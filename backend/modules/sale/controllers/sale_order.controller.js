/**
 * Saleorder Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';

const TABLE_NAME = 'commandes_clients';
const ID_FIELD = 'id_commande';

// GET /api/sale/sale/order - Liste tous les enregistrements
export const getSaleOrders = async (req, res) => {
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
    return handleError(res, error, 'getSaleorder');
  }
};

// GET /api/sale/sale/order/:id - Récupère un enregistrement
export const getSaleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getSaleorderById');
  }
};

// POST /api/sale/sale/order - Crée un enregistrement
export const createSaleOrder = async (req, res) => {
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
    return handleError(res, error, 'createSaleorder');
  }
};

// PUT /api/sale/sale/order/:id - Met à jour un enregistrement
export const updateSaleOrder = async (req, res) => {
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
    return handleError(res, error, 'updateSaleorder');
  }
};

// DELETE /api/sale/sale/order/:id - Supprime un enregistrement
export const deleteSaleOrder = async (req, res) => {
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
    return handleError(res, error, 'deleteSaleorder');
  }
};


// POST /api/sale/orders/:id/cancel
export const cancelSaleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE commandes_clients 
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
    return handleError(res, error, 'cancelSaleOrder');
  }
};


// POST /api/sale/orders/:id/confirm
export const confirmSaleOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE commandes_clients 
      SET statut = 'confirmee', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_commande = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Commande confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmSaleOrder');
  }
};


// GET /api/sale/orders/:id/lines
export const getSaleOrderLines = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM lignes_commande_client 
      WHERE id_commande = $1 
      ORDER BY ordre ASC
    `;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Lignes récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getSaleOrderLines');
  }
};


// POST /api/sale/orders/:id/lines
export const createSaleOrderLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    const { id_article, quantite, prix_unitaire, remise } = req.body;
    
    const query = `
      INSERT INTO lignes_commande_client 
        (id_commande, id_article, quantite, prix_unitaire, remise, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      id, id_article, quantite, prix_unitaire || 0, remise || 0, userId
    ]);
    
    return sendSuccess(res, result.rows[0], 'Ligne créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createSaleOrderLine');
  }
};


// PUT /api/sale/orders/:id/lines/:lineId
export const updateSaleOrderLine = async (req, res) => {
  try {
    const { id, lineId } = req.params;
    const userId = getUserId(req);
    const { quantite, prix_unitaire, remise } = req.body;
    
    const query = `
      UPDATE lignes_commande_client 
      SET quantite = $1, prix_unitaire = $2, remise = $3, updated_by = $4, updated_at = NOW()
      WHERE id_ligne = $5 AND id_commande = $6
      RETURNING *
    `;
    const result = await pool.query(query, [
      quantite, prix_unitaire, remise || 0, userId, lineId, id
    ]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Ligne mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateSaleOrderLine');
  }
};


// DELETE /api/sale/orders/:id/lines/:lineId
export const deleteSaleOrderLine = async (req, res) => {
  try {
    const { id, lineId } = req.params;
    const query = `
      DELETE FROM lignes_commande_client 
      WHERE id_ligne = $1 AND id_commande = $2
      RETURNING *
    `;
    const result = await pool.query(query, [lineId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne non trouvée', 404);
    }
    return sendSuccess(res, null, 'Ligne supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteSaleOrderLine');
  }
};
