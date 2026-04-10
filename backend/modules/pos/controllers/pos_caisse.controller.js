/**
 * POS Caisse Controller
 * Contrôleur pour les caisses POS
 */

import { pool } from '../../../src/utils/db.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/pos/caisses
export const getCaisses = async (req, res) => {
  try {
    const { active } = req.query;
    let query = `SELECT * FROM caisses`;
    const params = [];
    
    if (active === 'true') {
      query += ' WHERE active = $1';
      params.push(true);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows, 'Caisses récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getCaisses');
  }
};

// GET /api/pos/caisses/:id
export const getCaisse = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM caisses WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Caisse non trouvée', 404);
    }
    
    // Charger la session active si elle existe
    const sessionQuery = `
      SELECT * FROM sessions_caisse 
      WHERE id = $1 AND statut = 'ouverte'
      ORDER BY date_ouverture DESC
      LIMIT 1
    `;
    const sessionResult = await pool.query(sessionQuery, [id]);
    
    const caisse = result.rows[0];
    if (sessionResult.rows.length > 0) {
      caisse.session_active = sessionResult.rows[0];
    }
    
    return sendSuccess(res, caisse, 'Caisse récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getCaisse');
  }
};

// GET /api/pos/caisses/:id/session (alias pour getCaisse)
export const getCaisseSession = async (req, res) => {
  return getCaisse(req, res);
};
