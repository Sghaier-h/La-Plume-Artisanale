/**
 * Contrôleur Articles - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// GET /api/articles - Liste tous les articles
export const getArticles = async (req, res) => {
  try {
    const { search, type, actif, reference, couleur, dimension, finition, page, limit } = req.query;

    const qb = new QueryBuilder('articles_catalogue', 'a')
      .select([
        'a.id_article', 'a.code_article', 'a.designation',
        'a.id_type_article', 'ta.libelle as type_article',
        'a.specification', 'a.unite_vente', 'a.prix_unitaire_base',
        'a.temps_production_standard',
        'a.id_dimension', 'd.code as code_dimension', 'd.libelle as dimension_libelle', 'd.largeur', 'd.longueur',
        'a.id_couleur', 'c.code_commercial as couleur_code', 'c.nom as couleur_nom',
        'a.id_finition', 'f.code as code_finition', 'f.libelle as finition_libelle',
        'a.actif', 'a.date_creation', 'a.date_modification'
      ])
      .join('LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article')
      .join('LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id')
      .join('LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id')
      .join('LEFT JOIN parametres_finitions f ON a.id_finition = f.id')
      .search(['a.code_article', 'a.designation'], search)
      .whereIf('a.id_type_article = $?', type)
      .whereBool('a.actif = $?', actif)
      .whereIf('a.id_reference = $?', reference)
      .whereIf('a.id_couleur = $?', couleur)
      .whereIf('a.id_dimension = $?', dimension)
      .whereIf('a.id_finition = $?', finition)
      .orderBy('a.date_creation DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getArticles');
  }
};

// GET /api/articles/:id - Récupère un article
export const getArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        a.*,
        ta.libelle as type_article,
        d.code as code_dimension,
        d.libelle as dimension_libelle,
        c.code_commercial as couleur_code,
        c.nom as couleur_nom,
        f.code as code_finition,
        f.libelle as finition_libelle
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      LEFT JOIN parametres_dimensions d ON a.id_dimension = d.id
      LEFT JOIN parametres_couleurs c ON a.id_couleur = c.id
      LEFT JOIN parametres_finitions f ON a.id_finition = f.id
      WHERE a.id_article = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Article non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Article récupéré avec succès');
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'article', { error: error.message });
    return sendError(res, 'Erreur lors de la récupération de l\'article', 500);
  }
};

// POST /api/articles - Crée un article
export const createArticle = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const {
      code_article,
      designation,
      id_type_article,
      specification,
      unite_vente,
      prix_unitaire_base,
      temps_production_standard,
      id_reference,
      id_dimension,
      id_couleur,
      id_finition,
      actif = true
    } = req.body;
    
    const query = `
      INSERT INTO articles_catalogue (
        code_article, designation, id_type_article, specification,
        unite_vente, prix_unitaire_base, temps_production_standard,
        id_reference, id_dimension, id_couleur, id_finition, actif,
        created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      code_article, designation, id_type_article, specification,
      unite_vente, prix_unitaire_base, temps_production_standard,
      id_reference, id_dimension, id_couleur, id_finition, actif,
      userId
    ]);
    
    return sendSuccess(res, result.rows[0], 'Article créé avec succès', 201);
  } catch (error) {
    logger.error('Erreur lors de la création de l\'article', { error: error.message });
    return sendError(res, 'Erreur lors de la création de l\'article', 500);
  }
};

// PUT /api/articles/:id - Met à jour un article
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const updateFields = req.body;
    
    const allowedFields = [
      'code_article', 'designation', 'id_type_article', 'specification',
      'unite_vente', 'prix_unitaire_base', 'temps_production_standard',
      'id_reference', 'id_dimension', 'id_couleur', 'id_finition', 'actif'
    ];
    
    const setClause = [];
    const params = [];
    let paramCount = 0;
    
    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        setClause.push(`${field} = $${++paramCount}`);
        params.push(updateFields[field]);
      }
    }
    
    if (setClause.length === 0) {
      return sendError(res, 'Aucun champ à mettre à jour', 400);
    }
    
    setClause.push(`updated_by = $${++paramCount}`);
    params.push(userId);
    setClause.push(`updated_at = NOW()`);
    params.push(id);
    
    const query = `
      UPDATE articles_catalogue
      SET ${setClause.join(', ')}
      WHERE id_article = $${++paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Article non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Article mis à jour avec succès');
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'article', { error: error.message });
    return sendError(res, 'Erreur lors de la mise à jour de l\'article', 500);
  }
};

// DELETE /api/articles/:id - Supprime un article
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `DELETE FROM articles_catalogue WHERE id_article = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Article non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Article supprimé avec succès');
  } catch (error) {
    logger.error('Erreur lors de la suppression de l\'article', { error: error.message });
    return sendError(res, 'Erreur lors de la suppression de l\'article', 500);
  }
};

// GET /api/articles/types - Liste les types d'articles
export const getTypesArticles = async (req, res) => {
  try {
    const query = `SELECT * FROM types_articles ORDER BY libelle`;
    const result = await pool.query(query);
    
    return sendSuccess(res, result.rows, 'Types d\'articles récupérés avec succès');
  } catch (error) {
    logger.error('Erreur lors de la récupération des types d\'articles', { error: error.message });
    return sendError(res, 'Erreur lors de la récupération des types d\'articles', 500);
  }
};
