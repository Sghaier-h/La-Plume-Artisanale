/**
 * Contrôleur Mobile - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/mobile - Liste tous les enregistrements
export const getMobile = async (req, res) => {
  try {
    const query = `SELECT * FROM mobile ORDER BY created_at DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Mobile récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getMobile');
  }
};

// GET /api/mobile/:id - Récupère un enregistrement
export const getMobileById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM mobile WHERE id_mobile = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Mobile non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Mobile récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getMobileById');
  }
};

// POST /api/mobile - Crée un enregistrement
export const createMobile = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_mobile', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO mobile (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createMobile');
  }
};

// PUT /api/mobile/:id - Met à jour un enregistrement
export const updateMobile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_mobile', 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE mobile
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id_mobile = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateMobile');
  }
};

// DELETE /api/mobile/:id - Supprime un enregistrement
export const deleteMobile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique (champ active)
    // Si la table n'a pas de champ active, faire une suppression physique
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'mobile' AND column_name = 'active'
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        // Suppression logique
        query = `
          UPDATE mobile
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE id_mobile = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        // Suppression physique
        query = `
          DELETE FROM mobile
          WHERE id_mobile = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      // En cas d'erreur, utiliser la suppression physique
      query = `
        DELETE FROM mobile
        WHERE id_mobile = $1
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
    return handleError(res, error, 'deleteMobile');
  }
};
