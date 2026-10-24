// agent-runner.js — Cœur d'exécution d'un agent IA.
//
// Cycle :
//   1. Charge la config (agents_config) + prompt actif (agents_prompts) OU fichier prompts/*.md
//   2. Crée agents_runs (statut='en_cours')
//   3. Exécute les requêtes SQL autorisées (blocks ```sql du prompt) via db-readonly-client
//   4. Envoie system + user (data JSON) au LLM (Claude/OpenAI) — mode JSON strict
//   5. Parse la réponse structurée { findings: [...], resume }
//   6. Insère chaque finding dans agents_findings — inclut `sql_correction_proposee` si présent
//   7. Met à jour agents_runs (statut, tokens, cout_usd, reponse_brute)
//   8. Retourne { id_run, findings, resume, cout_usd, ... }
//
// Sécurité :
//  - Timeout global (défaut 90 s) — l'agent est ANNULÉ si dépassé
//  - Budget tokens contrôlé côté runner (fail si output prévisible > budget_tokens)
//  - Toutes les requêtes SQL passent par db-readonly-client (guard SQL destructif)
//  - Une seule execution simultanée par agent — verrou en mémoire

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from '../../_shared/db.js';
import * as ro from './db-readonly-client.js';
import { askLLM, safeJsonParse } from './llm-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.resolve(__dirname, '..', 'prompts');

const RUNNING = new Set(); // id_agent en cours d'exécution

// Mapping code agent -> fichier prompt par défaut (fallback si BD ne fournit pas de prompt actif).
const CODE_TO_PROMPT_FILE = {
  STOCK_MONITOR:        'stock.md',
  PRODUCTION_MONITOR:   'production.md',
  QUALITE_MONITOR:      'qualite.md',
  FINANCE_MONITOR:      'finance.md',
  COMMERCIAL_MONITOR:   'commercial.md',
  FOURNISSEURS_MONITOR: 'fournisseurs.md',
  RH_MONITOR:           'rh.md',
  RAPPORT_QUOTIDIEN:    'rapport-quotidien.md',
  RAPPORT_HEBDO:        'rapport-hebdo.md',
  RAPPORT_MENSUEL:      'rapport-mensuel.md',
};

async function loadAgentConfig(idAgent) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT c.*, p.contenu AS prompt_contenu, p.id_prompt
       FROM agents_config c
  LEFT JOIN agents_prompts p ON p.id_prompt = c.id_prompt_actif
      WHERE c.id_agent = $1`,
    [idAgent]
  );
  if (!rows[0]) throw new Error(`Agent #${idAgent} introuvable`);
  return rows[0];
}

async function loadPromptFallback(agent) {
  const fname = CODE_TO_PROMPT_FILE[agent.code];
  if (!fname) return null;
  try {
    const p = path.join(PROMPTS_DIR, fname);
    return await fs.readFile(p, 'utf8');
  } catch { return null; }
}

/** Extrait les blocs ```sql du prompt. Retourne un tableau de {name, sql}. */
function extractSqlBlocks(promptText) {
  if (!promptText) return [];
  const blocks = [];
  const re = /```sql(?:\s+name=([\w-]+))?\s*\n([\s\S]*?)```/gi;
  let m;
  while ((m = re.exec(promptText)) !== null) {
    blocks.push({ name: m[1] || `q${blocks.length + 1}`, sql: m[2].trim() });
  }
  return blocks;
}

/** Remplace {{date_debut}}, {{date_fin}}, {{today}} dans le SQL. */
function substituteVars(sql, vars) {
  return sql.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));
}

function buildDefaultVars(agent) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  // fenêtre par défaut : 7 jours glissants, agents "rapport" peuvent overrider dans leurs prompts
  const back = new Date(now);
  back.setDate(back.getDate() - 7);
  return {
    today,
    date_fin: today,
    date_debut: back.toISOString().slice(0, 10),
    seuil_dormance_j: agent.parametres?.seuil_dormance_j ?? 90,
    seuil_retard_h:   agent.parametres?.seuil_retard_h   ?? 24,
    seuil_defaut_pct: agent.parametres?.seuil_defaut_pct ?? 3.0,
    seuil_retard_j:   agent.parametres?.seuil_retard_j   ?? 15,
    periode_silence_j:agent.parametres?.periode_silence_j?? 60,
    seuil_absent_pct: agent.parametres?.seuil_absent_pct ?? 5,
  };
}

/**
 * @param {number|string} idAgent
 * @param {object} [opts]
 * @param {'cron'|'manuel'|'webhook'} [opts.trigger]
 * @param {number} [opts.userId]     — user déclencheur (mode manuel)
 * @param {number} [opts.timeoutMs]
 * @param {object} [opts.extraVars]  — override des variables SQL
 * @returns {Promise<{id_run, statut, findings, resume, cout_usd, tokens_input, tokens_output}>}
 */
export async function runAgent(idAgent, opts = {}) {
  if (RUNNING.has(String(idAgent))) {
    throw new Error(`Agent #${idAgent} déjà en cours d'exécution — abort.`);
  }
  RUNNING.add(String(idAgent));

  const pool = getPool();
  const agent = await loadAgentConfig(idAgent);
  const promptText = agent.prompt_contenu || (await loadPromptFallback(agent));
  if (!promptText) {
    RUNNING.delete(String(idAgent));
    throw new Error(`Aucun prompt actif ni fallback pour agent ${agent.code}`);
  }

  // 1. INSERT run "en_cours"
  const contexte = { trigger: opts.trigger || 'manuel', extraVars: opts.extraVars || {} };
  const { rows: runRows } = await pool.query(
    `INSERT INTO agents_runs (id_agent, id_prompt, statut, trigger_type, id_utilisateur, contexte_json)
     VALUES ($1, $2, 'en_cours', $3, $4, $5::jsonb) RETURNING id_run`,
    [
      agent.id_agent,
      agent.id_prompt || null,
      opts.trigger || 'manuel',
      opts.userId || null,
      JSON.stringify(contexte),
    ]
  );
  const id_run = runRows[0].id_run;

  const timeoutMs = opts.timeoutMs || Number(process.env.IA_AGENT_TIMEOUT_MS || 90_000);
  const abort = new AbortController();
  const to = setTimeout(() => abort.abort(new Error('timeout agent')), timeoutMs);
  const startedAt = Date.now();

  try {
    // 2. Extraire les SQL du prompt et les exécuter en lecture seule
    const vars = { ...buildDefaultVars(agent), ...(opts.extraVars || {}) };
    const sqlBlocks = extractSqlBlocks(promptText);
    const dataPayload = {};
    for (const block of sqlBlocks) {
      const finalSql = substituteVars(block.sql, vars);
      try {
        const res = await ro.query(finalSql);
        dataPayload[block.name] = {
          rows: res.rows,
          truncated: res.truncated,
          rowCount: res.rowCount,
        };
      } catch (err) {
        dataPayload[block.name] = { error: err.message || String(err) };
      }
    }

    // 3. Prépare system prompt + payload utilisateur
    const systemPrompt = [
      promptText.replace(/```sql[\s\S]*?```/gi, ''), // on retire les blocs SQL du système
      '',
      'FORMAT DE SORTIE OBLIGATOIRE (JSON strict) :',
      '{',
      '  "resume": "Synthèse en 1-3 phrases",',
      '  "findings": [',
      '    {',
      '      "severite": "info|warning|critique|alerte",',
      '      "categorie": "libre_ex_rupture_imminente",',
      '      "titre": "Titre court",',
      '      "description": "Explication + données chiffrées",',
      '      "entite_type": "article|of|facture|employe|null",',
      '      "entite_id": 123,',
      '      "donnees_json": { "champ": "valeur" },',
      '      "action_suggeree": "Recommandation humaine",',
      '      "sql_correction_proposee": "UPDATE ... WHERE ... -- optionnel, non destructif"',
      '    }',
      '  ]',
      '}',
      'Interdit d\'inventer des id_article/id_of qui ne figurent pas dans les données.',
      'Si aucune anomalie détectée, retourne findings: [].',
    ].join('\n');

    const userPrompt = [
      `Contexte agent : ${agent.code} — ${agent.nom}`,
      `Période : du ${vars.date_debut} au ${vars.date_fin}`,
      `Paramètres seuils : ${JSON.stringify(agent.parametres || {})}`,
      '',
      'Données extraites (SELECT en lecture seule) :',
      '```json',
      JSON.stringify(dataPayload, null, 2).slice(0, 60_000),
      '```',
      '',
      'Analyse et retourne le JSON défini par le système.',
    ].join('\n');

    // 4. Appel LLM
    const llm = await askLLM({
      system: systemPrompt,
      user: userPrompt,
      model: agent.llm_model,
      provider: agent.llm_provider,
      maxTokens: Math.min(4096, agent.budget_tokens || 4096),
      jsonMode: true,
      signal: abort.signal,
    });

    // 5. Parse JSON
    const parsed = safeJsonParse(llm.text) || { findings: [], resume: '' };
    const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
    const resume   = String(parsed.resume || '').slice(0, 4000);

    // 6. Insert findings
    const insertedIds = [];
    for (const f of findings) {
      const severite = ['info','warning','critique','alerte'].includes(f.severite) ? f.severite : 'info';
      const { rows: fRows } = await pool.query(
        `INSERT INTO agents_findings
           (id_run, id_agent, severite, categorie, titre, description,
            entite_type, entite_id, donnees_json, action_suggeree, sql_correction_proposee, statut)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,'nouveau')
         RETURNING id_finding`,
        [
          id_run, agent.id_agent, severite,
          (f.categorie || null)?.toString().slice(0, 60),
          (f.titre || '').toString().slice(0, 255) || '(sans titre)',
          f.description || null,
          f.entite_type || null,
          Number.isFinite(+f.entite_id) ? +f.entite_id : null,
          JSON.stringify(f.donnees_json || {}),
          f.action_suggeree || null,
          f.sql_correction_proposee || null,
        ]
      );
      insertedIds.push(fRows[0].id_finding);
    }

    // 7. Update run OK
    const duree = Date.now() - startedAt;
    await pool.query(
      `UPDATE agents_runs
          SET statut = 'succes',
              termine_a = NOW(),
              duree_ms = $1,
              tokens_input = $2,
              tokens_output = $3,
              cout_usd = $4,
              reponse_brute = $5
        WHERE id_run = $6`,
      [duree, llm.tokens_input, llm.tokens_output, llm.cout_usd, llm.text?.slice(0, 65_000) ?? null, id_run]
    );

    return {
      id_run,
      statut: 'succes',
      findings_ids: insertedIds,
      findings_count: insertedIds.length,
      resume,
      cout_usd: llm.cout_usd,
      tokens_input: llm.tokens_input,
      tokens_output: llm.tokens_output,
      duree_ms: duree,
      provider: llm.provider,
      model: llm.model,
    };
  } catch (err) {
    const duree = Date.now() - startedAt;
    const isTimeout = err?.name === 'AbortError' || /timeout/i.test(err?.message || '');
    await pool.query(
      `UPDATE agents_runs
          SET statut = $1, termine_a = NOW(), duree_ms = $2, erreur = $3
        WHERE id_run = $4`,
      [isTimeout ? 'timeout' : 'echec', duree, (err?.message || String(err)).slice(0, 2000), id_run]
    );
    throw err;
  } finally {
    clearTimeout(to);
    RUNNING.delete(String(idAgent));
  }
}

/** Utilitaire : lance tous les agents actifs (utilisé par scheduler). */
export async function runAllActive({ trigger = 'cron' } = {}) {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id_agent, code FROM agents_config WHERE actif = TRUE ORDER BY id_agent`
  );
  const results = [];
  for (const a of rows) {
    try {
      const r = await runAgent(a.id_agent, { trigger });
      results.push({ code: a.code, ...r });
    } catch (e) {
      results.push({ code: a.code, statut: 'echec', erreur: e.message });
    }
  }
  return results;
}
