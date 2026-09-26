/**
 * Contrôleur Search — recherche transversale
 *
 * Endpoints :
 *   GET /api/search?q=&type=&limit=       — Recherche unifiée
 *   GET /api/search/quick?q=              — Top 3 par entité
 */

import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// Descripteurs des sources de recherche
const SOURCES = [
  {
    type: 'article',
    sql: (q, l) => ({
      text: `SELECT id_article AS id, designation AS title, code_article AS subtitle
             FROM articles_catalogue
             WHERE designation ILIKE $1 OR code_article ILIKE $1
             LIMIT $2`,
      params: [`%${q}%`, l],
      link: (id) => `/articles-catalogue/${id}`,
    }),
  },
  {
    type: 'client',
    sql: (q, l) => ({
      text: `SELECT id_client AS id, raison_sociale AS title, code_client AS subtitle
             FROM comptes
             WHERE raison_sociale ILIKE $1 OR code_client ILIKE $1
             LIMIT $2`,
      params: [`%${q}%`, l],
      link: (id) => `/clients/${id}`,
    }),
  },
  {
    type: 'commande',
    sql: (q, l) => ({
      text: `SELECT id_commande AS id, numero_commande AS title, ref_client AS subtitle
             FROM commandes
             WHERE numero_commande ILIKE $1 OR ref_client ILIKE $1
             LIMIT $2`,
      params: [`%${q}%`, l],
      link: (id) => `/commandes/${id}`,
    }),
  },
  {
    type: 'of',
    sql: (q, l) => ({
      text: `SELECT id_of AS id, numero_of AS title, '' AS subtitle
             FROM ordres_fabrication
             WHERE numero_of ILIKE $1
             LIMIT $2`,
      params: [`%${q}%`, l],
      link: (id) => `/ordres-fabrication/${id}`,
    }),
  },
  {
    type: 'facture',
    sql: (q, l) => ({
      text: `SELECT id_facture AS id, numero_facture AS title, '' AS subtitle
             FROM factures
             WHERE numero_facture ILIKE $1
             LIMIT $2`,
      params: [`%${q}%`, l],
      link: (id) => `/factures/${id}`,
    }),
  },
  {
    type: 'bl',
    sql: (q, l) => ({
      text: `SELECT id_bl AS id, numero_bl AS title, '' AS subtitle
             FROM bons_livraison
             WHERE numero_bl ILIKE $1
             LIMIT $2`,
      params: [`%${q}%`, l],
      link: (id) => `/bons-livraison/${id}`,
    }),
  },
];

const runSource = async (source, q, perTypeLimit) => {
  try {
    const spec = source.sql(q, perTypeLimit);
    const r = await pool.query(spec.text, spec.params);
    return r.rows.map(row => ({
      type: source.type,
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || null,
      link: spec.link(row.id),
    }));
  } catch (err) {
    // Table absente ou colonne manquante : on ignore silencieusement cette source
    return [];
  }
};

// ─── GET /api/search ──────────────────────────────────────────────
export const search = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const type = req.query.type;
    const limit = parseInt(req.query.limit, 10) || 20;

    if (!q) return sendSuccess(res, { items: [], total: 0 });

    const sources = type ? SOURCES.filter(s => s.type === type) : SOURCES;
    const perType = Math.max(1, Math.ceil(limit / (sources.length || 1)));

    const results = await Promise.all(sources.map(s => runSource(s, q, perType)));
    const items = results.flat().slice(0, limit);
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'search');
  }
};

// ─── GET /api/search/quick ────────────────────────────────────────
export const quickSearch = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return sendSuccess(res, { items: [], total: 0 });
    const results = await Promise.all(SOURCES.map(s => runSource(s, q, 3)));
    const items = results.flat();
    return sendSuccess(res, { items, total: items.length });
  } catch (error) {
    return handleError(res, error, 'quickSearch');
  }
};
