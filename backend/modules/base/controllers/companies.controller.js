/**
 * Contrôleur Companies - Module base
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/companies - Liste toutes les sociétés
export const getCompanies = async (req, res) => {
  try {
    const query = `SELECT * FROM societes ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Sociétés récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getCompanies');
  }
};

// GET /api/companies/:id - Récupère une société
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM societes WHERE id_societe = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Société non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Société récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getCompanyById');
  }
};

// POST /api/companies - Crée une société
export const createCompany = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_societe', 'date_creation', 'date_modification', 'cree_par', 'modifie_par'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO societes (${fields.join(', ')}, date_creation, cree_par)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Société créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createCompany');
  }
};

// PUT /api/companies/:id - Met à jour une société
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_societe', 'date_creation', 'cree_par'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE societes
      SET ${setClause}, date_modification = NOW(), modifie_par = $${values.length + 1}
      WHERE id_societe = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Société non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Société mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateCompany');
  }
};

// DELETE /api/companies/:id - Supprime une société
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique (champ actif)
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'societes' AND (column_name = 'active' OR column_name = 'actif')
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        // Suppression logique
        query = `
          UPDATE societes
          SET actif = false, date_modification = NOW(), modifie_par = $1
          WHERE id_societe = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        // Suppression physique
        query = `
          DELETE FROM societes
          WHERE id_societe = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      // En cas d'erreur, utiliser la suppression physique
      query = `
        DELETE FROM societes
        WHERE id_societe = $1
        RETURNING *
      `;
      params = [id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Société non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Société supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteCompany');
  }
};
