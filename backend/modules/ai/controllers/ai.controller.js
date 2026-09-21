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

const _log = async ({ userId, prompt, response, entity_type, entity_id, latency_ms }) => {
  const r = await pool.query(
    `INSERT INTO ai
       (user_id, prompt, response, model, tokens_input, tokens_output, cost,
        entity_type, entity_id, latency_ms, created_at, created_by)
     VALUES ($1, $2, $3, $4, 0, 0, 0, $5, $6, $7, NOW(), $1)
     RETURNING id_ai AS id, user_id, prompt, response, model, entity_type, entity_id, feedback, latency_ms, created_at`,
    [userId, prompt, response, MODEL_PLACEHOLDER, entity_type || null, entity_id || null, latency_ms || 0]
  );
  return r.rows[0];
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
    const started = Date.now();
    const response = `Placeholder — LLM not configured. Prompt: ${prompt}`;
    const row = await _log({
      userId, prompt, response, entity_type, entity_id, latency_ms: Date.now() - started,
    });
    return sendSuccess(res, row, 'Réponse IA (placeholder)', 201);
  } catch (error) {
    return handleError(res, error, 'ask');
  }
};

// ─── POST /api/ai/summarize/of/:id_of ──────────────────────────────
export const summarizeOF = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_of } = req.params;
    let numero = id_of;
    try {
      const r = await pool.query(
        `SELECT numero_of FROM ordres_fabrication
         WHERE id_ordres_fabrication = $1 OR id_of = $1 LIMIT 1`,
        [id_of]
      );
      if (r.rows[0]?.numero_of) numero = r.rows[0].numero_of;
    } catch {}
    const summary = `OF #${numero} — Placeholder summary.`;
    const started = Date.now();
    const row = await _log({
      userId, prompt: `summarize OF ${id_of}`, response: summary,
      entity_type: 'ordre_fabrication', entity_id: id_of, latency_ms: Date.now() - started,
    });
    return sendSuccess(res, { summary, log: row });
  } catch (error) {
    return handleError(res, error, 'summarizeOF');
  }
};

// ─── POST /api/ai/suggest/planning ─────────────────────────────────
export const suggestPlanning = async (req, res) => {
  try {
    const userId = authorId(req);
    const { constraints } = req.body || {};
    const suggestion = {
      note: 'Placeholder — planification IA non configurée.',
      constraints_reçues: constraints || null,
      recommandation: 'Répartir la charge sur 5 jours en priorité aux OF en retard.',
    };
    await _log({
      userId, prompt: 'suggest planning', response: JSON.stringify(suggestion),
      entity_type: 'planning', entity_id: null, latency_ms: 0,
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
    let sample_count = 0;
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS c FROM suivi_fabrication WHERE created_at >= NOW() - INTERVAL '30 days'`
      );
      sample_count = r.rows[0]?.c || 0;
    } catch {}
    const report = {
      note: 'Placeholder — détection d\'anomalies IA non configurée.',
      lignes_analysees: sample_count,
      anomalies: [],
    };
    await _log({
      userId, prompt: 'detect anomalies', response: JSON.stringify(report),
      entity_type: 'suivi_fabrication', entity_id: null, latency_ms: 0,
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
