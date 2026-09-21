/**
 * CRM Opportunity Routes - Routes pour les opportunités CRM
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';

const router = express.Router();

// GET /api/crm/opportunities - Liste des opportunités
router.get('/', authenticate, async (req, res) => {
  try {
    const { stage_id, user_id, partner_id, state, search } = req.query;
    
    let query = `
      SELECT 
        o.*,
        p.raison_sociale as partner_name,
        u.nom as user_name,
        s.name as stage_name,
        t.name as team_name
      FROM crm_opportunity o
      LEFT JOIN clients p ON o.id_partner = p.id_client
      LEFT JOIN utilisateurs u ON o.id_utilisateur = u.id_utilisateur
      LEFT JOIN crm_stage s ON o.id_stage = s.id
      LEFT JOIN crm_team t ON o.id_team = t.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (stage_id) {
      paramCount++;
      query += ` AND o.id_stage = $${paramCount}`;
      params.push(stage_id);
    }

    if (user_id) {
      paramCount++;
      query += ` AND o.id_utilisateur = $${paramCount}`;
      params.push(user_id);
    }

    if (partner_id) {
      paramCount++;
      query += ` AND o.id_partner = $${paramCount}`;
      params.push(partner_id);
    }

    if (state) {
      paramCount++;
      query += ` AND o.state = $${paramCount}`;
      params.push(state);
    }

    if (search) {
      paramCount++;
      query += ` AND (o.name ILIKE $${paramCount} OR p.raison_sociale ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY o.date_creation DESC`;

    const result = await pool.query(query, params);
    
    const opportunities = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      partner_id: row.id_partner ? { id: row.id_partner, name: row.partner_name } : null,
      stage_id: row.id_stage ? { id: row.id_stage, name: row.stage_name } : null,
      team_id: row.id_team ? { id: row.id_team, name: row.team_name } : null,
      user_id: row.id_utilisateur ? { id: row.id_utilisateur, name: row.user_name } : null,
      probability: row.probabilite || 0,
      expected_revenue: row.revenu_attendu || 0,
      expected_date: row.date_prevue,
      state: row.state || 'new',
      active: row.active !== false,
      description: row.description,
      create_date: row.date_creation,
      write_date: row.date_modification
    }));

    res.json(opportunities);
  } catch (error) {
    console.error('Erreur récupération opportunités:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/crm/opportunities/:id - Détails d'une opportunité
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM crm_opportunity WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunité non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur récupération opportunité:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/opportunities - Créer une opportunité
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      name,
      partner_id,
      stage_id,
      user_id,
      team_id,
      probability,
      expected_revenue,
      expected_date,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO crm_opportunity (
        name, id_partner, id_stage, id_utilisateur, id_team,
        probabilite, revenu_attendu, date_prevue, description,
        state, active, date_creation, date_modification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *`,
      [
        name,
        partner_id,
        stage_id,
        user_id,
        team_id,
        probability || 0,
        expected_revenue || 0,
        expected_date,
        description,
        'new',
        true
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création opportunité:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/crm/opportunities/:id - Mettre à jour une opportunité
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      const fieldMap = {
        partner_id: 'id_partner',
        stage_id: 'id_stage',
        user_id: 'id_utilisateur',
        team_id: 'id_team',
        probability: 'probabilite',
        expected_revenue: 'revenu_attendu',
        expected_date: 'date_prevue',
        date_open: 'date_ouverture',
        date_closed: 'date_fermeture'
      };
      
      const dbField = fieldMap[key] || key;
      paramCount++;
      fields.push(`${dbField} = $${paramCount}`);
      values.push(updates[key]);
    });

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Aucune mise à jour fournie' });
    }

    paramCount++;
    fields.push(`date_modification = NOW()`);
    values.push(id);

    const query = `
      UPDATE crm_opportunity 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunité non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour opportunité:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/opportunities/:id/qualify - Qualifier une opportunité
router.post('/:id/qualify', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE crm_opportunity 
       SET state = 'qualified', probabilite = GREATEST(probabilite, 25), date_ouverture = NOW(), date_modification = NOW()
       WHERE id = $1`,
      [id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur qualification opportunité:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/opportunities/:id/win - Gagner une opportunité
router.post('/:id/win', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'opportunité
    const oppResult = await pool.query('SELECT * FROM crm_opportunity WHERE id = $1', [id]);
    if (oppResult.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunité non trouvée' });
    }

    const opp = oppResult.rows[0];

    // Mettre à jour l'opportunité
    await pool.query(
      `UPDATE crm_opportunity 
       SET state = 'won', probabilite = 100, date_fermeture = NOW(), active = false, date_modification = NOW()
       WHERE id = $1`,
      [id]
    );

    // Créer une commande de vente automatiquement
    if (opp.id_partner && opp.revenu_attendu > 0) {
      await pool.query(
        `INSERT INTO commandes_clients (
          id_client, date_commande, montant_total, etat, 
          created_by, date_creation, date_modification
        ) VALUES ($1, NOW(), $2, 'brouillon', $3, NOW(), NOW())`,
        [opp.id_partner, opp.revenu_attendu, req.user.id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur gain opportunité:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/crm/opportunities/:id/lose - Perdre une opportunité
router.post('/:id/lose', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(
      `UPDATE crm_opportunity 
       SET state = 'lost', probabilite = 0, date_fermeture = NOW(), active = false,
           description = COALESCE(description, '') || E'\n\nRaison de la perte: ' || $2,
           date_modification = NOW()
       WHERE id = $1`,
      [id, reason || 'Non spécifiée']
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur perte opportunité:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
