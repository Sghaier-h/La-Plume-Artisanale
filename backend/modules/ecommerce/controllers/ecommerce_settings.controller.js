/**
 * Ecommerce Settings Controller
 * Contrôleur pour les paramètres e-commerce
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/ecommerce/settings
export const getEcommerceSettings = async (req, res) => {
  try {
    const query = `SELECT * FROM ecommerce_settings LIMIT 1`;
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      // Retourner des paramètres par défaut
      return sendSuccess(res, {
        site_name: 'La Plume Artisanale',
        site_url: '',
        site_logo: '',
        site_active: false,
        payment_cash: false,
        payment_card: false,
        payment_online: false,
        delivery_cost: 0,
        free_delivery_threshold: 0
      }, 'Paramètres récupérés avec succès');
    }
    
    return sendSuccess(res, result.rows[0], 'Paramètres récupérés avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerceSettings');
  }
};

// PUT /api/ecommerce/settings
export const updateEcommerceSettings = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    // Vérifier si les paramètres existent
    const checkQuery = `SELECT * FROM ecommerce_settings LIMIT 1`;
    const checkResult = await pool.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      // Créer les paramètres
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const insertQuery = `
        INSERT INTO ecommerce_settings (${fields.join(', ')}, created_at, created_by)
        VALUES (${placeholders}, NOW(), $${values.length + 1})
        RETURNING *
      `;
      
      const result = await pool.query(insertQuery, [...values, userId]);
      return sendSuccess(res, result.rows[0], 'Paramètres créés avec succès');
    } else {
      // Mettre à jour les paramètres
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
      
      const updateQuery = `
        UPDATE ecommerce_settings
        SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
        RETURNING *
      `;
      
      const result = await pool.query(updateQuery, [...values, userId]);
      return sendSuccess(res, result.rows[0], 'Paramètres mis à jour avec succès');
    }
  } catch (error) {
    return handleError(res, error, 'updateEcommerceSettings');
  }
};
