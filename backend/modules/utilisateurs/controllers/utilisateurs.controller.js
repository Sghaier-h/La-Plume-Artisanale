/**
 * Contrôleur Utilisateurs - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/utilisateurs - Liste tous les enregistrements
export const getUtilisateurs = async (req, res) => {
  try {
    const query = `SELECT * FROM utilisateurs ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Utilisateurs récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getUtilisateurs');
  }
};

// GET /api/utilisateurs/:id - Récupère un enregistrement
export const getUtilisateursById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM utilisateurs WHERE id_utilisateur = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Utilisateurs non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Utilisateurs récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getUtilisateursById');
  }
};

// POST /api/utilisateurs - Crée un enregistrement
// POST /api/utilisateurs - Crée un enregistrement
export const createUtilisateurs = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_utilisateur', 'date_creation', 'date_modification', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO utilisateurs (' + fields.join(', ') + ', date_creation, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createUtilisateurs');
  }
};

// PUT /api/utilisateurs/:id - Met à jour un enregistrement
// PUT /api/utilisateurs/:id - Met à jour un enregistrement
export const updateUtilisateurs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_utilisateur', 'date_creation', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE utilisateurs SET ' + setClause + ', date_modification = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_utilisateur = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateUtilisateurs');
  }
};

// DELETE /api/utilisateurs/:id - Supprime un enregistrement
// DELETE /api/utilisateurs/:id - Supprime un enregistrement
export const deleteUtilisateurs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'utilisateurs' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE utilisateurs SET active = false, date_modification = NOW(), updated_by = $1 WHERE id_utilisateur = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM utilisateurs WHERE id_utilisateur = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM utilisateurs WHERE id_utilisateur = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteUtilisateurs');
  }
};
