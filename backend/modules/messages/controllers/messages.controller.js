/**
 * Contrôleur Messages — messagerie inter-utilisateurs
 *
 * Endpoints:
 *   GET    /api/messages                          — Liste (filtrable)
 *   GET    /api/messages/non-lus/count            — Nombre non-lus (badge)
 *   GET    /api/messages/conversation/:userId     — Thread bidirectionnel
 *   GET    /api/messages/:id                      — Détail
 *   POST   /api/messages                          — Envoyer
 *   PUT    /api/messages/:id/lu                   — Marquer lu
 *   PUT    /api/messages/tous-lus                 — Tout marquer lu
 *   DELETE /api/messages/:id                      — Supprimer (soft delete)
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError, sendError } from '../../../src/utils/error.helper.js';

// Lazy import de io pour éviter les cycles au chargement du module
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

// ─── GET /api/messages ────────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const userId = authorId(req);
    const { destinataire, expediteur, lu, urgent, search, limit = 100, offset = 0 } = req.query;

    const params = [];
    const where = [];

    // Par défaut : messages dont l'utilisateur est expéditeur OU destinataire
    if (destinataire) {
      params.push(destinataire);
      where.push(`m.id_destinataire = $${params.length}`);
    } else if (expediteur) {
      params.push(expediteur);
      where.push(`m.id_expediteur = $${params.length}`);
    } else if (userId) {
      params.push(userId);
      where.push(`(m.id_destinataire = $${params.length} OR m.id_expediteur = $${params.length})`);
    }

    if (lu === 'true' || lu === true) where.push('m.lu = true');
    else if (lu === 'false' || lu === false) where.push('m.lu = false');

    if (urgent === 'true' || urgent === true) where.push('m.urgent = true');

    if (search) {
      params.push(`%${search}%`);
      where.push(`(m.sujet ILIKE $${params.length} OR m.contenu ILIKE $${params.length})`);
    }

    // Exclure les messages sans contenu (rows stub héritées)
    where.push('m.contenu IS NOT NULL');

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT
        m.id_messages   AS id,
        m.id_expediteur, m.id_destinataire, m.destinataire_poste,
        m.sujet, m.contenu, m.urgent, m.id_of, m.lu,
        m.date_envoi, m.date_lecture,
        exp.nom AS expediteur_nom, exp.prenom AS expediteur_prenom, exp.email AS expediteur_email,
        dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom, dest.email AS destinataire_email
      FROM messages m
      LEFT JOIN utilisateurs exp  ON m.id_expediteur   = exp.id_utilisateur
      LEFT JOIN utilisateurs dest ON m.id_destinataire = dest.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY m.date_envoi DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { messages: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getMessages');
  }
};

// ─── GET /api/messages/non-lus/count ──────────────────────────────
export const getUnreadCount = async (req, res) => {
  try {
    const userId = authorId(req);
    if (!userId) return sendSuccess(res, { count: 0 });
    const r = await pool.query(
      `SELECT COUNT(*)::int AS count FROM messages WHERE id_destinataire = $1 AND lu = false AND contenu IS NOT NULL`,
      [userId]
    );
    return sendSuccess(res, { count: r.rows[0].count });
  } catch (error) {
    return handleError(res, error, 'getUnreadCount');
  }
};

// ─── GET /api/messages/conversation/:userId ───────────────────────
export const getConversation = async (req, res) => {
  try {
    const me = authorId(req);
    const other = parseInt(req.params.userId, 10);
    if (!me || !other) return sendError(res, 'Utilisateur requis', 400);

    const sql = `
      SELECT
        m.id_messages   AS id,
        m.id_expediteur, m.id_destinataire,
        m.sujet, m.contenu, m.urgent, m.id_of, m.lu,
        m.date_envoi, m.date_lecture,
        exp.nom AS expediteur_nom, exp.prenom AS expediteur_prenom,
        dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom
      FROM messages m
      LEFT JOIN utilisateurs exp  ON m.id_expediteur   = exp.id_utilisateur
      LEFT JOIN utilisateurs dest ON m.id_destinataire = dest.id_utilisateur
      WHERE m.contenu IS NOT NULL
        AND ((m.id_expediteur = $1 AND m.id_destinataire = $2)
          OR (m.id_expediteur = $2 AND m.id_destinataire = $1))
      ORDER BY m.date_envoi ASC
    `;
    const r = await pool.query(sql, [me, other]);
    return sendSuccess(res, { messages: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getConversation');
  }
};

// ─── GET /api/messages/:id ────────────────────────────────────────
export const getMessagesById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT m.*, m.id_messages AS id,
              exp.nom AS expediteur_nom, exp.prenom AS expediteur_prenom,
              dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom
       FROM messages m
       LEFT JOIN utilisateurs exp  ON m.id_expediteur   = exp.id_utilisateur
       LEFT JOIN utilisateurs dest ON m.id_destinataire = dest.id_utilisateur
       WHERE m.id_messages = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Message introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getMessagesById');
  }
};

// ─── POST /api/messages ───────────────────────────────────────────
export const createMessages = async (req, res) => {
  try {
    const expediteur = authorId(req);
    if (!expediteur) return sendError(res, 'Utilisateur non authentifié', 401);

    const { destinataire_id, destinataire_poste, sujet, message, contenu, id_of, urgent } = req.body || {};
    const body = contenu ?? message;

    if (!body) return sendError(res, 'Contenu requis', 400);
    if (!destinataire_id && !destinataire_poste) {
      return sendError(res, 'destinataire_id ou destinataire_poste requis', 400);
    }

    const r = await pool.query(
      `INSERT INTO messages
         (id_expediteur, id_destinataire, destinataire_poste, sujet, contenu, urgent, id_of, date_envoi, lu, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, false, $1)
       RETURNING id_messages AS id, id_expediteur, id_destinataire, destinataire_poste, sujet, contenu, urgent, id_of, date_envoi, lu`,
      [expediteur, destinataire_id || null, destinataire_poste || null, sujet || null, body, !!urgent, id_of || null]
    );

    const msg = r.rows[0];

    // Émettre l'événement Socket.IO (best effort)
    try {
      const io = await getIo();
      if (io) {
        if (msg.id_destinataire) {
          io.to(`user-${msg.id_destinataire}`).emit('message:new', msg);
        }
        if (msg.destinataire_poste) {
          io.to(`poste-${msg.destinataire_poste}`).emit('message:new', msg);
        }
      }
    } catch {}

    return sendSuccess(res, msg, 'Message envoyé', 201);
  } catch (error) {
    return handleError(res, error, 'createMessages');
  }
};

// ─── PUT /api/messages/:id/lu ─────────────────────────────────────
export const marquerLu = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `UPDATE messages
         SET lu = true, date_lecture = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP, updated_by = $2
       WHERE id_messages = $1 AND id_destinataire = $2 AND lu = false
       RETURNING id_messages AS id, id_expediteur, date_lecture`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendSuccess(res, { updated: false }, 'Message déjà lu ou non autorisé');

    // Notifier l'expéditeur
    try {
      const io = await getIo();
      if (io && r.rows[0].id_expediteur) {
        io.to(`user-${r.rows[0].id_expediteur}`).emit('message:read', {
          id: r.rows[0].id,
          date_lecture: r.rows[0].date_lecture,
        });
      }
    } catch {}

    return sendSuccess(res, r.rows[0], 'Marqué comme lu');
  } catch (error) {
    return handleError(res, error, 'marquerLu');
  }
};

// ─── PUT /api/messages/tous-lus ───────────────────────────────────
export const marquerTousLus = async (req, res) => {
  try {
    const userId = authorId(req);
    if (!userId) return sendError(res, 'Utilisateur non authentifié', 401);
    const r = await pool.query(
      `UPDATE messages SET lu = true, date_lecture = CURRENT_TIMESTAMP
       WHERE id_destinataire = $1 AND lu = false
       RETURNING id_messages AS id`,
      [userId]
    );
    return sendSuccess(res, { count: r.rows.length }, `${r.rows.length} messages marqués comme lus`);
  } catch (error) {
    return handleError(res, error, 'marquerTousLus');
  }
};

// ─── PUT /api/messages/:id ────────────────────────────────────────
export const updateMessages = async (req, res) => {
  try {
    const userId = authorId(req);
    const { sujet, contenu, urgent } = req.body || {};
    const r = await pool.query(
      `UPDATE messages
         SET sujet = COALESCE($2, sujet), contenu = COALESCE($3, contenu), urgent = COALESCE($4, urgent),
             updated_at = CURRENT_TIMESTAMP, updated_by = $5
       WHERE id_messages = $1 AND id_expediteur = $5
       RETURNING id_messages AS id, sujet, contenu, urgent`,
      [req.params.id, sujet ?? null, contenu ?? null, urgent ?? null, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Message introuvable ou non autorisé', 404);
    return sendSuccess(res, r.rows[0], 'Message mis à jour');
  } catch (error) {
    return handleError(res, error, 'updateMessages');
  }
};

// ─── DELETE /api/messages/:id ─────────────────────────────────────
export const deleteMessages = async (req, res) => {
  try {
    const userId = authorId(req);
    const r = await pool.query(
      `DELETE FROM messages WHERE id_messages = $1 AND (id_expediteur = $2 OR id_destinataire = $2) RETURNING id_messages`,
      [req.params.id, userId]
    );
    if (!r.rows[0]) return sendError(res, 'Message introuvable ou non autorisé', 404);
    return sendSuccess(res, { id: r.rows[0].id_messages }, 'Message supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteMessages');
  }
};
