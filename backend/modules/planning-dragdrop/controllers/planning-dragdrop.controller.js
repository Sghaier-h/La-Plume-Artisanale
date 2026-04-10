/**
 * Contrôleur PlanningDragdrop - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/planning-dragdrop - Liste tous les enregistrements
export const getPlanningDragdrop = async (req, res) => {
  try {
    const query = `SELECT * FROM planning_dragdrop ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'PlanningDragdrop récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getPlanningDragdrop');
  }
};

// GET /api/planning-dragdrop/:id - Récupère un enregistrement
export const getPlanningDragdropById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM planning_dragdrop WHERE id_planning = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'PlanningDragdrop non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'PlanningDragdrop récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getPlanningDragdropById');
  }
};

// POST /api/planning-dragdrop - Crée un enregistrement
// POST /api/planning-dragdrop - Crée un enregistrement
export const createPlanningDragdrop = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_planning', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO planning_dragdrop (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPlanningDragdrop');
  }
};

// PUT /api/planning-dragdrop/:id - Met à jour un enregistrement
// PUT /api/planning-dragdrop/:id - Met à jour un enregistrement
export const updatePlanningDragdrop = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_planning', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE planning_dragdrop SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_planning = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePlanningDragdrop');
  }
};

// DELETE /api/planning-dragdrop/:id - Supprime un enregistrement
// DELETE /api/planning-dragdrop/:id - Supprime un enregistrement
export const deletePlanningDragdrop = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'planning_dragdrop' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE planning_dragdrop SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_planning = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM planning_dragdrop WHERE id_planning = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM planning_dragdrop WHERE id_planning = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePlanningDragdrop');
  }
};
