import { pool } from '../utils/db.js';

// GET /api/matieres-premieres - Liste des matières premières
export const getMatieresPremieres = async (req, res) => {
  try {
    const { search, type_mp, actif } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          matieres: [
            {
              id_mp: 1,
              code_mp: 'FIL-COT-001',
              designation: 'Fil Coton 100% - Ne 30/1',
              type_mp: 'FIL_COTON',
              fournisseur: 'Fournisseur Textile SARL',
              couleur: 'Blanc',
              prix_unitaire: 15.50,
              stock_disponible: 500,
              stock_minimum: 100,
              stock_alerte: 150,
              actif: true
            },
            {
              id_mp: 2,
              code_mp: 'FIL-POLY-001',
              designation: 'Fil Polyester - Ne 50/1',
              type_mp: 'FIL_POLY',
              fournisseur: 'Fournisseur Textile SARL',
              couleur: 'Blanc',
              prix_unitaire: 12.00,
              stock_disponible: 300,
              stock_minimum: 80,
              stock_alerte: 120,
              actif: true
            }
          ],
          total: 2
        }
      });
    }

    let query = `
      SELECT 
        mp.id_mp,
        mp.code_mp,
        mp.designation,
        mp.composition,
        mp.couleur,
        mp.prix_unitaire,
        mp.stock_minimum,
        mp.stock_alerte,
        mp.delai_approvisionnement,
        mp.actif,
        tmp.code_type as type_mp,
        tmp.libelle as type_mp_libelle,
        f.code_fournisseur,
        f.raison_sociale as fournisseur,
        COALESCE(sm.quantite_disponible, 0) as stock_disponible,
        COALESCE(sm.quantite_reservee, 0) as stock_reserve,
        mp.date_creation
      FROM matieres_premieres mp
      LEFT JOIN types_mp tmp ON mp.id_type_mp = tmp.id_type_mp
      LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
      LEFT JOIN stock_mp sm ON mp.id_mp = sm.id_mp
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (mp.code_mp ILIKE $${paramIndex} OR mp.designation ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type_mp) {
      query += ` AND tmp.code_type = $${paramIndex}`;
      params.push(type_mp);
      paramIndex++;
    }

    if (actif !== undefined) {
      query += ` AND mp.actif = $${paramIndex}`;
      params.push(actif === 'true');
      paramIndex++;
    }

    query += ` ORDER BY mp.code_mp LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        matieres: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getMatieresPremieres:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/matieres-premieres/:id - Détails d'une matière première
export const getMatierePremiere = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_mp: parseInt(id),
          code_mp: 'FIL-COT-001',
          designation: 'Fil Coton 100% - Ne 30/1',
          type_mp: 'FIL_COTON',
          fournisseur: 'Fournisseur Textile SARL',
          couleur: 'Blanc',
          prix_unitaire: 15.50,
          stock_disponible: 500,
          stock_minimum: 100,
          stock_alerte: 150,
          actif: true
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        mp.*,
        tmp.code_type as type_mp,
        tmp.libelle as type_mp_libelle,
        f.code_fournisseur,
        f.raison_sociale as fournisseur,
        COALESCE(sm.quantite_disponible, 0) as stock_disponible,
        COALESCE(sm.quantite_reservee, 0) as stock_reserve
      FROM matieres_premieres mp
      LEFT JOIN types_mp tmp ON mp.id_type_mp = tmp.id_type_mp
      LEFT JOIN fournisseurs f ON mp.id_fournisseur = f.id_fournisseur
      LEFT JOIN stock_mp sm ON mp.id_mp = sm.id_mp
      WHERE mp.id_mp = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Matière première non trouvée' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getMatierePremiere:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/matieres-premieres - Créer une matière première
export const createMatierePremiere = async (req, res) => {
  try {
    const {
      code_mp, designation, id_type_mp, id_fournisseur,
      composition, couleur, prix_unitaire, stock_minimum,
      stock_alerte, delai_approvisionnement
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_mp: Math.floor(Math.random() * 1000),
          code_mp,
          designation,
          message: 'Matière première créée (mode mock)'
        }
      });
    }

    const result = await pool.query(`
      INSERT INTO matieres_premieres (
        code_mp, designation, id_type_mp, id_fournisseur,
        composition, couleur, prix_unitaire, stock_minimum,
        stock_alerte, delai_approvisionnement, actif
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *
    `, [
      code_mp, designation, id_type_mp, id_fournisseur,
      composition, couleur, prix_unitaire, stock_minimum,
      stock_alerte, delai_approvisionnement
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createMatierePremiere:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/matieres-premieres/:id - Mettre à jour une matière première
export const updateMatierePremiere = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Matière première mise à jour (mode mock)' }
      });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id_mp') {
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
      UPDATE matieres_premieres 
      SET ${fields.join(', ')}, date_modification = CURRENT_TIMESTAMP
      WHERE id_mp = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Matière première non trouvée' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateMatierePremiere:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/matieres-premieres/types - Types de matières premières
export const getTypesMP = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id_type_mp: 1, code_type: 'FIL_COTON', libelle: 'Fil Coton' },
          { id_type_mp: 2, code_type: 'FIL_POLY', libelle: 'Fil Polyester' },
          { id_type_mp: 3, code_type: 'FIL_TISSU', libelle: 'Fil Tissu' }
        ]
      });
    }

    const result = await pool.query(`
      SELECT id_type_mp, code_type, libelle, description
      FROM types_mp
      WHERE actif = true
      ORDER BY libelle
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getTypesMP:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
