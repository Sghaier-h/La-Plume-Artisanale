/**
 * Contrôleur Communication — Messagerie multi-canal (email / whatsapp / sms / interne)
 *
 * Endpoints:
 *   GET  /api/communication/canaux              — Liste des canaux disponibles
 *   GET  /api/communication/templates           — Templates prédéfinis
 *   GET  /api/communication/conversations       — Conversations groupées
 *   GET  /api/communication/messages            — Liste filtrable des messages
 *   POST /api/communication/messages            — Envoyer un message multi-canal
 *   GET  /api/communication                     — Liste brute (legacy)
 *   GET  /api/communication/:id                 — Détail
 *   PUT  /api/communication/:id                 — Update
 *   DELETE /api/communication/:id               — Supprime
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
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

// Migration idempotente : colonnes multi-canal
(async () => {
  try {
    await pool.query(`
      ALTER TABLE communication
        ADD COLUMN IF NOT EXISTS canal VARCHAR(20),
        ADD COLUMN IF NOT EXISTS template_code VARCHAR(80),
        ADD COLUMN IF NOT EXISTS id_expediteur INTEGER,
        ADD COLUMN IF NOT EXISTS id_destinataire INTEGER,
        ADD COLUMN IF NOT EXISTS contenu TEXT,
        ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(80),
        ADD COLUMN IF NOT EXISTS entity_id INTEGER
    `);
  } catch (err) {
    console.warn('[communication] migration ALTER TABLE échouée:', err.message);
  }
})();

// ─── Canaux ──────────────────────────────────────────────────────
const CANAUX = [
  { code: 'email', libelle: 'Email', actif: true, icon: 'mail' },
  { code: 'whatsapp', libelle: 'WhatsApp', actif: true, icon: 'whatsapp' },
  { code: 'sms', libelle: 'SMS', actif: false, icon: 'phone' },
  { code: 'interne', libelle: 'Messagerie interne', actif: true, icon: 'message-circle' },
];

// ─── Templates ───────────────────────────────────────────────────
const TEMPLATES = [
  { code: 'facture', libelle: 'Envoi facture', canal: 'email',
    sujet: 'Votre facture {{numero}}', corps: 'Bonjour {{client}},\nVeuillez trouver ci-joint votre facture {{numero}} d\'un montant de {{montant}} TND.\nCordialement,\nLa Plume Artisanale' },
  { code: 'bl', libelle: 'Envoi bon de livraison', canal: 'email',
    sujet: 'Bon de livraison {{numero}}', corps: 'Bonjour {{client}},\nVotre bon de livraison {{numero}} est prêt.\nCordialement,\nLa Plume Artisanale' },
  { code: 'commande_confirmee', libelle: 'Confirmation de commande', canal: 'whatsapp',
    sujet: 'Commande confirmée', corps: 'Bonjour {{client}}, votre commande {{numero}} est confirmée. Livraison prévue le {{date_livraison}}.' },
  { code: 'alerte_stock', libelle: 'Alerte stock bas', canal: 'interne',
    sujet: 'Alerte stock — {{article}}', corps: 'Le stock de {{article}} est en dessous du seuil ({{stock}} restants).' },
  { code: 'task_assignee', libelle: 'Tâche assignée', canal: 'interne',
    sujet: 'Nouvelle tâche : {{titre}}', corps: 'Une nouvelle tâche vous a été assignée : {{titre}}. Échéance : {{echeance}}.' },
  { code: 'birthday', libelle: 'Anniversaire employé', canal: 'interne',
    sujet: 'Joyeux anniversaire !', corps: 'Toute l\'équipe La Plume Artisanale vous souhaite un joyeux anniversaire {{prenom}} !' },
  { code: 'welcome', libelle: 'Bienvenue', canal: 'email',
    sujet: 'Bienvenue chez La Plume Artisanale', corps: 'Bonjour {{prenom}},\nBienvenue dans notre équipe !\nCordialement.' },
];

// ─── GET /api/communication/canaux ───────────────────────────────
export const getCanaux = async (req, res) => {
  try {
    return sendSuccess(res, { items: CANAUX, total: CANAUX.length });
  } catch (error) {
    return handleError(res, error, 'getCanaux');
  }
};

// ─── GET /api/communication/templates ────────────────────────────
export const getTemplates = async (req, res) => {
  try {
    const { canal } = req.query;
    const items = canal ? TEMPLATES.filter(t => t.canal === canal) : TEMPLATES;
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'getTemplates');
  }
};

// ─── GET /api/communication/messages ─────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const { canal, statut, entity_type, date_debut, date_fin, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['c.canal IS NOT NULL'];

    if (canal) { params.push(canal); where.push(`c.canal = $${params.length}`); }
    if (statut) { params.push(statut); where.push(`c.statut = $${params.length}`); }
    if (entity_type) { params.push(entity_type); where.push(`c.entity_type = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`c.sent_at >= $${params.length}`); }
    if (date_fin) { params.push(date_fin); where.push(`c.sent_at <= $${params.length}`); }

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT c.id_communication AS id, c.canal, c.template_code, c.id_expediteur, c.id_destinataire,
             c.contenu, c.statut, c.sent_at, c.entity_type, c.entity_id, c.created_at,
             exp.nom AS expediteur_nom, exp.prenom AS expediteur_prenom,
             dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom
      FROM communication c
      LEFT JOIN utilisateurs exp  ON c.id_expediteur   = exp.id_utilisateur
      LEFT JOIN utilisateurs dest ON c.id_destinataire = dest.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY COALESCE(c.sent_at, c.created_at) DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getMessages');
  }
};

// ─── POST /api/communication/messages ────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const { canal, id_destinataire, contenu, template_code, entity_type, entity_id } = req.body || {};

    if (!canal) return sendError(res, 'canal requis', 400);
    if (!contenu) return sendError(res, 'contenu requis', 400);
    if (!CANAUX.find(c => c.code === canal)) return sendError(res, `Canal '${canal}' inconnu`, 400);

    let statut = 'sent';
    let deliveryNote = null;

    // Dispatch selon canal — insertion best-effort dans table cible
    try {
      if (canal === 'email') {
        // insertion basique dans table emails si existante
        await pool.query(
          `INSERT INTO emails (destinataire_id, sujet, corps, statut, sent_at, created_by, created_at)
           VALUES ($1, $2, $3, 'sent', NOW(), $4, NOW())
           ON CONFLICT DO NOTHING`,
          [id_destinataire || null, template_code || 'communication', contenu, userId]
        ).catch(() => null);
      } else if (canal === 'whatsapp') {
        await pool.query(
          `INSERT INTO whatsapp (id_destinataire, contenu, statut, sent_at, created_by, created_at)
           VALUES ($1, $2, 'sent', NOW(), $3, NOW())
           ON CONFLICT DO NOTHING`,
          [id_destinataire || null, contenu, userId]
        ).catch(() => null);
      } else if (canal === 'interne') {
        // Insertion directe dans messages
        await pool.query(
          `INSERT INTO messages
             (id_expediteur, id_destinataire, contenu, date_envoi, lu, created_by, created_at)
           VALUES ($1, $2, $3, NOW(), false, $1, NOW())`,
          [userId, id_destinataire || null, contenu]
        );
        // Notifier via Socket.IO
        try {
          const io = await getIo();
          if (io && id_destinataire) {
            io.to(`user-${id_destinataire}`).emit('message:new', { contenu, id_expediteur: userId });
          }
        } catch {}
      } else if (canal === 'sms') {
        statut = 'queued';
        deliveryNote = 'SMS provider non configuré — message enregistré en attente.';
      }
    } catch (dispatchErr) {
      console.warn('[communication] dispatch error:', dispatchErr.message);
      statut = 'failed';
      deliveryNote = dispatchErr.message;
    }

    const r = await pool.query(
      `INSERT INTO communication
         (canal, template_code, id_expediteur, id_destinataire, contenu, statut, sent_at, entity_type, entity_id, created_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, NOW(), $3)
       RETURNING id_communication AS id, canal, template_code, id_expediteur, id_destinataire, contenu, statut, sent_at, entity_type, entity_id`,
      [canal, template_code || null, userId, id_destinataire || null, contenu, statut, entity_type || null, entity_id || null]
    );

    const row = r.rows[0];

    // Émettre l'événement Socket.IO global
    try {
      const io = await getIo();
      if (io) io.emit('communication:sent', row);
    } catch {}

    return sendSuccess(res, { ...row, note: deliveryNote }, 'Message envoyé', 201);
  } catch (error) {
    return handleError(res, error, 'sendMessage');
  }
};

// ─── GET /api/communication/conversations ────────────────────────
export const getConversations = async (req, res) => {
  try {
    const { canal } = req.query;
    const params = [];
    const where = ['c.canal IS NOT NULL', 'c.id_destinataire IS NOT NULL'];
    if (canal) { params.push(canal); where.push(`c.canal = $${params.length}`); }

    const sql = `
      SELECT DISTINCT ON (c.canal, c.id_destinataire)
             c.canal, c.id_destinataire,
             c.id_communication AS last_message_id,
             c.contenu AS last_contenu,
             c.statut AS last_statut,
             c.sent_at AS last_sent_at,
             dest.nom AS destinataire_nom, dest.prenom AS destinataire_prenom, dest.email AS destinataire_email,
             (SELECT COUNT(*)::int FROM communication c2
              WHERE c2.canal = c.canal AND c2.id_destinataire = c.id_destinataire
                AND c2.statut IN ('pending','queued','sent')) AS message_count
      FROM communication c
      LEFT JOIN utilisateurs dest ON c.id_destinataire = dest.id_utilisateur
      WHERE ${where.join(' AND ')}
      ORDER BY c.canal, c.id_destinataire, COALESCE(c.sent_at, c.created_at) DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getConversations');
  }
};

// ─── GET /api/communication ──────────────────────────────────────
export const getCommunication = async (req, res) => {
  try {
    const query = `SELECT * FROM communication ORDER BY created_at DESC LIMIT 200`;
    const result = await pool.query(query);
    return sendSuccess(res, { items: result.rows, total: result.rows.length });
  } catch (error) {
    return handleError(res, error, 'getCommunication');
  }
};

// ─── GET /api/communication/:id ──────────────────────────────────
export const getCommunicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`SELECT * FROM communication WHERE id_communication = $1`, [id]);
    if (r.rows.length === 0) return sendError(res, 'Communication non trouvée', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getCommunicationById');
  }
};

// ─── POST /api/communication ─────────────────────────────────────
export const createCommunication = async (req, res) => {
  // Alias vers sendMessage
  return sendMessage(req, res);
};

// ─── PUT /api/communication/:id ──────────────────────────────────
export const updateCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const { statut, contenu } = req.body || {};
    const r = await pool.query(
      `UPDATE communication
         SET statut = COALESCE($2, statut), contenu = COALESCE($3, contenu),
             updated_at = NOW(), updated_by = $4
       WHERE id_communication = $1 RETURNING *`,
      [id, statut ?? null, contenu ?? null, userId]
    );
    if (r.rows.length === 0) return sendError(res, 'Communication non trouvée', 404);
    return sendSuccess(res, r.rows[0], 'Mise à jour');
  } catch (error) {
    return handleError(res, error, 'updateCommunication');
  }
};

// ─── DELETE /api/communication/:id ───────────────────────────────
export const deleteCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query(`DELETE FROM communication WHERE id_communication = $1 RETURNING id_communication`, [id]);
    if (r.rows.length === 0) return sendError(res, 'Communication non trouvée', 404);
    return sendSuccess(res, { id: r.rows[0].id_communication }, 'Supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteCommunication');
  }
};
