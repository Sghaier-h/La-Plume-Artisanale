/**
 * Contrôleur Dashboard KPIs — Agrégations et indicateurs en temps réel
 * Alimente les dashboards opérateurs avec des vraies données BDD
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// ── GET /api/dashboard/kpis — Vue d'ensemble admin ──────────────────────
export const getKpisAdmin = async (req, res) => {
  try {
    const [clients, commandes, devis, factures, of, machines] = await Promise.all([
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE actif = true) as total_actifs,
        COUNT(*) FILTER (WHERE type_client = 'CLIENT' AND actif = true) as clients,
        COUNT(*) FILTER (WHERE type_client = 'PROSPECT' AND actif = true) as prospects
        FROM comptes`),
      pool.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'en_attente') as en_attente,
        COUNT(*) FILTER (WHERE statut = 'validee') as validees,
        COUNT(*) FILTER (WHERE statut = 'livree') as livrees,
        COALESCE(SUM(montant_total) FILTER (WHERE date_commande >= CURRENT_DATE - INTERVAL '30 days'), 0) as ca_30j
        FROM commandes`),
      pool.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'BROUILLON') as brouillons,
        COUNT(*) FILTER (WHERE statut = 'TRANSFORME') as transformes,
        COALESCE(SUM(montant_ttc) FILTER (WHERE date_devis >= CURRENT_DATE - INTERVAL '30 days'), 0) as montant_30j
        FROM devis`),
      pool.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'BROUILLON') as brouillons,
        COUNT(*) FILTER (WHERE statut = 'PAYEE') as payees,
        COALESCE(SUM(montant_ttc), 0) as ca_total,
        COALESCE(SUM(montant_regle), 0) as montant_regle,
        COALESCE(SUM(montant_restant), 0) as montant_restant
        FROM factures`),
      pool.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'planifie') as planifies,
        COUNT(*) FILTER (WHERE statut = 'en_cours') as en_cours,
        COUNT(*) FILTER (WHERE statut = 'termine') as termines
        FROM ordres_fabrication`),
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE actif = true) as total_actives,
        COUNT(*) FILTER (WHERE statut = 'operationnel' AND actif = true) as operationnelles,
        COUNT(*) FILTER (WHERE statut = 'maintenance' AND actif = true) as maintenance
        FROM machines`)
    ]);

    return sendSuccess(res, {
      clients: clients.rows[0],
      commandes: commandes.rows[0],
      devis: devis.rows[0],
      factures: factures.rows[0],
      ordres_fabrication: of.rows[0],
      machines: machines.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleError(res, error, 'getKpisAdmin');
  }
};

// ── GET /api/dashboard/activite-recente — Dernières activités ──────────
export const getActiviteRecente = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [commandes, devis, factures] = await Promise.all([
      pool.query(
        `SELECT 'commande' as type, id_commande as id, numero_commande as numero,
                c.raison_sociale as client, cmd.statut, cmd.montant_total as montant,
                cmd.date_creation as date
         FROM commandes cmd
         LEFT JOIN comptes c ON cmd.id_client = c.id_client
         ORDER BY cmd.date_creation DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT 'devis' as type, id_devis as id, numero_devis as numero,
                c.raison_sociale as client, d.statut, d.montant_ttc as montant,
                d.created_at as date
         FROM devis d
         LEFT JOIN comptes c ON d.id_client = c.id_client
         ORDER BY d.created_at DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT 'facture' as type, id_facture as id, numero_facture as numero,
                c.raison_sociale as client, f.statut, f.montant_ttc as montant,
                f.created_at as date
         FROM factures f
         LEFT JOIN comptes c ON f.id_client = c.id_client
         ORDER BY f.created_at DESC LIMIT $1`, [limit]
      )
    ]);

    // Fusionner et trier par date
    const all = [...commandes.rows, ...devis.rows, ...factures.rows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    return sendSuccess(res, all);
  } catch (error) {
    return handleError(res, error, 'getActiviteRecente');
  }
};

// ── GET /api/dashboard/ventes-par-mois — Graphique évolution ───────────
export const getVentesParMois = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', date_facture), 'YYYY-MM') as mois,
        COUNT(*) as nb_factures,
        COALESCE(SUM(montant_ttc), 0) as total_ttc,
        COALESCE(SUM(montant_regle), 0) as total_regle
      FROM factures
      WHERE date_facture >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', date_facture)
      ORDER BY mois
    `);

    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getVentesParMois');
  }
};

// ── GET /api/dashboard/top-clients — Top 10 clients ────────────────────
export const getTopClients = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
      SELECT
        c.id_client, c.code_client, c.raison_sociale,
        COUNT(DISTINCT f.id_facture) as nb_factures,
        COALESCE(SUM(f.montant_ttc), 0) as ca_total
      FROM comptes c
      LEFT JOIN factures f ON c.id_client = f.id_client
      WHERE c.actif = true AND c.type_client = 'CLIENT'
      GROUP BY c.id_client, c.code_client, c.raison_sociale
      ORDER BY ca_total DESC
      LIMIT $1
    `, [limit]);

    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getTopClients');
  }
};

// ── Helper : exécuter une requête, retourner 0 si table absente ────────
const safeCount = async (sql, params = []) => {
  try {
    const r = await pool.query(sql, params);
    return r.rows[0] || {};
  } catch (err) {
    logger?.warn?.(`[dashboard] safeCount failed: ${err.message}`);
    return {};
  }
};

// ── GET /api/dashboard/production ──────────────────────────────────────
export const getProductionStats = async (req, res) => {
  try {
    const of_en_cours = await safeCount(
      `SELECT COUNT(*)::int AS n FROM ordres_fabrication WHERE statut = 'en_cours'`
    );
    const of_termines_today = await safeCount(
      `SELECT COUNT(*)::int AS n FROM ordres_fabrication
       WHERE statut = 'termine' AND date_fin_reelle::date = CURRENT_DATE`
    );
    const machines_actives = await safeCount(
      `SELECT COUNT(*)::int AS n FROM machines WHERE actif = true AND statut = 'operationnel'`
    );
    const rendement = await safeCount(
      `SELECT COALESCE(AVG(rendement), 0)::numeric(10,2) AS n FROM ordres_fabrication
       WHERE rendement IS NOT NULL AND date_fin_reelle >= CURRENT_DATE - INTERVAL '30 days'`
    );
    return sendSuccess(res, {
      of_en_cours: of_en_cours.n || 0,
      of_termines_today: of_termines_today.n || 0,
      machines_actives: machines_actives.n || 0,
      rendement_moyen: Number(rendement.n || 0),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(res, error, 'getProductionStats');
  }
};

// ── GET /api/dashboard/commandes ───────────────────────────────────────
export const getCommandesStats = async (req, res) => {
  try {
    const stats = await safeCount(
      `SELECT
         COUNT(*)::int AS total_mois,
         COALESCE(SUM(montant_total), 0)::numeric(14,2) AS ca_mois,
         COUNT(*) FILTER (WHERE statut = 'en_attente')::int AS en_attente,
         COUNT(*) FILTER (WHERE statut = 'validee')::int AS validees
       FROM commandes
       WHERE date_commande >= DATE_TRUNC('month', CURRENT_DATE)`
    );
    return sendSuccess(res, {
      total_mois: stats.total_mois || 0,
      ca_mois: Number(stats.ca_mois || 0),
      en_attente: stats.en_attente || 0,
      validees: stats.validees || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleError(res, error, 'getCommandesStats');
  }
};

// ── GET /api/dashboard/alertes ─────────────────────────────────────────
export const getAlertes = async (req, res) => {
  try {
    const alerts = [];

    // Stock bas
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS n FROM matieres_premieres
         WHERE quantite_stock IS NOT NULL AND seuil_alerte IS NOT NULL
           AND quantite_stock <= seuil_alerte`
      );
      const n = r.rows[0]?.n || 0;
      if (n > 0) alerts.push({ type: 'stock_bas', level: 'warning', message: `${n} matière(s) en stock bas`, link: '/stock/matieres', count: n });
    } catch {}

    // OF en retard
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS n FROM ordres_fabrication
         WHERE date_fin_prevue < CURRENT_DATE AND statut NOT IN ('termine', 'annule')`
      );
      const n = r.rows[0]?.n || 0;
      if (n > 0) alerts.push({ type: 'of_retard', level: 'error', message: `${n} ordre(s) de fabrication en retard`, link: '/production/of', count: n });
    } catch {}

    // Machines en panne
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS n FROM machines WHERE actif = true AND statut IN ('panne', 'arret')`
      );
      const n = r.rows[0]?.n || 0;
      if (n > 0) alerts.push({ type: 'machines_panne', level: 'error', message: `${n} machine(s) en panne`, link: '/production/machines', count: n });
    } catch {}

    // Factures impayées
    try {
      const r = await pool.query(
        `SELECT COUNT(*)::int AS n FROM factures
         WHERE montant_restant > 0 AND date_echeance < CURRENT_DATE`
      );
      const n = r.rows[0]?.n || 0;
      if (n > 0) alerts.push({ type: 'factures_impayees', level: 'warning', message: `${n} facture(s) impayée(s) en retard`, link: '/factures', count: n });
    } catch {}

    return sendSuccess(res, { items: alerts, total: alerts.length });
  } catch (error) {
    return handleError(res, error, 'getAlertes');
  }
};

// ── GET /api/dashboard/kpis-production — Dashboard Chef Production ─────
export const getKpisProduction = async (req, res) => {
  try {
    const [of, machines, qualite] = await Promise.all([
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE statut = 'planifie') as planifies,
        COUNT(*) FILTER (WHERE statut = 'en_cours') as en_cours,
        COUNT(*) FILTER (WHERE statut = 'termine' AND date_fin_reelle >= CURRENT_DATE - INTERVAL '7 days') as termines_7j,
        COUNT(*) FILTER (WHERE date_fin_prevue < CURRENT_DATE AND statut != 'termine') as retards
        FROM ordres_fabrication`),
      pool.query(`SELECT
        COUNT(*) FILTER (WHERE actif = true) as total,
        COUNT(*) FILTER (WHERE statut = 'operationnel' AND actif = true) as operationnelles,
        COUNT(*) FILTER (WHERE statut = 'arret' AND actif = true) as en_arret,
        COUNT(*) FILTER (WHERE statut = 'maintenance' AND actif = true) as en_maintenance
        FROM machines`),
      // Qualité — peut ne pas exister si table vide
      pool.query(`SELECT COUNT(*) as nb_controles FROM suivi_fabrication`).catch(() => ({ rows: [{ nb_controles: 0 }] }))
    ]);

    return sendSuccess(res, {
      ordres_fabrication: of.rows[0],
      machines: machines.rows[0],
      qualite: qualite.rows[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleError(res, error, 'getKpisProduction');
  }
};
