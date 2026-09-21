/**
 * Contrôleur Whatsapp — envoi et suivi de messages WhatsApp (stub)
 *
 * Endpoints:
 *   GET    /api/whatsapp                                      — Outbox
 *   GET    /api/whatsapp/templates                            — Templates disponibles
 *   GET    /api/whatsapp/stats/global                         — Stats
 *   POST   /api/whatsapp/envoyer                              — Envoyer un message libre
 *   POST   /api/whatsapp/envoyer/facture/:id_facture          — Envoyer une facture
 *   POST   /api/whatsapp/envoyer/bl/:id_bl                    — Envoyer un BL
 *   POST   /api/whatsapp/envoyer/commande-confirmation/:id    — Confirmer une commande
 *   POST   /api/whatsapp/webhook                              — Webhook (pas d'auth)
 *   GET    /api/whatsapp/:id                                  — Détail
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

// Migration idempotente
(async () => {
  try {
    await pool.query(`
      ALTER TABLE whatsapp
        ADD COLUMN IF NOT EXISTS destinataire_phone VARCHAR(32),
        ADD COLUMN IF NOT EXISTS message TEXT,
        ADD COLUMN IF NOT EXISTS template_code VARCHAR(80),
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(80),
        ADD COLUMN IF NOT EXISTS entity_id INTEGER,
        ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'queued',
        ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS read_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS error_message TEXT
    `);
  } catch (err) {
    console.warn('[whatsapp] migration ALTER TABLE échouée:', err.message);
  }
})();

const TEMPLATES = [
  { code: 'facture_pdf', label: 'Envoi facture PDF', variables: ['numero_facture', 'montant', 'lien_pdf'] },
  { code: 'bl_livre', label: 'BL livré', variables: ['numero_bl', 'date_livraison'] },
  { code: 'commande_confirmee', label: 'Commande confirmée', variables: ['numero_commande', 'date_livraison_prevue'] },
  { code: 'rendez_vous', label: 'Rappel rendez-vous', variables: ['date', 'heure'] },
  { code: 'alerte_stock', label: 'Alerte stock bas', variables: ['produit', 'quantite_restante'] },
];

// ─── GET /api/whatsapp ─────────────────────────────────────────────
export const getWhatsapp = async (req, res) => {
  try {
    const { statut, entity_type, date_debut, date_fin, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['w.destinataire_phone IS NOT NULL'];

    if (statut) { params.push(statut); where.push(`w.statut = $${params.length}`); }
    if (entity_type) { params.push(entity_type); where.push(`w.entity_type = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`w.created_at >= $${params.length}`); }
    if (date_fin) { params.push(date_fin); where.push(`w.created_at <= $${params.length}`); }

    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT w.id_whatsapp AS id, w.destinataire_phone, w.message, w.template_code,
             w.entity_type, w.entity_id, w.statut, w.sent_at, w.delivered_at, w.read_at,
             w.error_message, w.created_at
      FROM whatsapp w
      WHERE ${where.join(' AND ')}
      ORDER BY w.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getWhatsapp');
  }
};

// ─── GET /api/whatsapp/templates ───────────────────────────────────
export const getTemplates = async (req, res) => {
  return sendSuccess(res, { items: TEMPLATES, total: TEMPLATES.length });
};

// ─── GET /api/whatsapp/stats/global ────────────────────────────────
export const getStatsGlobal = async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE statut = 'sent')::int AS envoyes,
        COUNT(*) FILTER (WHERE statut = 'delivered')::int AS livres,
        COUNT(*) FILTER (WHERE statut = 'read')::int AS lus,
        COUNT(*) FILTER (WHERE statut = 'failed')::int AS echecs
      FROM whatsapp
      WHERE destinataire_phone IS NOT NULL
    `);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};

// ─── GET /api/whatsapp/:id ─────────────────────────────────────────
export const getWhatsappById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT w.*, w.id_whatsapp AS id FROM whatsapp w WHERE w.id_whatsapp = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Message WhatsApp introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getWhatsappById');
  }
};

// Helper interne : insertion + stub d'envoi immédiat
const _enqueue = async ({ phone, message, template_code, entity_type, entity_id, userId }) => {
  const r = await pool.query(
    `INSERT INTO whatsapp
       (destinataire_phone, message, template_code, entity_type, entity_id, statut, sent_at, created_at, created_by)
     VALUES ($1, $2, $3, $4, $5, 'sent', NOW(), NOW(), $6)
     RETURNING id_whatsapp AS id, destinataire_phone, message, template_code, entity_type, entity_id, statut, sent_at`,
    [phone, message, template_code || null, entity_type || null, entity_id || null, userId]
  );
  const row = r.rows[0];
  console.log(`[whatsapp] STUB → phone=${phone} template=${template_code || 'libre'} entity=${entity_type || '-'}#${entity_id || '-'}`);
  try {
    const io = await getIo();
    if (io) io.emit('whatsapp:sent', row);
  } catch {}
  return row;
};

// ─── POST /api/whatsapp/envoyer ────────────────────────────────────
export const envoyerMessage = async (req, res) => {
  try {
    const userId = authorId(req);
    const { destinataire_phone, message, template_code, entity_type, entity_id } = req.body || {};
    if (!destinataire_phone) return sendError(res, 'destinataire_phone requis', 400);
    if (!message && !template_code) return sendError(res, 'message ou template_code requis', 400);
    const row = await _enqueue({ phone: destinataire_phone, message: message || `[${template_code}]`, template_code, entity_type, entity_id, userId });
    return sendSuccess(res, row, 'Message WhatsApp envoyé', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerMessage');
  }
};

// ─── POST /api/whatsapp/envoyer/facture/:id_facture ────────────────
export const envoyerFacture = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_facture } = req.params;
    let phone = null; let numero = id_facture;
    try {
      const r = await pool.query(
        `SELECT f.*, c.telephone AS client_phone
         FROM factures f LEFT JOIN clients c ON c.id_client = f.id_client
         WHERE f.id_factures = $1 OR f.id_facture = $1 LIMIT 1`,
        [id_facture]
      );
      if (r.rows[0]) { phone = r.rows[0].client_phone; numero = r.rows[0].numero_facture || numero; }
    } catch {}
    if (!phone) return sendError(res, 'Téléphone client introuvable pour cette facture', 404);
    const row = await _enqueue({
      phone, message: `Facture ${numero} disponible`,
      template_code: 'facture_pdf', entity_type: 'facture', entity_id: id_facture, userId,
    });
    return sendSuccess(res, row, 'Facture envoyée par WhatsApp', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerFacture');
  }
};

// ─── POST /api/whatsapp/envoyer/bl/:id_bl ──────────────────────────
export const envoyerBL = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_bl } = req.params;
    let phone = null; let numero = id_bl;
    try {
      const r = await pool.query(
        `SELECT b.*, c.telephone AS client_phone
         FROM bons_livraison b LEFT JOIN clients c ON c.id_client = b.id_client
         WHERE b.id_bons_livraison = $1 OR b.id_bl = $1 LIMIT 1`,
        [id_bl]
      );
      if (r.rows[0]) { phone = r.rows[0].client_phone; numero = r.rows[0].numero_bl || numero; }
    } catch {}
    if (!phone) return sendError(res, 'Téléphone client introuvable pour ce BL', 404);
    const row = await _enqueue({
      phone, message: `Bon de livraison ${numero} livré`,
      template_code: 'bl_livre', entity_type: 'bl', entity_id: id_bl, userId,
    });
    return sendSuccess(res, row, 'BL envoyé par WhatsApp', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerBL');
  }
};

// ─── POST /api/whatsapp/envoyer/commande-confirmation/:id_commande ─
export const envoyerCommandeConfirmation = async (req, res) => {
  try {
    const userId = authorId(req);
    const { id_commande } = req.params;
    let phone = null; let numero = id_commande;
    try {
      const r = await pool.query(
        `SELECT co.*, c.telephone AS client_phone
         FROM commandes co LEFT JOIN clients c ON c.id_client = co.id_client
         WHERE co.id_commandes = $1 OR co.id_commande = $1 LIMIT 1`,
        [id_commande]
      );
      if (r.rows[0]) { phone = r.rows[0].client_phone; numero = r.rows[0].numero_commande || numero; }
    } catch {}
    if (!phone) return sendError(res, 'Téléphone client introuvable pour cette commande', 404);
    const row = await _enqueue({
      phone, message: `Commande ${numero} confirmée`,
      template_code: 'commande_confirmee', entity_type: 'commande', entity_id: id_commande, userId,
    });
    return sendSuccess(res, row, 'Confirmation commande envoyée', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerCommandeConfirmation');
  }
};

// ─── POST /api/whatsapp/webhook (no auth) ──────────────────────────
export const webhook = async (req, res) => {
  try {
    const { message_id, status } = req.body || {};
    if (!message_id || !status) return sendError(res, 'message_id et status requis', 400);
    const column = status === 'delivered' ? 'delivered_at' : status === 'read' ? 'read_at' : null;
    if (!column) return sendError(res, 'status invalide (delivered|read)', 400);
    const r = await pool.query(
      `UPDATE whatsapp SET statut = $2, ${column} = NOW(), updated_at = NOW()
       WHERE id_whatsapp = $1 RETURNING id_whatsapp AS id, statut, ${column}`,
      [message_id, status]
    );
    if (!r.rows[0]) return sendError(res, 'Message introuvable', 404);
    try {
      const io = await getIo();
      if (io) io.emit(`whatsapp:${status}`, r.rows[0]);
    } catch {}
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'webhook');
  }
};
