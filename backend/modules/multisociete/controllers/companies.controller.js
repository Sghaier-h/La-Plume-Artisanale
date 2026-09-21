/**
 * Companies Controller
 * Contrôleur pour les sociétés
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

// GET /api/companies
export const getCompanies = async (req, res) => {
  try {
    const { loadRelations: loadRels, search, ...filters } = req.query;
    const tableName = getTableName('res.company') || 'societes';
    const idField = 'id_societe'; // Forcé pour societes
    
    let query = `SELECT * FROM ${tableName}`;
    const params = [];
    const conditions = [];
    
    if (search) {
      conditions.push(`(nom ILIKE $${params.length + 1} OR code ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY ${idField} DESC`;
    
    const result = await pool.query(query, params);
    let records = result.rows;
    
    if (loadRels === 'true') {
      // Charger les relations si nécessaire
      records = await loadRelations('res.company', records);
    }
    
    return sendSuccess(res, records, 'Sociétés récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getCompanies');
  }
};

// GET /api/companies/:id
export const getCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { loadRelations: loadRels } = req.query;
    const tableName = getTableName('res.company') || 'societes';
    const idField = 'id_societe'; // Forcé pour societes
    
    // Valider que l'ID est un nombre
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return sendError(res, 'ID invalide. Un nombre est attendu.', 400);
    }
    
    const query = `SELECT * FROM ${tableName} WHERE ${idField} = $1`;
    const result = await pool.query(query, [companyId]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Société non trouvée', 404);
    }
    
    let record = result.rows[0];
    
    if (loadRels === 'true') {
      record = (await loadRelations('res.company', [record]))[0];
    }
    
    return sendSuccess(res, record, 'Société récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getCompany');
  }
};

// POST /api/companies
export const createCompany = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const tableName = getTableName('res.company') || 'societes';
    
    // Mapper 'name' vers 'nom' pour la table societes
    const mappedData = { ...data };
    if (mappedData.name) {
      mappedData.nom = mappedData.nom || mappedData.name;
      delete mappedData.name;
    }
    
    // Supprimer description si la colonne n'existe pas dans la table
    if (mappedData.description !== undefined) {
      delete mappedData.description;
    }
    
    const fields = Object.keys(mappedData);
    const values = Object.values(mappedData);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')}, date_creation, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    
    return sendSuccess(res, result.rows[0], 'Société créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createCompany');
  }
};

// PUT /api/companies/:id
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const tableName = getTableName('res.company') || 'societes';
    const idField = 'id_societe'; // Forcé pour societes
    
    // Valider que l'ID est un nombre
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return sendError(res, 'ID invalide. Un nombre est attendu.', 400);
    }
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE ${idField} = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, companyId]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Société non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Société mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateCompany');
  }
};

// DELETE /api/companies/:id
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const tableName = getTableName('res.company') || 'societes';
    const idField = 'id_societe'; // Forcé pour societes
    
    // Valider que l'ID est un nombre
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return sendError(res, 'ID invalide. Un nombre est attendu.', 400);
    }
    
    const query = `
      UPDATE ${tableName}
      SET active = false, updated_at = NOW(), updated_by = $1
      WHERE ${idField} = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, companyId]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Société non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Société supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteCompany');
  }
};
