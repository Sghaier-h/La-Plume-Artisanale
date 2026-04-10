/**
 * Crmlead Controller - Version SQL directe
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';

const TABLE_NAME = 'pistes_crm';
const ID_FIELD = 'id_piste';

// GET /api/crm/crm/lead - Liste tous les enregistrements
export const getCrmLeads = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const { offset, pageSize } = getPaginationParams(page, limit);

    let query = `SELECT * FROM ${TABLE_NAME} WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      const searchConditions = ["nom","email","telephone"].map(field => 
        `${field} ILIKE $${paramIndex}`
      ).join(' OR ');
      query += ` AND (${searchConditions})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);

    const result = await pool.query(query, params);
    const totalResult = await pool.query(`SELECT COUNT(*) as total FROM ${TABLE_NAME}`, []);
    const total = parseInt(totalResult.rows[0].total);

    return sendSuccess(res, {
      data: result.rows,
      pagination: buildPaginationResponse(page, pageSize, total)
    });
  } catch (error) {
    return handleError(res, error, 'getCrmlead');
  }
};

// GET /api/crm/crm/lead/:id - Récupère un enregistrement
export const getCrmLead = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Enregistrement non trouvé', 404);
    }

    return sendSuccess(res, result.rows[0], 'Enregistrement récupéré avec succès');
  } catch (error) {
    return handleError(res, error, 'getCrmleadById');
  }
};

// POST /api/crm/crm/lead - Crée un enregistrement
export const createCrmLead = async (req, res) => {
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
    return handleError(res, error, 'createCrmlead');
  }
};

// PUT /api/crm/crm/lead/:id - Met à jour un enregistrement
export const updateCrmLead = async (req, res) => {
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
    return handleError(res, error, 'updateCrmlead');
  }
};

// DELETE /api/crm/crm/lead/:id - Supprime un enregistrement
export const deleteCrmLead = async (req, res) => {
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
    return handleError(res, error, 'deleteCrmlead');
  }
};


// POST /api/crm/leads/:id/convert
export const convertToOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const leadQuery = `SELECT * FROM crm_leads WHERE id_lead = $1`;
    const leadResult = await pool.query(leadQuery, [id]);
    
    if (leadResult.rows.length === 0) {
      return sendError(res, 'Piste non trouvée', 404);
    }
    
    const lead = leadResult.rows[0];
    // Créer une opportunité à partir de la piste
    const oppQuery = `
      INSERT INTO crm_opportunities (name, partner_id, expected_revenue, probability, stage_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const oppResult = await pool.query(oppQuery, [
      lead.name || 'Opportunité depuis ' + lead.name,
      lead.partner_id,
      lead.expected_revenue || 0,
      lead.probability || 10,
      1 // stage_id par défaut
    ]);
    
    return sendSuccess(res, oppResult.rows[0], 'Piste convertie en opportunité avec succès');
  } catch (error) {
    return handleError(res, error, 'convertToOpportunity');
  }
};


// POST /api/crm/leads
export const createLead = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      name, partner_id, email, phone, source, expected_revenue, probability
    } = req.body;
    
    const query = `
      INSERT INTO pistes_crm 
        (nom, id_partenaire, email, telephone, source, revenu_attendu, probabilite, statut, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'nouvelle', $8, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      name, partner_id || null, email || null, phone || null, 
      source || 'website', expected_revenue || 0, probability || 10, userId
    ]);
    
    return sendSuccess(res, result.rows[0], 'Piste créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createLead');
  }
};

export const getLeads = getCrmLeads;
export const getLead = getCrmLead;
export const updateLead = updateCrmLead;
export const deleteLead = deleteCrmLead;