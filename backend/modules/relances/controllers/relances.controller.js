/**
 * Contrôleur Relances Factures — relances automatiques d'impayés
 *
 * Endpoints:
 *   GET    /api/relances                          — liste (filtrable)
 *   GET    /api/relances/:id                      — détail
 *   GET    /api/relances/facture/:id_facture      — relances d'une facture
 *   GET    /api/relances/factures-impayees        — factures à relancer + prochaine relance
 *   POST   /api/relances/generer                  — génération auto (job manuel)
 *   POST   /api/relances/facture/:id/envoyer      — relance manuelle
 *   PUT    /api/relances/:id/reponse              — enregistrer réponse client
 *   GET    /api/relances/stats/global             — KPIs recouvrement
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';
import { sendEmail } from '../../../src/services/email.service.js';

// ─── Socket.IO (lazy) ─────────────────────────────────────────────
let _io = null;
const getIo = async () => {
  if (_io) return _io;
  try {
    const m = await import('../../../src/server.js');
    _io = m.io;
  } catch { /* silent */ }
  return _io;
};

// ─── Templates de relance ─────────────────────────────────────────
const TEMPLATES = {
  1: {
    type: 'amicale',
    subject: 'Rappel amiable — Facture {numero} en attente',
    html: `Bonjour {client},<br/><br/>Sauf erreur de notre part, la facture n° <strong>{numero}</strong> d'un montant de <strong>{montant} DT</strong> émise le {date} n'a pas encore été réglée.<br/><br/>Merci de nous confirmer le règlement à votre convenance.<br/><br/>Cordialement,<br/>La Plume Artisanale`,
  },
  2: {
    type: 'ferme',
    subject: 'Relance — Facture {numero} en retard',
    html: `Bonjour {client},<br/><br/>Notre facture n° <strong>{numero}</strong> d'un montant de <strong>{montant} DT</strong> reste impayée à ce jour. En retard de <strong>{jours} jours</strong> par rapport à l'échéance du {echeance}.<br/><br/>Merci de procéder au règlement sous 7 jours pour éviter toute pénalité.<br/><br/>Cordialement,<br/>La Plume Artisanale`,
  },
  3: {
    type: 'mise_en_demeure',
    subject: 'Mise en demeure — Facture {numero}',
    html: `Bonjour {client},<br/><br/>Malgré nos précédentes relances, la facture n° <strong>{numero}</strong> de <strong>{montant} DT</strong> reste impayée. En retard de <strong>{jours} jours</strong>.<br/><br/>Sans règlement sous 8 jours, nous nous verrons contraints d'engager une procédure de recouvrement contentieux.<br/><br/>Cordialement,<br/>La Plume Artisanale`,
  },
};

const renderTemplate = (tpl, ctx) => {
  let s = tpl;
  Object.entries(ctx || {}).forEach(([k, v]) => {
    s = s.replaceAll(`{${k}}`, v == null ? '' : String(v));
  });
  return s;
};

// ─── Config helpers ───────────────────────────────────────────────
const getRelancesConfig = async () => {
  const r = await pool
    .query(`SELECT cle, valeur FROM parametrage WHERE cle LIKE 'relances.%'`)
    .catch(() => ({ rows: [] }));
  const cfg = {
    j1_delai: 7,
    j2_delai: 15,
    j3_delai: 30,
    enabled: true,
    cron_hour: 9,
  };
  r.rows.forEach((row) => {
    const key = row.cle.replace('relances.', '');
    const raw = row.valeur;
    if (key === 'enabled') cfg[key] = raw === 'true';
    else cfg[key] = parseInt(raw, 10) || cfg[key];
  });
  return cfg;
};

// Retourne le niveau suivant, ou null si aucune relance à envoyer
const nextNiveau = (lastNiveau, joursDepuisLast, joursRetard, cfg) => {
  if (!lastNiveau) {
    // Aucune relance encore : envoyer niveau 1 si retard >= j1_delai
    return joursRetard >= cfg.j1_delai ? 1 : null;
  }
  if (lastNiveau === 1 && joursDepuisLast >= (cfg.j2_delai - cfg.j1_delai)) return 2;
  if (lastNiveau === 2 && joursDepuisLast >= (cfg.j3_delai - cfg.j2_delai)) return 3;
  return null;
};

// ─── GET /api/relances ────────────────────────────────────────────
export const getRelances = async (req, res) => {
  try {
    const { id_facture, niveau, date_debut, date_fin, limit = 200, offset = 0 } = req.query;
    const where = [];
    const params = [];
    if (id_facture) { params.push(id_facture); where.push(`r.id_facture = $${params.length}`); }
    if (niveau)     { params.push(niveau);     where.push(`r.niveau = $${params.length}`); }
    if (date_debut) { params.push(date_debut); where.push(`r.date_relance >= $${params.length}`); }
    if (date_fin)   { params.push(date_fin);   where.push(`r.date_relance <= $${params.length}`); }
    params.push(parseInt(limit, 10) || 200);
    params.push(parseInt(offset, 10) || 0);

    const sql = `
      SELECT r.*, f.numero_facture, f.montant_ttc, f.montant_restant, f.date_echeance,
             c.raison_sociale AS client_nom, c.email AS client_email
      FROM relances_factures r
      LEFT JOIN factures f ON r.id_facture = f.id_facture
      LEFT JOIN clients  c ON f.id_client   = c.id_client
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY r.date_relance DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { relances: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getRelances');
  }
};

// ─── GET /api/relances/:id ────────────────────────────────────────
export const getRelanceById = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT r.*, f.numero_facture, c.raison_sociale AS client_nom
       FROM relances_factures r
       LEFT JOIN factures f ON r.id_facture = f.id_facture
       LEFT JOIN clients  c ON f.id_client   = c.id_client
       WHERE r.id_relance = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Relance introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getRelanceById');
  }
};

// ─── GET /api/relances/facture/:id_facture ────────────────────────
export const getRelancesFacture = async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT * FROM relances_factures WHERE id_facture = $1 ORDER BY niveau ASC, date_relance ASC`,
      [req.params.id_facture]
    );
    return sendSuccess(res, { relances: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getRelancesFacture');
  }
};

// ─── GET /api/relances/factures-impayees ──────────────────────────
// SELECT factures non-réglées + date_echeance < NOW + montant_restant > 0
const buildFacturesImpayeesQuery = () => `
  WITH last_rel AS (
    SELECT DISTINCT ON (id_facture)
      id_facture, niveau AS last_niveau, date_relance AS last_date_relance
    FROM relances_factures
    ORDER BY id_facture, date_relance DESC
  )
  SELECT
    f.id_facture, f.numero_facture, f.id_client, f.date_facture, f.date_echeance,
    f.statut, f.montant_ttc, f.montant_regle, f.montant_restant,
    c.raison_sociale AS client_nom, c.email AS client_email,
    (CURRENT_DATE - f.date_echeance)::int AS jours_retard,
    lr.last_niveau, lr.last_date_relance
  FROM factures f
  LEFT JOIN clients c ON f.id_client = c.id_client
  LEFT JOIN last_rel lr ON lr.id_facture = f.id_facture
  WHERE COALESCE(f.montant_restant, f.montant_ttc, 0) > 0
    AND f.date_echeance < CURRENT_DATE
    AND UPPER(COALESCE(f.statut, '')) NOT IN ('REGLEE','ANNULEE','BROUILLON','PAYEE')
  ORDER BY jours_retard DESC
`;

const computeProchaineRelance = (row, cfg) => {
  const joursRetard = row.jours_retard || 0;
  const lastN = row.last_niveau || 0;
  const lastDate = row.last_date_relance ? new Date(row.last_date_relance) : null;
  const joursDepuisLast = lastDate
    ? Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    : joursRetard;
  const niveau = nextNiveau(lastN, joursDepuisLast, joursRetard, cfg);
  return { prochain_niveau: niveau, jours_depuis_derniere: joursDepuisLast };
};

export const getFacturesImpayees = async (_req, res) => {
  try {
    const cfg = await getRelancesConfig();
    const r = await pool.query(buildFacturesImpayeesQuery());
    const rows = r.rows.map((row) => ({ ...row, ...computeProchaineRelance(row, cfg) }));
    return sendSuccess(res, { factures: rows, total: rows.length, config: cfg });
  } catch (error) {
    return handleError(res, error, 'getFacturesImpayees');
  }
};

// ─── Coeur : traitement d'une facture ─────────────────────────────
const _processFacture = async (row, cfg, opts = {}) => {
  const { dry_run = false, force = false, createdBy = null, io = null } = opts;
  const { prochain_niveau } = computeProchaineRelance(row, cfg);
  const niveau = force ? (row.last_niveau ? Math.min(3, row.last_niveau + 1) : 1) : prochain_niveau;
  if (!niveau) return { skipped: true, reason: 'no_level_due', id_facture: row.id_facture };

  const tpl = TEMPLATES[niveau];
  const destinataire = row.client_email;
  if (!destinataire) return { skipped: true, reason: 'no_email', id_facture: row.id_facture };

  const ctx = {
    client:   row.client_nom || 'Client',
    numero:   row.numero_facture || `#${row.id_facture}`,
    montant:  Number(row.montant_restant || row.montant_ttc || 0).toFixed(2),
    date:     row.date_facture ? new Date(row.date_facture).toLocaleDateString('fr-FR') : '',
    echeance: row.date_echeance ? new Date(row.date_echeance).toLocaleDateString('fr-FR') : '',
    jours:    row.jours_retard || 0,
  };
  const subject = renderTemplate(tpl.subject, ctx);
  const html    = renderTemplate(tpl.html, ctx);

  if (dry_run) {
    return { dry_run: true, id_facture: row.id_facture, niveau, destinataire, subject };
  }

  let statut = 'envoyee';
  let errorMessage = null;
  try {
    const result = await sendEmail({ to: destinataire, subject, html });
    if (!result?.success) {
      statut = result?.mocked ? 'mocked' : 'echec';
      errorMessage = result?.error || result?.message || null;
    }
  } catch (e) {
    statut = 'echec';
    errorMessage = e.message;
  }

  const ins = await pool.query(
    `INSERT INTO relances_factures
       (id_facture, niveau, type_relance, canal, destinataire, sujet, contenu, statut, error_message, created_by)
     VALUES ($1,$2,$3,'email',$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [row.id_facture, niveau, tpl.type, destinataire, subject, html, statut, errorMessage, createdBy]
  );
  const relance = ins.rows[0];

  // Socket.IO
  try {
    if (io) io.emit('relance:sent', {
      id_relance: relance.id_relance,
      id_facture: relance.id_facture,
      niveau: relance.niveau,
      statut: relance.statut,
      destinataire: relance.destinataire,
      date_relance: relance.date_relance,
    });
  } catch { /* silent */ }

  return { sent: true, relance, id_facture: row.id_facture, niveau };
};

// ─── POST /api/relances/generer ───────────────────────────────────
export const genererRelances = async (req, res) => {
  try {
    const { dry_run = false, force_all = false } = req.body || {};
    const cfg = await getRelancesConfig();
    const io = await getIo();
    const createdBy = req.user?.id || req.user?.userId || null;

    const r = await pool.query(buildFacturesImpayeesQuery());
    const results = { envoyees: 0, skipped: 0, dry_run: 0, errors: [], details: [] };

    for (const row of r.rows) {
      try {
        const out = await _processFacture(row, cfg, { dry_run, force: force_all, createdBy, io });
        if (out.dry_run) results.dry_run++;
        else if (out.sent) results.envoyees++;
        else results.skipped++;
        results.details.push(out);
      } catch (e) {
        results.errors.push({ id_facture: row.id_facture, error: e.message });
      }
    }

    return sendSuccess(res, results, dry_run ? 'Simulation terminée' : 'Relances générées');
  } catch (error) {
    return handleError(res, error, 'genererRelances');
  }
};

// Version job (sans req/res) — appelée par le scheduler
export const genererRelancesJob = async () => {
  const cfg = await getRelancesConfig();
  const io  = await getIo();
  const r = await pool.query(buildFacturesImpayeesQuery());
  const results = { envoyees: 0, skipped: 0, errors: [] };
  for (const row of r.rows) {
    try {
      const out = await _processFacture(row, cfg, { dry_run: false, force: false, createdBy: 0, io });
      if (out.sent) results.envoyees++;
      else results.skipped++;
    } catch (e) {
      results.errors.push({ id_facture: row.id_facture, error: e.message });
    }
  }
  return results;
};

// ─── POST /api/relances/facture/:id/envoyer ───────────────────────
export const envoyerRelanceManuelle = async (req, res) => {
  try {
    const { niveau, canal = 'email', destinataire: destOverride, sujet: sujetOverride, contenu: contenuOverride } = req.body || {};
    if (!niveau || ![1,2,3].includes(Number(niveau))) return sendError(res, 'niveau (1|2|3) requis', 400);
    const io = await getIo();
    const createdBy = req.user?.id || req.user?.userId || null;

    const q = await pool.query(`
      WITH last_rel AS (
        SELECT DISTINCT ON (id_facture) id_facture, niveau AS last_niveau, date_relance AS last_date_relance
        FROM relances_factures ORDER BY id_facture, date_relance DESC
      )
      SELECT f.*, c.raison_sociale AS client_nom, c.email AS client_email,
             (CURRENT_DATE - f.date_echeance)::int AS jours_retard,
             lr.last_niveau, lr.last_date_relance
      FROM factures f
      LEFT JOIN clients c ON f.id_client = c.id_client
      LEFT JOIN last_rel lr ON lr.id_facture = f.id_facture
      WHERE f.id_facture = $1
    `, [req.params.id_facture]);
    if (!q.rows[0]) return sendError(res, 'Facture introuvable', 404);
    const row = q.rows[0];

    const n = Number(niveau);
    const tpl = TEMPLATES[n];
    const destinataire = destOverride || row.client_email;
    if (!destinataire) return sendError(res, 'Aucun destinataire (email client absent)', 400);

    const ctx = {
      client:   row.client_nom || 'Client',
      numero:   row.numero_facture || `#${row.id_facture}`,
      montant:  Number(row.montant_restant || row.montant_ttc || 0).toFixed(2),
      date:     row.date_facture ? new Date(row.date_facture).toLocaleDateString('fr-FR') : '',
      echeance: row.date_echeance ? new Date(row.date_echeance).toLocaleDateString('fr-FR') : '',
      jours:    row.jours_retard || 0,
    };
    const subject = sujetOverride  || renderTemplate(tpl.subject, ctx);
    const html    = contenuOverride || renderTemplate(tpl.html, ctx);

    let statut = 'envoyee';
    let errorMessage = null;
    if (canal === 'email') {
      try {
        const result = await sendEmail({ to: destinataire, subject, html });
        if (!result?.success) {
          statut = result?.mocked ? 'mocked' : 'echec';
          errorMessage = result?.error || result?.message || null;
        }
      } catch (e) {
        statut = 'echec';
        errorMessage = e.message;
      }
    } else {
      statut = 'a_envoyer';  // whatsapp/courrier : géré ailleurs
    }

    const ins = await pool.query(
      `INSERT INTO relances_factures
         (id_facture, niveau, type_relance, canal, destinataire, sujet, contenu, statut, error_message, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [row.id_facture, n, tpl.type, canal, destinataire, subject, html, statut, errorMessage, createdBy]
    );
    const relance = ins.rows[0];

    try {
      if (io) io.emit('relance:sent', {
        id_relance: relance.id_relance,
        id_facture: relance.id_facture,
        niveau: relance.niveau,
        canal: relance.canal,
        statut: relance.statut,
        destinataire: relance.destinataire,
        date_relance: relance.date_relance,
      });
    } catch { /* silent */ }

    return sendSuccess(res, relance, 'Relance envoyée', 201);
  } catch (error) {
    return handleError(res, error, 'envoyerRelanceManuelle');
  }
};

// ─── PUT /api/relances/:id/reponse ────────────────────────────────
export const enregistrerReponse = async (req, res) => {
  try {
    const { reponse_recue = true, date_reponse } = req.body || {};
    const r = await pool.query(
      `UPDATE relances_factures
         SET reponse_recue = $2, date_reponse = COALESCE($3, CURRENT_TIMESTAMP)
       WHERE id_relance = $1
       RETURNING *`,
      [req.params.id, !!reponse_recue, date_reponse || null]
    );
    if (!r.rows[0]) return sendError(res, 'Relance introuvable', 404);
    return sendSuccess(res, r.rows[0], 'Réponse enregistrée');
  } catch (error) {
    return handleError(res, error, 'enregistrerReponse');
  }
};

// ─── GET /api/relances/stats/global ───────────────────────────────
export const getStatsGlobal = async (_req, res) => {
  try {
    const total     = await pool.query(`SELECT COUNT(*)::int AS n FROM relances_factures`).catch(() => ({rows:[{n:0}]}));
    const factRel   = await pool.query(`SELECT COUNT(DISTINCT id_facture)::int AS n FROM relances_factures`).catch(() => ({rows:[{n:0}]}));

    // Recouvrement : factures REGLEE dans les 30j suivant une relance
    const recouvre  = await pool.query(`
      SELECT COUNT(DISTINCT r.id_facture)::int AS n
      FROM relances_factures r
      JOIN factures f ON f.id_facture = r.id_facture
      WHERE UPPER(COALESCE(f.statut, '')) IN ('REGLEE','PAYEE')
        AND f.updated_at BETWEEN r.date_relance AND r.date_relance + INTERVAL '30 days'
    `).catch(() => ({rows:[{n:0}]}));

    const montantRec = await pool.query(`
      SELECT COALESCE(SUM(f.montant_regle),0)::float AS montant
      FROM relances_factures r
      JOIN factures f ON f.id_facture = r.id_facture
      WHERE UPPER(COALESCE(f.statut, '')) IN ('REGLEE','PAYEE')
        AND f.updated_at BETWEEN r.date_relance AND r.date_relance + INTERVAL '30 days'
    `).catch(() => ({rows:[{montant:0}]}));

    const taux = factRel.rows[0].n
      ? Math.round((recouvre.rows[0].n / factRel.rows[0].n) * 10000) / 100
      : 0;

    return sendSuccess(res, {
      total_relances: total.rows[0].n,
      factures_relancees: factRel.rows[0].n,
      factures_recouvrees: recouvre.rows[0].n,
      taux_recouvrement: taux,
      montant_recupere: montantRec.rows[0].montant || 0,
    });
  } catch (error) {
    return handleError(res, error, 'getStatsGlobal');
  }
};
