/**
 * Contrôleur Documents - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/documents - Liste tous les enregistrements
export const getDocuments = async (req, res) => {
  try {
    const query = `SELECT * FROM documents ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Documents récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getDocuments');
  }
};

// GET /api/documents/:id - Récupère un enregistrement
export const getDocumentsById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM documents WHERE id_documents = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Documents non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Documents récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getDocumentsById');
  }
};

// POST /api/documents - Crée un enregistrement
// POST /api/documents - Crée un enregistrement
export const createDocuments = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_documents', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO documents (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createDocuments');
  }
};

// PUT /api/documents/:id - Met à jour un enregistrement
// PUT /api/documents/:id - Met à jour un enregistrement
export const updateDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_documents', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE documents SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_documents = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateDocuments');
  }
};

// DELETE /api/documents/:id - Supprime un enregistrement
// DELETE /api/documents/:id - Supprime un enregistrement
export const deleteDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'documents' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE documents SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_documents = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM documents WHERE id_documents = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM documents WHERE id_documents = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteDocuments');
  }
};
