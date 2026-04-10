/**
 * Contrôleur SelecteursMachines - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/selecteurs-machines - Liste tous les enregistrements
export const getSelecteursMachines = async (req, res) => {
  try {
    const query = `SELECT * FROM selecteurs_machines ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'SelecteursMachines récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getSelecteursMachines');
  }
};

// GET /api/selecteurs-machines/:id - Récupère un enregistrement
export const getSelecteursMachinesById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM selecteurs_machines WHERE id_selecteurs = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'SelecteursMachines non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'SelecteursMachines récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getSelecteursMachinesById');
  }
};

// POST /api/selecteurs-machines - Crée un enregistrement
// POST /api/selecteurs-machines - Crée un enregistrement
export const createSelecteursMachines = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_selecteurs', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO selecteurs_machines (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createSelecteursMachines');
  }
};

// PUT /api/selecteurs-machines/:id - Met à jour un enregistrement
// PUT /api/selecteurs-machines/:id - Met à jour un enregistrement
export const updateSelecteursMachines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_selecteurs', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE selecteurs_machines SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_selecteurs = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateSelecteursMachines');
  }
};

// DELETE /api/selecteurs-machines/:id - Supprime un enregistrement
// DELETE /api/selecteurs-machines/:id - Supprime un enregistrement
export const deleteSelecteursMachines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'selecteurs_machines' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE selecteurs_machines SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_selecteurs = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM selecteurs_machines WHERE id_selecteurs = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM selecteurs_machines WHERE id_selecteurs = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteSelecteursMachines');
  }
};
