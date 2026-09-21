/**
 * Mrpproduction Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';

const TABLE_NAME = 'ordres_fabrication';
const ID_FIELD = 'id_of';

// GET /api/mrp/mrp/production - Liste tous les enregistrements
export const getMrpProductions = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const { offset, pageSize } = getPaginationParams(page, limit);

    let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchConditions = ["numero_of"].map(field => 
        `${field} ILIKE $${paramIndex}`
      ).join(' OR ');
      query += ` AND (${searchConditions})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY ${ID_FIELD} DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM ${TABLE_NAME}`, []);
    const total = parseInt(totalResult.rows[0].total);

    return sendSuccess(res, {
      data: result.rows,
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    return handleError(res, error, 'getMrpproduction');
  }
};

// GET /api/mrp/mrp/production/:id - Récupère un enregistrement
export const getMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getMrpproductionById');
  }
};

// POST /api/mrp/mrp/production - Crée un enregistrement
export const createMrpProduction = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const excludedFields = [ID_FIELD, 'created_at', 'updated_at', 'created_by', 'updated_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à créer', 400);
    }
    
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO ${TABLE_NAME} (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Enregistrement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createMrpproduction');
  }
};

// PUT /api/mrp/mrp/production/:id - Met à jour un enregistrement
export const updateMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const excludedFields = [ID_FIELD, 'created_at', 'created_by'];
    const allowedFields = Object.keys(data).filter(f => !excludedFields.includes(f));
    const fields = allowedFields;
    const values = fields.map(f => data[f]);
    
    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    const query = `
      UPDATE ${TABLE_NAME}
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE ${ID_FIELD} = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Enregistrement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateMrpproduction');
  }
};

// DELETE /api/mrp/mrp/production/:id - Supprime un enregistrement
export const deleteMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Essayer d'abord la suppression logique
    const checkActiveQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${TABLE_NAME}' AND column_name = 'active'
    `;
    
    let query;
    let params;
    
    try {
      const checkResult = await pool.query(checkActiveQuery);
      const hasActiveField = checkResult.rows.length > 0;
      
      if (hasActiveField) {
        query = `
          UPDATE ${TABLE_NAME}
          SET active = false, updated_at = NOW(), updated_by = $1
          WHERE ${ID_FIELD} = $2
          RETURNING *
        `;
        params = [userId, id];
      } else {
        query = `
          DELETE FROM ${TABLE_NAME}
          WHERE ${ID_FIELD} = $1
          RETURNING *
        `;
        params = [id];
      }
    } catch (checkError) {
      query = `
        DELETE FROM ${TABLE_NAME}
        WHERE ${ID_FIELD} = $1
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
    return handleError(res, error, 'deleteMrpproduction');
  }
};


// POST /api/mrp/productions/:id/confirm
export const confirmMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE ordres_fabrication 
      SET statut = 'confirme', date_confirmation = NOW(), updated_at = NOW() 
      WHERE id_of = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Production non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Production confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmMrpProduction');
  }
};


// POST /api/mrp/productions/:id/done
export const doneMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE ordres_fabrication 
      SET statut = 'termine', date_fin = NOW(), updated_at = NOW() 
      WHERE id_of = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Production non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Production terminée avec succès');
  } catch (error) {
    return handleError(res, error, 'doneMrpProduction');
  }
};


// POST /api/mrp/productions/:id/start
export const startMrpProduction = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      UPDATE ordres_fabrication 
      SET statut = 'en_cours', date_debut = NOW(), updated_at = NOW() 
      WHERE id_of = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendError(res, 'Production non trouvée', 404);
    }
    return sendSuccess(res, result.rows[0], 'Production démarrée avec succès');
  } catch (error) {
    return handleError(res, error, 'startMrpProduction');
  }
};


// GET /api/mrp/productions/:id/moves
export const getProductionMoves = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM mouvements_stock 
      WHERE id_of = $1 
      ORDER BY date_mouvement DESC
    `;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Mouvements récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getProductionMoves');
  }
};
