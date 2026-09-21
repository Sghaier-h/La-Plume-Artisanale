/**
 * CRM Stage Routes - Routes pour les étapes du pipeline
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';

const router = express.Router();

// Étapes par défaut du pipeline CRM (table crm_stage non créée)
const DEFAULT_STAGES = [
  { id: 1, name: 'Nouveau', ordre: 1, probabilite: 10, fold: false, active: true },
  { id: 2, name: 'Qualifié', ordre: 2, probabilite: 25, fold: false, active: true },
  { id: 3, name: 'Proposition', ordre: 3, probabilite: 50, fold: false, active: true },
  { id: 4, name: 'Négociation', ordre: 4, probabilite: 75, fold: false, active: true },
  { id: 5, name: 'Gagné', ordre: 5, probabilite: 100, fold: false, active: true },
  { id: 6, name: 'Perdu', ordre: 6, probabilite: 0, fold: true, active: true },
];

// GET /api/crm/stages - Liste des étapes
router.get('/', authenticate, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM crm_stage ORDER BY ordre ASC');
    res.json({ success: true, data: r.rows.length ? r.rows : DEFAULT_STAGES });
  } catch {
    res.json({ success: true, data: DEFAULT_STAGES });
});

// GET /api/crm/stages/:id
router.get('/:id', authenticate, async (req, res) => {
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
router.post('/', authenticate, async (req, res) => {
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
