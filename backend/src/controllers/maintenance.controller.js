import { pool } from '../utils/db.js';

// GET /api/maintenance/interventions - Liste interventions
export const getInterventions = async (req, res) => {
  try {
    const { id_machine, type, statut, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          interventions: [
            {
              id_intervention: 1,
              numero_intervention: 'INT-2024-000001',
              id_machine: 1,
              type_intervention: 'PREVENTIVE',
              statut: 'PLANIFIEE',
              date_planification: '2024-01-15'
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT i.*, m.numero_machine, m.marque, m.modele,
             t.libelle as type_maintenance_libelle,
             u.nom_utilisateur as intervenant_nom
      FROM interventions_maintenance i
      LEFT JOIN machines m ON i.id_machine = m.id_machine
      LEFT JOIN types_maintenance t ON i.id_type_maintenance = t.id_type
      LEFT JOIN utilisateurs u ON i.id_intervenant = u.id_utilisateur
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_machine) {
      query += ` AND i.id_machine = $${paramIndex}`;
      params.push(id_machine);
      paramIndex++;
    }
    if (type) {
      query += ` AND i.type_intervention = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    if (statut) {
      query += ` AND i.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }
    if (date_debut) {
      query += ` AND i.date_planification >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }
    if (date_fin) {
      query += ` AND i.date_planification <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    query += ` ORDER BY i.date_planification DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { interventions: result.rows, total: result.rows.length } });
  } catch (error) {
    console.error('Erreur getInterventions:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/maintenance/interventions - Créer intervention
export const createIntervention = async (req, res) => {
  try {
    const {
      id_machine, id_type_maintenance, type_intervention,
      date_planification, description_probleme, id_intervenant
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_intervention: Math.floor(Math.random() * 1000),
          numero_intervention: 'INT-2024-000001',
          message: 'Intervention créée (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Générer numéro
      const numeroResult = await client.query('SELECT generer_numero_intervention() as numero');
      const numero = numeroResult.rows[0].numero;

      const result = await client.query(`
        INSERT INTO interventions_maintenance (
          numero_intervention, id_machine, id_type_maintenance, type_intervention,
          date_planification, description_probleme, id_intervenant, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PLANIFIEE')
        RETURNING *
      `, [numero, id_machine, id_type_maintenance, type_intervention, date_planification, description_probleme, id_intervenant]);

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createIntervention:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// GET /api/maintenance/alertes - Liste alertes
export const getAlertes = async (req, res) => {
  try {
    const { lue, traitee } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_alerte: 1,
            type_alerte: 'PREVENTIVE_DUE',
            message: 'Maintenance préventive due pour machine M2301',
            priorite: 1
          }
        ]
      });
    }

    let query = `
      SELECT a.*, m.numero_machine
      FROM alertes_maintenance a
      LEFT JOIN machines m ON a.id_machine = m.id_machine
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (lue !== undefined) {
      query += ` AND a.lue = $${paramIndex}`;
      params.push(lue === 'true');
      paramIndex++;
    }
    if (traitee !== undefined) {
      query += ` AND a.traitee = $${paramIndex}`;
      params.push(traitee === 'true');
      paramIndex++;
    }

    query += ` ORDER BY a.priorite, a.date_alerte DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getAlertes:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/maintenance/planification - Planification maintenance
export const getPlanification = async (req, res) => {
  try {
    const { id_machine } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_planification: 1,
            id_machine: 1,
            date_prochaine: '2024-01-20',
            en_retard: false
          }
        ]
      });
    }

    let query = `
      SELECT p.*, m.numero_machine, t.libelle as type_maintenance_libelle
      FROM planification_maintenance p
      LEFT JOIN machines m ON p.id_machine = m.id_machine
      LEFT JOIN types_maintenance t ON p.id_type_maintenance = t.id_type
      WHERE p.actif = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    if (id_machine) {
      query += ` AND p.id_machine = $${paramIndex}`;
      params.push(id_machine);
      paramIndex++;
    }

    query += ` ORDER BY p.date_prochaine ASC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getPlanification:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/maintenance/pieces - Liste pièces détachées
export const getPieces = async (req, res) => {
  try {
    const { stock_minimum } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_piece: 1,
            code_piece: 'PIECE-001',
            designation: 'Roue dentée',
            stock_disponible: 5,
            stock_minimum: 10
          }
        ]
      });
    }

    let query = `SELECT * FROM pieces_detachees WHERE actif = TRUE`;
    const params = [];
    let paramIndex = 1;

    if (stock_minimum === 'true') {
      query += ` AND stock_disponible <= stock_minimum`;
    }

    query += ` ORDER BY designation`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getPieces:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/maintenance/verifier-alertes - Vérifier et créer alertes
export const verifierAlertes = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Alertes vérifiées (mode mock)', alertes_creees: 0 }
      });
    }

    await pool.query('SELECT verifier_alertes_maintenance()');
    
    const result = await pool.query(`
      SELECT COUNT(*) as nb_alertes
      FROM alertes_maintenance
      WHERE traitee = FALSE AND date_alerte >= CURRENT_DATE
    `);

    res.json({
      success: true,
      data: {
        message: 'Alertes vérifiées',
        alertes_creees: parseInt(result.rows[0].nb_alertes)
      }
    });
  } catch (error) {
    console.error('Erreur verifierAlertes:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
