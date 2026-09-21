/**
 * Contrôleur Notifications — notifications in-app
 *
 * Endpoints:
 *   GET    /api/notifications                  — Liste (filtrable)
 *   GET    /api/notifications/non-lues/count   — Count non-lues
 *   GET    /api/notifications/stats/global     — Stats
 *   POST   /api/notifications                  — Créer
 *   POST   /api/notifications/broadcast        — Broadcast (ADMIN)
 *   PUT    /api/notifications/toutes-lues      — Tout marquer lu
 *   PUT    /api/notifications/:id/lu           — Marquer lu
 *   DELETE /api/notifications/:id              — Supprimer
 *   GET    /api/notifications/:id              — Détail
 *
 * Export:
 *   notifier(destinataire_id, type, titre, contenu, lien?) — helper réutilisable
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
      ALTER TABLE notifications
        ADD COLUMN IF NOT EXISTS id_destinataire INTEGER,
        ADD COLUMN IF NOT EXISTS type VARCHAR(60),
        ADD COLUMN IF NOT EXISTS titre VARCHAR(200),
        ADD COLUMN IF NOT EXISTS contenu TEXT,
        ADD COLUMN IF NOT EXISTS lien VARCHAR(500),
        ADD COLUMN IF NOT EXISTS urgent BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS lu BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS date_creation TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS date_lecture TIMESTAMP
    `);
  } catch (err) {
    console.warn('[notifications] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── Helper exporté : créer + émettre une notification ─────────────
export const notifier = async (destinataire_id, type, titre, contenu, lien = null) => {
  try {
    if (!destinataire_id || !type || !titre) return null;
    const r = await pool.query(
      `INSERT INTO notifications
         (id_destinataire, type, titre, contenu, lien, urgent, lu, date_creation, created_at, name)
       VALUES ($1, $2, $3, $4, $5, false, false, NOW(), NOW(), $3)
       RETURNING id_notifications AS id, id_destinataire, type, titre, contenu, lien, urgent, lu, date_creation`,
      [destinataire_id, type, titre, contenu || null, lien]
    );
    const row = r.rows[0];
    try {
      const io = await getIo();
      if (io) io.to(`user-${destinataire_id}`).emit('notification:new', row);
    } catch {}
    return row;
  } catch (err) {
    console.warn('[notifications.notifier] erreur:', err.message);
    return null;
  }
};

// ─── GET /api/notifications ────────────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = authorId(req);
    const { type, lu, urgent, date_debut, date_fin, limit = 100, offset = 0 } = req.query;

    const params = [];
    const where = ['n.titre IS NOT NULL'];

    if (!isAdmin && userId) { params.push(userId); where.push(`n.id_destinataire = $${params.length}`); }
    if (type) { params.push(type); where.push(`n.type = $${params.length}`); }
    if (lu === 'true') where.push('n.lu = true');
    else if (lu === 'false') where.push('n.lu = false');
    if (urgent === 'true') where.push('n.urgent = true');
    if (date_debut) { params.push(date_debut); where.push(`n.date_creation >= $${params.length}`); }
    if (date_fin) { params.push(date_fin); where.push(`n.date_creation <= $${params.length}`); }

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const r = await pool.query(
      `SELECT n.id_notifications AS id, n.id_destinataire, n.type, n.titre, n.contenu,
              n.lien, n.urgent, n.lu, n.date_creation, n.date_lecture
       FROM notifications n
       WHERE ${where.join(' AND ')}
       ORDER BY n.date_creation DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getNotifications');
  }
};

// ─── GET /api/notifications/non-lues/count ─────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const userId = authorId(req);
    if (!userId) return sendSuccess(res, { count: 0 });
    const r = await pool.query(
      `SELECT COUNT(*)::int AS count FROM notifications
       WHERE id_destinataire = $1 AND lu = false AND titre IS NOT NULL`,
      [userId]
    );
    return sendSuccess(res, { count: r.rows[0].count });
  } catch (error) {
    return handleError(res, error, 'getUnreadCount');
  }
};

// ─── GET /api/notifications/stats/global ───────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const total = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE lu = false)::int AS non_lues,
              COUNT(*) FILTER (WHERE urgent = true)::int AS urgentes
       FROM notifications WHERE titre IS NOT NULL`
    );
    const parType = await pool.query(
      `SELECT type, COUNT(*)::int AS count FROM notifications
       WHERE titre IS NOT NULL AND type IS NOT NULL
       GROUP BY type ORDER BY count DESC`
    );
    return sendSuccess(res, { ...total.rows[0], par_type: parType.rows });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/notifications/:id ────────────────────────────────────
export const getNotificationById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT n.*, n.id_notifications AS id FROM notifications n
       WHERE n.id_notifications = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Notification introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getNotificationById');
  }
};

// ─── POST /api/notifications ───────────────────────────────────────
export const createNotification = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_destinataire, type, titre, contenu, lien, urgent } = req.body || {};
    if (!id_destinataire || !type || !titre) return sendError(res, 'id_destinataire, type, titre requis', 400);
    const r = await pool.query(
      `INSERT INTO notifications
         (id_destinataire, type, titre, contenu, lien, urgent, lu, date_creation, created_at, created_by, name)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW(), $7, $3)
       RETURNING id_notifications AS id, id_destinataire, type, titre, contenu, lien, urgent, lu, date_creation`,
      [id_destinataire, type, titre, contenu || null, lien || null, !!urgent, userId]
    );
    const row = r.rows[0];
    try {
      const io = await getIo();
      if (io) io.to(`user-${id_destinataire}`).emit('notification:new', row);
    } catch {}
    return sendSuccess(res, row, 'Notification créée', 201);
  } catch (error) {
    return handleError(res, error, 'createNotification');
  }
};

// ─── POST /api/notifications/broadcast ─────────────────────────────
export const broadcast = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return sendError(res, 'Accès refusé — administrateur requis', 403);
    const userId = authorId(req);
    const { type, titre, contenu, lien, roles } = req.body || {};
    if (!type || !titre) return sendError(res, 'type et titre requis', 400);
    if (!Array.isArray(roles) || roles.length === 0) return sendError(res, 'roles (array) requis', 400);

    const users = await pool.query(
      `SELECT id_utilisateur FROM utilisateurs WHERE role = ANY($1::text[]) AND actif = true`,
      [roles]
    );
    const created = [];
    for (const u of users.rows) {
      const r = await pool.query(
        `INSERT INTO notifications
           (id_destinataire, type, titre, contenu, lien, urgent, lu, date_creation, created_at, created_by, name)
         VALUES ($1, $2, $3, $4, $5, false, false, NOW(), NOW(), $6, $3)
         RETURNING id_notifications AS id, id_destinataire, type, titre, contenu, lien, urgent, lu, date_creation`,
        [u.id_utilisateur, type, titre, contenu || null, lien || null, userId]
      );
      created.push(r.rows[0]);
    }
    try {
      const io = await getIo();
      if (io) {
        for (const row of created) io.to(`user-${row.id_destinataire}`).emit('notification:new', row);
      }
    } catch {}
    return sendSuccess(res, { count: created.length, items: created }, `${created.length} notifications diffusées`, 201);
  } catch (error) {
    return handleError(res, error, 'broadcast');
  }
};

// ─── PUT /api/notifications/:id/lu ─────────────────────────────────
export const marquerLu = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE notifications SET lu = true, date_lecture = NOW(), updated_at = NOW(), updated_by = $2
       WHERE id_notifications = $1 AND id_destinataire = $2 AND lu = false
       RETURNING id_notifications AS id, id_destinataire, date_lecture`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendSuccess(res, { updated: false }, 'Déjà lue ou non autorisée');
    try {
      const io = await getIo();
      if (io) io.to(`user-${userId}`).emit('notification:read', r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0], 'Marquée comme lue');
  } catch (error) {
    return handleError(res, error, 'marquerLu');
  }
};

// ─── PUT /api/notifications/toutes-lues ────────────────────────────
export const marquerToutesLues = async (req, res) => {
  try {
    const userId = authorId(req);
    if (!userId) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `UPDATE notifications SET lu = true, date_lecture = NOW()
       WHERE id_destinataire = $1 AND lu = false
       RETURNING id_notifications AS id`,
      [userId]
    );
    try {
      const io = await getIo();
      if (io) io.to(`user-${userId}`).emit('notification:all_read', { count: r.rows.length });
    } catch {}
    return sendSuccess(res, { count: r.rows.length }, `${r.rows.length} notifications marquées comme lues`);
  } catch (error) {
    return handleError(res, error, 'marquerToutesLues');
  }
};

// ─── DELETE /api/notifications/:id ─────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const userId = authorId(req);
    const isAdmin = req.user?.role === 'ADMIN';
    const params = isAdmin ? [req.params.id] : [req.params.id, userId];
    const where = isAdmin
      ? 'id_notifications = $1'
      : 'id_notifications = $1 AND id_destinataire = $2';
    const r = await pool.query(
      `DELETE FROM notifications WHERE ${where} RETURNING id_notifications`,
      params
    );
    if (!r.rows[0]) return sendError(res, 'Notification introuvable ou non autorisée', 404);
    return sendSuccess(res, { id: r.rows[0].id_notifications }, 'Notification supprimée');
  } catch (error) {
    return handleError(res, error, 'deleteNotification');
  }
};
