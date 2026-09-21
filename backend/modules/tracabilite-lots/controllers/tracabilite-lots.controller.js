/**
 * Contrôleur TracabiliteLots - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/tracabilite-lots - Liste tous les enregistrements
export const getTracabiliteLots = async (req, res) => {
  try {
    const query = `SELECT * FROM tracabilite_lots ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'TracabiliteLots récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getTracabiliteLots');
  }
};

// GET /api/tracabilite-lots/:id - Récupère un enregistrement
export const getTracabiliteLotsById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM tracabilite_lots WHERE id_tracabilite = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'TracabiliteLots non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'TracabiliteLots récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getTracabiliteLotsById');
  }
};

// POST /api/tracabilite-lots - Crée un enregistrement
// POST /api/tracabilite-lots - Crée un enregistrement
export const createTracabiliteLots = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_tracabilite', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO tracabilite_lots (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createTracabiliteLots');
  }
};

// PUT /api/tracabilite-lots/:id - Met à jour un enregistrement
// PUT /api/tracabilite-lots/:id - Met à jour un enregistrement
export const updateTracabiliteLots = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_tracabilite', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE tracabilite_lots SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_tracabilite = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateTracabiliteLots');
  }
};

// DELETE /api/tracabilite-lots/:id - Supprime un enregistrement
// DELETE /api/tracabilite-lots/:id - Supprime un enregistrement
export const deleteTracabiliteLots = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'tracabilite_lots' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE tracabilite_lots SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_tracabilite = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM tracabilite_lots WHERE id_tracabilite = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM tracabilite_lots WHERE id_tracabilite = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteTracabiliteLots');
  }
};
