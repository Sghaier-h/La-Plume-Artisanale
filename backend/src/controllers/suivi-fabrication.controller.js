import { pool } from '../utils/db.js';

// GET /api/suivi-fabrication - Liste des suivis de fabrication
export const getSuivisFabrication = async (req, res) => {
  try {
    const { of_id, machine_id, statut, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          suivis: [
            {
              id_suivi: 1,
              numero_suivi: 'SUIVI-001',
              numero_of: 'OF-20240101-0001',
              code_machine: 'MET001',
              operateur: 'Tisseur 1',
              date_debut: new Date().toISOString(),
              quantite_produite: 150,
              quantite_bonne: 145,
              quantite_rebut: 5,
              rendement: 96.67,
              statut: 'en_cours'
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        sf.id_suivi,
        sf.numero_suivi,
        sf.date_debut,
        sf.date_fin,
        sf.quantite_produite,
        sf.quantite_bonne,
        sf.quantite_rebut,
        sf.quantite_2eme_choix,
        sf.temps_production,
        sf.temps_arret,
        sf.vitesse_moyenne,
        sf.rendement,
        sf.trs,
        sf.statut,
        sf.observations,
        of.numero_of,
        of.quantite_a_produire,
        of.quantite_produite as of_quantite_produite,
        m.code_machine,
        m.designation as machine_designation,
        e.nom as operateur_nom,
        e.prenom as operateur_prenom,
        a.code_article,
        a.designation as article_designation
      FROM suivi_fabrication sf
      LEFT JOIN ordres_fabrication of ON sf.id_of = of.id_of
      LEFT JOIN machines m ON sf.id_machine = m.id_machine
      LEFT JOIN equipe_fabrication e ON sf.id_operateur = e.id_operateur
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (of_id) {
      query += ` AND sf.id_of = $${paramIndex}`;
      params.push(of_id);
      paramIndex++;
    }

    if (machine_id) {
      query += ` AND sf.id_machine = $${paramIndex}`;
      params.push(machine_id);
      paramIndex++;
    }

    if (statut) {
      query += ` AND sf.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (date_debut) {
      query += ` AND DATE(sf.date_debut) >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }

    if (date_fin) {
      query += ` AND DATE(sf.date_debut) <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    query += ` ORDER BY sf.date_debut DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        suivis: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getSuivisFabrication:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/suivi-fabrication/:id - Détails d'un suivi
export const getSuiviFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_suivi: parseInt(id),
          numero_suivi: 'SUIVI-001',
          numero_of: 'OF-20240101-0001',
          code_machine: 'MET001',
          operateur: 'Tisseur 1',
          date_debut: new Date().toISOString(),
          quantite_produite: 150,
          quantite_bonne: 145,
          quantite_rebut: 5,
          rendement: 96.67,
          statut: 'en_cours'
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        sf.*,
        of.numero_of,
        of.quantite_a_produire,
        m.code_machine,
        e.nom as operateur_nom,
        e.prenom as operateur_prenom
      FROM suivi_fabrication sf
      LEFT JOIN ordres_fabrication of ON sf.id_of = of.id_of
      LEFT JOIN machines m ON sf.id_machine = m.id_machine
      LEFT JOIN equipe_fabrication e ON sf.id_operateur = e.id_operateur
      WHERE sf.id_suivi = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Suivi non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getSuiviFabrication:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/suivi-fabrication - Créer un suivi de fabrication
export const createSuiviFabrication = async (req, res) => {
  try {
    const {
      id_of, id_machine, id_operateur, date_debut,
      quantite_produite, quantite_bonne, quantite_rebut,
      temps_production, observations
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_suivi: Math.floor(Math.random() * 1000),
          numero_suivi: `SUIVI-${Date.now()}`,
          message: 'Suivi créé (mode mock)'
        }
      });
    }

    const numero_suivi = `SUIVI-${Date.now()}`;
    const rendement = quantite_produite > 0 && quantite_bonne > 0
      ? (quantite_bonne / quantite_produite) * 100 
      : 0;

    const result = await pool.query(`
      INSERT INTO suivi_fabrication (
        numero_suivi, id_of, id_machine, id_operateur,
        date_debut, quantite_produite, quantite_bonne,
        quantite_rebut, temps_production, rendement,
        statut, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'en_cours', $11)
      RETURNING *
    `, [
      numero_suivi, id_of, id_machine, id_operateur,
      date_debut, quantite_produite, quantite_bonne,
      quantite_rebut, temps_production, rendement, observations
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createSuiviFabrication:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/suivi-fabrication/:id - Mettre à jour un suivi
export const updateSuiviFabrication = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Suivi mis à jour (mode mock)' }
      });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id_suivi') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucun champ à mettre à jour' }
      });
    }

    values.push(id);
    const result = await pool.query(`
      UPDATE suivi_fabrication 
      SET ${fields.join(', ')}
      WHERE id_suivi = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Suivi non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateSuiviFabrication:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/suivi-fabrication/of/:of_id/avancement - Avancement d'un OF
export const getAvancementOF = async (req, res) => {
  try {
    const { of_id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          of_id: parseInt(of_id),
          quantite_a_produire: 1000,
          quantite_produite: 750,
          quantite_bonne: 720,
          quantite_rebut: 30,
          pourcentage_avancement: 75,
          reste_a_produire: 250,
          suivis: []
        }
      });
    }

    const ofResult = await pool.query(`
      SELECT quantite_a_produire, quantite_produite
      FROM ordres_fabrication
      WHERE id_of = $1
    `, [of_id]);

    if (ofResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    const of = ofResult.rows[0];
    const suivisResult = await pool.query(`
      SELECT 
        sf.*,
        m.code_machine,
        e.nom as operateur_nom
      FROM suivi_fabrication sf
      LEFT JOIN machines m ON sf.id_machine = m.id_machine
      LEFT JOIN equipe_fabrication e ON sf.id_operateur = e.id_operateur
      WHERE sf.id_of = $1
      ORDER BY sf.date_debut DESC
    `, [of_id]);

    const total_produit = suivisResult.rows.reduce((sum, s) => sum + parseFloat(s.quantite_produite || 0), 0);
    const total_bonne = suivisResult.rows.reduce((sum, s) => sum + parseFloat(s.quantite_bonne || 0), 0);
    const total_rebut = suivisResult.rows.reduce((sum, s) => sum + parseFloat(s.quantite_rebut || 0), 0);
    const quantite_a_produire = parseFloat(of.quantite_a_produire || 0);
    const pourcentage = quantite_a_produire > 0 ? (total_produit / quantite_a_produire) * 100 : 0;

    res.json({
      success: true,
      data: {
        of_id: parseInt(of_id),
        quantite_a_produire,
        quantite_produite: total_produit,
        quantite_bonne: total_bonne,
        quantite_rebut: total_rebut,
        pourcentage_avancement: pourcentage,
        reste_a_produire: Math.max(0, quantite_a_produire - total_produit),
        suivis: suivisResult.rows
      }
    });
  } catch (error) {
    console.error('Erreur getAvancementOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
