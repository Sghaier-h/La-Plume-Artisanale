/**
 * CRM Campaign Controller
 * Contrôleur pour les campagnes CRM
 */

import { pool } from '../../../src/utils/db.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import { loadRelations } from '../../../src/core/Relations.js';

// GET /api/crm/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const { loadRelations: loadRels, search, ...filters } = req.query;
    
    let query = `SELECT * FROM crm_campaigns`;
    const params = [];
    const conditions = [];
    
    if (search) {
      conditions.push(`(name ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY id DESC`;
    
    const result = await pool.query(query, params);
    let records = result.rows;
    
    if (loadRels === 'true') {
      records = await loadRelations('crm.campaign', records);
    }
    
    return sendSuccess(res, records, 'Campagnes récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getCampaigns');
  }
};

// GET /api/crm/campaigns/:id
export const getCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { loadRelations: loadRels } = req.query;
    
    const query = `SELECT * FROM crm_campaigns WHERE id = $1`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Campagne non trouvée', 404);
    }
    
    let record = result.rows[0];
    
    if (loadRels === 'true') {
      record = (await loadRelations('crm.campaign', [record]))[0];
    }
    
    return sendSuccess(res, record, 'Campagne récupérée avec succès');
  } catch (error) {
    return handleError(res, error, 'getCampaign');
  }
};

// POST /api/crm/campaigns
export const createCampaign = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO crm_campaigns (${fields.join(', ')}, created_at, created_by)
      VALUES (${placeholders}, NOW(), $${values.length + 1})
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId]);
    return sendSuccess(res, result.rows[0], 'Campagne créée avec succès', 201);
  } catch (error) {
    return handleError(res, error, 'createCampaign');
  }
};

// PUT /api/crm/campaigns/:id
export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE crm_campaigns
      SET ${setClause}, updated_at = NOW(), updated_by = $${values.length + 1}
      WHERE id = $${values.length + 2}
      RETURNING *
    `;
    
    const result = await pool.query(query, [...values, userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Campagne non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Campagne mise à jour avec succès');
  } catch (error) {
    return handleError(res, error, 'updateCampaign');
  }
};

// DELETE /api/crm/campaigns/:id
export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE crm_campaigns
      SET statut = 'cancelled', updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Campagne non trouvée', 404);
    }
    
    return sendSuccess(res, null, 'Campagne supprimée avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteCampaign');
  }
};

// POST /api/crm/campaigns/:id/start
export const startCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE crm_campaigns
      SET statut = 'running', date_start = NOW(), updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Campagne non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Campagne démarrée avec succès');
  } catch (error) {
    return handleError(res, error, 'startCampaign');
  }
};

// POST /api/crm/campaigns/:id/pause
export const pauseCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE crm_campaigns
      SET statut = 'paused', updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Campagne non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Campagne mise en pause avec succès');
  } catch (error) {
    return handleError(res, error, 'pauseCampaign');
  }
};

// POST /api/crm/campaigns/:id/stop
export const stopCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    
    const query = `
      UPDATE crm_campaigns
      SET statut = 'completed', date_end = NOW(), updated_at = NOW(), updated_by = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, id]);
    
    if (result.rows.length === 0) {
      return sendError(res, 'Campagne non trouvée', 404);
    }
    
    return sendSuccess(res, result.rows[0], 'Campagne arrêtée avec succès');
  } catch (error) {
    return handleError(res, error, 'stopCampaign');
  }
};

// GET /api/crm/campaigns/:id/stats
export const getCampaignStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        COUNT(*) as participants_count,
        COUNT(CASE WHEN opened = true THEN 1 END) as opened_count,
        COUNT(CASE WHEN clicked = true THEN 1 END) as clicked_count,
        COUNT(CASE WHEN converted = true THEN 1 END) as converted_count
      FROM crm_campaign_participants
      WHERE campaign_id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return sendSuccess(res, result.rows[0] || {}, 'Statistiques de campagne récupérées avec succès');
  } catch (error) {
    return handleError(res, error, 'getCampaignStats');
  }
};
