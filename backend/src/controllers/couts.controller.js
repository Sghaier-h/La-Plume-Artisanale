import { pool } from '../utils/db.js';

// GET /api/couts/budgets - Liste budgets
export const getBudgets = async (req, res) => {
  try {
    const { id_projet, id_of, statut } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          budgets: [
            {
              id_budget: 1,
              code_budget: 'BUD-2024-001',
              libelle: 'Budget Production Janvier',
              budget_total: 50000,
              budget_utilise: 35000,
              budget_restant: 15000
            }
          ]
        }
      });
    }

    let query = `SELECT * FROM budgets WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (id_projet) {
      query += ` AND id_projet = $${paramIndex}`;
      params.push(id_projet);
      paramIndex++;
    }
    if (id_of) {
      query += ` AND id_of = $${paramIndex}`;
      params.push(id_of);
      paramIndex++;
    }
    if (statut) {
      query += ` AND statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    query += ` ORDER BY date_debut DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { budgets: result.rows } });
  } catch (error) {
    console.error('Erreur getBudgets:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/couts/cout-theorique/:id_of - Coût théorique OF
export const getCoutTheorique = async (req, res) => {
  try {
    const { id_of } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          cout_total: 1500,
          details: {
            matieres_premieres: 800,
            main_oeuvre: 500,
            machine: 200
          }
        }
      });
    }

    const result = await pool.query('SELECT calculer_cout_theorique_of($1) as cout', [id_of]);
    const coutTotal = parseFloat(result.rows[0].cout || 0);

    // Détails par type
    const detailsResult = await pool.query(`
      SELECT type_cout, SUM(montant_theorique) as montant
      FROM couts_theoriques
      WHERE id_of = $1
      GROUP BY type_cout
    `, [id_of]);

    const details = {};
    detailsResult.rows.forEach(row => {
      details[row.type_cout] = parseFloat(row.montant || 0);
    });

    res.json({
      success: true,
      data: {
        cout_total: coutTotal,
        details
      }
    });
  } catch (error) {
    console.error('Erreur getCoutTheorique:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/couts/cout-reel/:id_of - Coût réel OF
export const getCoutReel = async (req, res) => {
  try {
    const { id_of } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          cout_total: 1650,
          details: {
            matieres_premieres: 850,
            main_oeuvre: 550,
            machine: 250
          }
        }
      });
    }

    const result = await pool.query('SELECT calculer_cout_reel_of($1) as cout', [id_of]);
    const coutTotal = parseFloat(result.rows[0].cout || 0);

    // Détails par type
    const detailsResult = await pool.query(`
      SELECT type_cout, SUM(montant_reel) as montant
      FROM couts_reels
      WHERE id_of = $1
      GROUP BY type_cout
    `, [id_of]);

    const details = {};
    detailsResult.rows.forEach(row => {
      details[row.type_cout] = parseFloat(row.montant || 0);
    });

    res.json({
      success: true,
      data: {
        cout_total: coutTotal,
        details
      }
    });
  } catch (error) {
    console.error('Erreur getCoutReel:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/couts/analyse-ecarts/:id_of - Analyser écarts
export const analyserEcarts = async (req, res) => {
  try {
    const { id_of } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          cout_theorique: 1500,
          cout_reel: 1650,
          ecart: 150,
          ecart_pourcentage: 10,
          details: {
            matieres_premieres: { theorique: 800, reel: 850, ecart: 50 },
            main_oeuvre: { theorique: 500, reel: 550, ecart: 50 },
            machine: { theorique: 200, reel: 250, ecart: 50 }
          }
        }
      });
    }

    const result = await pool.query('SELECT analyser_ecarts_of($1) as analyse', [id_of]);
    const analyse = result.rows[0].analyse;

    // Détails par type
    const theoriqueResult = await pool.query(`
      SELECT type_cout, SUM(montant_theorique) as montant
      FROM couts_theoriques
      WHERE id_of = $1
      GROUP BY type_cout
    `, [id_of]);

    const reelResult = await pool.query(`
      SELECT type_cout, SUM(montant_reel) as montant
      FROM couts_reels
      WHERE id_of = $1
      GROUP BY type_cout
    `, [id_of]);

    const details = {};
    const types = new Set([...theoriqueResult.rows.map(r => r.type_cout), ...reelResult.rows.map(r => r.type_cout)]);
    
    types.forEach(type => {
      const theorique = theoriqueResult.rows.find(r => r.type_cout === type);
      const reel = reelResult.rows.find(r => r.type_cout === type);
      details[type] = {
        theorique: parseFloat(theorique?.montant || 0),
        reel: parseFloat(reel?.montant || 0),
        ecart: parseFloat(reel?.montant || 0) - parseFloat(theorique?.montant || 0)
      };
    });

    res.json({
      success: true,
      data: {
        ...analyse,
        details
      }
    });
  } catch (error) {
    console.error('Erreur analyserEcarts:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
