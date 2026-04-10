/**
 * Contrôleur Settings - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/settings - Liste tous les enregistrements
export const getSettings = async (req, res) => {
  try {
    const query = `SELECT * FROM settings ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Settings récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getSettings');
  }
};

// GET /api/settings/:id - Récupère un enregistrement
export const getSettingsById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM settings WHERE id_settings = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Settings non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Settings récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getSettingsById');
  }
};

// POST /api/settings - Crée un enregistrement
export const createSettings = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_settings', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO settings (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createSettings');
  }
};

// PUT /api/settings/:id - Met à jour un enregistrement
export const updateSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_settings', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE settings
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id_settings = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateSettings');
  }
};

// DELETE /api/settings/:id - Supprime un enregistrement
export const deleteSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique (champ active)
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND column_name = 'active'
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = `
          UPDATE settings
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE id_settings = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        query = `
          DELETE FROM settings
          WHERE id_settings = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      query = `
        DELETE FROM settings
        WHERE id_settings = $1
        RETURNING *
      `;
      params = [id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Enregistrement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteSettings');
  }
};
