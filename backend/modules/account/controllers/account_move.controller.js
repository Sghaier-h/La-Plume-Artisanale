/**
 * AccountMove Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';

const TABLE_NAME = 'factures';
const ID_FIELD = 'id_facture';

export const getAccountMoves = async (req, res) => {
  try {
    const { page, limit, search, state, move_type, partner_id } = req.query;
    const { offset, pageSize } = getPaginationParams(page, limit);

    let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (numero_facture ILIKE $${paramIndex} OR reference ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (state) {
      query += ` AND statut = $${paramIndex}`;
      params.push(state);
      paramIndex++;
    }
    if (move_type) {
      query += ` AND type_facture = $${paramIndex}`;
      params.push(move_type);
      paramIndex++;
    }
    if (partner_id) {
      query += ` AND id_client = $${paramIndex}`;
      params.push(partner_id);
      paramIndex++;
    }

    query += ` ORDER BY date_facture DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM ${TABLE_NAME} WHERE 1=1`, []);
    const total = parseInt(totalResult.rows[0].total);

    return sendSuccess(res, {
      data: result.rows,
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    return handleError(res, error, 'getAccountMoves');
  }
};

export const getAccountMove = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Account move not found', 404);
    }

    return sendSuccess(res, { data: result.rows[0] });
  } catch (error) {
    return handleError(res, error, 'getAccountMove');
  }
};

export const postAccountMove = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Mettre à jour le statut à "posted"
    const query = `
      UPDATE ${TABLE_NAME}
      SET statut = 'posted', updated_at = NOW(), updated_by = $1
      WHERE ${ID_FIELD} = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Account move not found', 404);
    }

    return sendSuccess(res, { data: result.rows[0] });
  } catch (error) {
    return handleError(res, error.message, 500);
  }
};

export const draftAccountMove = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    // Mettre à jour le statut à "draft"
    const query = `
      UPDATE ${TABLE_NAME}
      SET statut = 'draft', updated_at = NOW(), updated_by = $1
      WHERE ${ID_FIELD} = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Account move not found', 404);
    }

    return sendSuccess(res, { data: result.rows[0] });
  } catch (error) {
    return handleError(res, error.message, 500);
  }
};

/**
 * GET /api/account/moves/:id/lines - Obtient les lignes d'une facture
 */
export const getAccountMoveLines = async (req, res) => {
  try {
    const lineTable = 'lignes_facture';
    const moveIdField = 'id_facture';
    
    const query = `
      SELECT 
        l.*,
        a.nom_article as product_name,
        a.reference as product_code
      FROM ${lineTable} l
      LEFT JOIN articles a ON l.id_article = a.id_article
      WHERE l.${moveIdField} = $1
      ORDER BY l.id_ligne_facture ASC
    `;
    
    const result = await pool.query(query, [req.params.id]);
    
    return sendSuccess(res, { data: result.rows });
  } catch (error) {
    return handleError(res, error.message, 500);
  }
};

export default {
  getAccountMoves,
  getAccountMove,
  postAccountMove,
  draftAccountMove,
  getAccountMoveLines
};
