/**
 * Contrôleur PurchaseRequests - Module modulaire
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';

// GET /api/purchase-requests - Liste tous les enregistrements
export const getPurchaseRequests = async (req, res) => {
  try {
    const { loadRelations, search, statut, ...filters } = req.query;
    
    let query = `SELECT * FROM demandes_achat WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (numero_demande ILIKE $${paramIndex} OR motif ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (statut) {
      query += ` AND statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }
    
    query += ` ORDER BY COALESCE(created_at, id) DESC`;
    
    const result = await pool.query(query, params);
    let records = result.rows;
    
    // Charger les lignes si demandé
    if (loadRelations === 'true') {
      for (const record of records) {
        const linesQuery = `SELECT * FROM lignes_demande_achat WHERE id_demande = $1`;
        const linesResult = await pool.query(linesQuery, [record.id]);
        record.lignes = linesResult.rows;
      }
    }
    
    return sendSuccess(res, records, 'Demandes d\'achat récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseRequests');
  }
};

// GET /api/purchase-requests/:id - Récupère un enregistrement
export const getPurchaseRequestsById = async (req, res) => {
  try {
    const { id } = req.params;
    const { loadRelations } = req.query;
    
    const query = `SELECT * FROM demandes_achat WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Demande d\'achat non trouvée', 404);
    }
    
    let record = result.rows[0];
    
    // Charger les lignes si demandé
    if (loadRelations === 'true') {
      const linesQuery = `SELECT * FROM lignes_demande_achat WHERE id_demande = $1 ORDER BY id`;
      const linesResult = await pool.query(linesQuery, [id]);
      record.lignes = linesResult.rows;
    }
    
    return sendSuccess(res, record, 'Demande d\'achat récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseRequestsById');
  }
};

// POST /api/purchase-requests - Crée un enregistrement
export const createPurchaseRequests = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const { motif, date_besoin, notes, lignes, ...data } = req.body;
    
    // Générer un numéro de demande
    const numQuery = `SELECT COUNT(*) as count FROM demandes_achat WHERE DATE(created_at) = CURRENT_DATE`;
    const numResult = await pool.query(numQuery);
    const count = parseInt(numResult.rows[0].count) + 1;
    const numero = `DA-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(count).padStart(4, '0')}`;
    
    // Créer la demande d'achat
    const insertQuery = `
      INSERT INTO demandes_achat (
        numero_demande, motif, date_besoin, notes, statut, 
        created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, 'brouillon', $5, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      numero,
      motif || '',
      date_besoin || null,
      notes || '',
      userId
    ]);
    
    const request = result.rows[0];
    
    // Créer les lignes si fournies
    if (lignes && Array.isArray(lignes)) {
      for (const ligne of lignes) {
        await pool.query(`
          INSERT INTO lignes_demande_achat (
            id_demande, id_product, quantity, price_unit, description, 
            created_at, created_by
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        `, [
          request.id,
          ligne.id_product || ligne.product_id,
          ligne.quantity || 0,
          ligne.price_unit || 0,
          ligne.description || '',
          userId
        ]);
      }
    }
    
    // Récupérer la demande avec ses lignes
    const fullQuery = `
      SELECT pr.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', prl.id,
              'id_product', prl.id_product,
              'quantity', prl.quantity,
              'price_unit', prl.price_unit,
              'description', prl.description
            )
          ) FILTER (WHERE prl.id IS NOT NULL),
          '[]'
        ) as lignes
      FROM demandes_achat pr
      LEFT JOIN lignes_demande_achat prl ON pr.id_demande = prl.id_demande
      WHERE pr.id_demande = $1
      GROUP BY pr.id_demande
    `;
    const fullResult = await pool.query(fullQuery, [request.id_demande]);
    
    return sendSuccess(res, fullResult.rows[0], 'Demande d\'achat créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPurchaseRequests');
  }
};

// PUT /api/purchase-requests/:id - Met à jour un enregistrement
export const updatePurchaseRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const { motif, date_besoin, notes, lignes, ...data } = req.body;
    
    // Vérifier que la demande existe
    const checkQuery = `SELECT * FROM demandes_achat WHERE id = $1`;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return sendError(res, 'Demande d\'achat non trouvée', 404);
    }
    
    // Mettre à jour la demande
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    if (motif !== undefined) {
      updateFields.push(`motif = $${paramIndex++}`);
      updateValues.push(motif);
    }
    if (date_besoin !== undefined) {
      updateFields.push(`date_besoin = $${paramIndex++}`);
      updateValues.push(date_besoin);
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`);
      updateValues.push(notes);
    }
    
    if (updateFields.length > 0) {
      updateFields.push(`updated_at = NOW()`);
      updateFields.push(`updated_by = $${paramIndex++}`);
      updateValues.push(userId);
      updateValues.push(id);
      
      const updateQuery = `
        UPDATE demandes_achat
        SET ${updateFields.join(', ')}
        WHERE id_demande = $${paramIndex}
        RETURNING *
      `;
      
      await pool.query(updateQuery, updateValues);
    }
    
    // Mettre à jour les lignes si fournies
    if (lignes && Array.isArray(lignes)) {
      // Supprimer les anciennes lignes
      await pool.query(`DELETE FROM lignes_demande_achat WHERE id_demande = $1`, [id]);
      
      // Créer les nouvelles lignes
      for (const ligne of lignes) {
        await pool.query(`
          INSERT INTO lignes_demande_achat (
            id_demande, id_product, quantity, price_unit, description, 
            created_at, created_by
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        `, [
          id,
          ligne.id_product || ligne.product_id,
          ligne.quantity || 0,
          ligne.price_unit || 0,
          ligne.description || '',
          userId
        ]);
      }
    }
    
    // Récupérer la demande mise à jour avec ses lignes
    const fullQuery = `
      SELECT pr.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', prl.id,
              'id_product', prl.id_product,
              'quantity', prl.quantity,
              'price_unit', prl.price_unit,
              'description', prl.description
            )
          ) FILTER (WHERE prl.id IS NOT NULL),
          '[]'
        ) as lignes
      FROM demandes_achat pr
      LEFT JOIN lignes_demande_achat prl ON pr.id_demande = prl.id_demande
      WHERE pr.id_demande = $1
      GROUP BY pr.id_demande
    `;
    const fullResult = await pool.query(fullQuery, [id]);
    
    return sendSuccess(res, fullResult.rows[0], 'Demande d\'achat mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePurchaseRequests');
  }
};

// DELETE /api/purchase-requests/:id - Supprime un enregistrement
export const deletePurchaseRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE demandes_achat
      SET active = false, updated_at = NOW(), updated_by = $1
      WHERE id_demande = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Demande d\'achat non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Demande d\'achat supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePurchaseRequests');
  }
};

// POST /api/purchase-requests/:id/validate
export const validatePurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE demandes_achat
      SET statut = 'approuvee', updated_at = NOW(), updated_by = $1
      WHERE id_demande = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Demande d\'achat non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Demande d\'achat approuvée avec succès');
  } catch (error) {
    return handleError(res, error, 'validatePurchaseRequest');
  }
};

// POST /api/purchase-requests/:id/reject
export const rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const { reason } = req.body;
    
    const query = `
      UPDATE demandes_achat
      SET statut = 'rejetee', raison_rejet = $1, updated_at = NOW(), updated_by = $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [reason || 'Non spécifié', userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Demande d\'achat non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Demande d\'achat rejetée avec succès');
  } catch (error) {
    return handleError(res, error, 'rejectPurchaseRequest');
  }
};

// GET /api/purchase-requests/:id/lignes
export const getPurchaseRequestLines = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM lignes_demande_achat WHERE id_demande = $1 ORDER BY id`;
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows, 'Lignes de demande d\'achat récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getPurchaseRequestLines');
  }
};

// POST /api/purchase-requests/:id/lignes
export const createPurchaseRequestLine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = { ...req.body, id_demande: id };
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO lignes_demande_achat (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Ligne de demande d\'achat créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createPurchaseRequestLine');
  }
};

// PUT /api/purchase-requests/:id/lignes/:lineId
export const updatePurchaseRequestLine = async (req, res) => {
  try {
    const { id, lineId } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE lignes_demande_achat
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id = $${values.length + 2} AND id_demande = $${values.length + 3}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, lineId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne de demande d\'achat non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Ligne de demande d\'achat mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updatePurchaseRequestLine');
  }
};

// DELETE /api/purchase-requests/:id/lignes/:lineId
export const deletePurchaseRequestLine = async (req, res) => {
  try {
    const { id, lineId } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      DELETE FROM lignes_demande_achat
      WHERE id = $1 AND id_demande = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [lineId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Ligne de demande d\'achat non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Ligne de demande d\'achat supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deletePurchaseRequestLine');
  }
};
