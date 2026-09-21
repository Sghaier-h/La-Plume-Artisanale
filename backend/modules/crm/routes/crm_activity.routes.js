/**
 * CRM Activity Routes - Routes pour les activités CRM
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';

const router = express.Router();

// GET /api/crm/activities - Liste des activités
router.get('/', authenticate, async (req, res) => {
  try {
    const { opportunity_id, partner_id, user_id, activity_type, done } = req.query;
    
    let query = `
      SELECT 
        a.*,
        p.raison_sociale as partner_name,
        u.nom as user_name,
        o.name as opportunity_name
      FROM crm_activity a
      LEFT JOIN clients p ON a.id_partner = p.id_client
      LEFT JOIN utilisateurs u ON a.id_utilisateur = u.id_utilisateur
      LEFT JOIN crm_opportunity o ON a.id_opportunite = o.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (opportunity_id) {
      paramCount++;
      query += ` AND a.id_opportunite = $${paramCount}`;
      params.push(opportunity_id);
    }

    if (partner_id) {
      paramCount++;
      query += ` AND a.id_partner = $${paramCount}`;
      params.push(partner_id);
    }

    if (user_id) {
      paramCount++;
      query += ` AND a.id_utilisateur = $${paramCount}`;
      params.push(user_id);
    }

    if (activity_type) {
      paramCount++;
      query += ` AND a.type_activite = $${paramCount}`;
      params.push(activity_type);
    }

    if (done !== undefined) {
      paramCount++;
      query += ` AND a.done = $${paramCount}`;
      params.push(done === 'true');
    }

    query += ` ORDER BY a.date_activite DESC`;

    const result = await pool.query(query, params);
    
    const activities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      activity_type: row.type_activite,
      opportunity_id: row.id_opportunite ? { id: row.id_opportunite, name: row.opportunity_name } : null,
      partner_id: row.id_partner ? { id: row.id_partner, name: row.partner_name } : null,
      user_id: row.id_utilisateur ? { id: row.id_utilisateur, name: row.user_name } : null,
      team_id: row.id_team,
      date: row.date_activite,
      duration: row.duree,
      summary: row.summary,
      description: row.description,
      done: row.done || false,
      state: row.state || 'planned',
      create_date: row.date_creation,
      write_date: row.date_modification
    }));

    res.json(activities);
  } catch (error) {
    console.error('Erreur récupération activités:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/activities - Créer une activité
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      activity_type,
      opportunity_id,
      partner_id,
      user_id,
      team_id,
      date,
      duration,
      summary,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO crm_activity (
        name, type_activite, id_opportunite, id_partner, id_utilisateur, id_team,
        date_activite, duree, summary, description, done, state,
        date_creation, date_modification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        name,
        activity_type,
        opportunity_id,
        partner_id,
        user_id,
        team_id,
        date || new Date(),
        duration,
        summary,
        description,
        false,
        'planned'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création activité:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/activities/:id/done - Marquer une activité comme terminée
router.post('/:id/done', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE crm_activity 
       SET done = true, state = 'done', date_modification = NOW()
       WHERE id = $1`,
      [id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur activité terminée:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
