/**
 * Contrôleur Mobile — enregistrement d'appareils et push (stub)
 *
 * Endpoints:
 *   POST /api/v1/mobile/register                     — Enregistrer/mettre à jour un device
 *   POST /api/v1/mobile/heartbeat                    — Mettre à jour last_seen
 *   GET  /api/v1/mobile/devices                      — Liste (filtrable)
 *   GET  /api/v1/mobile/config                       — Config mobile
 *   GET  /api/v1/mobile/user/:id_user/tasks          — Feed du jour pour l'utilisateur
 *   GET  /api/v1/mobile/devices/:id                  — Détail device
 *   PUT  /api/v1/mobile/devices/:id/deactivate       — Désactiver device
 *   POST /api/v1/mobile/notifications/push           — Push notification (placeholder)
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

(async () => {
  try {
    await pool.query(`
      ALTER TABLE mobile
        ADD COLUMN IF NOT EXISTS device_id VARCHAR(128),
        ADD COLUMN IF NOT EXISTS device_type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS user_id INTEGER,
        ADD COLUMN IF NOT EXISTS push_token TEXT,
        ADD COLUMN IF NOT EXISTS app_version VARCHAR(32),
        ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true
    `);
    // Index unique sur device_id pour upsert
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS mobile_device_id_uniq ON mobile(device_id) WHERE device_id IS NOT NULL`);
  } catch (err) {
    console.warn('[mobile] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── POST /api/v1/mobile/register ──────────────────────────────────
export const registerDevice = async (req, res) => {
  try {
    const userId = authorId(req);
    const { device_id, device_type, push_token, app_version } = req.body || {};
    if (!device_id) return sendError(res, 'device_id requis', 400);
    if (!['android', 'ios', 'tablet'].includes(device_type)) return sendError(res, 'device_type invalide', 400);

    const r = await pool.query(
      `INSERT INTO mobile
         (device_id, device_type, user_id, push_token, app_version, last_seen, is_active, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, NOW(), true, NOW(), $3)
       ON CONFLICT (device_id) WHERE device_id IS NOT NULL DO UPDATE SET
         device_type = EXCLUDED.device_type,
         user_id = COALESCE(EXCLUDED.user_id, mobile.user_id),
         push_token = COALESCE(EXCLUDED.push_token, mobile.push_token),
         app_version = COALESCE(EXCLUDED.app_version, mobile.app_version),
         last_seen = NOW(),
         is_active = true,
         updated_at = NOW(),
         updated_by = EXCLUDED.created_by
       RETURNING id_mobile AS id, device_id, device_type, user_id, app_version, last_seen, is_active`,
      [device_id, device_type, userId, push_token || null, app_version || null]
    );
    return sendSuccess(res, r.rows[0], 'Device enregistré', 201);
  } catch (error) {
    return handleError(res, error, 'registerDevice');
  }
};

// ─── POST /api/v1/mobile/heartbeat ─────────────────────────────────
export const heartbeat = async (req, res) => {
  try {
    const { device_id } = req.body || {};
    if (!device_id) return sendError(res, 'device_id requis', 400);
    const r = await pool.query(
      `UPDATE mobile SET last_seen = NOW(), updated_at = NOW()
       WHERE device_id = $1 RETURNING id_mobile AS id, device_id, last_seen`,
      [device_id]
    );
    if (!r.rows[0]) return sendError(res, 'Device introuvable — /register requis', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'heartbeat');
  }
};

// ─── GET /api/v1/mobile/devices ────────────────────────────────────
export const getDevices = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = authorId(req);
    const { user_id, device_type, is_active, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['m.device_id IS NOT NULL'];

    if (!isAdmin && userId) { params.push(userId); where.push(`m.user_id = $${params.length}`); }
    else if (user_id) { params.push(user_id); where.push(`m.user_id = $${params.length}`); }
    if (device_type) { params.push(device_type); where.push(`m.device_type = $${params.length}`); }
    if (is_active === 'true') where.push('m.is_active = true');
    else if (is_active === 'false') where.push('m.is_active = false');

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const r = await pool.query(
      `SELECT m.id_mobile AS id, m.device_id, m.device_type, m.user_id, m.app_version,
              m.last_seen, m.is_active, m.created_at,
              u.email AS user_email
       FROM mobile m LEFT JOIN utilisateurs u ON u.id_utilisateur = m.user_id
       WHERE ${where.join(' AND ')}
       ORDER BY m.last_seen DESC NULLS LAST
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getDevices');
  }
};

// ─── GET /api/v1/mobile/config ─────────────────────────────────────
export const getConfig = async (req, res) => {
  const proto = req.protocol;
  const host = req.get('host');
  return sendSuccess(res, {
    api_base_url: `${proto}://${host}/api`,
    socket_url: `${proto}://${host}`,
    features_flags: {
      offline_mode: false,
      push_notifications: false,
      whatsapp_integration: true,
      barcode_scanner: true,
    },
    min_app_version: '1.0.0',
  });
};

// ─── GET /api/v1/mobile/user/:id_user/tasks ────────────────────────
export const getUserTasks = async (req, res) => {
  try {
    const { id_user } = req.params;
    const taches = { items: [], total: 0 };
    const suivi = { items: [], total: 0 };
    let unread_messages = 0;

    try {
      const r = await pool.query(
        `SELECT * FROM taches
         WHERE assigne_a = $1 AND (date_echeance::date = CURRENT_DATE OR statut = 'en_cours')
         ORDER BY date_echeance ASC LIMIT 50`,
        [id_user]
      );
      taches.items = r.rows; taches.total = r.rows.length;
    } catch {}

    try {
      const r = await pool.query(
        `SELECT * FROM suivi_fabrication
         WHERE id_operateur = $1 AND created_at::date = CURRENT_DATE
         ORDER BY created_at DESC LIMIT 50`,
        [id_user]
      );
      suivi.items = r.rows; suivi.total = r.rows.length;
    } catch {}

    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS c FROM messages
         WHERE id_destinataire = $1 AND lu = false AND contenu IS NOT NULL`,
        [id_user]
      );
      unread_messages = r.rows[0]?.c || 0;
    } catch {}

    return sendSuccess(res, { taches, suivi, unread_messages });
  } catch (error) {
    return handleError(res, error, 'getUserTasks');
  }
};

// ─── GET /api/v1/mobile/devices/:id ────────────────────────────────
export const getDeviceById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT m.*, m.id_mobile AS id FROM mobile m WHERE m.id_mobile = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Device introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getDeviceById');
  }
};

// ─── PUT /api/v1/mobile/devices/:id/deactivate ─────────────────────
export const deactivateDevice = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE mobile SET is_active = false, updated_at = NOW(), updated_by = $2
       WHERE id_mobile = $1 RETURNING id_mobile AS id, device_id, is_active`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Device introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit('mobile:device_deactivated', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Device désactivé');
  } catch (error) {
    return handleError(res, error, 'deactivateDevice');
  }
};

// ─── POST /api/v1/mobile/notifications/push ────────────────────────
export const pushNotification = async (req, res) => {
  try {
    const { device_ids = [], title, body, data } = req.body || {};
    if (!Array.isArray(device_ids) || device_ids.length === 0) return sendError(res, 'device_ids requis', 400);
    if (!title || !body) return sendError(res, 'title et body requis', 400);
    console.log(`[mobile] STUB push → ${device_ids.length} device(s), title="${title}"`);
    try {
      const io = await getIo();
      if (io) io.emit('mobile:push', { device_ids, title, body, data: data || null });
    } catch {}
    return sendSuccess(res, {
      queued: device_ids.length,
      note: 'Placeholder — push notifications non configurées.',
    });
  } catch (error) {
    return handleError(res, error, 'pushNotification');
  }
};
