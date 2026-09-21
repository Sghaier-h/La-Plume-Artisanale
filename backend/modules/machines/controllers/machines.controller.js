/**
 * Contrôleur Machines - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/machines - Liste tous les enregistrements
export const getMachines = async (req, res) => {
  try {
    const query = `SELECT * FROM machines ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Machines récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getMachines');
  }
};

// GET /api/machines/:id - Récupère un enregistrement
export const getMachinesById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM machines WHERE id_machine = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Machines non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Machines récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getMachinesById');
  }
};

// POST /api/machines - Crée un enregistrement
// POST /api/machines - Crée un enregistrement
export const createMachines = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_machine', 'date_creation', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO machines (' + fields.join(', ') + ', date_creation, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createMachines');
  }
};

// PUT /api/machines/:id - Met à jour un enregistrement
// PUT /api/machines/:id - Met à jour un enregistrement
export const updateMachines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_machine', 'date_creation', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE machines SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_machine = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateMachines');
  }
};

// DELETE /api/machines/:id - Supprime un enregistrement
// DELETE /api/machines/:id - Supprime un enregistrement
export const deleteMachines = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE machines SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_machine = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM machines WHERE id_machine = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM machines WHERE id_machine = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteMachines');
  }
};
