/**
 * Contrôleur Partners - Module base
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/partners - Liste tous les partenaires (clients/fournisseurs)
export const getPartners = async (req, res) => {
  try {
    const query = `SELECT * FROM comptes ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    return sendSuccess(res, result.rows, 'Partenaires récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getPartners');
  }
};

// GET /api/partners/:id - Récupère un partenaire
export const getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM comptes WHERE id_client = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Partenaire non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Partenaire récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getPartnerById');
  }
};

// POST /api/partners - Crée un partenaire
export const createPartner = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_client', 'date_creation', 'date_modification', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO comptes (${fields.join(', ')}, date_creation, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Partenaire créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPartner');
  }
};

// PUT /api/partners/:id - Met à jour un partenaire
export const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_client', 'date_creation', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE clients
      SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
      WHERE id_client = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Partenaire non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Partenaire mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePartner');
  }
};

// DELETE /api/partners/:id - Supprime un partenaire
export const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique (champ active ou actif)
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' AND (column_name = 'active' OR column_name = 'actif')
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        const activeField = checkResult.rows[0].column_name;
        // Suppression logique
        query = `
          UPDATE clients
          SET ${activeField} = false, date_modification = NOW(), updated_by = $1
          WHERE id_client = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        // Suppression physique
        query = `
          DELETE FROM comptes
          WHERE id_client = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      // En cas d'erreur, utiliser la suppression physique
      query = `
        DELETE FROM comptes
        WHERE id_client = $1
        RETURNING *
      `;
      params = [id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Partenaire non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Partenaire supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePartner');
  }
};
