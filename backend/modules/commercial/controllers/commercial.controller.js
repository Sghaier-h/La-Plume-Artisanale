/**
 * Contrôleur Commercial - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/commercial - Liste tous les enregistrements
export const getCommercial = async (req, res) => {
  try {
    const query = `SELECT * FROM commercial ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Commercial récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getCommercial');
  }
};

// GET /api/commercial/:id - Récupère un enregistrement
export const getCommercialById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM commercial WHERE id_commercial = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commercial non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Commercial récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getCommercialById');
  }
};

// POST /api/commercial - Crée un enregistrement
export const createCommercial = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data).filter(f => f !== 'id_commercial');
    const values = Object.values(data).filter((_, i) => Object.keys(data)[i] !== 'id_commercial');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO commercial (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Commercial créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createCommercial');
  }
};

// PUT /api/commercial/:id - Met à jour un enregistrement
export const updateCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data).filter(f => f !== 'id_commercial');
    const values = Object.values(data).filter((_, i) => Object.keys(data)[i] !== 'id_commercial');
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const query = `
      UPDATE commercial
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id_commercial = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commercial non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Commercial mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateCommercial');
  }
};

// DELETE /api/commercial/:id - Supprime un enregistrement
export const deleteCommercial = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE commercial
      SET active = false, updated_at = NOW(), updated_by = $1
      WHERE id_commercial = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commercial non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Commercial supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteCommercial');
  }
};
