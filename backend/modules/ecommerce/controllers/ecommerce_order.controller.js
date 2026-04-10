/**
 * Ecommerce Order Controller
 * Contrôleur pour les commandes e-commerce
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/ecommerce/orders
export const getEcommerceOrders = async (req, res) => {
  try {
    const { ecommerce, search, loadRelations } = req.query;
    
    let query = `
      SELECT co.*, c.raison_sociale as partner_name
      FROM commandes_clients co
      LEFT JOIN clients c ON co.id_client = c.id_client
      WHERE 1=1
    `;
    const params = [];
    
    if (search) {
      query += ` AND (co.numero_commande ILIKE $${params.length + 1} OR c.raison_sociale ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY co.id_commande DESC';
    
    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows, 'Commandes e-commerce récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerceOrders');
  }
};

// GET /api/ecommerce/orders/:id
export const getEcommerceOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT co.*, c.raison_sociale as partner_name
      FROM commandes_clients co
      LEFT JOIN clients c ON co.id_client = c.id_client
      WHERE co.id_commande = $1 
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Commande récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getEcommerceOrder');
  }
};

// PUT /api/ecommerce/orders/:id
export const updateEcommerceOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE commandes_clients
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id_commande = $${values.length + 2} AND source = 'ecommerce'
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Commande mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateEcommerceOrder');
  }
};

// POST /api/ecommerce/orders/:id/confirm
export const confirmEcommerceOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE commandes_clients
      SET statut = 'confirmed', updated_at = NOW(), updated_by = $1
      WHERE id_commande = $2 AND source = 'ecommerce'
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Commande confirmée avec succès');
  } catch (error) {
    return handleError(res, error, 'confirmEcommerceOrder');
  }
};

// POST /api/ecommerce/orders/:id/cancel
export const cancelEcommerceOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE commandes_clients
      SET statut = 'cancel', updated_at = NOW(), updated_by = $1
      WHERE id_commande = $2 AND source = 'ecommerce'
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Commande annulée avec succès');
  } catch (error) {
    return handleError(res, error, 'cancelEcommerceOrder');
  }
};
