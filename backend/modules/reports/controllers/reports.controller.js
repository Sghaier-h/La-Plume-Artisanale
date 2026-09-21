/**
 * Contrôleur Reports — rapports d'agrégation multi-modules
 *
 * Fournit des agrégations best-effort sur les tables métier existantes.
 * Toutes les fonctions sont défensives : si une table/colonne manque, on
 * retombe sur des zéros avec une note.
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const safeQuery = async (sql, params = []) => {
  try {
    const r = await pool.query(sql, params);
    return { ok: true, rows: r.rows };
  } catch (e) {
    return { ok: false, error: e.message, rows: [] };
  }
};

const parsePeriode = (req) => {
  const { date_debut, date_fin } = req.query;
  return {
    debut: date_debut || null,
    fin: date_fin || null,
  };
};

// ─── GET /api/reports/production ──────────────────────────────────
export const reportProduction = async (req, res) => {
  try {
    const { debut, fin } = parsePeriode(req);
    const { id_machine, id_of } = req.query;
    const params = [];
    const where = [];
    if (debut) { params.push(debut); where.push(`sf.created_at >= $${params.length}`); }
    if (fin)   { params.push(fin);   where.push(`sf.created_at <= $${params.length}`); }
    if (id_machine) { params.push(id_machine); where.push(`sf.id_machine = $${params.length}`); }
    if (id_of)      { params.push(id_of);      where.push(`sf.id_of = $${params.length}`); }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const global = await safeQuery(
      `SELECT COALESCE(SUM(quantite_produite),0)::numeric AS total_produit,
              COALESCE(AVG(NULLIF(rendement,0)),0)::numeric AS avg_rendement,
              COALESCE(AVG(NULLIF(trs,0)),0)::numeric AS avg_trs,
              COUNT(*)::int AS nb_suivis
         FROM suivi_fabrication sf ${w}`,
      params
    );

    const byMachine = await safeQuery(
      `SELECT sf.id_machine,
              COALESCE(SUM(quantite_produite),0)::numeric AS total_produit,
              COALESCE(AVG(NULLIF(rendement,0)),0)::numeric AS avg_rendement,
              COALESCE(AVG(NULLIF(trs,0)),0)::numeric AS avg_trs
         FROM suivi_fabrication sf ${w}
        GROUP BY sf.id_machine
        ORDER BY total_produit DESC`,
      params
    );

    return sendSuccess(res, {
      periode: { debut, fin },
      global: global.rows[0] || {},
      by_machine: byMachine.rows,
      note: global.ok ? undefined : 'Table suivi_fabrication indisponible',
    }, 'Rapport production');
  } catch (error) {
    return handleError(res, error, 'reportProduction');
  }
};

// ─── GET /api/reports/ventes ──────────────────────────────────────
export const reportVentes = async (req, res) => {
  try {
    const { debut, fin } = parsePeriode(req);
    const p = [];
    const w = [];
    if (debut) { p.push(debut); w.push(`COALESCE(date_facture, created_at::date) >= $${p.length}`); }
    if (fin)   { p.push(fin);   w.push(`COALESCE(date_facture, created_at::date) <= $${p.length}`); }
    const where = w.length ? `WHERE ${w.join(' AND ')}` : '';

    const kpi = await safeQuery(
      `SELECT COALESCE(SUM(COALESCE(montant_ttc, montant_total, 0)),0)::numeric AS ca_periode,
              COUNT(*)::int AS nb_factures
         FROM factures ${where}`,
      p
    );

    const cmd = await safeQuery(
      `SELECT COUNT(*)::int AS nb_commandes FROM commandes ${
        where ? where.replace(/date_facture/g, 'date_commande') : ''
      }`,
      p
    );

    const topClients = await safeQuery(
      `SELECT f.id_client,
              COALESCE(c.nom, c.raison_sociale, 'Client ' || f.id_client::text) AS client,
              COALESCE(SUM(COALESCE(f.montant_ttc, f.montant_total, 0)),0)::numeric AS ca
         FROM factures f
         LEFT JOIN clients c ON c.id_client = f.id_client
         ${where}
        GROUP BY f.id_client, c.nom, c.raison_sociale
        ORDER BY ca DESC
        LIMIT 5`,
      p
    );

    const topArticles = await safeQuery(
      `SELECT fl.id_article,
              COALESCE(a.designation, a.nom, 'Article ' || fl.id_article::text) AS article,
              COALESCE(SUM(fl.quantite),0)::numeric AS qte,
              COALESCE(SUM(fl.montant_ligne),0)::numeric AS ca
         FROM factures_lignes fl
         LEFT JOIN factures f ON f.id_facture = fl.id_facture
         LEFT JOIN articles a ON a.id_article = fl.id_article
         ${where.replace(/COALESCE\(date_facture/g, 'COALESCE(f.date_facture').replace(/created_at::date/g, 'f.created_at::date')}
        GROUP BY fl.id_article, a.designation, a.nom
        ORDER BY ca DESC
        LIMIT 5`,
      p
    );

    return sendSuccess(res, {
      periode: { debut, fin },
      ca_periode: kpi.rows[0]?.ca_periode || 0,
      nb_commandes: cmd.rows[0]?.nb_commandes || 0,
      nb_factures: kpi.rows[0]?.nb_factures || 0,
      top_5_clients: topClients.rows,
      top_5_articles: topArticles.rows,
    }, 'Rapport ventes');
  } catch (error) {
    return handleError(res, error, 'reportVentes');
  }
};

// ─── GET /api/reports/stock ───────────────────────────────────────
export const reportStock = async (req, res) => {
  try {
    const total = await safeQuery(
      `SELECT COUNT(*)::int AS total_articles,
              COALESCE(SUM(COALESCE(stock_actuel,0) * COALESCE(prix_achat, prix_vente, 0)),0)::numeric AS valeur_stock_totale
         FROM articles`
    );

    const alertes = await safeQuery(
      `SELECT COUNT(*)::int AS alertes_stock_bas
         FROM articles
        WHERE COALESCE(stock_actuel,0) <= COALESCE(stock_min, 0)
          AND COALESCE(stock_min, 0) > 0`
    );

    const topArticles = await safeQuery(
      `SELECT id_article,
              COALESCE(designation, nom) AS article,
              COALESCE(stock_actuel,0)::numeric AS stock,
              COALESCE(prix_achat, prix_vente, 0)::numeric AS prix,
              COALESCE(stock_actuel,0) * COALESCE(prix_achat, prix_vente, 0)::numeric AS valeur
         FROM articles
        ORDER BY valeur DESC NULLS LAST
        LIMIT 10`
    );

    return sendSuccess(res, {
      total_articles: total.rows[0]?.total_articles || 0,
      valeur_stock_totale: total.rows[0]?.valeur_stock_totale || 0,
      alertes_stock_bas: alertes.rows[0]?.alertes_stock_bas || 0,
      top_10_articles_valeur: topArticles.rows,
      note: total.ok ? undefined : 'Certaines colonnes stock indisponibles',
    }, 'Rapport stock');
  } catch (error) {
    return handleError(res, error, 'reportStock');
  }
};

// ─── GET /api/reports/qualite ─────────────────────────────────────
export const reportQualite = async (req, res) => {
  try {
    const { debut, fin } = parsePeriode(req);
    const p = [];
    const w = [];
    if (debut) { p.push(debut); w.push(`created_at >= $${p.length}`); }
    if (fin)   { p.push(fin);   w.push(`created_at <= $${p.length}`); }
    const where = w.length ? `WHERE ${w.join(' AND ')}` : '';

    const cpp = await safeQuery(
      `SELECT COUNT(*)::int AS total,
              COALESCE(SUM(CASE WHEN conforme = true THEN 1 ELSE 0 END),0)::int AS conformes
         FROM controle_premiere_piece ${where}`,
      p
    );

    const nc = await safeQuery(
      `SELECT COUNT(*)::int AS total_nc,
              COALESCE(SUM(COALESCE(cout_perte, 0)),0)::numeric AS valeur_perte
         FROM non_conformites ${where}`,
      p
    );

    const parType = await safeQuery(
      `SELECT COALESCE(type_nc, 'AUTRE') AS type,
              COUNT(*)::int AS nb
         FROM non_conformites ${where}
        GROUP BY type_nc
        ORDER BY nb DESC`,
      p
    );

    const causes = await safeQuery(
      `SELECT COALESCE(cause_racine, 'INCONNUE') AS cause,
              COUNT(*)::int AS nb
         FROM non_conformites ${where}
        GROUP BY cause_racine
        ORDER BY nb DESC
        LIMIT 5`,
      p
    );

    const total = Number(cpp.rows[0]?.total || 0);
    const conformes = Number(cpp.rows[0]?.conformes || 0);
    const taux_conformite = total > 0 ? Math.round((conformes / total) * 10000) / 100 : 0;

    return sendSuccess(res, {
      periode: { debut, fin },
      taux_conformite,
      total_controles: total,
      total_nc: nc.rows[0]?.total_nc || 0,
      nc_par_type: parType.rows,
      top_5_causes_racines: causes.rows,
      valeur_perte_periode: nc.rows[0]?.valeur_perte || 0,
    }, 'Rapport qualité');
  } catch (error) {
    return handleError(res, error, 'reportQualite');
  }
};

// ─── GET /api/reports/rh ──────────────────────────────────────────
export const reportRh = async (req, res) => {
  try {
    const resume = await safeQuery(
      `SELECT COALESCE(AVG(NULLIF(total_jours_presents,0)),0)::numeric AS presents_moyen,
              COALESCE(AVG(NULLIF(total_jours_absents,0)),0)::numeric  AS absents_moyen,
              COALESCE(AVG(NULLIF(total_retards,0)),0)::numeric        AS retards_moyen,
              COALESCE(AVG(NULLIF(total_minutes_retard,0)),0)::numeric AS minutes_retard_moyen
         FROM pointage_resume`
    );

    const conges = await safeQuery(
      `SELECT COUNT(*)::int AS conges_en_cours
         FROM conges
        WHERE (statut IS NULL OR statut IN ('en_cours', 'valide', 'approuve'))
          AND CURRENT_DATE BETWEEN COALESCE(date_debut, CURRENT_DATE) AND COALESCE(date_fin, CURRENT_DATE)`
    );

    return sendSuccess(res, {
      presents_moyen: resume.rows[0]?.presents_moyen || 0,
      absents_moyen: resume.rows[0]?.absents_moyen || 0,
      retards_moyen: resume.rows[0]?.retards_moyen || 0,
      minutes_retard_moyen: resume.rows[0]?.minutes_retard_moyen || 0,
      conges_en_cours: conges.rows[0]?.conges_en_cours || 0,
    }, 'Rapport RH');
  } catch (error) {
    return handleError(res, error, 'reportRh');
  }
};

// ─── GET /api/reports/financier ───────────────────────────────────
export const reportFinancier = async (req, res) => {
  try {
    const ca = await safeQuery(
      `SELECT COALESCE(SUM(COALESCE(montant_ttc, montant_total, 0)),0)::numeric AS ca_total,
              COALESCE(SUM(CASE WHEN COALESCE(statut,'') IN ('payee','paye','payé')
                                THEN COALESCE(montant_ttc, montant_total, 0) ELSE 0 END),0)::numeric AS ca_encaisse,
              COALESCE(SUM(CASE WHEN COALESCE(statut,'') NOT IN ('payee','paye','payé','annulee','annule')
                                THEN COALESCE(montant_ttc, montant_total, 0) ELSE 0 END),0)::numeric AS encours
         FROM factures`
    );

    const avoirs = await safeQuery(
      `SELECT COALESCE(SUM(COALESCE(montant_ttc, montant_total, 0)),0)::numeric AS avoirs_appliques
         FROM avoirs`
    );

    return sendSuccess(res, {
      ca_total: ca.rows[0]?.ca_total || 0,
      ca_encaisse: ca.rows[0]?.ca_encaisse || 0,
      encours: ca.rows[0]?.encours || 0,
      avoirs_appliques: avoirs.rows[0]?.avoirs_appliques || 0,
    }, 'Rapport financier');
  } catch (error) {
    return handleError(res, error, 'reportFinancier');
  }
};

// ─── POST /api/reports/custom ─────────────────────────────────────
export const reportCustom = async (req, res) => {
  try {
    return sendSuccess(res, {
      note: 'Custom reports — spec pending',
      received: req.body || {},
    }, 'Rapport custom (placeholder)');
  } catch (error) {
    return handleError(res, error, 'reportCustom');
  }
};

// ─── GET /api/reports ─────────────────────────────────────────────
export const listReports = async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM reports ORDER BY id DESC`);
    return sendSuccess(res, r.rows, 'Rapports sauvegardés');
  } catch (error) {
    return handleError(res, error, 'listReports');
  }
};

// ─── POST /api/reports ────────────────────────────────────────────
export const createReport = async (req, res) => {
  try {
    const userId = getUserId(req) || null;
    const { name, description } = req.body || {};
    if (!name) return sendError(res, 'name requis', 400);
    const r = await pool.query(
      `INSERT INTO reports (name, description, active, created_at, created_by)
       VALUES ($1, $2, true, NOW(), $3) RETURNING *`,
      [name, description || null, userId]
    );
    return sendSuccess(res, r.rows[0], 'Rapport enregistré', 201);
  } catch (error) {
    return handleError(res, error, 'createReport');
  }
};

// ─── DELETE /api/reports/:id ──────────────────────────────────────
export const deleteReport = async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM reports WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Rapport introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id }, 'Rapport supprimé');
  } catch (error) {
    return handleError(res, error, 'deleteReport');
  }
};
