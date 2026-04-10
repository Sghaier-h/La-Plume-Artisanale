/**
 * Contrôleur BonsLivraison - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/bons-livraison - Liste tous les enregistrements
export const getBonsLivraison = async (req, res) => {
  try {
    const query = `SELECT * FROM bons_livraison ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'BonsLivraison récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getBonsLivraison');
  }
};

// GET /api/bons-livraison/:id - Récupère un enregistrement
export const getBonsLivraisonById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM bons_livraison WHERE id_bl = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'BonsLivraison non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'BonsLivraison récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getBonsLivraisonById');
  }
};

// POST /api/bons-livraison - Crée un enregistrement
// POST /api/bons-livraison - Crée un enregistrement
export const createBonsLivraison = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_bl', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO bons_livraison (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createBonsLivraison');
  }
};

// PUT /api/bons-livraison/:id - Met à jour un enregistrement
// PUT /api/bons-livraison/:id - Met à jour un enregistrement
export const updateBonsLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_bl', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE bons_livraison SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_bl = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateBonsLivraison');
  }
};

// DELETE /api/bons-livraison/:id - Supprime un enregistrement
// DELETE /api/bons-livraison/:id - Supprime un enregistrement
export const deleteBonsLivraison = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'bons_livraison' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE bons_livraison SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_bl = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM bons_livraison WHERE id_bl = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM bons_livraison WHERE id_bl = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteBonsLivraison');
  }
};
