/**
 * Contrôleur Articles Catalogue
 *
 * Porté depuis la logique GAS 04_Catalogue.gs :
 * - getArticles_cat (avec enrichissement relations)
 * - ajouterArticle_cat (avec génération auto refs)
 * - modifierArticle_cat
 * - supprimerArticle_cat
 * - rechercherArticles (filtres multi-critères)
 * - getValeursDistinctesProduits (pour dropdowns frontend)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';
import { buildReferences, buildDesignation } from '../../../src/services/article-reference.service.js';

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue
// Liste paginée + enrichie (JOINs avec tous les paramètres)
// Filtres: search, actif, id_modele, id_dimension, id_couleur, id_finition,
//          id_tissage, id_nombre_couleurs, dans_catalogue_produit
// ─────────────────────────────────────────────────────────────────────
export const getArticlesCatalogue = async (req, res) => {
  try {
    const {
      search, actif, id_modele, id_dimension, id_couleur, id_finition,
      id_tissage, id_nombre_couleurs, dans_catalogue_produit, page, limit
    } = req.query;

    const qb = new QueryBuilder('articles_catalogue', 'a')
      .select([
        'a.id_article', 'a.code_article', 'a.designation',
        'a.ref_commerciale', 'a.ref_fabrication',
        'a.specification', 'a.unite_vente',
        'a.prix_unitaire_base', 'a.prix_vente', 'a.prix_revient',
        'a.temps_production_standard', 'a.qte_minimal_stock',
        'a.description', 'a.image_url', 'a.dans_catalogue_produit',
        'a.actif', 'a.date_creation', 'a.date_modification',
        // Modèle
        'a.id_modele', 'm.code_modele', 'm.libelle as modele_libelle',
        // Dimension
        'a.id_dimension', 'd.code as code_dimension', 'd.libelle as dimension_libelle',
        'd.largeur', 'd.longueur',
        // Couleur
        'a.id_couleur', 'c.code_commercial as couleur_code', 'c.nom as couleur_nom', 'c.code_hex',
        // Finition
        'a.id_finition', 'f.code as code_finition', 'f.libelle as finition_libelle',
        // Tissage
        'a.id_tissage', 't.code as code_tissage', 't.libelle as tissage_libelle',
        // Nombre couleurs
        'a.id_nombre_couleurs', 'nc.code as code_nc', 'nc.libelle as nc_libelle', 'nc.nombre as nc_nombre',
        // Type article
        'a.id_type_article', 'ta.libelle as type_article_libelle'
      ])
      .join('LEFT JOIN parametres_modeles m ON a.id_modele = m.id')
      .join('LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id')
      .join('LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id')
      .join('LEFT JOIN parametres_finitions f ON a.id_finition = f.id')
      .join('LEFT JOIN parametres_tissages t ON a.id_tissage = t.id')
      .join('LEFT JOIN parametres_nombre_couleurs nc ON a.id_nombre_couleurs = nc.id')
      .join('LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article')
      .search(['a.code_article', 'a.designation', 'a.ref_commerciale', 'a.ref_fabrication'], search)
      .whereBool('a.actif = $?', actif)
      .whereIf('a.id_modele = $?', id_modele)
      .whereIf('a.id_dimension = $?', id_dimension)
      .whereIf('a.id_couleur = $?', id_couleur)
      .whereIf('a.id_finition = $?', id_finition)
      .whereIf('a.id_tissage = $?', id_tissage)
      .whereIf('a.id_nombre_couleurs = $?', id_nombre_couleurs)
      .whereBool('a.dans_catalogue_produit = $?', dans_catalogue_produit)
      .orderBy('a.date_creation DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getArticlesCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/valeurs-distinctes
// Retourne les listes uniques pour dropdowns frontend
// Inspiré de getValeursDistinctesProduits() du GAS
// ─────────────────────────────────────────────────────────────────────
export const getValeursDistinctes = async (req, res) => {
  try {
    const [modeles, dimensions, couleurs, finitions, tissages, nc] = await Promise.all([
      pool.query('SELECT id, code_modele, libelle FROM parametres_modeles WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code, libelle FROM parametres_dimensions WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code_commercial, nom FROM parametres_couleurs WHERE actif = true ORDER BY nom'),
      pool.query('SELECT id, code, libelle FROM parametres_finitions WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code, libelle FROM parametres_tissages WHERE actif = true ORDER BY libelle'),
      pool.query('SELECT id, code, libelle, nombre FROM parametres_nombre_couleurs WHERE actif = true ORDER BY nombre')
    ]);

    return sendSuccess(res, {
      modeles: modeles.rows,
      dimensions: dimensions.rows,
      couleurs: couleurs.rows,
      finitions: finitions.rows,
      tissages: tissages.rows,
      nombre_couleurs: nc.rows
    });
  } catch (error) {
    return handleError(res, error, 'getValeursDistinctes');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/:id
// ─────────────────────────────────────────────────────────────────────
export const getArticleCatalogueById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*,
              m.code_modele, m.libelle as modele_libelle,
              d.code as code_dimension, d.libelle as dimension_libelle, d.largeur, d.longueur,
              c.code_commercial as couleur_code, c.nom as couleur_nom, c.code_hex,
              f.code as code_finition, f.libelle as finition_libelle,
              t.code as code_tissage, t.libelle as tissage_libelle,
              nc.code as code_nc, nc.libelle as nc_libelle, nc.nombre as nc_nombre,
              ta.libelle as type_article_libelle
       FROM articles_catalogue a
       LEFT JOIN parametres_modeles m ON a.id_modele = m.id
       LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
       LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id
       LEFT JOIN parametres_finitions f ON a.id_finition = f.id
       LEFT JOIN parametres_tissages t ON a.id_tissage = t.id
       LEFT JOIN parametres_nombre_couleurs nc ON a.id_nombre_couleurs = nc.id
       LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
       WHERE a.id_article = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getArticleCatalogueById');
  }
};

// ─────────────────────────────────────────────────────────────────────
// POST /api/articles-catalogue
// Création article + génération auto refs si non fournies
// ─────────────────────────────────────────────────────────────────────
export const createArticleCatalogue = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = { ...req.body };

    // Générer automatiquement les références si manquantes et qu'on a les éléments
    if ((!data.ref_commerciale || !data.ref_fabrication) && data.id_modele && data.id_dimension && data.id_nombre_couleurs) {
      const [modele, dimension, nc] = await Promise.all([
        pool.query('SELECT code_modele FROM parametres_modeles WHERE id = $1', [data.id_modele]),
        pool.query('SELECT code FROM parametres_dimensions WHERE id = $1', [data.id_dimension]),
        pool.query('SELECT code FROM parametres_nombre_couleurs WHERE id = $1', [data.id_nombre_couleurs])
      ]);

      if (modele.rows.length && dimension.rows.length && nc.rows.length) {
        const refs = buildReferences({
          codeModele: modele.rows[0].code_modele,
          codeDimension: dimension.rows[0].code,
          codeNc: nc.rows[0].code,
          selecteurs: data.selecteurs || []
        });
        data.ref_commerciale = data.ref_commerciale || refs.ref_commerciale;
        data.ref_fabrication = data.ref_fabrication || refs.ref_fabrication;
        data.code_article = data.code_article || refs.ref_commerciale;
      }
    }

    // Validation minimale
    if (!data.designation) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('designation'));
    }
    if (!data.code_article) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('code_article'));
    }

    // Champs autorisés pour l'INSERT
    const allowedFields = [
      'code_article', 'designation', 'id_type_article', 'specification',
      'unite_vente', 'prix_unitaire_base', 'temps_production_standard',
      'ref_commerciale', 'ref_fabrication',
      'id_nombre_couleurs', 'id_couleur', 'id_personnalisation',
      'qte_minimal_stock', 'prix_vente', 'prix_revient',
      'id_modele', 'id_dimension', 'id_finition', 'id_tissage',
      'description', 'dans_catalogue_produit', 'image_url', 'actif'
    ];

    const fields = allowedFields.filter(f => data[f] !== undefined);
    const values = fields.map(f => data[f]);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO articles_catalogue (${fields.join(', ')}, date_creation, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;

    const result = await pool.query(query, [...values, userId]);
    logger.info('Article catalogue créé', {
      id: result.rows[0].id_article,
      code: result.rows[0].code_article,
      ref_com: result.rows[0].ref_commerciale
    });

    return sendSuccess(res, result.rows[0], 'Article créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createArticleCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// PUT /api/articles-catalogue/:id
// ─────────────────────────────────────────────────────────────────────
export const updateArticleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;

    const excludedFields = ['id_article', 'date_creation', 'date_modification', 'created_by', 'updated_by'];
    const allowedFields = [
      'code_article', 'designation', 'id_type_article', 'specification',
      'unite_vente', 'prix_unitaire_base', 'temps_production_standard',
      'ref_commerciale', 'ref_fabrication',
      'id_nombre_couleurs', 'id_couleur', 'id_personnalisation',
      'qte_minimal_stock', 'prix_vente', 'prix_revient',
      'id_modele', 'id_dimension', 'id_finition', 'id_tissage',
      'description', 'dans_catalogue_produit', 'image_url', 'actif'
    ];

    const fields = allowedFields.filter(f => data[f] !== undefined && !excludedFields.includes(f));
    if (fields.length === 0) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, 'Aucune donnée à mettre à jour');
    }

    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const query = `
      UPDATE articles_catalogue
      SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
      WHERE id_article = $${values.length + 2}
      RETURNING *
    `;

    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    logger.info('Article catalogue mis à jour', { id });
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateArticleCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/articles-catalogue/:id (soft delete)
// ─────────────────────────────────────────────────────────────────────
export const deleteArticleCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;

    const result = await pool.query(
      `UPDATE articles_catalogue
       SET actif = false, date_modification = NOW(), updated_by = $1
       WHERE id_article = $2
       RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Article'));
    }

    logger.info('Article catalogue désactivé', { id });
    return sendSuccess(res, { message: 'Article désactivé avec succès' });
  } catch (error) {
    return handleError(res, error, 'deleteArticleCatalogue');
  }
};

// ─────────────────────────────────────────────────────────────────────
// GET /api/articles-catalogue/stats/top-modeles
// Top modèles par nombre d'articles
// ─────────────────────────────────────────────────────────────────────
export const getStatsTopModeles = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(
      `SELECT m.id, m.code_modele, m.libelle,
              COUNT(a.id_article) as nb_articles,
              COUNT(*) FILTER (WHERE a.actif = true) as nb_actifs
       FROM parametres_modeles m
       LEFT JOIN articles_catalogue a ON a.id_modele = m.id
       WHERE m.actif = true
       GROUP BY m.id, m.code_modele, m.libelle
       ORDER BY nb_articles DESC
       LIMIT $1`,
      [limit]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getStatsTopModeles');
  }
};
