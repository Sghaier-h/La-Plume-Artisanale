/**
 * Contrôleur Email — outbox / envoi d'emails (SMTP non configuré → mode simulation)
 *
 * Endpoints :
 *   GET    /api/email                             — Liste outbox
 *   GET    /api/email/templates                   — Templates disponibles
 *   POST   /api/email/test                        — Ping SMTP (placeholder)
 *   POST   /api/email/envoyer                     — Envoi générique
 *   POST   /api/email/envoyer/facture/:id_facture — Envoi facture
 *   POST   /api/email/envoyer/bl/:id_bl           — Envoi bon de livraison
 *   POST   /api/email/envoyer/devis/:id_devis     — Envoi devis
 *   GET    /api/email/:id                         — Détail
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { sendEmail } from '../../../src/services/email.service.js';
import {
  bufferPDF, drawInvoice, drawQuote, drawBL, drawAvoir,
  fetchFactureFull, fetchDevisFull, fetchBLFull, fetchAvoirFull,
  loadSociete,
} from '../../../src/services/pdf.service.js';

let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try { _io = (await import('../../../src/server.js')).io; } catch {}
  return _io;
};

const authorId = (req) => req.user?.id || req.user?.userId || null;

// Migration idempotente
(async () => {
  try {
    await pool.query(`
      ALTER TABLE email
        ADD COLUMN IF NOT EXISTS id_destinataire INTEGER,
        ADD COLUMN IF NOT EXISTS destinataire VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sujet VARCHAR(500),
        ADD COLUMN IF NOT EXISTS corps_html TEXT,
        ADD COLUMN IF NOT EXISTS corps_texte TEXT,
        ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
        ADD COLUMN IF NOT EXISTS entity_id INTEGER,
        ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS error_message TEXT
    `);
  } catch (err) {
    console.warn('[email] migration ALTER TABLE échouée:', err.message);
  }
})();

const TEMPLATES = [
  { code: 'facture', libelle: 'Facture', sujet: 'Votre facture {{numero}}', corps_html: '<p>Bonjour,</p><p>Veuillez trouver ci-joint la facture <b>{{numero}}</b>.</p>' },
  { code: 'bl', libelle: 'Bon de livraison', sujet: 'Bon de livraison {{numero}}', corps_html: '<p>Bonjour,</p><p>Votre bon de livraison <b>{{numero}}</b>.</p>' },
  { code: 'devis', libelle: 'Devis', sujet: 'Votre devis {{numero}}', corps_html: '<p>Bonjour,</p><p>Veuillez trouver notre devis <b>{{numero}}</b>.</p>' },
  { code: 'relance', libelle: 'Relance paiement', sujet: 'Relance — facture {{numero}}', corps_html: '<p>Bonjour,</p><p>Nous vous rappelons que la facture {{numero}} reste impayée.</p>' },
];

// Insère la ligne en 'queued' puis tente un envoi SMTP réel via sendEmail().
// Met à jour statut (sent | queued | failed) selon le résultat.
const persistAndSend = async ({ userId, destinataire, id_destinataire, sujet, corps_html, corps_texte, entity_type, entity_id, attachments }) => {
  // 1) Insertion préalable en statut 'queued' — la ligne est toujours sauvegardée.
  const r = await pool.query(
    `INSERT INTO email
       (name, destinataire, id_destinataire, sujet, corps_html, corps_texte, statut,
        entity_type, entity_id, active, created_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'queued', $7, $8, true, NOW(), $9)
     RETURNING id_email AS id, destinataire, id_destinataire, sujet, corps_html, corps_texte, statut,
               entity_type, entity_id, sent_at, error_message`,
    [sujet || 'email', destinataire, id_destinataire || null, sujet || null,
     corps_html || null, corps_texte || null, entity_type || null, entity_id || null, userId]
  );
  let row = r.rows[0];

  // 2) Tentative d'envoi (SMTP optionnel — dégradation gracieuse si non configuré).
  let result;
  try {
    result = await sendEmail({
      to: destinataire,
      subject: sujet || '(sans objet)',
      html: corps_html,
      text: corps_texte,
      attachments: attachments || undefined,
    });
  } catch (err) {
    result = { success: false, error: err.message };
  }

  // 3) Mise à jour du statut selon le résultat.
  if (result.success) {
    const u = await pool.query(
      `UPDATE email SET statut = 'sent', sent_at = NOW(), error_message = NULL
       WHERE id_email = $1
       RETURNING id_email AS id, destinataire, sujet, statut, sent_at, error_message`,
      [row.id]
    );
    row = { ...row, ...u.rows[0] };
    console.log(`[email] sent to ${destinataire}: "${sujet}" (id=${result.messageId || '-'})`);
  } else if (result.mocked) {
    const u = await pool.query(
      `UPDATE email SET statut = 'queued', error_message = $2 WHERE id_email = $1
       RETURNING id_email AS id, destinataire, sujet, statut, sent_at, error_message`,
      [row.id, result.message || 'SMTP non configuré']
    );
    row = { ...row, ...u.rows[0], mocked: true };
    console.log(`[email] queued (SMTP non configuré) → ${destinataire}: "${sujet}"`);
  } else {
    const u = await pool.query(
      `UPDATE email SET statut = 'failed', error_message = $2 WHERE id_email = $1
       RETURNING id_email AS id, destinataire, sujet, statut, sent_at, error_message`,
      [row.id, (result.error || 'unknown').slice(0, 500)]
    );
    row = { ...row, ...u.rows[0] };
    console.warn(`[email] FAILED → ${destinataire}: ${result.error}`);
  }

  try {
    const io = await getIo();
    if (io) io.emit(`email:${row.statut}`, row);
  } catch {}
  return row;
};

// ─── GET /api/email ───────────────────────────────────────────────
export const getEmails = async (req, res) => {
  try {
    const { statut, entity_type, entity_id, limit = 100, offset = 0 } = req.query;
    const params = [];
    const where = ['e.destinataire IS NOT NULL'];
    if (statut) { params.push(statut); where.push(`e.statut = $${params.length}`); }
    if (entity_type) { params.push(entity_type); where.push(`e.entity_type = $${params.length}`); }
    if (entity_id) { params.push(entity_id); where.push(`e.entity_id = $${params.length}`); }
    params.push(parseInt(limit, 10) || 100);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT e.id_email AS id, e.destinataire, e.id_destinataire, e.sujet, e.statut,
             e.entity_type, e.entity_id, e.sent_at, e.error_message, e.created_at
      FROM email e
      WHERE ${where.join(' AND ')}
      ORDER BY e.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getEmails');
  }
};

// ─── GET /api/email/templates ─────────────────────────────────────
export const getTemplates = async (req, res) => sendSuccess(res, { items: TEMPLATES, total: TEMPLATES.length });

// ─── POST /api/email/test ─────────────────────────────────────────
export const testEmail = async (req, res) => {
  try {
    const { destinataire } = req.body || {};
    if (!destinataire) return sendError(res, 'destinataire requis', 400);
    return sendSuccess(res, { destinataire, note: 'SMTP non configuré — ping simulé OK' }, 'Test OK');
  } catch (error) {
    return handleError(res, error, 'testEmail');
  }
};

// ─── POST /api/email/envoyer ──────────────────────────────────────
export const envoyerEmail = async (req, res) => {
  try {
    const userId = authorId(req);
    const { destinataire, sujet, corps_html, corps_texte, entity_type, entity_id, id_destinataire } = req.body || {};
    if (!destinataire) return sendError(res, 'destinataire requis', 400);
    const row = await persistAndSend({ userId, destinataire, id_destinataire, sujet, corps_html, corps_texte, entity_type, entity_id });
    const msg = row.statut === 'sent' ? 'Email envoyé'
              : row.statut === 'queued' ? 'Email en file (SMTP non configuré)'
              : 'Email en erreur';
    return sendSuccess(res, row, msg, 201);
  } catch (error) {
    return handleError(res, error, 'envoyerEmail');
  }
};

// ─── POST /api/email/envoyer/facture/:id_facture ──────────────────
export const envoyerFacture = async (req, res) => {
  try {
    const userId = authorId(req);
    const idFacture = req.params.id_facture;
    const f = await pool.query(
      `SELECT f.*, c.raison_sociale, c.email
       FROM factures f LEFT JOIN clients c ON f.id_client = c.id_client
       WHERE f.id_facture = $1`,
      [idFacture]
    );
    if (!f.rows[0]) return sendError(res, 'Facture introuvable', 404);
    const facture = f.rows[0];
    const numero = facture.numero_facture || idFacture;
    const montant = facture.montant_total || facture.total_ttc || facture.montant_ttc || '';
    const client = facture.raison_sociale || '';
    const sujet = `Votre facture ${numero}`;
    const corps_html = `
      <p>Bonjour ${client},</p>
      <p>Veuillez trouver ci-après votre facture <b>${numero}</b>${montant ? ` d'un montant de <b>${montant} TND</b>` : ''}.</p>
      <p>Lien PDF: <a href="${req.body?.lien_pdf || '#'}">Télécharger la facture</a></p>
      <p>Cordialement,<br>La Plume Artisanale</p>
    `;
    const destinataire = req.body?.destinataire || facture.email;
    if (!destinataire) return sendError(res, 'Email destinataire introuvable', 400);

    // Génération PDF en pièce jointe
    let attachments;
    try {
      const full = await fetchFactureFull(idFacture);
      if (full) {
        const societe = await loadSociete();
        const pdfBuffer = await bufferPDF(drawInvoice, { ...full, societe });
        attachments = [{ filename: `facture-${numero}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }];
      }
    } catch (e) { console.warn('[email] PDF facture non généré:', e.message); }

    const row = await persistAndSend({ userId, destinataire, sujet, corps_html, entity_type: 'facture', entity_id: idFacture, attachments });
    const msg = row.statut === 'sent' ? 'Facture envoyée'
              : row.statut === 'queued' ? 'Facture en file (SMTP non configuré)'
              : 'Facture en erreur';
    return sendSuccess(res, row, msg, 201);
  } catch (error) {
    return handleError(res, error, 'envoyerFacture');
  }
};

// ─── POST /api/email/envoyer/bl/:id_bl ────────────────────────────
export const envoyerBL = async (req, res) => {
  try {
    const userId = authorId(req);
    const idBl = req.params.id_bl;
    const b = await pool.query(
      `SELECT b.id_bl, b.numero_bl, c.raison_sociale, c.email
       FROM bons_livraison b LEFT JOIN clients c ON b.id_client = c.id_client
       WHERE b.id_bl = $1`,
      [idBl]
    );
    if (!b.rows[0]) return sendError(res, 'Bon de livraison introuvable', 404);
    const bl = b.rows[0];
    const tpl = TEMPLATES.find(t => t.code === 'bl');
    const sujet = tpl.sujet.replace('{{numero}}', bl.numero_bl || idBl);
    const corps_html = tpl.corps_html.replace('{{numero}}', bl.numero_bl || idBl);
    const destinataire = req.body?.destinataire || bl.email;
    if (!destinataire) return sendError(res, 'Email destinataire introuvable', 400);

    let attachments;
    try {
      const full = await fetchBLFull(idBl);
      if (full) {
        const societe = await loadSociete();
        const pdfBuffer = await bufferPDF(drawBL, { ...full, societe });
        attachments = [{ filename: `bl-${bl.numero_bl || idBl}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }];
      }
    } catch (e) { console.warn('[email] PDF BL non généré:', e.message); }

    const row = await persistAndSend({ userId, destinataire, sujet, corps_html, entity_type: 'bl', entity_id: idBl, attachments });
    return sendSuccess(res, row, 'BL envoyé', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerBL');
  }
};

// ─── POST /api/email/envoyer/devis/:id_devis ──────────────────────
export const envoyerDevis = async (req, res) => {
  try {
    const userId = authorId(req);
    const idDevis = req.params.id_devis;
    const d = await pool.query(
      `SELECT d.id_devis, d.numero_devis, c.raison_sociale, c.email
       FROM devis d LEFT JOIN clients c ON d.id_client = c.id_client
       WHERE d.id_devis = $1`,
      [idDevis]
    );
    if (!d.rows[0]) return sendError(res, 'Devis introuvable', 404);
    const devis = d.rows[0];
    const tpl = TEMPLATES.find(t => t.code === 'devis');
    const sujet = tpl.sujet.replace('{{numero}}', devis.numero_devis || idDevis);
    const corps_html = tpl.corps_html.replace('{{numero}}', devis.numero_devis || idDevis);
    const destinataire = req.body?.destinataire || devis.email;
    if (!destinataire) return sendError(res, 'Email destinataire introuvable', 400);

    let attachments;
    try {
      const full = await fetchDevisFull(idDevis);
      if (full) {
        const societe = await loadSociete();
        const pdfBuffer = await bufferPDF(drawQuote, { ...full, societe });
        attachments = [{ filename: `devis-${devis.numero_devis || idDevis}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }];
      }
    } catch (e) { console.warn('[email] PDF devis non généré:', e.message); }

    const row = await persistAndSend({ userId, destinataire, sujet, corps_html, entity_type: 'devis', entity_id: idDevis, attachments });
    return sendSuccess(res, row, 'Devis envoyé', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerDevis');
  }
};

// ─── GET /api/email/:id ───────────────────────────────────────────
export const getEmailById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT *, id_email AS id FROM email WHERE id_email = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Email introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getEmailById');
  }
};
