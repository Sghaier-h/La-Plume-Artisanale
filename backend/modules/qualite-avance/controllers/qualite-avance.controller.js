/**
 * Contrôleur QualiteAvance - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/qualite-avance - Liste tous les enregistrements
export const getQualiteAvance = async (req, res) => {
  try {
    const query = `SELECT * FROM qualite_avance ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'QualiteAvance récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getQualiteAvance');
  }
};

// GET /api/qualite-avance/:id - Récupère un enregistrement
export const getQualiteAvanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM qualite_avance WHERE id_qualite = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'QualiteAvance non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'QualiteAvance récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getQualiteAvanceById');
  }
};

// POST /api/qualite-avance - Crée un enregistrement
// POST /api/qualite-avance - Crée un enregistrement
export const createQualiteAvance = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_qualite', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO qualite_avance (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createQualiteAvance');
  }
};

// PUT /api/qualite-avance/:id - Met à jour un enregistrement
// PUT /api/qualite-avance/:id - Met à jour un enregistrement
export const updateQualiteAvance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_qualite', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE qualite_avance SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_qualite = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateQualiteAvance');
  }
};

// DELETE /api/qualite-avance/:id - Supprime un enregistrement
// DELETE /api/qualite-avance/:id - Supprime un enregistrement
export const deleteQualiteAvance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'qualite_avance' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE qualite_avance SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_qualite = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM qualite_avance WHERE id_qualite = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM qualite_avance WHERE id_qualite = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteQualiteAvance');
  }
};
