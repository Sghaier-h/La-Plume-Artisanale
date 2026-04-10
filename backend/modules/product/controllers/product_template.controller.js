/**
 * Producttemplate Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';
import { getImageUrl, deleteImageFile } from '../utils/upload.js';

const TABLE_NAME = 'articles_catalogue';
const ID_FIELD = 'id_article';

// GET /api/product/product/template - Liste tous les enregistrements
export const getProductTemplates = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const { offset, pageSize } = getPaginationParams(page, limit);

    let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchConditions = ["nom","reference"].map(field => 
        `${field} ILIKE $${paramIndex}`
      ).join(' OR ');
      query += ` AND (${searchConditions})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM ${TABLE_NAME}`, []);
    const total = parseInt(totalResult.rows[0].total);

    // Ajouter les URLs complètes des images
    const products = result.rows.map(product => {
      if (product.image_url) {
        product.image_url_full = getImageUrl(product.image_url);
      }
      return product;
    });

    return sendSuccess(res, {
      data: products,
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    return handleError(res, error, 'getProducttemplate');
  }
};

// GET /api/product/product/template/:id - Récupère un enregistrement
export const getProductTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getProducttemplateById');
  }
};

// POST /api/product/product/template - Crée un enregistrement
export const createProductTemplate = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const excludedFields = [ID_FIELD, 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO ${TABLE_NAME} (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createProducttemplate');
  }
};

// PUT /api/product/product/template/:id - Met à jour un enregistrement
export const updateProductTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const excludedFields = [ID_FIELD, 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE ${TABLE_NAME}
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE ${ID_FIELD} = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateProducttemplate');
  }
};

// DELETE /api/product/product/template/:id - Supprime un enregistrement
export const deleteProductTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${TABLE_NAME}' AND column_name = 'active'
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = `
          UPDATE ${TABLE_NAME}
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE ${ID_FIELD} = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        query = `
          DELETE FROM ${TABLE_NAME}
          WHERE ${ID_FIELD} = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      query = `
        DELETE FROM ${TABLE_NAME}
        WHERE ${ID_FIELD} = $1
        RETURNING *
      `;
      params = [id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteProducttemplate');
  }
};


// GET /api/product/templates/:id/movements
export const getProductMovements = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM mouvements_stock 
      WHERE id_article = $1 
      ORDER BY date_mouvement DESC
    `;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Mouvements récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductMovements');
  }
};


// GET /api/product/templates/:id/stock
export const getProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT s.*, l.nom as location_name, w.nom as warehouse_name
      FROM stock s
      LEFT JOIN emplacements l ON s.id_emplacement = l.id_emplacement
      LEFT JOIN entrepots w ON l.id_entrepot = w.id_entrepot
      WHERE s.id_article = $1
      ORDER BY s.date_modification DESC
    `;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Stock récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductStock');
  }
};

// POST /api/product/templates/:id/image - Upload image produit
export const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return sendError(res, 'Aucun fichier uploadé', 400);
    }

    const userId = getUserId(req) || 1;
    const imageUrl = `/uploads/products/${req.file.filename}`;

    // Vérifier que le produit existe
    const productCheck = await pool.query(
      `SELECT ${ID_FIELD} FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`,
      [id]
    );

    if (productCheck.rows.length === 0) {
      deleteImageFile(req.file.filename);
      return sendError(res, 'Produit non trouvé', 404);
    }

    // Mettre à jour le produit avec l'image
    const updateQuery = `
      UPDATE ${TABLE_NAME} 
      SET image_url = $1, updated_at = NOW(), updated_by = $2
      WHERE ${ID_FIELD} = $3
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [imageUrl, userId, id]);
    const product = result.rows[0];
    product.image_url_full = getImageUrl(product.image_url);

    return sendSuccess(res, product, 'Image uploadée avec succès');
  } catch (error) {
    return handleError(res, error, 'uploadProductImage');
  }
};

// DELETE /api/product/templates/:id/image/:imageId - Supprimer image
export const deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;

    // Récupérer le produit pour obtenir l'image
    const productResult = await pool.query(
      `SELECT image_url FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return sendError(res, 'Produit non trouvé', 404);
    }

    const imageUrl = productResult.rows[0].image_url;
    if (imageUrl) {
      // Supprimer le fichier
      deleteImageFile(imageUrl);
    }

    // Mettre à jour le produit pour supprimer l'image_url
    const updateQuery = `
      UPDATE ${TABLE_NAME} 
      SET image_url = NULL, updated_at = NOW(), updated_by = $1
      WHERE ${ID_FIELD} = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [userId, id]);
    return sendSuccess(res, result.rows[0], 'Image supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteProductImage');
  }
};

// GET /api/product/templates/:id/images - Récupérer toutes les images d'un produit
export const getProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `SELECT image_url FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Produit non trouvé', 404);
    }

    const images = [];
    if (result.rows[0].image_url) {
      images.push({
        id: 1,
        url: result.rows[0].image_url,
        url_full: getImageUrl(result.rows[0].image_url),
        is_primary: true
      });
    }

    return sendSuccess(res, { images }, 'Images récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductImages');
  }
};
