/**
 * Contrôleur AI — assistant IA (stub, sans appel LLM)
 *
 * Endpoints:
 *   GET  /api/ai/history                    — Historique utilisateur
 *   GET  /api/ai/usage/stats                — Stats d'usage
 *   POST /api/ai/ask                        — Placeholder ask
 *   POST /api/ai/summarize/of/:id_of        — Résumé d'OF
 *   POST /api/ai/suggest/planning           — Suggestion de planning
 *   POST /api/ai/detect/anomalies           — Détection d'anomalies
 *   PUT  /api/ai/history/:id/feedback       — Feedback (up/down)
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { askAI } from '../../../src/services/ai.service.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;

(async () => {
  try {
    await pool.query(`
      ALTER TABLE ai
        ADD COLUMN IF NOT EXISTS user_id INTEGER,
        ADD COLUMN IF NOT EXISTS prompt TEXT,
        ADD COLUMN IF NOT EXISTS response TEXT,
        ADD COLUMN IF NOT EXISTS model VARCHAR(80),
        ADD COLUMN IF NOT EXISTS tokens_input INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tokens_output INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS cost NUMERIC(12,4) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(80),
        ADD COLUMN IF NOT EXISTS entity_id INTEGER,
        ADD COLUMN IF NOT EXISTS feedback VARCHAR(8),
        ADD COLUMN IF NOT EXISTS latency_ms INTEGER,
        ADD COLUMN IF NOT EXISTS error_message TEXT
    `);
  } catch (err) {
    console.warn('[ai] migration ALTER TABLE échouée:', err.message);
  }
})();

const MODEL_PLACEHOLDER = 'stub-llm-v0';

const _log = async ({ userId, prompt, response, entity_type, entity_id, latency_ms, model, tokens_input, tokens_output, cost, error_message }) => {
  const r = await pool.query(
    `INSERT INTO ai
       (user_id, prompt, response, model, tokens_input, tokens_output, cost,
        entity_type, entity_id, latency_ms, error_message, created_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $1)
     RETURNING id_ai AS id, user_id, prompt, response, model, tokens_input, tokens_output, cost,
               entity_type, entity_id, feedback, latency_ms, error_message, created_at`,
    [
      userId, prompt, response, model || MODEL_PLACEHOLDER,
      tokens_input || 0, tokens_output || 0, cost || 0,
      entity_type || null, entity_id || null, latency_ms || 0,
      error_message || null,
    ]
  );
  return r.rows[0];
};

// Appel unifié : appelle askAI puis renvoie {response, model, tokens_*, cost, latency_ms, mocked?}.
const _invokeAI = async ({ prompt, systemPrompt, maxTokens }) => {
  const r = await askAI({ prompt, systemPrompt, maxTokens });
  return {
    response: r.response || (r.error ? `Erreur IA: ${r.error}` : ''),
    model: r.model || MODEL_PLACEHOLDER,
    tokens_input: r.tokens_input || 0,
    tokens_output: r.tokens_output || 0,
    cost: r.cost || 0,
    latency_ms: r.latency_ms || 0,
    mocked: !!r.mocked,
    error_message: r.success ? null : (r.error || (r.mocked ? 'AI_API_KEY non configurée' : null)),
  };
};

// ─── GET /api/ai/history ───────────────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const userId = authorId(req);
    const { limit = 50, offset = 0 } = req.query;
    const r = await pool.query(
      `SELECT id_ai AS id, user_id, prompt, response, model, entity_type, entity_id,
              feedback, latency_ms, created_at
       FROM ai WHERE user_id = $1 AND prompt IS NOT NULL
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit, 10) || 50, parseInt(offset, 10) || 0]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getHistory');
  }
};

// ─── GET /api/ai/usage/stats ───────────────────────────────────────
export const getUsageStats = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `SELECT
         COUNT(*)::int AS total_requests,
         COALESCE(SUM(tokens_input), 0)::int AS tokens_input,
         COALESCE(SUM(tokens_output), 0)::int AS tokens_output,
         COALESCE(SUM(cost), 0)::float AS cost_total,
         COUNT(*) FILTER (WHERE feedback = 'up')::int AS up_count,
         COUNT(*) FILTER (WHERE feedback = 'down')::int AS down_count
       FROM ai
       WHERE user_id = $1
         AND prompt IS NOT NULL
         AND created_at >= date_trunc('month', NOW())`,
      [userId]
    );
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getUsageStats');
  }
};

// ─── POST /api/ai/ask ──────────────────────────────────────────────
export const ask = async (req, res) => {
  try {
    const userId = authorId(req);
    const { prompt, entity_type, entity_id } = req.body || {};
    if (!prompt) return sendError(res, 'prompt requis', 400);
    const ai = await _invokeAI({ prompt });
    const row = await _log({
      userId, prompt, response: ai.response, entity_type, entity_id,
      latency_ms: ai.latency_ms, model: ai.model,
      tokens_input: ai.tokens_input, tokens_output: ai.tokens_output, cost: ai.cost,
      error_message: ai.error_message,
    });
    const msg = ai.mocked ? 'Réponse IA (placeholder — AI_API_KEY absent)'
              : ai.error_message ? 'Erreur IA'
              : 'Réponse IA';
    return sendSuccess(res, { ...row, mocked: ai.mocked }, msg, 201);
  } catch (error) {
    return handleError(res, error, 'ask');
  }
};

// ─── POST /api/ai/summarize/of/:id_of ──────────────────────────────
export const summarizeOF = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_of } = req.params;
    let of = null;
    try {
      const r = await pool.query(
        `SELECT * FROM ordres_fabrication
         WHERE id_ordres_fabrication = $1 OR id_of = $1 LIMIT 1`,
        [id_of]
      );
      of = r.rows[0] || null;
    } catch {}
    const numero = of?.numero_of || id_of;
    const details = of
      ? `Numéro: ${numero}\nÉtat: ${of.etat || of.statut || 'n/a'}\nQuantité: ${of.quantite_totale || of.quantite || 'n/a'}\nProduit: ${of.reference_produit || of.id_produit || 'n/a'}\nDate début: ${of.date_debut_prevue || of.date_debut || 'n/a'}\nDate fin: ${of.date_fin_prevue || of.date_fin || 'n/a'}`
      : `OF #${id_of} — pas de détails trouvés en base.`;
    const prompt = `Résume cet Ordre de Fabrication en 3 phrases, en français, ton professionnel:\n\n${details}`;
    const ai = await _invokeAI({ prompt, maxTokens: 400 });
    const row = await _log({
      userId, prompt, response: ai.response,
      entity_type: 'ordre_fabrication', entity_id: id_of,
      latency_ms: ai.latency_ms, model: ai.model,
      tokens_input: ai.tokens_input, tokens_output: ai.tokens_output, cost: ai.cost,
      error_message: ai.error_message,
    });
    return sendSuccess(res, { summary: ai.response, mocked: ai.mocked, log: row });
  } catch (error) {
    return handleError(res, error, 'summarizeOF');
  }
};

// ─── POST /api/ai/suggest/planning ─────────────────────────────────
export const suggestPlanning = async (req, res) => {
  try {
    const userId = authorId(req);
    const { constraints } = req.body || {};

    // Contexte: OF en attente + capacités machines.
    let pendingOFs = [];
    let machines = [];
    try {
      const r = await pool.query(
        `SELECT numero_of, etat, quantite_totale, date_fin_prevue
         FROM ordres_fabrication
         WHERE etat IN ('en_attente', 'planifie', 'en_cours')
         ORDER BY date_fin_prevue NULLS LAST LIMIT 20`
      );
      pendingOFs = r.rows;
    } catch {}
    try {
      const r = await pool.query(
        `SELECT nom, capacite_theorique_h, etat FROM machines WHERE actif = true LIMIT 20`
      );
      machines = r.rows;
    } catch {}

    const prompt = `Tu es un planificateur atelier textile. Propose un planning optimal en 5 points bref.
Contraintes utilisateur: ${JSON.stringify(constraints || {})}
OFs en attente:\n${JSON.stringify(pendingOFs, null, 2)}
Capacités machines:\n${JSON.stringify(machines, null, 2)}`;

    const ai = await _invokeAI({ prompt, maxTokens: 800 });
    const suggestion = {
      note: ai.mocked ? 'Placeholder — AI_API_KEY absent.' : undefined,
      recommandation: ai.response,
      contexte: { pendingOFs_count: pendingOFs.length, machines_count: machines.length },
      constraints_reçues: constraints || null,
      mocked: ai.mocked,
    };
    await _log({
      userId, prompt, response: ai.response,
      entity_type: 'planning', entity_id: null,
      latency_ms: ai.latency_ms, model: ai.model,
      tokens_input: ai.tokens_input, tokens_output: ai.tokens_output, cost: ai.cost,
      error_message: ai.error_message,
    });
    return sendSuccess(res, suggestion);
  } catch (error) {
    return handleError(res, error, 'suggestPlanning');
  }
};

// ─── POST /api/ai/detect/anomalies ─────────────────────────────────
export const detectAnomalies = async (req, res) => {
  try {
    const userId = authorId(req);
    // Stats des 30 derniers jours pour alimenter le prompt.
    let sample_count = 0;
    let stats = null;
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS c,
                AVG(rendement)::float AS avg_rendement,
                AVG(trs)::float AS avg_trs,
                MIN(rendement)::float AS min_rendement,
                MAX(rendement)::float AS max_rendement
         FROM suivi_fabrication
         WHERE created_at >= NOW() - INTERVAL '30 days'`
      );
      sample_count = r.rows[0]?.c || 0;
      stats = r.rows[0] || null;
    } catch {}

    const prompt = `Analyse les statistiques de production des 30 derniers jours et identifie les anomalies (rendement anormalement bas, TRS en chute, variance excessive). Retourne un JSON avec clé "anomalies": [{type, severity, description, recommandation}].
Statistiques:\n${JSON.stringify(stats, null, 2)}
Nombre d'échantillons: ${sample_count}`;

    const ai = await _invokeAI({ prompt, maxTokens: 800 });
    let anomalies = [];
    try {
      const m = ai.response?.match(/\{[\s\S]*\}/);
      if (m) anomalies = JSON.parse(m[0]).anomalies || [];
    } catch {}
    const report = {
      note: ai.mocked ? 'Placeholder — AI_API_KEY absent.' : undefined,
      lignes_analysees: sample_count,
      stats,
      anomalies,
      analyse_brute: ai.response,
      mocked: ai.mocked,
    };
    await _log({
      userId, prompt, response: ai.response,
      entity_type: 'suivi_fabrication', entity_id: null,
      latency_ms: ai.latency_ms, model: ai.model,
      tokens_input: ai.tokens_input, tokens_output: ai.tokens_output, cost: ai.cost,
      error_message: ai.error_message,
    });
    return sendSuccess(res, report);
  } catch (error) {
    return handleError(res, error, 'detectAnomalies');
  }
};

// ─── PUT /api/ai/history/:id/feedback ──────────────────────────────
export const updateFeedback = async (req, res) => {
  try {
    const userId = authorId(req);
    const { feedback } = req.body || {};
    if (!['up', 'down'].includes(feedback)) return sendError(res, "feedback doit être 'up' ou 'down'", 400);
    const r = await pool.query(
      `UPDATE ai SET feedback = $2, updated_at = NOW(), updated_by = $3
       WHERE id_ai = $1 AND user_id = $3
       RETURNING id_ai AS id, feedback`,
      [req.params.id, feedback, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Entrée IA introuvable ou non autorisée', 404);
    return sendSuccess(res, r.rows[0], 'Feedback enregistré');
  } catch (error) {
    return handleError(res, error, 'updateFeedback');
  }
};
