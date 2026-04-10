/**
 * POS Session Controller
 * Contrôleur pour les sessions POS
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// POST /api/pos/sessions/ouvrir
export const openSession = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const { id_caisse, montant_ouverture } = req.body;
    
    // Vérifier qu'il n'y a pas de session ouverte
    const checkQuery = `
      SELECT * FROM sessions_caisse 
      WHERE id_caisse = $1 AND statut = 'ouverte'
    `;
    const checkResult = await pool.query(checkQuery, [id_caisse]);
    
    if (checkResult.rows.length > 0) {
      return sendError(res, 'Une session est déjà ouverte pour cette caisse', 400);
    }
    
    const query = `
      INSERT INTO sessions_caisse (
        id_caisse, date_ouverture, statut, created_by
      )
      VALUES ($1, NOW(), 'ouverte', $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [id_caisse, userId]);
    return sendSuccess(res, result.rows[0], 'Session ouverte avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'openSession');
  }
};

// POST /api/pos/sessions/:id/fermer
export const closeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const { montant_fermeture } = req.body;
    
    // Calculer le total des ventes
    const salesQuery = `
      SELECT COALESCE(SUM(montant_total), 0) as total_ventes
      FROM ventes_caisse
      WHERE id_session = $1
    `;
    const salesResult = await pool.query(salesQuery, [id]);
    const totalVentes = parseFloat(salesResult.rows[0].total_ventes || 0);
    
    const query = `
      UPDATE sessions_caisse
      SET 
        statut = 'fermee',
        date_fermeture = NOW(),
        updated_by = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      userId,
      id
    ]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Session non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Session fermée avec succès');
  } catch (error) {
    return handleError(res, error, 'closeSession');
  }
};

// GET /api/pos/sessions
export const getSessions = async (req, res) => {
  try {
    const { id_caisse, statut } = req.query;
    let query = `SELECT * FROM sessions_caisse WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    
    if (id_caisse) {
      query += ` AND id_caisse = $${paramIndex}`;
      params.push(id_caisse);
      paramIndex++;
    }
    
    if (statut) {
      query += ` AND statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }
    
    query += ` ORDER BY date_ouverture DESC`;
    
    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows, 'Sessions récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getSessions');
  }
};

// GET /api/pos/sessions/:id
export const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM sessions_caisse WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Session non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Session récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getSession');
  }
};
