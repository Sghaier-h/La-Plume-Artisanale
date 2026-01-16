import { pool } from '../utils/db.js';

// GET /api/parametres-catalogue/dimensions - Liste des dimensions
export const getDimensions = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code: '1020', libelle: '100x200 cm', largeur: 100, longueur: 200, actif: true },
          { id: 2, code: '2426', libelle: '240x260 cm', largeur: 240, longueur: 260, actif: true },
          { id: 3, code: '160150', libelle: '160x150 cm', largeur: 160, longueur: 150, actif: true }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM parametres_dimensions
      WHERE actif = true
      ORDER BY code
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    // Si la table n'existe pas, retourner des données mock
    if (error.code === '42P01') {
      return res.json({
        success: true,
        data: [
          { id: 1, code: '1020', libelle: '100x200 cm', largeur: 100, longueur: 200, actif: true },
          { id: 2, code: '2426', libelle: '240x260 cm', largeur: 240, longueur: 260, actif: true }
        ]
      });
    }
    console.error('Erreur getDimensions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/parametres-catalogue/finitions - Liste des types de finition
export const getFinitions = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code: 'FR', libelle: 'Frange', description: 'Finition avec frange', actif: true },
          { id: 2, code: 'OR', libelle: 'Ourlet', description: 'Finition avec ourlet', actif: true },
          { id: 3, code: 'BR', libelle: 'Bordure', description: 'Finition avec bordure', actif: true }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM parametres_finitions
      WHERE actif = true
      ORDER BY libelle
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({
        success: true,
        data: [
          { id: 1, code: 'FR', libelle: 'Frange', actif: true },
          { id: 2, code: 'OR', libelle: 'Ourlet', actif: true }
        ]
      });
    }
    console.error('Erreur getFinitions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/parametres-catalogue/tissages - Liste des types de tissage
export const getTissages = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code: 'PL', libelle: 'Tissage Plat', description: 'Tissage plat standard', actif: true },
          { id: 2, code: 'JA', libelle: 'Jacquard', description: 'Tissage jacquard', actif: true },
          { id: 3, code: 'EP', libelle: 'Éponge', description: 'Tissage éponge', actif: true }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM parametres_tissages
      WHERE actif = true
      ORDER BY libelle
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({
        success: true,
        data: [
          { id: 1, code: 'PL', libelle: 'Tissage Plat', actif: true },
          { id: 2, code: 'JA', libelle: 'Jacquard', actif: true }
        ]
      });
    }
    console.error('Erreur getTissages:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/parametres-catalogue/couleurs - Liste des couleurs
export const getCouleurs = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code_commercial: 'C01', nom: 'BLANC', code_hex: '#FFFFFF', actif: true },
          { id: 2, code_commercial: 'C20', nom: 'ROUGE', code_hex: '#FF0000', actif: true },
          { id: 3, code_commercial: 'C15', nom: 'BLEU', code_hex: '#0000FF', actif: true },
          { id: 4, code_commercial: 'C32', nom: 'VERT', code_hex: '#00FF00', actif: true }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM parametres_couleurs
      WHERE actif = true
      ORDER BY code_commercial
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({
        success: true,
        data: [
          { id: 1, code_commercial: 'C01', nom: 'BLANC', actif: true },
          { id: 2, code_commercial: 'C20', nom: 'ROUGE', actif: true }
        ]
      });
    }
    console.error('Erreur getCouleurs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/parametres-catalogue/modeles - Liste des modèles
export const getModeles = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code_modele: 'AR', libelle: 'ARTHUR', description: 'Modèle Arthur', actif: true },
          { id: 2, code_modele: 'IB', libelle: 'IBIZA', description: 'Modèle Ibiza', actif: true },
          { id: 3, code_modele: 'PO', libelle: 'PONCHO', description: 'Modèle Poncho', actif: true },
          { id: 4, code_modele: 'NDL', libelle: 'ND LILI', description: 'Modèle ND Lili', actif: true }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM parametres_modeles
      WHERE actif = true
      ORDER BY libelle
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    if (error.code === '42P01') {
      return res.json({
        success: true,
        data: [
          { id: 1, code_modele: 'AR', libelle: 'ARTHUR', actif: true },
          { id: 2, code_modele: 'IB', libelle: 'IBIZA', actif: true }
        ]
      });
    }
    console.error('Erreur getModeles:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/parametres-catalogue/:type - Créer un paramètre
export const createParametre = async (req, res) => {
  try {
    const { type } = req.params;
    const data = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { id: Math.floor(Math.random() * 1000), message: 'Paramètre créé (mode mock)' }
      });
    }

    const tables = {
      dimensions: 'parametres_dimensions',
      finitions: 'parametres_finitions',
      tissages: 'parametres_tissages',
      couleurs: 'parametres_couleurs',
      modeles: 'parametres_modeles'
    };

    const table = tables[type];
    if (!table) {
      return res.status(400).json({
        success: false,
        error: { message: 'Type de paramètre invalide' }
      });
    }

    // Créer dynamiquement selon le type
    const fields = Object.keys(data).filter(k => k !== 'id');
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(`
      INSERT INTO ${table} (${fields.join(', ')}, actif)
      VALUES (${placeholders}, true)
      RETURNING *
    `, values);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createParametre:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/parametres-catalogue/:type/:id - Mettre à jour un paramètre
export const updateParametre = async (req, res) => {
  try {
    const { type, id } = req.params;
    const updates = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Paramètre mis à jour (mode mock)' }
      });
    }

    const tables = {
      dimensions: 'parametres_dimensions',
      finitions: 'parametres_finitions',
      tissages: 'parametres_tissages',
      couleurs: 'parametres_couleurs',
      modeles: 'parametres_modeles'
    };

    const table = tables[type];
    if (!table) {
      return res.status(400).json({
        success: false,
        error: { message: 'Type de paramètre invalide' }
      });
    }

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id') {
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
      UPDATE ${table} 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Paramètre non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateParametre:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
