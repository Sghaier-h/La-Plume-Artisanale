/**
 * Purchaseorder Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';

const TABLE_NAME = 'commandes_fournisseurs';
const ID_FIELD = 'id_commande_fournisseur';

// GET /api/purchase/purchase/order - Liste tous les enregistrements
export const getPurchaseOrders = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const { offset, pageSize } = getPaginationParams(page, limit);

    let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchConditions = ["numero_commande"].map(field => 
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

    return sendSuccess(res, {
      data: result.rows,
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    return handleError(res, error, 'getPurchaseorder');
  }
};

// GET /api/purchase/purchase/order/:id - Récupère un enregistrement
export const getPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseorderById');
  }
};

// POST /api/purchase/purchase/order - Crée un enregistrement
export const createPurchaseOrder = async (req, res) => {
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
    return handleError(res, error, 'createPurchaseorder');
  }
};

// PUT /api/purchase/purchase/order/:id - Met à jour un enregistrement
export const updatePurchaseOrder = async (req, res) => {
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
    return handleError(res, error, 'updatePurchaseorder');
  }
};

// DELETE /api/purchase/purchase/order/:id - Supprime un enregistrement
export const deletePurchaseOrder = async (req, res) => {
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
    return handleError(res, error, 'deletePurchaseorder');
  }
};


// POST /api/purchase/orders/:id/cancel
export const cancelPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE commandes_fournisseurs 
      SET statut = 'annulee', updated_at = NOW() 
      WHERE id_commande = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande annulée avec succès');
  } catch (error) {
    return handleError(res, error, 'cancelPurchaseOrder');
  }
};


// POST /api/purchase/orders/:id/confirm
export const confirmPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE commandes_fournisseurs 
      SET statut = 'confirmee', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_commande_fournisseur = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmPurchaseOrder');
  }
};


// GET /api/purchase/orders/:id/lines
export const getPurchaseOrderLines = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM lignes_commande_fournisseur 
      WHERE id_commande_fournisseur = $1 
      ORDER BY ordre ASC
    `;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Lignes récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseOrderLines');
  }
};
