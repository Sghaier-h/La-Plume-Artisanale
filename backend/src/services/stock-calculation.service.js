/**
 * Stock Calculation Service
 *
 * Porté depuis la logique GAS _buildParRefStockFabricationComplete_() / _buildParRefStockFabricationUsineOnly_()
 *
 * Formule :
 *   stock_final = stock_pf (disponible)
 *               + stock_of_en_cours (quantité à produire - quantité déjà produite)
 *               - quantite_reservee (commandes en attente de production)
 *               - quantite_colise (lignes_bl en préparation)
 *
 * Le stock est calculé par id_article, et retourne :
 *   - stock_brut : ce qui est physiquement en stock_produits_finis
 *   - stock_en_cours_fabrication : ce qui est dans les OF non terminés
 *   - stock_reserve : ce qui est réservé par des commandes non livrées
 *   - stock_colise : ce qui est dans des BL non validés
 *   - stock_disponible : stock_brut + stock_en_cours - stock_reserve - stock_colise
 */

import { pool } from '../utils/db.js';

/**
 * Calcule le stock d'un article unique
 *
 * @param {number} idArticle
 * @returns {Promise<{
 *   id_article: number,
 *   stock_brut: number,
 *   stock_en_cours_fabrication: number,
 *   stock_reserve: number,
 *   stock_colise: number,
 *   stock_disponible: number,
 *   details: { ... }
 * }>}
 */
export async function calculateStockForArticle(idArticle) {
  const id = parseInt(idArticle);
  if (!id || isNaN(id)) {
    throw new Error('id_article invalide');
  }

  // Requête unique avec 4 CTE pour agréger les 4 sources
  const result = await pool.query(`
    WITH
      -- Stock physique disponible
      stock_physique AS (
        SELECT
          COALESCE(SUM(quantite_disponible), 0) as qte,
          COUNT(*) as nb_lots
        FROM stock_produits_finis
        WHERE id_article = $1
          AND statut IN ('disponible', 'reserve', 'en_stock')
      ),
      -- Quantité dans les OF en cours (non terminés, non annulés)
      stock_of AS (
        SELECT
          COALESCE(SUM(GREATEST(quantite_a_produire - COALESCE(quantite_produite, 0), 0)), 0) as qte,
          COUNT(*) FILTER (WHERE statut IN ('planifie', 'en_cours')) as nb_of
        FROM ordres_fabrication
        WHERE id_article = $1
          AND statut NOT IN ('termine', 'annule')
      ),
      -- Quantité réservée par commandes (non livrées)
      reserve AS (
        SELECT
          COALESCE(SUM(GREATEST(ac.quantite_commandee - COALESCE(ac.quantite_livree, 0), 0)), 0) as qte,
          COUNT(*) FILTER (WHERE c.statut != 'livree' AND c.statut != 'annulee') as nb_lignes
        FROM articles_commande ac
        JOIN commandes c ON ac.id_commande = c.id_commande
        WHERE ac.id_article = $1
          AND c.statut NOT IN ('livree', 'annulee')
      ),
      -- Quantité en cours d'expédition (BL non validés)
      colise AS (
        SELECT
          COALESCE(SUM(quantite_livree), 0) as qte,
          COUNT(*) as nb_lignes
        FROM lignes_bl lb
        JOIN bons_livraison bl ON lb.id_bl = bl.id_bl
        WHERE lb.id_article = $1
          AND bl.statut IN ('BROUILLON', 'en_preparation')
      )
    SELECT
      sp.qte::numeric as stock_brut,
      sp.nb_lots::int as nb_lots_stock,
      sof.qte::numeric as stock_en_cours_fabrication,
      sof.nb_of::int as nb_of_en_cours,
      r.qte::numeric as stock_reserve,
      r.nb_lignes::int as nb_reservations,
      c.qte::numeric as stock_colise,
      c.nb_lignes::int as nb_colisages,
      (sp.qte + sof.qte - r.qte - c.qte)::numeric as stock_disponible
    FROM stock_physique sp, stock_of sof, reserve r, colise c
  `, [id]);

  const row = result.rows[0] || {};

  return {
    id_article: id,
    stock_brut: parseFloat(row.stock_brut || 0),
    stock_en_cours_fabrication: parseFloat(row.stock_en_cours_fabrication || 0),
    stock_reserve: parseFloat(row.stock_reserve || 0),
    stock_colise: parseFloat(row.stock_colise || 0),
    stock_disponible: parseFloat(row.stock_disponible || 0),
    details: {
      nb_lots_stock: parseInt(row.nb_lots_stock || 0),
      nb_of_en_cours: parseInt(row.nb_of_en_cours || 0),
      nb_reservations: parseInt(row.nb_reservations || 0),
      nb_colisages: parseInt(row.nb_colisages || 0)
    }
  };
}

/**
 * Calcule le stock pour TOUS les articles actifs
 * Version optimisée avec une seule requête agrégée
 *
 * @returns {Promise<Array>} Liste des stocks par article
 */
export async function calculateStockForAllArticles(options = {}) {
  const { onlyPositive = false, actif = true } = options;

  const result = await pool.query(`
    WITH
      stock_physique AS (
        SELECT id_article, SUM(quantite_disponible) as qte
        FROM stock_produits_finis
        WHERE statut IN ('disponible', 'reserve', 'en_stock')
        GROUP BY id_article
      ),
      stock_of AS (
        SELECT id_article, SUM(GREATEST(quantite_a_produire - COALESCE(quantite_produite, 0), 0)) as qte
        FROM ordres_fabrication
        WHERE statut NOT IN ('termine', 'annule')
        GROUP BY id_article
      ),
      reserve AS (
        SELECT ac.id_article, SUM(GREATEST(ac.quantite_commandee - COALESCE(ac.quantite_livree, 0), 0)) as qte
        FROM articles_commande ac
        JOIN commandes c ON ac.id_commande = c.id_commande
        WHERE c.statut NOT IN ('livree', 'annulee')
        GROUP BY ac.id_article
      ),
      colise AS (
        SELECT lb.id_article, SUM(lb.quantite_livree) as qte
        FROM lignes_bl lb
        JOIN bons_livraison bl ON lb.id_bl = bl.id_bl
        WHERE bl.statut IN ('BROUILLON', 'en_preparation')
        GROUP BY lb.id_article
      )
    SELECT
      a.id_article,
      a.code_article,
      a.designation,
      a.ref_commerciale,
      a.qte_minimal_stock,
      COALESCE(sp.qte, 0)::numeric as stock_brut,
      COALESCE(sof.qte, 0)::numeric as stock_en_cours_fabrication,
      COALESCE(r.qte, 0)::numeric as stock_reserve,
      COALESCE(c.qte, 0)::numeric as stock_colise,
      (COALESCE(sp.qte, 0) + COALESCE(sof.qte, 0) - COALESCE(r.qte, 0) - COALESCE(c.qte, 0))::numeric as stock_disponible
    FROM articles_catalogue a
    LEFT JOIN stock_physique sp ON a.id_article = sp.id_article
    LEFT JOIN stock_of sof ON a.id_article = sof.id_article
    LEFT JOIN reserve r ON a.id_article = r.id_article
    LEFT JOIN colise c ON a.id_article = c.id_article
    ${actif ? 'WHERE a.actif = true' : ''}
    ${onlyPositive ? (actif ? 'AND' : 'WHERE') + ' (COALESCE(sp.qte, 0) + COALESCE(sof.qte, 0) - COALESCE(r.qte, 0) - COALESCE(c.qte, 0)) > 0' : ''}
    ORDER BY a.code_article
  `);

  return result.rows.map(r => ({
    id_article: r.id_article,
    code_article: r.code_article,
    designation: r.designation,
    ref_commerciale: r.ref_commerciale,
    qte_minimal_stock: parseFloat(r.qte_minimal_stock || 0),
    stock_brut: parseFloat(r.stock_brut || 0),
    stock_en_cours_fabrication: parseFloat(r.stock_en_cours_fabrication || 0),
    stock_reserve: parseFloat(r.stock_reserve || 0),
    stock_colise: parseFloat(r.stock_colise || 0),
    stock_disponible: parseFloat(r.stock_disponible || 0)
  }));
}

/**
 * Détecte les articles en stock bas (disponible < minimum)
 * Porté depuis getAnalyseStockBasAlimentation() du GAS
 */
export async function getStockBasArticles(options = {}) {
  const { limit = 100 } = options;

  const result = await pool.query(`
    WITH
      stock_physique AS (
        SELECT id_article, SUM(quantite_disponible) as qte
        FROM stock_produits_finis
        WHERE statut IN ('disponible', 'reserve', 'en_stock')
        GROUP BY id_article
      ),
      stock_of AS (
        SELECT id_article, SUM(GREATEST(quantite_a_produire - COALESCE(quantite_produite, 0), 0)) as qte
        FROM ordres_fabrication
        WHERE statut NOT IN ('termine', 'annule')
        GROUP BY id_article
      ),
      reserve AS (
        SELECT ac.id_article, SUM(GREATEST(ac.quantite_commandee - COALESCE(ac.quantite_livree, 0), 0)) as qte
        FROM articles_commande ac
        JOIN commandes c ON ac.id_commande = c.id_commande
        WHERE c.statut NOT IN ('livree', 'annulee')
        GROUP BY ac.id_article
      )
    SELECT
      a.id_article, a.code_article, a.designation, a.ref_commerciale,
      a.qte_minimal_stock,
      m.libelle as modele_libelle,
      COALESCE(sp.qte, 0)::numeric as stock_brut,
      COALESCE(sof.qte, 0)::numeric as stock_en_cours,
      COALESCE(r.qte, 0)::numeric as stock_reserve,
      (COALESCE(sp.qte, 0) + COALESCE(sof.qte, 0) - COALESCE(r.qte, 0))::numeric as stock_disponible,
      (a.qte_minimal_stock - (COALESCE(sp.qte, 0) + COALESCE(sof.qte, 0) - COALESCE(r.qte, 0)))::numeric as deficit
    FROM articles_catalogue a
    LEFT JOIN parametres_modeles m ON a.id_modele = m.id
    LEFT JOIN stock_physique sp ON a.id_article = sp.id_article
    LEFT JOIN stock_of sof ON a.id_article = sof.id_article
    LEFT JOIN reserve r ON a.id_article = r.id_article
    WHERE a.actif = true
      AND a.qte_minimal_stock > 0
      AND (a.qte_minimal_stock > (COALESCE(sp.qte, 0) + COALESCE(sof.qte, 0) - COALESCE(r.qte, 0)))
    ORDER BY deficit DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map(r => ({
    id_article: r.id_article,
    code_article: r.code_article,
    designation: r.designation,
    ref_commerciale: r.ref_commerciale,
    modele_libelle: r.modele_libelle,
    qte_minimal_stock: parseFloat(r.qte_minimal_stock || 0),
    stock_brut: parseFloat(r.stock_brut || 0),
    stock_en_cours: parseFloat(r.stock_en_cours || 0),
    stock_reserve: parseFloat(r.stock_reserve || 0),
    stock_disponible: parseFloat(r.stock_disponible || 0),
    deficit: parseFloat(r.deficit || 0)
  }));
}
