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
        FROM clients`),
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
         LEFT JOIN clients c ON cmd.id_client = c.id_client
         ORDER BY cmd.date_creation DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT 'devis' as type, id_devis as id, numero_devis as numero,
                c.raison_sociale as client, d.statut, d.montant_ttc as montant,
                d.created_at as date
         FROM devis d
         LEFT JOIN clients c ON d.id_client = c.id_client
         ORDER BY d.created_at DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT 'facture' as type, id_facture as id, numero_facture as numero,
                c.raison_sociale as client, f.statut, f.montant_ttc as montant,
                f.created_at as date
         FROM factures f
         LEFT JOIN clients c ON f.id_client = c.id_client
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
      FROM clients c
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
