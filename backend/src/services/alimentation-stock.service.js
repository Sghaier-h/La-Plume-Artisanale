/**
 * Alimentation Stock Service
 *
 * Porté depuis getAnalyseStockBasAlimentation() du GAS
 *
 * Logique métier :
 * 1. Identifier les articles dont le stock disponible < minimum
 * 2. Calculer le déficit à combler (minimum - disponible)
 * 3. Proposer (ou créer) des OF pour combler le déficit
 * 4. Prendre en compte les OF déjà en cours pour ne pas doubler
 */

import { pool } from '../utils/db.js';
import { logger } from '../utils/logger.js';

/**
 * Analyse complète avec propositions d'alimentation
 *
 * @param {Object} options
 * @param {number} options.limit - Nombre max d'articles
 * @returns {Promise<{
 *   total_articles_stock_bas: number,
 *   articles: Array<{
 *     id_article, code_article, designation,
 *     stock_disponible, qte_minimal_stock, deficit,
 *     nb_of_en_cours, qte_of_en_cours,
 *     qte_a_produire_suggerer,
 *     action_recommandee: 'creer_of' | 'attendre_of' | 'rien'
 *   }>
 * }>}
 */
export async function analyseAlimentationStock(options = {}) {
  const { limit = 100 } = options;

  const result = await pool.query(`
    WITH
      stock_physique AS (
        SELECT id_article, SUM(quantite_disponible) as qte
        FROM stock_produits_finis
        WHERE statut IN ('disponible', 'reserve', 'en_stock')
        GROUP BY id_article
      ),
      of_en_cours AS (
        SELECT
          id_article,
          SUM(GREATEST(quantite_a_produire - COALESCE(quantite_produite, 0), 0)) as qte_restante,
          COUNT(*) as nb_of
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
      m.code_modele,
      d.code as code_dimension,
      d.libelle as dimension_libelle,
      COALESCE(sp.qte, 0)::numeric as stock_brut,
      COALESCE(ofc.qte_restante, 0)::numeric as qte_of_en_cours,
      COALESCE(ofc.nb_of, 0)::int as nb_of_en_cours,
      COALESCE(r.qte, 0)::numeric as stock_reserve,
      (COALESCE(sp.qte, 0) + COALESCE(ofc.qte_restante, 0) - COALESCE(r.qte, 0))::numeric as stock_disponible,
      (a.qte_minimal_stock - (COALESCE(sp.qte, 0) + COALESCE(ofc.qte_restante, 0) - COALESCE(r.qte, 0)))::numeric as deficit
    FROM articles_catalogue a
    LEFT JOIN parametres_modeles m ON a.id_modele = m.id
    LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
    LEFT JOIN stock_physique sp ON a.id_article = sp.id_article
    LEFT JOIN of_en_cours ofc ON a.id_article = ofc.id_article
    LEFT JOIN reserve r ON a.id_article = r.id_article
    WHERE a.actif = true
      AND a.qte_minimal_stock > 0
      AND (a.qte_minimal_stock > (COALESCE(sp.qte, 0) + COALESCE(ofc.qte_restante, 0) - COALESCE(r.qte, 0)))
    ORDER BY deficit DESC
    LIMIT $1
  `, [limit]);

  const articles = result.rows.map(r => {
    const deficit = parseFloat(r.deficit || 0);
    const qteOfEnCours = parseFloat(r.qte_of_en_cours || 0);
    const nbOfEnCours = parseInt(r.nb_of_en_cours || 0);

    // Décider de l'action recommandée
    let actionRecommandee = 'creer_of';
    let qteAProduireSuggerer = deficit;

    if (nbOfEnCours > 0 && qteOfEnCours >= deficit) {
      // Des OF couvrent déjà le besoin
      actionRecommandee = 'attendre_of';
      qteAProduireSuggerer = 0;
    } else if (nbOfEnCours > 0) {
      // Des OF en cours, mais insuffisants — créer un OF pour le delta
      actionRecommandee = 'creer_of';
      qteAProduireSuggerer = deficit; // déficit inclut déjà les OF en cours
    }

    return {
      id_article: r.id_article,
      code_article: r.code_article,
      designation: r.designation,
      ref_commerciale: r.ref_commerciale,
      modele_libelle: r.modele_libelle,
      code_modele: r.code_modele,
      code_dimension: r.code_dimension,
      dimension_libelle: r.dimension_libelle,
      qte_minimal_stock: parseFloat(r.qte_minimal_stock || 0),
      stock_brut: parseFloat(r.stock_brut || 0),
      stock_reserve: parseFloat(r.stock_reserve || 0),
      stock_disponible: parseFloat(r.stock_disponible || 0),
      deficit,
      nb_of_en_cours: nbOfEnCours,
      qte_of_en_cours: qteOfEnCours,
      qte_a_produire_suggerer: Math.max(0, Math.round(qteAProduireSuggerer)),
      action_recommandee: actionRecommandee
    };
  });

  const stats = {
    total_articles_stock_bas: articles.length,
    total_deficit: articles.reduce((s, a) => s + a.deficit, 0),
    total_a_produire: articles.reduce((s, a) => s + a.qte_a_produire_suggerer, 0),
    articles_avec_of: articles.filter(a => a.nb_of_en_cours > 0).length,
    articles_sans_of: articles.filter(a => a.nb_of_en_cours === 0).length
  };

  return { stats, articles };
}

/**
 * Crée un OF d'alimentation pour un article
 *
 * @param {Object} options
 * @param {number} options.idArticle
 * @param {number} options.quantite
 * @param {number} options.userId
 * @param {string} [options.priorite='normale']
 */
export async function creerOfAlimentation({ idArticle, quantite, userId, priorite = 'normale' }) {
  if (!idArticle || !quantite || quantite <= 0) {
    throw new Error('id_article et quantite > 0 requis');
  }

  // Récupérer l'article
  const article = await pool.query(
    'SELECT id_article, code_article, designation FROM articles_catalogue WHERE id_article = $1 AND actif = true',
    [idArticle]
  );
  if (article.rows.length === 0) {
    throw new Error('Article introuvable ou désactivé');
  }

  // Générer un numéro d'OF
  const countResult = await pool.query(
    "SELECT COUNT(*) as c FROM ordres_fabrication WHERE date_creation_of >= CURRENT_DATE"
  );
  const numero = `OF-ALIM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(parseInt(countResult.rows[0].c) + 1).padStart(4, '0')}`;

  const result = await pool.query(
    `INSERT INTO ordres_fabrication (
      numero_of, id_article, quantite_a_produire,
      date_creation_of, priorite, statut, observations,
      cree_par, created_by
    ) VALUES ($1, $2, $3, CURRENT_DATE, $4, 'planifie', $5, $6, $6)
    RETURNING *`,
    [numero, idArticle, quantite, priorite, 'OF auto-créé pour alimentation stock', userId]
  );

  logger.info('OF alimentation créé', {
    numero,
    id_article: idArticle,
    quantite
  });

  return result.rows[0];
}

/**
 * Crée en lot des OF pour tous les articles recommandés
 * Ne crée d'OF que pour les articles avec action_recommandee = 'creer_of'
 */
export async function creerOfsAlimentationLot({ articles, userId, priorite = 'normale' }) {
  const results = {
    crees: [],
    erreurs: []
  };

  for (const item of articles) {
    if (item.action_recommandee !== 'creer_of' || item.qte_a_produire_suggerer <= 0) {
      continue;
    }

    try {
      const of = await creerOfAlimentation({
        idArticle: item.id_article,
        quantite: item.qte_a_produire_suggerer,
        userId,
        priorite
      });
      results.crees.push({
        id_article: item.id_article,
        code_article: item.code_article,
        of
      });
    } catch (error) {
      results.erreurs.push({
        id_article: item.id_article,
        code_article: item.code_article,
        error: error.message
      });
    }
  }

  return results;
}
