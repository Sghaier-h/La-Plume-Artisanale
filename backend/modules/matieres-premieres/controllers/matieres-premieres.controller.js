/**
 * Contrôleur MatieresPremieres - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/matieres-premieres - Liste tous les enregistrements
export const getMatieresPremieres = async (req, res) => {
  try {
    const query = `SELECT * FROM matieres_premieres ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'MatieresPremieres récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getMatieresPremieres');
  }
};

// GET /api/matieres-premieres/:id - Récupère un enregistrement
export const getMatieresPremieresById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM matieres_premieres WHERE id_mp = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'MatieresPremieres non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'MatieresPremieres récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getMatieresPremieresById');
  }
};

// POST /api/matieres-premieres - Crée un enregistrement
// POST /api/matieres-premieres - Crée un enregistrement
export const createMatieresPremieres = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_mp', 'date_creation', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO matieres_premieres (' + fields.join(', ') + ', date_creation, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createMatieresPremieres');
  }
};

// PUT /api/matieres-premieres/:id - Met à jour un enregistrement
// PUT /api/matieres-premieres/:id - Met à jour un enregistrement
export const updateMatieresPremieres = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_mp', 'date_creation', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE matieres_premieres SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_mp = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateMatieresPremieres');
  }
};

// DELETE /api/matieres-premieres/:id - Supprime un enregistrement
// DELETE /api/matieres-premieres/:id - Supprime un enregistrement
export const deleteMatieresPremieres = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'matieres_premieres' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE matieres_premieres SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_mp = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM matieres_premieres WHERE id_mp = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM matieres_premieres WHERE id_mp = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteMatieresPremieres');
  }
};
