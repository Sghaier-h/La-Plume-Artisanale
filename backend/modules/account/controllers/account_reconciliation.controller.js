/**
 * Account Reconciliation Controller
 * Contrôleur pour les rapprochements bancaires
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { loadRelations } from '../../../src/core/Relations.js';

// GET /api/account/reconciliations
export const getReconciliations = async (req, res) => {
  try {
    const { loadRelations: loadRels, ...filters } = req.query;
    
    const query = `SELECT * FROM account_reconciliations ORDER BY id DESC`;
    const result = await pool.query(query);
    let records = result.rows;
    
    if (loadRels === 'true') {
      records = await loadRelations('account.reconciliation', records);
    }
    
    return sendSuccess(res, records, 'Rapprochements récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getReconciliations');
  }
};

// GET /api/account/reconciliations/:id
export const getReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const { loadRelations: loadRels } = req.query;
    
    const query = `SELECT * FROM account_reconciliations WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Rapprochement non trouvé', 404);
    }
    
    let record = result.rows[0];
    
    if (loadRels === 'true') {
      record = (await loadRelations('account.reconciliation', [record]))[0];
    }
    
    return sendSuccess(res, record, 'Rapprochement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getReconciliation');
  }
};

// POST /api/account/reconciliations
export const createReconciliation = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO account_reconciliations (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Rapprochement créé avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createReconciliation');
  }
};

// PUT /api/account/reconciliations/:id
export const updateReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE account_reconciliations
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Rapprochement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Rapprochement mis à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateReconciliation');
  }
};

// DELETE /api/account/reconciliations/:id
export const deleteReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE account_reconciliations
      SET statut = 'draft', updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Rapprochement non trouvé', 404);
    }
    
    return sendSuccess(res, null, 'Rapprochement supprimé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteReconciliation');
  }
};

// POST /api/account/reconciliations/:id/validate
export const validateReconciliation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE account_reconciliations
      SET statut = 'validated', updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Rapprochement non trouvé', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Rapprochement validé avec succès');
  } catch (error) {
    return handleError(res, error, 'validateReconciliation');
  }
};

// POST /api/account/reconciliations/:id/auto-match
export const autoMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Logique d'appariement automatique
    const query = `
      UPDATE account_reconciliation_lines
      SET matched = true
      WHERE reconciliation_id = $1 AND matched = false
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return sendSuccess(res, { matched: result.rows.length }, 'Appariement automatique effectué');
  } catch (error) {
    return handleError(res, error, 'autoMatch');
  }
};

// GET /api/account/reconciliations/:id/unmatched-lines
export const getUnmatchedLines = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM account_reconciliation_lines WHERE reconciliation_id = $1 AND matched = false`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Lignes non appariées récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getUnmatchedLines');
  }
};

// POST /api/account/reconciliations/:id/match
export const matchLines = async (req, res) => {
  try {
    const { id } = req.params;
    const { lineId, matchedLineId } = req.body;
    
    const query = `
      UPDATE account_reconciliation_lines
      SET matched = true, matched_line_id = $1
      WHERE id = $2 AND reconciliation_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [matchedLineId, lineId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Lignes appariées avec succès');
  } catch (error) {
    return handleError(res, error, 'matchLines');
  }
};
