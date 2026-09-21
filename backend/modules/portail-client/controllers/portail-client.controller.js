/**
 * Contrôleur Portail Client
 * Endpoints sous /api/portail — voir routes/portail-client.routes.js
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const JWT_TTL = '7d';
const BCRYPT_ROUNDS = 10;

// ────────── AUTH ──────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return sendError(res, 'Email et mot de passe requis', 400);

    const r = await pool.query(
      `SELECT id_client, raison_sociale, email, portail_password_hash, portail_activated
         FROM clients WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [email]
    );
    const client = r.rows[0];
    if (!client || !client.portail_activated || !client.portail_password_hash) {
      return sendError(res, 'Identifiants incorrects ou portail non activé', 401);
    }
    const ok = await bcrypt.compare(password, client.portail_password_hash);
    if (!ok) return sendError(res, 'Identifiants incorrects', 401);

    const token = jwt.sign(
      { portail: true, id_client: client.id_client, email: client.email },
      JWT_SECRET,
      { expiresIn: JWT_TTL }
    );
    await pool.query(
      `UPDATE clients SET portail_last_login = CURRENT_TIMESTAMP WHERE id_client = $1`,
      [client.id_client]
    );
    return sendSuccess(res, {
      token,
      client: {
        id_client: client.id_client,
        raison_sociale: client.raison_sociale,
        email: client.email
      }
    }, 'Connecté');
  } catch (error) { return handleError(res, error, 'portail.login'); }
};

// Blacklist en mémoire (best-effort)
const _blacklist = new Set();
export const logout = async (req, res) => {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (auth) _blacklist.add(auth);
  return sendSuccess(res, { logged_out: true });
};
export const isBlacklisted = (t) => _blacklist.has(t);

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return sendError(res, 'Email requis', 400);
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await pool.query(
      `UPDATE clients SET portail_reset_token = $1, portail_reset_expires = $2
         WHERE LOWER(email) = LOWER($3)`,
      [token, expires, email]
    );
    // TODO en prod: envoyer email avec lien /portail/reset-password/:token
    return sendSuccess(res, { sent: true, ...(process.env.NODE_ENV !== 'production' ? { debug_token: token } : {}) },
      'Si le compte existe, un email a été envoyé');
  } catch (error) { return handleError(res, error, 'portail.forgotPassword'); }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body || {};
    if (!token || !new_password) return sendError(res, 'Token et nouveau mot de passe requis', 400);
    if (new_password.length < 8) return sendError(res, 'Mot de passe trop court (min 8)', 400);

    const r = await pool.query(
      `SELECT id_client FROM clients
        WHERE portail_reset_token = $1 AND portail_reset_expires > CURRENT_TIMESTAMP LIMIT 1`,
      [token]
    );
    if (!r.rows[0]) return sendError(res, 'Token invalide ou expiré', 400);
    const hash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    await pool.query(
      `UPDATE clients SET portail_password_hash = $1, portail_reset_token = NULL,
         portail_reset_expires = NULL, portail_activated = true WHERE id_client = $2`,
      [hash, r.rows[0].id_client]
    );
    return sendSuccess(res, { reset: true }, 'Mot de passe réinitialisé');
  } catch (error) { return handleError(res, error, 'portail.resetPassword'); }
};

export const me = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_client, code_client, raison_sociale, email, telephone, adresse, ville,
              code_postal, pays, matricule_fiscal, portail_last_login
         FROM clients WHERE id_client = $1 LIMIT 1`,
      [req.portail.id_client]
    );
    if (!r.rows[0]) return sendError(res, 'Client introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) { return handleError(res, error, 'portail.me'); }
};

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!new_password || new_password.length < 8) return sendError(res, 'Mot de passe trop court (min 8)', 400);
    const r = await pool.query(
      `SELECT portail_password_hash FROM clients WHERE id_client = $1 LIMIT 1`,
      [req.portail.id_client]
    );
    if (!r.rows[0]) return sendError(res, 'Client introuvable', 404);
    const ok = await bcrypt.compare(current_password || '', r.rows[0].portail_password_hash || '');
    if (!ok) return sendError(res, 'Mot de passe actuel incorrect', 400);
    const hash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    await pool.query(`UPDATE clients SET portail_password_hash = $1 WHERE id_client = $2`,
      [hash, req.portail.id_client]);
    return sendSuccess(res, { changed: true }, 'Mot de passe changé');
  } catch (error) { return handleError(res, error, 'portail.changePassword'); }
};

// ────────── COMMANDES ──────────
export const getCommandes = async (req, res) => {
  try {
    const { statut } = req.query;
    const params = [req.portail.id_client];
    let sql = `SELECT id_commande, numero_commande, statut, date_commande, date_livraison_prevue,
                      montant_ht, montant_ttc, montant_total
                 FROM commandes WHERE id_client = $1`;
    if (statut) { params.push(statut); sql += ` AND statut = $${params.length}`; }
    sql += ` ORDER BY date_commande DESC NULLS LAST, id_commande DESC`;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { commandes: r.rows, total: r.rows.length });
  } catch (error) { return handleError(res, error, 'portail.getCommandes'); }
};

export const getCommandeDetail = async (req, res) => {
  try {
    const cmd = await pool.query(
      `SELECT * FROM commandes WHERE id_commande = $1 AND id_client = $2 LIMIT 1`,
      [req.params.id_commande, req.portail.id_client]
    );
    if (!cmd.rows[0]) return sendError(res, 'Commande introuvable', 404);
    const lignes = await pool.query(
      `SELECT * FROM lignes_commande WHERE id_commande = $1 ORDER BY ordre NULLS LAST, id_ligne`,
      [req.params.id_commande]
    ).catch(() => ({ rows: [] }));
    return sendSuccess(res, { ...cmd.rows[0], lignes: lignes.rows });
  } catch (error) { return handleError(res, error, 'portail.getCommandeDetail'); }
};

// ────────── FACTURES ──────────
export const getFactures = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_facture, numero_facture, statut, date_facture, date_echeance,
              montant_ht, montant_ttc, montant_regle, montant_restant
         FROM factures WHERE id_client = $1 ORDER BY date_facture DESC NULLS LAST, id_facture DESC`,
      [req.portail.id_client]
    );
    return sendSuccess(res, { factures: r.rows, total: r.rows.length });
  } catch (error) { return handleError(res, error, 'portail.getFactures'); }
};

// PDF helpers: tente d'utiliser un service PDF s'il existe, sinon renvoie 501
async function streamPdf(res, kind, id, id_client) {
  // Chercher un fichier généré : uploads/pdf/{kind}/{id}.pdf
  const filePath = path.join(process.cwd(), 'uploads', 'pdf', kind, `${id}.pdf`);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${kind}-${id}.pdf"`);
    return fs.createReadStream(filePath).pipe(res);
  }
  // Fallback : essayer un service pdf lazy
  try {
    const mod = await import('../../../src/services/pdf.service.js').catch(() => null);
    if (mod?.generatePdf) {
      const buffer = await mod.generatePdf(kind, id, { id_client });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${kind}-${id}.pdf"`);
      return res.send(buffer);
    }
  } catch {}
  return sendError(res, 'Service PDF non disponible', 501);
}

export const getFacturePdf = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_facture FROM factures WHERE id_facture = $1 AND id_client = $2 LIMIT 1`,
      [req.params.id, req.portail.id_client]
    );
    if (!r.rows[0]) return sendError(res, 'Facture introuvable', 404);
    return streamPdf(res, 'facture', req.params.id, req.portail.id_client);
  } catch (error) { return handleError(res, error, 'portail.getFacturePdf'); }
};

// ────────── BONS DE LIVRAISON ──────────
export const getBLs = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT bl.id_bl, bl.numero_bl, bl.statut, bl.date_bl, bl.date_livraison, bl.id_commande,
              c.numero_commande
         FROM bons_livraison bl
         LEFT JOIN commandes c ON bl.id_commande = c.id_commande
        WHERE bl.id_client = $1
        ORDER BY bl.date_bl DESC NULLS LAST, bl.id_bl DESC`,
      [req.portail.id_client]
    );
    return sendSuccess(res, { bons_livraison: r.rows, total: r.rows.length });
  } catch (error) { return handleError(res, error, 'portail.getBLs'); }
};

export const getBLPdf = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_bl FROM bons_livraison WHERE id_bl = $1 AND id_client = $2 LIMIT 1`,
      [req.params.id, req.portail.id_client]
    );
    if (!r.rows[0]) return sendError(res, 'BL introuvable', 404);
    return streamPdf(res, 'bon-livraison', req.params.id, req.portail.id_client);
  } catch (error) { return handleError(res, error, 'portail.getBLPdf'); }
};

// ────────── DEVIS ──────────
export const getDevis = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_devis, numero_devis, statut, date_devis, date_validite,
              montant_ht, montant_ttc
         FROM devis WHERE id_client = $1
        ORDER BY date_devis DESC NULLS LAST, id_devis DESC`,
      [req.portail.id_client]
    );
    return sendSuccess(res, { devis: r.rows, total: r.rows.length });
  } catch (error) { return handleError(res, error, 'portail.getDevis'); }
};

export const accepterDevis = async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE devis SET statut = 'ACCEPTE', updated_at = CURRENT_TIMESTAMP
        WHERE id_devis = $1 AND id_client = $2
          AND statut IN ('BROUILLON','ENVOYE','EN_ATTENTE')
       RETURNING id_devis, numero_devis, statut`,
      [req.params.id, req.portail.id_client]
    );
    if (!r.rows[0]) return sendError(res, 'Devis introuvable ou non acceptable', 404);
    return sendSuccess(res, r.rows[0], 'Devis accepté');
  } catch (error) { return handleError(res, error, 'portail.accepterDevis'); }
};

export const getDevisPdf = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_devis FROM devis WHERE id_devis = $1 AND id_client = $2 LIMIT 1`,
      [req.params.id, req.portail.id_client]
    );
    if (!r.rows[0]) return sendError(res, 'Devis introuvable', 404);
    return streamPdf(res, 'devis', req.params.id, req.portail.id_client);
  } catch (error) { return handleError(res, error, 'portail.getDevisPdf'); }
};

// ────────── DEMANDES ──────────
export const getDemandes = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM portail_demandes WHERE id_client = $1
        ORDER BY date_demande DESC LIMIT 200`,
      [req.portail.id_client]
    );
    return sendSuccess(res, { demandes: r.rows, total: r.rows.length });
  } catch (error) { return handleError(res, error, 'portail.getDemandes'); }
};

export const createDemande = async (req, res) => {
  try {
    const { type_demande, sujet, message, id_commande, id_facture } = req.body || {};
    if (!message) return sendError(res, 'Message requis', 400);
    const r = await pool.query(
      `INSERT INTO portail_demandes
         (id_client, type_demande, sujet, message, id_commande, id_facture, statut)
       VALUES ($1, $2, $3, $4, $5, $6, 'nouvelle')
       RETURNING *`,
      [
        req.portail.id_client,
        type_demande || 'question',
        sujet || null,
        message,
        id_commande || null,
        id_facture || null
      ]
    );
    return sendSuccess(res, r.rows[0], 'Demande envoyée', 201);
  } catch (error) { return handleError(res, error, 'portail.createDemande'); }
};

// ────────── STATS ──────────
export const getStats = async (req, res) => {
  try {
    const id = req.portail.id_client;
    const [cmd, ca, imp] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total_commandes FROM commandes WHERE id_client = $1`, [id]),
      pool.query(`SELECT COALESCE(SUM(montant_ttc), 0)::float AS ca_annee
                    FROM factures WHERE id_client = $1
                     AND EXTRACT(YEAR FROM date_facture) = EXTRACT(YEAR FROM CURRENT_DATE)`, [id]),
      pool.query(`SELECT COUNT(*)::int AS count,
                         COALESCE(SUM(montant_restant), 0)::float AS montant
                    FROM factures
                   WHERE id_client = $1
                     AND (statut IS NULL OR statut NOT IN ('PAYEE','ANNULEE'))
                     AND COALESCE(montant_restant, 0) > 0`, [id])
    ]);
    const dem = await pool.query(
      `SELECT COUNT(*)::int AS count FROM portail_demandes
        WHERE id_client = $1 AND statut IN ('nouvelle','en_cours')`,
      [id]
    );
    return sendSuccess(res, {
      total_commandes: cmd.rows[0].total_commandes,
      ca_annee: ca.rows[0].ca_annee,
      factures_impayees_count: imp.rows[0].count,
      factures_impayees_montant: imp.rows[0].montant,
      demandes_en_cours: dem.rows[0].count
    });
  } catch (error) { return handleError(res, error, 'portail.getStats'); }
};

// ────────── ADMIN (JWT normal, pas portail) ──────────
export const adminSetPortailAccess = async (req, res) => {
  try {
    const { id_client } = req.params;
    const { enabled, password } = req.body || {};
    const updates = [];
    const params = [id_client];
    if (typeof enabled === 'boolean') {
      params.push(enabled); updates.push(`portail_activated = $${params.length}`);
    }
    if (password) {
      const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      params.push(hash); updates.push(`portail_password_hash = $${params.length}`);
    }
    if (!updates.length) return sendError(res, 'Aucun changement demandé', 400);
    const r = await pool.query(
      `UPDATE clients SET ${updates.join(', ')} WHERE id_client = $1
       RETURNING id_client, raison_sociale, email, portail_activated`,
      params
    );
    if (!r.rows[0]) return sendError(res, 'Client introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Accès portail mis à jour');
  } catch (error) { return handleError(res, error, 'portail.adminSetPortailAccess'); }
};

export const adminResetPortail = async (req, res) => {
  try {
    const { id_client } = req.params;
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const r = await pool.query(
      `UPDATE clients SET portail_reset_token = $1, portail_reset_expires = $2
         WHERE id_client = $3 RETURNING id_client, email`,
      [token, expires, id_client]
    );
    if (!r.rows[0]) return sendError(res, 'Client introuvable', 404);
    // TODO prod: envoyer email
    return sendSuccess(res, {
      sent: true,
      email: r.rows[0].email,
      ...(process.env.NODE_ENV !== 'production' ? { debug_token: token } : {})
    }, 'Lien de réinitialisation envoyé');
  } catch (error) { return handleError(res, error, 'portail.adminResetPortail'); }
};

export const adminAuthenticate = authenticate;
