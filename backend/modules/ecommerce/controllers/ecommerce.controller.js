/**
 * Contrôleur Ecommerce - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/ecommerce - Liste tous les enregistrements
export const getEcommerce = async (req, res) => {
  try {
    const query = `SELECT * FROM ecommerce ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Ecommerce récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerce');
  }
};

// GET /api/ecommerce/:id - Récupère un enregistrement
export const getEcommerceById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ecommerce WHERE id_ecommerce = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ecommerce non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Ecommerce récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerceById');
  }
};

// POST /api/ecommerce - Crée un enregistrement
// POST /api/ecommerce - Crée un enregistrement
export const createEcommerce = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_ecommerce', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO ecommerce (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createEcommerce');
  }
};

// PUT /api/ecommerce/:id - Met à jour un enregistrement
// PUT /api/ecommerce/:id - Met à jour un enregistrement
export const updateEcommerce = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_ecommerce', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE ecommerce SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_ecommerce = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateEcommerce');
  }
};

// DELETE /api/ecommerce/:id - Supprime un enregistrement
// DELETE /api/ecommerce/:id - Supprime un enregistrement
export const deleteEcommerce = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'ecommerce' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE ecommerce SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_ecommerce = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM ecommerce WHERE id_ecommerce = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM ecommerce WHERE id_ecommerce = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteEcommerce');
  }
};
