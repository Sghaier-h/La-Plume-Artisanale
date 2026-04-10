/**
 * Contrôleur Produits - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/produits - Liste tous les enregistrements
export const getProduits = async (req, res) => {
  try {
    const query = `SELECT * FROM produits ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Produits récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getProduits');
  }
};

// GET /api/produits/:id - Récupère un enregistrement
export const getProduitsById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM produits WHERE id_produits = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Produits non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Produits récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getProduitsById');
  }
};

// POST /api/produits - Crée un enregistrement
// POST /api/produits - Crée un enregistrement
export const createProduits = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_produits', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à créer', 400);
    const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
    const query = 'INSERT INTO produits (' + fields.join(', ') + ', created_at, created_by) VALUES (' + placeholders + ', NOW(), $' + (values.length + 1) + ') RETURNING *';
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createProduits');
  }
};

// PUT /api/produits/:id - Met à jour un enregistrement
// PUT /api/produits/:id - Met à jour un enregistrement
export const updateProduits = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const excludedFields = ['id_produits', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    if (fields.length === 0) return sendError(res, 'Aucune donnée à mettre à jour', 400);
    const setClause = fields.map((field, i) => field + ' = $' + (i + 1)).join(', ');
    const query = 'UPDATE produits SET ' + setClause + ', updated_at = NOW(), updated_by = $' + (values.length + 1) + ' WHERE id_produits = $' + (values.length + 2) + ' RETURNING *';
    const result = await pool.query(query, [...values, userId, id]);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateProduits');
  }
};

// DELETE /api/produits/:id - Supprime un enregistrement
// DELETE /api/produits/:id - Supprime un enregistrement
export const deleteProduits = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const checkActiveQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'produits' AND column_name = 'active'";
    let query, params;
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      if (hasActiveField) {
        query = 'UPDATE produits SET active = false, updated_at = NOW(), updated_by = $1 WHERE id_produits = $2 RETURNING *';
        params = [userId, id];
      } else {
        query = 'DELETE FROM produits WHERE id_produits = $1 RETURNING *';
        params = [id];
      }
    } catch (checkError) {
      query = 'DELETE FROM produits WHERE id_produits = $1 RETURNING *';
      params = [id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return sendError(res, 'Enregistrement non trouvé', 404);
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteProduits');
  }
};
