import { pool } from '../utils/db.js';

// GET /api/attributs-articles/dimensions - Liste des dimensions
export const getDimensions = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code: '1020', libelle: '100x200 cm', largeur: 100, longueur: 200 },
          { id: 2, code: '2426', libelle: '120x180 cm', largeur: 120, longueur: 180 }
        ]
      });
    }

    // Créer table si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dimensions_articles (
        id_dimension SERIAL PRIMARY KEY,
        code_dimension VARCHAR(20) UNIQUE NOT NULL,
        libelle VARCHAR(100) NOT NULL,
        largeur DECIMAL(10,2),
        longueur DECIMAL(10,2),
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      SELECT * FROM dimensions_articles WHERE actif = true ORDER BY code_dimension
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getDimensions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/attributs-articles/couleurs - Liste des couleurs
export const getCouleurs = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code_commercial: 'C01', nom: 'BLANC', code_hex: '#FFFFFF' },
          { id: 2, code_commercial: 'C20', nom: 'ROUGE', code_hex: '#FF0000' },
          { id: 3, code_commercial: 'C15', nom: 'BLEU', code_hex: '#0000FF' }
        ]
      });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS couleurs_articles (
        id_couleur SERIAL PRIMARY KEY,
        code_commercial VARCHAR(20) UNIQUE NOT NULL,
        nom VARCHAR(100) NOT NULL,
        code_hex VARCHAR(7),
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      SELECT * FROM couleurs_articles WHERE actif = true ORDER BY code_commercial
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getCouleurs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/attributs-articles/finitions - Liste des finitions
export const getFinitions = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id: 1, code: 'FR', libelle: 'Frange' },
          { id: 2, code: 'OR', libelle: 'Ourlet' }
        ]
      });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS finitions_articles (
        id_finition SERIAL PRIMARY KEY,
        code_finition VARCHAR(20) UNIQUE NOT NULL,
        libelle VARCHAR(100) NOT NULL,
        description TEXT,
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      SELECT * FROM finitions_articles WHERE actif = true ORDER BY libelle
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getFinitions:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/attributs-articles/dimensions - Créer une dimension
export const createDimension = async (req, res) => {
  try {
    const { code_dimension, libelle, largeur, longueur } = req.body;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { id: Math.floor(Math.random() * 1000), code_dimension, libelle }
      });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS dimensions_articles (
        id_dimension SERIAL PRIMARY KEY,
        code_dimension VARCHAR(20) UNIQUE NOT NULL,
        libelle VARCHAR(100) NOT NULL,
        largeur DECIMAL(10,2),
        longueur DECIMAL(10,2),
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      INSERT INTO dimensions_articles (code_dimension, libelle, largeur, longueur)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [code_dimension, libelle, largeur, longueur]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createDimension:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/attributs-articles/couleurs - Créer une couleur
export const createCouleur = async (req, res) => {
  try {
    const { code_commercial, nom, code_hex } = req.body;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { id: Math.floor(Math.random() * 1000), code_commercial, nom }
      });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS couleurs_articles (
        id_couleur SERIAL PRIMARY KEY,
        code_commercial VARCHAR(20) UNIQUE NOT NULL,
        nom VARCHAR(100) NOT NULL,
        code_hex VARCHAR(7),
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      INSERT INTO couleurs_articles (code_commercial, nom, code_hex)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [code_commercial, nom, code_hex]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createCouleur:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/attributs-articles/finitions - Créer une finition
export const createFinition = async (req, res) => {
  try {
    const { code_finition, libelle, description } = req.body;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { id: Math.floor(Math.random() * 1000), code_finition, libelle }
      });
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS finitions_articles (
        id_finition SERIAL PRIMARY KEY,
        code_finition VARCHAR(20) UNIQUE NOT NULL,
        libelle VARCHAR(100) NOT NULL,
        description TEXT,
        actif BOOLEAN DEFAULT true,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await pool.query(`
      INSERT INTO finitions_articles (code_finition, libelle, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [code_finition, libelle, description]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createFinition:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
