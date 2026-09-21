/**
 * CRM Stage Routes - Routes pour les étapes du pipeline
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';

const router = express.Router();

// GET /api/crm/stages - Liste des étapes
router.get('/crm/stages', authenticate, async (req, res) => {
  try {
    const { team_id } = req.query;
    let query = 'SELECT * FROM crm_stage WHERE 1=1';
    const params = [];

    if (team_id) {
      query += ' AND id_team = $1';
      params.push(team_id);
    }

    query += ' ORDER BY ordre ASC, name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur récupération étapes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/crm/stages/:id
router.get('/crm/stages/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM crm_stage WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Étape non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur récupération étape:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/stages - Créer une étape
router.post('/crm/stages', authenticate, async (req, res) => {
  try {
    const { name, sequence, probability, team_id, fold, active } = req.body;

    const result = await pool.query(
      `INSERT INTO crm_stage (name, ordre, probabilite, id_team, fold, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, sequence || 0, probability || 0, team_id, fold || false, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création étape:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
