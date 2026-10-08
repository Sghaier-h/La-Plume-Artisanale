/**
 * Contrôleur Users - Module base
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/users - Liste tous les utilisateurs
export const getUsers = async (req, res) => {
  try {
    const query = `SELECT * FROM users ORDER BY date_creation DESC`;
    const result = await pool.query(query);
    // Ne pas retourner les mots de passe
    const users = result.rows.map(user => {
      const { mot_de_passe_hash, salt, password, ...safeUser } = user;
      return safeUser;
    });
    return sendSuccess(res, users, 'Utilisateurs récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getUsers');
  }
};

// GET /api/users/:id - Récupère un utilisateur
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM users WHERE id_utilisateur = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }
    
    // Ne pas retourner le mot de passe
    const user = result.rows[0];
    delete user.password;
    delete user.mot_de_passe;
    
    return sendSuccess(res, user, 'Utilisateur récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getUserById');
  }
};

// POST /api/users - Crée un utilisateur
export const createUser = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_utilisateur', 'date_creation', 'date_modification', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO users (${fields.join(', ')}, date_creation, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    
    // Ne pas retourner le mot de passe
    const user = result.rows[0];
    delete user.password;
    delete user.mot_de_passe;
    
    return sendSuccess(res, user, 'Utilisateur créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createUser');
  }
};

// PUT /api/users/:id - Met à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Filtrer les champs non autorisés
    const excludedFields = ['id_utilisateur', 'date_creation', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE utilisateurs
      SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
      WHERE id_utilisateur = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }
    
    // Ne pas retourner le mot de passe
    const user = result.rows[0];
    delete user.password;
    delete user.mot_de_passe;
    
    return sendSuccess(res, user, 'Utilisateur mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateUser');
  }
};

// DELETE /api/users/:id - Supprime un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique (champ active ou actif)
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'utilisateurs' AND (column_name = 'active' OR column_name = 'actif')
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
          UPDATE utilisateurs
          SET ${activeField} = false, date_modification = NOW(), updated_by = $1
          WHERE id_utilisateur = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        // Suppression physique
        query = `
          DELETE FROM users
          WHERE id_utilisateur = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      // En cas d'erreur, utiliser la suppression physique
      query = `
        DELETE FROM users
        WHERE id_utilisateur = $1
        RETURNING *
      `;
      params = [id];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Utilisateur non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Utilisateur supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteUser');
  }
};
