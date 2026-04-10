/**
 * Contrôleur PurchaseOrderLineController - Module purchase
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/purchase/purchase_order_line - Liste tous les enregistrements
export const getPurchaseOrderLine = async (req, res) => {
  try {
    const query = `SELECT * FROM purchase_order_lines ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'PurchaseOrderLine récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseOrderLine');
  }
};

// GET /api/purchase/purchase_order_line/:id - Récupère un enregistrement
export const getPurchaseOrderLineById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM purchase_order_lines WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseOrderLineById');
  }
};

// POST /api/purchase/purchase_order_line - Crée un enregistrement
export const createPurchaseOrderLine = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO purchase_order_lines (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPurchaseOrderLine');
  }
};

// PUT /api/purchase/purchase_order_line/:id - Met à jour un enregistrement
export const updatePurchaseOrderLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE purchase_order_lines
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePurchaseOrderLine');
  }
};

// DELETE /api/purchase/purchase_order_line/:id - Supprime un enregistrement
export const deletePurchaseOrderLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique (champ active)
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'purchase_order_lines' AND column_name = 'active'
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = `
          UPDATE purchase_order_lines
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE id = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        query = `
          DELETE FROM purchase_order_lines
          WHERE id = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      query = `
        DELETE FROM purchase_order_lines
        WHERE id = $1
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
    return handleError(res, error, 'deletePurchaseOrderLine');
  }
};
