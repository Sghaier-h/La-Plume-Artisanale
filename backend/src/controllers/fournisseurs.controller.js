import { pool } from '../utils/db.js';

// GET /api/fournisseurs - Liste des fournisseurs
export const getFournisseurs = async (req, res) => {
  try {
    const { search, actif } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          fournisseurs: [
            {
              id_fournisseur: 1,
              code_fournisseur: 'FOUR001',
              raison_sociale: 'Fournisseur Textile SARL',
              ville: 'Sfax',
              telephone: '+216 74 987 654',
              email: 'contact@fournisseur-textile.tn',
              actif: true
            }
          ],
          total: 1
        }
      });
    }

    let query = `SELECT * FROM fournisseurs WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (code_fournisseur ILIKE $${paramIndex} OR raison_sociale ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (actif !== undefined) {
      query += ` AND actif = $${paramIndex}`;
      params.push(actif === 'true');
      paramIndex++;
    }

    query += ` ORDER BY raison_sociale LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        fournisseurs: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getFournisseurs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/fournisseurs/:id - Détails d'un fournisseur
export const getFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_fournisseur: parseInt(id),
          code_fournisseur: 'FOUR001',
          raison_sociale: 'Fournisseur Textile SARL',
          actif: true
        }
      });
    }

    const result = await pool.query('SELECT * FROM fournisseurs WHERE id_fournisseur = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Fournisseur non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getFournisseur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/fournisseurs - Créer un fournisseur
export const createFournisseur = async (req, res) => {
  try {
    const {
      code_fournisseur, raison_sociale, adresse, code_postal, ville, pays,
      telephone, email, contact_principal, delai_livraison_moyen,
      conditions_paiement, devise
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_fournisseur: Math.floor(Math.random() * 1000),
          code_fournisseur,
          message: 'Fournisseur créé (mode mock)'
        }
      });
    }

    const result = await pool.query(`
      INSERT INTO fournisseurs (
        code_fournisseur, raison_sociale, adresse, code_postal, ville, pays,
        telephone, email, contact_principal, delai_livraison_moyen,
        conditions_paiement, devise, actif
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      RETURNING *
    `, [
      code_fournisseur, raison_sociale, adresse, code_postal, ville, pays,
      telephone, email, contact_principal, delai_livraison_moyen,
      conditions_paiement, devise || 'TND'
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createFournisseur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/fournisseurs/:id - Mettre à jour un fournisseur
export const updateFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Fournisseur mis à jour (mode mock)' }
      });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id_fournisseur') {
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
      UPDATE fournisseurs 
      SET ${fields.join(', ')}
      WHERE id_fournisseur = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Fournisseur non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateFournisseur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
