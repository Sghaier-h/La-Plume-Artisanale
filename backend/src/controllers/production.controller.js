import { pool } from '../utils/db.js';

export const getOFs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, a.code_article, a.designation
       FROM ordres_fabrication o
       JOIN articles_catalogue a ON o.id_article = a.id_article
       ORDER BY o.date_creation_of DESC
       LIMIT 100`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getOFs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getOF = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT o.*, a.code_article, a.designation
       FROM ordres_fabrication o
       JOIN articles_catalogue a ON o.id_article = a.id_article
       WHERE o.id_of = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OF non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur getOF:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createOF = async (req, res) => {
  try {
    const { id_article, quantite_a_produire, date_debut_prevue, date_fin_prevue } = req.body;

    const result = await pool.query(
      `INSERT INTO ordres_fabrication 
       (numero_of, id_article, quantite_a_produire, date_debut_prevue, date_fin_prevue, statut)
       VALUES ('OF' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ordres_fabrication_id_of_seq')::TEXT, 4, '0'),
               $1, $2, $3, $4, 'planifie')
       RETURNING *`,
      [id_article, quantite_a_produire, date_debut_prevue, date_fin_prevue]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createOF:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateOF = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Construire la requête dynamiquement
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE ordres_fabrication 
       SET ${setClause}, date_modification = CURRENT_TIMESTAMP
       WHERE id_of = $1
       RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'OF non trouvé' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur updateOF:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getMachines = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, tm.libelle as type_machine
       FROM machines m
       JOIN types_machines tm ON m.id_type_machine = tm.id_type_machine
       WHERE m.actif = true
       ORDER BY m.numero_machine`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getMachines:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

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

