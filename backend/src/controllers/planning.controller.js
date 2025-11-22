import { pool } from '../utils/db.js';

export const getPlanning = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, o.numero_of, a.designation, m.numero_machine
       FROM planning_machines p
       JOIN ordres_fabrication o ON p.id_of = o.id_of
       JOIN articles_catalogue a ON o.id_article = a.id_article
       LEFT JOIN machines m ON p.id_machine = m.id_machine
       ORDER BY p.date_debut_prevue`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getPlanning:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updatePlanning = async (req, res) => {
  try {
    const { id_planning, id_machine, date_debut_prevue, date_fin_prevue } = req.body;

    const result = await pool.query(
      `UPDATE planning_machines 
       SET id_machine = $1, date_debut_prevue = $2, date_fin_prevue = $3
       WHERE id_planning = $4
       RETURNING *`,
      [id_machine, date_debut_prevue, date_fin_prevue, id_planning]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Planning non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updatePlanning:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const assignMachine = async (req, res) => {
  try {
    const { ofId } = req.params;
    const { machineId } = req.body;

    const result = await pool.query(
      `INSERT INTO planning_machines (id_machine, id_of, date_debut_prevue, date_fin_prevue, statut)
       SELECT $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day', 'planifie'
       FROM ordres_fabrication
       WHERE id_of = $2
       RETURNING *`,
      [machineId, ofId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OF non trouvé' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur assignMachine:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

