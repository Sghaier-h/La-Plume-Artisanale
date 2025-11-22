import { pool } from '../utils/db.js';

export const getStockMP = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, mp.code_mp, mp.designation, mp.couleur
       FROM stock_mp s
       JOIN matieres_premieres mp ON s.id_mp = mp.id_mp
       WHERE s.statut = 'disponible'
       ORDER BY mp.code_mp`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getStockMP:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getStockPF = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, a.code_article, a.designation
       FROM stock_produits_finis s
       JOIN articles_catalogue a ON s.id_article = a.id_article
       WHERE s.statut = 'en_attente_expedition'
       ORDER BY s.date_entree DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur getStockPF:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createTransfert = async (req, res) => {
  try {
    const { id_stock_mp, quantite, emplacement_destination } = req.body;

    const result = await pool.query(
      `INSERT INTO transferts_entrepots 
       (numero_transfert, id_stock_mp, quantite, emplacement_destination, statut)
       VALUES ('TRF-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(NEXTVAL('transferts_entrepots_id_transfert_seq')::TEXT, 4, '0'),
               $1, $2, $3, 'en_attente')
       RETURNING *`,
      [id_stock_mp, quantite, emplacement_destination]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur createTransfert:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

