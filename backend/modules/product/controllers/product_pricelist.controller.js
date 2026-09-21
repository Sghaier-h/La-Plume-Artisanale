/**
 * Product Pricelist Controller
 * Contrôleur pour les listes de prix
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getTableName, getIdField, mapField, mapRecord, mapValues } from '../../../src/core/TableMapping.js';
import { loadRelations } from '../../../src/core/Relations.js';

// GET /api/product/pricelists
export const getPricelists = async (req, res) => {
  try {
    const { loadRelations: loadRels, search, ...filters } = req.query;
    // Utiliser directement le nom de table car le mapping n'existe pas
    const tableName = 'listes_prix';
    const idField = 'id_liste_prix';
    
    let query = `SELECT * FROM ${tableName}`;
    const params = [];
    const conditions = [];
    
    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1} OR code ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY ${idField} DESC`;
    
    const result = await pool.query(query, params);
    // Retourner directement les résultats sans mapping
    const records = result.rows;
    
    return sendSuccess(res, records, 'Listes de prix récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getPricelists');
  }
};

// GET /api/product/pricelists/:id
export const getPricelist = async (req, res) => {
  try {
    const { id } = req.params;
    const tableName = 'listes_prix';
    const idField = 'id_liste_prix';
    
    const query = `SELECT * FROM ${tableName} WHERE ${idField} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Liste de prix non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Liste de prix récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getPricelist');
  }
};

// POST /api/product/pricelists
export const createPricelist = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    const tableName = 'listes_prix';
    
    const excludedFields = ['id_liste_prix', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    
    return sendSuccess(res, result.rows[0], 'Liste de prix créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPricelist');
  }
};

// PUT /api/product/pricelists/:id
export const updatePricelist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    const tableName = 'listes_prix';
    const idField = 'id_liste_prix';
    
    const excludedFields = [idField, 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE ${idField} = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Liste de prix non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Liste de prix mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePricelist');
  }
};

// DELETE /api/product/pricelists/:id
export const deletePricelist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const tableName = 'listes_prix';
    const idField = 'id_liste_prix';
    
    const query = `
      UPDATE ${tableName}
      SET active = false, updated_at = NOW(), updated_by = $1
      WHERE ${idField} = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Liste de prix non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Liste de prix supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePricelist');
  }
};

// GET /api/product/pricelists/:id/items
export const getPricelistItems = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM product_pricelist_items WHERE pricelist_id = $1 ORDER BY id`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Items de liste de prix récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getPricelistItems');
  }
};

// POST /api/product/pricelists/:id/items
export const createPricelistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = { ...req.body, pricelist_id: id };
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO product_pricelist_items (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Item de liste de prix créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPricelistItem');
  }
};

// PUT /api/product/pricelists/:id/items/:itemId
export const updatePricelistItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE product_pricelist_items
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id = $${values.length + 2} AND pricelist_id = $${values.length + 3}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, itemId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Item de liste de prix non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Item de liste de prix mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePricelistItem');
  }
};

// DELETE /api/product/pricelists/:id/items/:itemId
export const deletePricelistItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE product_pricelist_items
      SET active = false, updated_at = NOW(), updated_by = $1
      WHERE id = $2 AND pricelist_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, itemId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Item de liste de prix non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Item de liste de prix supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePricelistItem');
  }
};
