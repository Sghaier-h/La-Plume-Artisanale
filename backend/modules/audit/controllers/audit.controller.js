/**
 * Contrôleur Audit — Journal d'audit / traçabilité des actions utilisateurs
 *
 * Endpoints :
 *   GET    /api/audit                            — Liste (filtrable)
 *   GET    /api/audit/stats/global               — Stats globales
 *   GET    /api/audit/entity/:type/:id           — Historique d'une entité
 *   GET    /api/audit/user/:id_user/recent       — 50 dernières actions d'un utilisateur
 *   GET    /api/audit/:id                        — Détail
 *   POST   /api/audit                            — Créer un événement d'audit
 *   DELETE /api/audit/:id                        — Supprimer (admin uniquement)
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Migration idempotente : ajouter les colonnes nécessaires au module au chargement
(async () => {
  try {
    await pool.query(`
      ALTER TABLE audit
        ADD COLUMN IF NOT EXISTS id_user INTEGER,
        ADD COLUMN IF NOT EXISTS action VARCHAR(100),
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS entity_id INTEGER,
        ADD COLUMN IF NOT EXISTS ancien_valeur JSONB,
        ADD COLUMN IF NOT EXISTS nouveau_valeur JSONB,
        ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64),
        ADD COLUMN IF NOT EXISTS user_agent TEXT,
        ADD COLUMN IF NOT EXISTS date_action TIMESTAMP DEFAULT NOW()
    `);
  } catch (err) {
    console.warn('[audit] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── GET /api/audit ───────────────────────────────────────────────
export const getAudit = async (req, res) => {
  try {
    const { id_user, action, entity_type, entity_id, date_debut, date_fin, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['a.action IS NOT NULL'];

    if (id_user) { params.push(id_user); where.push(`a.id_user = $${params.length}`); }
    if (action) { params.push(action); where.push(`a.action = $${params.length}`); }
    if (entity_type) { params.push(entity_type); where.push(`a.entity_type = $${params.length}`); }
    if (entity_id) { params.push(entity_id); where.push(`a.entity_id = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`a.date_action >= $${params.length}`); }
    if (date_fin) { params.push(date_fin); where.push(`a.date_action <= $${params.length}`); }

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT a.id_audit AS id, a.id_user, a.action, a.entity_type, a.entity_id,
             a.ancien_valeur, a.nouveau_valeur, a.ip_address, a.user_agent, a.date_action,
             u.email AS user_email, u.nom AS user_nom, u.prenom AS user_prenom
      FROM audit a
      LEFT JOIN utilisateurs u ON a.id_user = u.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY a.date_action DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getAudit');
  }
};

// ─── GET /api/audit/stats/global ──────────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const total = await pool.query(`SELECT COUNT(*)::int AS total FROM audit WHERE action IS NOT NULL`);
    const parType = await pool.query(
      `SELECT action, COUNT(*)::int AS count FROM audit WHERE action IS NOT NULL
       GROUP BY action ORDER BY count DESC`
    );
    const topUsers = await pool.query(
      `SELECT a.id_user, u.email, u.nom, u.prenom, COUNT(*)::int AS count
       FROM audit a
       LEFT JOIN utilisateurs u ON a.id_user = u.id_utilisateur
       WHERE a.action IS NOT NULL AND a.id_user IS NOT NULL
       GROUP BY a.id_user, u.email, u.nom, u.prenom
       ORDER BY count DESC
       LIMIT 10`
    );
    return sendSuccess(res, {
      total_events: total.rows[0].total,
      actions_par_type: parType.rows,
      top_10_users: topUsers.rows,
    });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/audit/entity/:type/:id ──────────────────────────────
export const getByEntity = async (req, res) => {
  try {
    const { type, id } = req.params;
    const r = await pool.query(
      `SELECT a.id_audit AS id, a.id_user, a.action, a.entity_type, a.entity_id,
              a.ancien_valeur, a.nouveau_valeur, a.ip_address, a.user_agent, a.date_action,
              u.email AS user_email
       FROM audit a
       LEFT JOIN utilisateurs u ON a.id_user = u.id_utilisateur
       WHERE a.entity_type = $1 AND a.entity_id = $2
       ORDER BY a.date_action DESC`,
      [type, id]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getByEntity');
  }
};

// ─── GET /api/audit/user/:id_user/recent ──────────────────────────
export const getRecentByUser = async (req, res) => {
  try {
    const { id_user } = req.params;
    const r = await pool.query(
      `SELECT a.id_audit AS id, a.action, a.entity_type, a.entity_id,
              a.ancien_valeur, a.nouveau_valeur, a.ip_address, a.date_action
       FROM audit a
       WHERE a.id_user = $1 AND a.action IS NOT NULL
       ORDER BY a.date_action DESC
       LIMIT 50`,
      [id_user]
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getRecentByUser');
  }
};

// ─── GET /api/audit/:id ───────────────────────────────────────────
export const getAuditById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT a.*, a.id_audit AS id, u.email AS user_email, u.nom AS user_nom, u.prenom AS user_prenom
       FROM audit a
       LEFT JOIN utilisateurs u ON a.id_user = u.id_utilisateur
       WHERE a.id_audit = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Événement d\'audit introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getAuditById');
  }
};

// ─── POST /api/audit ──────────────────────────────────────────────
export const createAudit = async (req, res) => {
  try {
    const userId = authorId(req);
    const { action, entity_type, entity_id, ancien_valeur, nouveau_valeur } = req.body || {};
    if (!action) return sendError(res, 'action requis', 400);

    const ip = req.ip || req.headers['x-forwarded-for'] || null;
    const ua = req.headers['user-agent'] || null;

    const r = await pool.query(
      `INSERT INTO audit
         (id_user, action, entity_type, entity_id, ancien_valeur, nouveau_valeur, ip_address, user_agent, date_action, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $1)
       RETURNING id_audit AS id, id_user, action, entity_type, entity_id, ancien_valeur, nouveau_valeur, ip_address, user_agent, date_action`,
      [
        userId,
        action,
        entity_type || null,
        entity_id || null,
        ancien_valeur ? JSON.stringify(ancien_valeur) : null,
        nouveau_valeur ? JSON.stringify(nouveau_valeur) : null,
        ip,
        ua,
      ]
    );
    return sendSuccess(res, r.rows[0], 'Événement d\'audit créé', 201);
  } catch (error) {
    return handleError(res, error, 'createAudit');
  }
};

// ─── DELETE /api/audit/:id ────────────────────────────────────────
export const deleteAudit = async (req, res) => {
  try {
    if (req.user?.role !== 'ADMIN') return sendError(res, 'Accès refusé — administrateur requis', 403);
    const r = await pool.query(
      `DELETE FROM audit WHERE id_audit = $1 RETURNING id_audit`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Événement d\'audit introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_audit }, 'Supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteAudit');
  }
};
