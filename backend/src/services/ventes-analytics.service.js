/**
 * Ventes Analytics Service
 *
 * Porté depuis 04_Catalogue.gs :
 * - getStatsVentesArticle (stats par article : quantités, CA, marge)
 * - getTopArticlesVendus (top N)
 * - getAnalyseProduitsVente (grille produit/dimension/finition/tissu/couleur avec marges)
 *
 * Toutes les agrégations utilisent les factures (pas les commandes) car :
 * - Les factures = CA réel
 * - Les commandes peuvent être annulées
 */

import { pool } from '../utils/db.js';

/**
 * Stats de ventes pour un article spécifique
 *
 * @param {number} idArticle
 * @param {Object} options - date_debut, date_fin
 */
export async function getStatsVentesArticle(idArticle, options = {}) {
  const { date_debut, date_fin } = options;

  const params = [idArticle];
  let dateFilter = '';
  if (date_debut) {
    params.push(date_debut);
    dateFilter += ` AND f.date_facture >= $${params.length}`;
  }
  if (date_fin) {
    params.push(date_fin);
    dateFilter += ` AND f.date_facture <= $${params.length}`;
  }

  const result = await pool.query(`
    SELECT
      a.id_article,
      a.code_article,
      a.designation,
      a.prix_vente,
      a.prix_revient,
      COALESCE(SUM(lf.quantite), 0)::numeric as quantite_vendue,
      COALESCE(SUM(lf.montant_ht), 0)::numeric as ca_ht,
      COALESCE(SUM(lf.montant_ttc), 0)::numeric as ca_ttc,
      COUNT(DISTINCT f.id_facture) as nb_factures,
      COUNT(DISTINCT f.id_client) as nb_clients,
      -- Marge calculée sur la base du prix_revient
      COALESCE(SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0))), 0)::numeric as marge_ht,
      -- Taux de marge en %
      CASE
        WHEN SUM(lf.montant_ht) > 0 THEN
          ROUND((SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0))) / SUM(lf.montant_ht) * 100)::numeric, 2)
        ELSE 0
      END as taux_marge_pct
    FROM articles_catalogue a
    LEFT JOIN lignes_facture lf ON lf.id_article = a.id_article
    LEFT JOIN factures f ON lf.id_facture = f.id_facture AND f.statut != 'ANNULEE'
    WHERE a.id_article = $1 ${dateFilter}
    GROUP BY a.id_article, a.code_article, a.designation, a.prix_vente, a.prix_revient
  `, params);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id_article: row.id_article,
    code_article: row.code_article,
    designation: row.designation,
    prix_vente: parseFloat(row.prix_vente || 0),
    prix_revient: parseFloat(row.prix_revient || 0),
    quantite_vendue: parseFloat(row.quantite_vendue || 0),
    ca_ht: parseFloat(row.ca_ht || 0),
    ca_ttc: parseFloat(row.ca_ttc || 0),
    nb_factures: parseInt(row.nb_factures || 0),
    nb_clients: parseInt(row.nb_clients || 0),
    marge_ht: parseFloat(row.marge_ht || 0),
    taux_marge_pct: parseFloat(row.taux_marge_pct || 0)
  };
}

/**
 * Top N articles vendus
 *
 * @param {Object} options - limit, date_debut, date_fin, order_by
 */
export async function getTopArticlesVendus(options = {}) {
  const { limit = 20, date_debut, date_fin, order_by = 'quantite' } = options;

  const params = [];
  let dateFilter = '';
  if (date_debut) {
    params.push(date_debut);
    dateFilter += ` AND f.date_facture >= $${params.length}`;
  }
  if (date_fin) {
    params.push(date_fin);
    dateFilter += ` AND f.date_facture <= $${params.length}`;
  }

  // Ordre par défaut : quantité, sinon CA ou marge
  const orderClause = {
    quantite: 'quantite_vendue DESC',
    ca: 'ca_ht DESC',
    marge: 'marge_ht DESC',
    factures: 'nb_factures DESC'
  }[order_by] || 'quantite_vendue DESC';

  params.push(limit);

  const result = await pool.query(`
    SELECT
      a.id_article,
      a.code_article,
      a.designation,
      a.ref_commerciale,
      a.prix_vente,
      a.prix_revient,
      m.libelle as modele_libelle,
      SUM(lf.quantite)::numeric as quantite_vendue,
      SUM(lf.montant_ht)::numeric as ca_ht,
      SUM(lf.montant_ttc)::numeric as ca_ttc,
      COUNT(DISTINCT f.id_facture) as nb_factures,
      COUNT(DISTINCT f.id_client) as nb_clients,
      SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0)))::numeric as marge_ht,
      CASE
        WHEN SUM(lf.montant_ht) > 0 THEN
          ROUND((SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0))) / SUM(lf.montant_ht) * 100)::numeric, 2)
        ELSE 0
      END as taux_marge_pct
    FROM articles_catalogue a
    INNER JOIN lignes_facture lf ON lf.id_article = a.id_article
    INNER JOIN factures f ON lf.id_facture = f.id_facture
    LEFT JOIN parametres_modeles m ON a.id_modele = m.id
    WHERE f.statut != 'ANNULEE' ${dateFilter}
    GROUP BY a.id_article, a.code_article, a.designation, a.ref_commerciale,
             a.prix_vente, a.prix_revient, m.libelle
    ORDER BY ${orderClause}
    LIMIT $${params.length}
  `, params);

  return result.rows.map(r => ({
    id_article: r.id_article,
    code_article: r.code_article,
    designation: r.designation,
    ref_commerciale: r.ref_commerciale,
    modele_libelle: r.modele_libelle,
    prix_vente: parseFloat(r.prix_vente || 0),
    prix_revient: parseFloat(r.prix_revient || 0),
    quantite_vendue: parseFloat(r.quantite_vendue || 0),
    ca_ht: parseFloat(r.ca_ht || 0),
    ca_ttc: parseFloat(r.ca_ttc || 0),
    nb_factures: parseInt(r.nb_factures || 0),
    nb_clients: parseInt(r.nb_clients || 0),
    marge_ht: parseFloat(r.marge_ht || 0),
    taux_marge_pct: parseFloat(r.taux_marge_pct || 0)
  }));
}

/**
 * Analyse ventes groupée par modèle
 */
export async function getVentesParModele(options = {}) {
  const { date_debut, date_fin } = options;

  const params = [];
  let dateFilter = '';
  if (date_debut) {
    params.push(date_debut);
    dateFilter += ` AND f.date_facture >= $${params.length}`;
  }
  if (date_fin) {
    params.push(date_fin);
    dateFilter += ` AND f.date_facture <= $${params.length}`;
  }

  const result = await pool.query(`
    SELECT
      m.id, m.code_modele, m.libelle,
      COUNT(DISTINCT a.id_article) as nb_articles_vendus,
      SUM(lf.quantite)::numeric as quantite_totale,
      SUM(lf.montant_ht)::numeric as ca_ht,
      SUM(lf.montant_ttc)::numeric as ca_ttc,
      SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0)))::numeric as marge_ht,
      COUNT(DISTINCT f.id_facture) as nb_factures
    FROM parametres_modeles m
    INNER JOIN articles_catalogue a ON a.id_modele = m.id
    INNER JOIN lignes_facture lf ON lf.id_article = a.id_article
    INNER JOIN factures f ON lf.id_facture = f.id_facture
    WHERE f.statut != 'ANNULEE' ${dateFilter}
    GROUP BY m.id, m.code_modele, m.libelle
    ORDER BY ca_ht DESC
  `, params);

  return result.rows.map(r => ({
    id_modele: r.id,
    code_modele: r.code_modele,
    libelle: r.libelle,
    nb_articles_vendus: parseInt(r.nb_articles_vendus || 0),
    quantite_totale: parseFloat(r.quantite_totale || 0),
    ca_ht: parseFloat(r.ca_ht || 0),
    ca_ttc: parseFloat(r.ca_ttc || 0),
    marge_ht: parseFloat(r.marge_ht || 0),
    nb_factures: parseInt(r.nb_factures || 0)
  }));
}

/**
 * Top articles par COMMANDES (fallback si pas encore de factures)
 * Utile quand les factures ne sont pas encore créées mais les commandes existent
 */
export async function getTopArticlesCommandes(options = {}) {
  const { limit = 20, date_debut, date_fin } = options;

  const params = [];
  let dateFilter = '';
  if (date_debut) {
    params.push(date_debut);
    dateFilter += ` AND c.date_commande >= $${params.length}`;
  }
  if (date_fin) {
    params.push(date_fin);
    dateFilter += ` AND c.date_commande <= $${params.length}`;
  }
  params.push(limit);

  const result = await pool.query(`
    SELECT
      a.id_article,
      a.code_article,
      a.designation,
      a.ref_commerciale,
      a.prix_vente,
      a.prix_revient,
      m.libelle as modele_libelle,
      SUM(ac.quantite_commandee)::numeric as quantite_commandee,
      SUM(ac.quantite_produite)::numeric as quantite_produite,
      SUM(ac.quantite_livree)::numeric as quantite_livree,
      COUNT(DISTINCT c.id_commande) as nb_commandes,
      COUNT(DISTINCT c.id_client) as nb_clients,
      SUM(COALESCE(ac.montant_ligne, ac.quantite_commandee * ac.prix_unitaire))::numeric as ca_estime
    FROM articles_catalogue a
    INNER JOIN articles_commande ac ON ac.id_article = a.id_article
    INNER JOIN commandes c ON ac.id_commande = c.id_commande
    LEFT JOIN parametres_modeles m ON a.id_modele = m.id
    WHERE c.statut NOT IN ('annulee') ${dateFilter}
    GROUP BY a.id_article, a.code_article, a.designation, a.ref_commerciale,
             a.prix_vente, a.prix_revient, m.libelle
    ORDER BY quantite_commandee DESC
    LIMIT $${params.length}
  `, params);

  return result.rows.map(r => ({
    id_article: r.id_article,
    code_article: r.code_article,
    designation: r.designation,
    ref_commerciale: r.ref_commerciale,
    modele_libelle: r.modele_libelle,
    prix_vente: parseFloat(r.prix_vente || 0),
    prix_revient: parseFloat(r.prix_revient || 0),
    quantite_commandee: parseFloat(r.quantite_commandee || 0),
    quantite_produite: parseFloat(r.quantite_produite || 0),
    quantite_livree: parseFloat(r.quantite_livree || 0),
    nb_commandes: parseInt(r.nb_commandes || 0),
    nb_clients: parseInt(r.nb_clients || 0),
    ca_estime: parseFloat(r.ca_estime || 0)
  }));
}

/**
 * Dashboard ventes global — chiffres clés
 */
export async function getDashboardVentes(options = {}) {
  const { date_debut, date_fin } = options;

  const params = [];
  let dateFilter = '';
  if (date_debut) {
    params.push(date_debut);
    dateFilter += ` AND f.date_facture >= $${params.length}`;
  }
  if (date_fin) {
    params.push(date_fin);
    dateFilter += ` AND f.date_facture <= $${params.length}`;
  }

  const result = await pool.query(`
    SELECT
      COUNT(DISTINCT f.id_facture) as nb_factures,
      COUNT(DISTINCT f.id_client) as nb_clients,
      COUNT(DISTINCT lf.id_article) as nb_articles_distincts,
      COALESCE(SUM(lf.quantite), 0)::numeric as quantite_totale,
      COALESCE(SUM(lf.montant_ht), 0)::numeric as ca_ht,
      COALESCE(SUM(lf.montant_ttc), 0)::numeric as ca_ttc,
      COALESCE(SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0))), 0)::numeric as marge_ht,
      CASE
        WHEN SUM(lf.montant_ht) > 0 THEN
          ROUND((SUM(lf.quantite * (lf.prix_unitaire_ht - COALESCE(a.prix_revient, 0))) / SUM(lf.montant_ht) * 100)::numeric, 2)
        ELSE 0
      END as taux_marge_global_pct
    FROM factures f
    LEFT JOIN lignes_facture lf ON lf.id_facture = f.id_facture
    LEFT JOIN articles_catalogue a ON a.id_article = lf.id_article
    WHERE f.statut != 'ANNULEE' ${dateFilter}
  `, params);

  const row = result.rows[0] || {};
  return {
    nb_factures: parseInt(row.nb_factures || 0),
    nb_clients: parseInt(row.nb_clients || 0),
    nb_articles_distincts: parseInt(row.nb_articles_distincts || 0),
    quantite_totale: parseFloat(row.quantite_totale || 0),
    ca_ht: parseFloat(row.ca_ht || 0),
    ca_ttc: parseFloat(row.ca_ttc || 0),
    marge_ht: parseFloat(row.marge_ht || 0),
    taux_marge_global_pct: parseFloat(row.taux_marge_global_pct || 0),
    periode: { date_debut, date_fin }
  };
}
