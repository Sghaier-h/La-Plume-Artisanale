/**
 * Contrôleur StockMultiEntrepots - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/stock-multi-entrepots - Liste tous les enregistrements
export const getStockMultiEntrepots = async (req, res) => {
  try {
    const query = `SELECT * FROM stock_multi_entrepots ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'StockMultiEntrepots récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getStockMultiEntrepots');
  }
};

// GET /api/stock-multi-entrepots/:id - Récupère un enregistrement
export const getStockMultiEntrepotsById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM stock_multi_entrepots WHERE id_stock = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'StockMultiEntrepots non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'StockMultiEntrepots récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getStockMultiEntrepotsById');
  }
};

// POST /api/stock-multi-entrepots - Crée un enregistrement
// POST /api/stock-multi-entrepots - Crée un enregistrement
export const createStockMultiEntrepots = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_stock', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO stock_multi_entrepots (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createStockMultiEntrepots');
  }
};

// PUT /api/stock-multi-entrepots/:id - Met à jour un enregistrement
// PUT /api/stock-multi-entrepots/:id - Met à jour un enregistrement
export const updateStockMultiEntrepots = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_stock', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE stock_multi_entrepots SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_stock = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateStockMultiEntrepots');
  }
};

// DELETE /api/stock-multi-entrepots/:id - Supprime un enregistrement
// DELETE /api/stock-multi-entrepots/:id - Supprime un enregistrement
export const deleteStockMultiEntrepots = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'stock_multi_entrepots' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE stock_multi_entrepots SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_stock = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM stock_multi_entrepots WHERE id_stock = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM stock_multi_entrepots WHERE id_stock = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteStockMultiEntrepots');
  }
};
