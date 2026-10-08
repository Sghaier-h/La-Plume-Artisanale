// service.js — IA scheduler
// Charge la config des agents et enregistre un cron par agent actif.
// Dépendance : node-cron (à installer via `npm i node-cron`).
import { getPool } from '../../_shared/db.js';
const pool = getPool();

let cron;
try { cron = (await import('node-cron')).default; }
catch { console.warn('[ia-scheduler] node-cron non installé — scheduler inactif'); }

const tasksByAgent = new Map();

async function loadAgents() {
  const { rows } = await pool.query(
    `SELECT id_agent, code, nom, cron_schedule
       FROM agents_config
      WHERE actif = TRUE AND cron_schedule IS NOT NULL`
  );
  return rows;
}

async function runAgent(agent, trigger = 'cron', user = null) {
  const started = Date.now();
  const { rows } = await pool.query(
    `INSERT INTO agents_runs (id_agent, statut, trigger_type, id_utilisateur, contexte_json)
     VALUES ($1, 'en_cours', $2, $3, $4::jsonb) RETURNING id_run`,
    [agent.id_agent, trigger, user?.id ?? null, JSON.stringify({ manual: trigger === 'manuel' })]
  );
  const id_run = rows[0].id_run;
  try {
    // TODO : exécution réelle (chargement prompt actif, appel LLM, parsing findings)
    // Ici on log un run vide « succès » — squelette.
    const duree = Date.now() - started;
    await pool.query(
      `UPDATE agents_runs SET statut='succes', termine_a=NOW(), duree_ms=$1 WHERE id_run=$2`,
      [duree, id_run]
    );
    return { id_run, statut: 'succes', duree_ms: duree };
  } catch (e) {
    await pool.query(
      `UPDATE agents_runs SET statut='echec', termine_a=NOW(), erreur=$1 WHERE id_run=$2`,
      [e.message || String(e), id_run]
    );
    throw e;
  }
}

export async function start() {
  if (!cron) return { started: false, reason: 'node-cron manquant' };
  const agents = await loadAgents();
  for (const a of agents) {
    if (tasksByAgent.has(a.id_agent)) tasksByAgent.get(a.id_agent).stop();
    if (!cron.validate(a.cron_schedule)) {
      console.warn(`[ia-scheduler] cron invalide pour ${a.code}: ${a.cron_schedule}`);
      continue;
    }
    const task = cron.schedule(a.cron_schedule, () => runAgent(a).catch(err =>
      console.error(`[ia-scheduler] ${a.code} échec:`, err.message)
    ));
    tasksByAgent.set(a.id_agent, task);
  }
  return { started: true, scheduled: agents.length };
}

export async function stop() {
  for (const t of tasksByAgent.values()) t.stop();
  tasksByAgent.clear();
  return { stopped: true };
}

export async function reload() {
  await stop();
  return start();
}

export async function triggerManual(idAgent, user) {
  const { rows } = await pool.query(
    `SELECT id_agent, code, nom, cron_schedule FROM agents_config WHERE id_agent = $1`, [idAgent]
  );
  if (!rows[0]) throw new Error('Agent introuvable');
  return runAgent(rows[0], 'manuel', user);
}

export async function status() {
  return {
    running: tasksByAgent.size,
    agents: [...tasksByAgent.keys()]
  };
}
