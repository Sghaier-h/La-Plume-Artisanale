/**
 * Contrôleur Webhooks — enregistrements pour intégrations sortantes
 *
 * Endpoints :
 *   GET    /api/webhooks
 *   GET    /api/webhooks/events/available
 *   GET    /api/webhooks/:id
 *   POST   /api/webhooks
 *   POST   /api/webhooks/:id/test
 *   PUT    /api/webhooks/:id
 *   PUT    /api/webhooks/:id/toggle
 *   DELETE /api/webhooks/:id
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Migration idempotente
(async () => {
  try {
    await pool.query(`
      ALTER TABLE webhooks
        ADD COLUMN IF NOT EXISTS url TEXT,
        ADD COLUMN IF NOT EXISTS events TEXT[],
        ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS secret VARCHAR(255),
        ADD COLUMN IF NOT EXISTS headers JSONB,
        ADD COLUMN IF NOT EXISTS retries INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS last_delivered_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS last_status_code INTEGER
    `);
  } catch (err) {
    console.warn('[webhooks] migration ALTER TABLE échouée:', err.message);
  }
})();

const AVAILABLE_EVENTS = [
  'of.created', 'of.completed', 'of.cancelled',
  'facture.created', 'facture.paid',
  'bl.created', 'bl.livre',
  'devis.created', 'devis.accepted',
  'commande.created', 'commande.confirmed',
  'message.new',
  'stock.low',
  'client.created',
];

const URL_REGEX = /^https?:\/\/[^\s]+$/i;

// ─── GET /api/webhooks ────────────────────────────────────────────
export const getWebhooks = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_webhooks AS id, name, description, url, events, actif, secret, headers,
              retries, last_delivered_at, last_status_code, created_at, updated_at
       FROM webhooks
       WHERE url IS NOT NULL
       ORDER BY created_at DESC`
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getWebhooks');
  }
};

// ─── GET /api/webhooks/events/available ───────────────────────────
export const getAvailableEvents = async (req, res) => {
  return sendSuccess(res, { items: AVAILABLE_EVENTS, total: AVAILABLE_EVENTS.length });
};

// ─── GET /api/webhooks/:id ────────────────────────────────────────
export const getWebhookById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT *, id_webhooks AS id FROM webhooks WHERE id_webhooks = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Webhook introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getWebhookById');
  }
};

// ─── POST /api/webhooks ───────────────────────────────────────────
export const createWebhook = async (req, res) => {
  try {
    const userId = authorId(req);
    const { url, events, secret, headers, name, description } = req.body || {};
    if (!url) return sendError(res, 'url requis', 400);
    if (!URL_REGEX.test(url)) return sendError(res, 'url invalide (http/https attendu)', 400);
    if (!Array.isArray(events) || events.length === 0) return sendError(res, 'events (array) requis', 400);

    const r = await pool.query(
      `INSERT INTO webhooks
         (name, description, url, events, actif, secret, headers, active, created_at, created_by)
       VALUES ($1, $2, $3, $4, true, $5, $6, true, NOW(), $7)
       RETURNING id_webhooks AS id, name, url, events, actif, secret, headers, created_at`,
      [
        name || url,
        description || null,
        url,
        events,
        secret || null,
        headers ? JSON.stringify(headers) : null,
        userId,
      ]
    );
    return sendSuccess(res, r.rows[0], 'Webhook créé', 201);
  } catch (error) {
    return handleError(res, error, 'createWebhook');
  }
};

// ─── PUT /api/webhooks/:id ────────────────────────────────────────
export const updateWebhook = async (req, res) => {
  try {
    const userId = authorId(req);
    const { url, events, secret, headers, name, description, actif } = req.body || {};
    if (url && !URL_REGEX.test(url)) return sendError(res, 'url invalide', 400);

    const r = await pool.query(
      `UPDATE webhooks
         SET name = COALESCE($2, name),
             description = COALESCE($3, description),
             url = COALESCE($4, url),
             events = COALESCE($5, events),
             secret = COALESCE($6, secret),
             headers = COALESCE($7, headers),
             actif = COALESCE($8, actif),
             updated_at = NOW(), updated_by = $9
       WHERE id_webhooks = $1
       RETURNING id_webhooks AS id, name, url, events, actif, secret, headers`,
      [
        req.params.id,
        name ?? null,
        description ?? null,
        url ?? null,
        Array.isArray(events) ? events : null,
        secret ?? null,
        headers ? JSON.stringify(headers) : null,
        actif ?? null,
        userId,
      ]
    );
    if (!r.rows[0]) return sendError(res, 'Webhook introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Webhook mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateWebhook');
  }
};

// ─── PUT /api/webhooks/:id/toggle ─────────────────────────────────
export const toggleWebhook = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE webhooks
         SET actif = NOT COALESCE(actif, false),
             updated_at = NOW(), updated_by = $2
       WHERE id_webhooks = $1
       RETURNING id_webhooks AS id, actif`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Webhook introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Webhook basculé');
  } catch (error) {
    return handleError(res, error, 'toggleWebhook');
  }
};

// ─── POST /api/webhooks/:id/test ──────────────────────────────────
export const testWebhook = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_webhooks AS id, url, events FROM webhooks WHERE id_webhooks = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Webhook introuvable', 404);
    return sendSuccess(res, {
      id: r.rows[0].id,
      url: r.rows[0].url,
      note: 'Test simulé — aucun appel HTTP effectué',
      status: 'ok',
    }, 'Test OK');
  } catch (error) {
    return handleError(res, error, 'testWebhook');
  }
};

// ─── DELETE /api/webhooks/:id ─────────────────────────────────────
export const deleteWebhook = async (req, res) => {
  try {
    const r = await pool.query(
      `DELETE FROM webhooks WHERE id_webhooks = $1 RETURNING id_webhooks`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Webhook introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_webhooks }, 'Webhook supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteWebhook');
  }
};
