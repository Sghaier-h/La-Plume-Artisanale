/**
 * Purchase Reception Controller
 * Contrôleur pour les réceptions fournisseurs
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { loadRelations } from '../../../src/core/Relations.js';

// GET /api/purchase/receptions
export const getPurchaseReceptions = async (req, res) => {
  try {
    const { loadRelations: loadRels, search, ...filters } = req.query;
    
    let query = `SELECT * FROM receptions_fournisseurs`;
    const params = [];
    const conditions = [];
    
    if (search) {
      conditions.push(`(numero_reception ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY id DESC`;
    
    const result = await pool.query(query, params);
    let records = result.rows;
    
    if (loadRels === 'true') {
      records = await loadRelations('purchase.reception', records);
    }
    
    return sendSuccess(res, records, 'Réceptions récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseReceptions');
  }
};

// GET /api/purchase/receptions/:id
export const getPurchaseReception = async (req, res) => {
  try {
    const { id } = req.params;
    const { loadRelations: loadRels } = req.query;
    
    const query = `SELECT * FROM receptions_fournisseurs WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Réception non trouvée', 404);
    }
    
    let record = result.rows[0];
    
    if (loadRels === 'true') {
      record = (await loadRelations('purchase.reception', [record]))[0];
    }
    
    return sendSuccess(res, record, 'Réception récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseReception');
  }
};

// POST /api/purchase/receptions
export const createPurchaseReception = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO receptions_fournisseurs (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Réception créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPurchaseReception');
  }
};

// POST /api/purchase/receptions/from-order
export const createFromOrder = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const { id_commande } = req.body;
    
    // Récupérer la commande
    const orderQuery = `SELECT * FROM commandes_fournisseurs WHERE id_commande = $1`;
    const orderResult = await pool.query(orderQuery, [id_commande]);
    
    if (orderResult.rows.length === 0) {
      return sendError(res, 'Commande non trouvée', 404);
    }
    
    const order = orderResult.rows[0];
    
    // Créer la réception
    const receptionQuery = `
      INSERT INTO receptions_fournisseurs (
        id_commande_fournisseur, date_reception, statut, created_at, created_by
      )
      VALUES ($1, NOW(), 'brouillon', NOW(), $2)
      RETURNING *
    `;
    
    const receptionResult = await pool.query(receptionQuery, [id_commande, userId]);
    const reception = receptionResult.rows[0];
    
    // Créer les lignes de réception depuis les lignes de commande
    const linesQuery = `SELECT * FROM articles_commande_fournisseur WHERE id_commande = $1`;
    const linesResult = await pool.query(linesQuery, [id_commande]);
    
    for (const line of linesResult.rows) {
      await pool.query(`
        INSERT INTO lignes_reception (
          id_reception, id_product, quantite_commandee, quantite_recue, 
          quantite_acceptee, quantite_rejetee, controle_qualite, created_at
        )
        VALUES ($1, $2, $3, 0, 0, 0, 'en_attente', NOW())
      `, [reception.id, line.id_product, line.quantite]);
    }
    
    return sendSuccess(res, reception, 'Réception créée depuis la commande avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createFromOrder');
  }
};

// PUT /api/purchase/receptions/:id
export const updatePurchaseReception = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE receptions_fournisseurs
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Réception non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Réception mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePurchaseReception');
  }
};

// DELETE /api/purchase/receptions/:id
export const deletePurchaseReception = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE receptions_fournisseurs
      SET statut = 'annulee', updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Réception non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Réception supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePurchaseReception');
  }
};

// POST /api/purchase/receptions/:id/validate
export const validatePurchaseReception = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE receptions_fournisseurs
      SET statut = 'validee', updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Réception non trouvée', 404);
    }
    
    // Mettre à jour le stock
    const linesQuery = `SELECT * FROM lignes_reception WHERE id_reception = $1`;
    const linesResult = await pool.query(linesQuery, [id]);
    
    for (const line of linesResult.rows) {
      await pool.query(`
        UPDATE articles
        SET qty_available = qty_available + $1
        WHERE id_article = $2
      `, [line.quantite_acceptee, line.id_product]);
    }
    
    return sendSuccess(res, result.rows[0], 'Réception validée avec succès');
  } catch (error) {
    return handleError(res, error, 'validatePurchaseReception');
  }
};
