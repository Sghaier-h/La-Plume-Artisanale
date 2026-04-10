/**
 * Contrôleur SuiviFabrication - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/suivi-fabrication - Liste tous les enregistrements
export const getSuiviFabrication = async (req, res) => {
  try {
    const query = `SELECT * FROM suivi_fabrication ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'SuiviFabrication récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getSuiviFabrication');
  }
};

// GET /api/suivi-fabrication/:id - Récupère un enregistrement
export const getSuiviFabricationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM suivi_fabrication WHERE id_suivi = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'SuiviFabrication non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'SuiviFabrication récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getSuiviFabricationById');
  }
};

// POST /api/suivi-fabrication - Crée un enregistrement
// POST /api/suivi-fabrication - Crée un enregistrement
export const createSuiviFabrication = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_suivi', 'date_creation', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO suivi_fabrication (' + fields.join(', ') + ', date_creation, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createSuiviFabrication');
  }
};

// PUT /api/suivi-fabrication/:id - Met à jour un enregistrement
// PUT /api/suivi-fabrication/:id - Met à jour un enregistrement
export const updateSuiviFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_suivi', 'date_creation', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE suivi_fabrication SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_suivi = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateSuiviFabrication');
  }
};

// DELETE /api/suivi-fabrication/:id - Supprime un enregistrement
// DELETE /api/suivi-fabrication/:id - Supprime un enregistrement
export const deleteSuiviFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'suivi_fabrication' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE suivi_fabrication SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_suivi = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM suivi_fabrication WHERE id_suivi = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM suivi_fabrication WHERE id_suivi = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteSuiviFabrication');
  }
};
