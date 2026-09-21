/**
 * Ecommerce Product Controller
 * Contrôleur pour les produits e-commerce
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/ecommerce/products
export const getEcommerceProducts = async (req, res) => {
  try {
    const { ecommerce, search, loadRelations } = req.query;
    
    let query = `
      SELECT a.*, ta.libelle as category_name
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      WHERE 1=1
    `;
    const params = [];
    
    if (ecommerce === 'true') {
      query += ' AND a.website_published = $' + (params.length + 1);
      params.push(true);
    }
    
    if (search) {
      query += ` AND (a.nom ILIKE $${params.length + 1} OR a.code ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY a.id_article DESC';
    
    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows, 'Produits e-commerce récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerceProducts');
  }
};

// GET /api/ecommerce/products/:id
export const getEcommerceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT a.*, ta.libelle as category_name
      FROM articles_catalogue a
      LEFT JOIN types_articles ta ON a.id_type_article = ta.id_type_article
      WHERE a.id_article = $1
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Produit non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Produit récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerceProduct');
  }
};

// POST /api/ecommerce/products
export const createEcommerceProduct = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO articles_catalogue (${fields.map(f => f === 'name' ? 'designation' : f).join(', ')}, date_creation, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Produit créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createEcommerceProduct');
  }
};

// PUT /api/ecommerce/products/:id
export const updateEcommerceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE articles_catalogue
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id_article = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Produit non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Produit mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateEcommerceProduct');
  }
};

// DELETE /api/ecommerce/products/:id
export const deleteEcommerceProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE articles_catalogue
      SET website_published = false, updated_at = NOW(), updated_by = $1
      WHERE id_article = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Produit non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Produit supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteEcommerceProduct');
  }
};
