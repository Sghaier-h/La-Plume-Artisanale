import { pool } from '../utils/db.js';

// GET /api/planning-dragdrop - Obtenir le planning avec OF en attente et machines
export const getPlanning = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          ofEnAttente: [
            { id_of: 1, numero_of: 'OF-001', article: 'IBIZA 1020', quantite: 100, priorite: 'normale' }
          ],
          machines: [
            { id_machine: 1, numero_machine: 'M2301', ofEnCours: [{ id_of: 2 }], ofEnAttente: [] }
          ]
        }
      });
    }

    // OF en attente d'attribution
    const ofAttenteResult = await pool.query(`
      SELECT 
        of.id_of,
        of.numero_of,
        a.designation as article,
        of.quantite_a_produire as quantite,
        of.priorite,
        of.date_debut_prevue
      FROM ordres_fabrication of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE of.statut = 'planifie'
      ORDER BY 
        CASE of.priorite 
          WHEN 'urgente' THEN 1 
          WHEN 'haute' THEN 2 
          WHEN 'normale' THEN 3 
          ELSE 4 
        END,
        of.date_debut_prevue
    `);

    // Machines avec leurs OF
    const machinesResult = await pool.query(`
      SELECT 
        m.id_machine,
        m.numero_machine,
        m.statut,
        m.largeur_utile,
        m.capacite_production
      FROM machines m
      WHERE m.actif = true AND m.statut IN ('operationnel', 'en_maintenance')
      ORDER BY m.numero_machine
    `);

    const machines = await Promise.all(
      machinesResult.rows.map(async (machine) => {
        const planningResult = await pool.query(`
          SELECT 
            pm.id_of,
            of.numero_of,
            of.statut,
            pm.date_debut_prevue,
            pm.date_fin_prevue
          FROM planning_machines pm
          LEFT JOIN ordres_fabrication of ON pm.id_of = of.id_of
          WHERE pm.id_machine = $1
          ORDER BY pm.date_debut_prevue
        `, [machine.id_machine]);

        const ofEnCours = planningResult.rows.filter(p => p.statut === 'en_cours');
        const ofEnAttente = planningResult.rows.filter(p => p.statut === 'attribue' || p.statut === 'planifie');

        return {
          ...machine,
          ofEnCours,
          ofEnAttente
        };
      })
    );

    res.json({
      success: true,
      data: {
        ofEnAttente: ofAttenteResult.rows,
        machines
      }
    });
  } catch (error) {
    console.error('Erreur getPlanning:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/planning-dragdrop/assigner - Assigner un OF à une machine
export const assignerOFMachine = async (req, res) => {
  try {
    const { ofId, machineId, position } = req.body; // position: 'en_cours' ou index dans en_attente

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'OF assigné à la machine (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Vérifier si l'OF existe
      const ofResult = await client.query('SELECT * FROM ordres_fabrication WHERE id_of = $1', [ofId]);
      if (ofResult.rows.length === 0) {
        throw new Error('OF non trouvé');
      }

      // Vérifier si la machine existe
      const machineResult = await client.query('SELECT * FROM machines WHERE id_machine = $1', [machineId]);
      if (machineResult.rows.length === 0) {
        throw new Error('Machine non trouvée');
      }

      // Vérifier si l'OF n'est pas déjà assigné à une autre machine
      const existingResult = await client.query(
        'SELECT * FROM planning_machines WHERE id_of = $1 AND id_machine != $2',
        [ofId, machineId]
      );

      if (existingResult.rows.length > 0) {
        // Retirer de l'ancienne machine
        await client.query('DELETE FROM planning_machines WHERE id_of = $1', [ofId]);
      }

      // Vérifier si l'OF est déjà sur cette machine
      const existingOnMachine = await client.query(
        'SELECT * FROM planning_machines WHERE id_of = $1 AND id_machine = $2',
        [ofId, machineId]
      );

      if (existingOnMachine.rows.length === 0) {
        // Insérer dans planning_machines
        await client.query(`
          INSERT INTO planning_machines (id_machine, id_of, date_debut_prevue, date_fin_prevue, statut)
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day', 'attribue')
        `, [machineId, ofId]);
      }

      // Mettre à jour le statut de l'OF
      if (ofResult.rows[0].statut === 'planifie') {
        await client.query('UPDATE ordres_fabrication SET statut = $1 WHERE id_of = $2', ['attribue', ofId]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'OF assigné à la machine avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur assignerOFMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/planning-dragdrop/reordonner - Réordonner les OF d'une machine
export const reordonnerOF = async (req, res) => {
  try {
    const { machineId, ofIds } = req.body; // Array d'IDs dans le nouvel ordre

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'OF réordonnés (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Mettre à jour l'ordre des OF
      for (let i = 0; i < ofIds.length; i++) {
        await client.query(`
          UPDATE planning_machines 
          SET date_debut_prevue = CURRENT_TIMESTAMP + ($1 || ' days')::INTERVAL
          WHERE id_machine = $2 AND id_of = $3
        `, [i, machineId, ofIds[i]]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'OF réordonnés avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur reordonnerOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
