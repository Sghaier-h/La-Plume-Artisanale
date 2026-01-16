import { pool } from '../utils/db.js';

// GET /api/multisociete/societes - Liste sociétés
export const getSocietes = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          societes: [
            {
              id_societe: 1,
              code_societe: 'SOC001',
              raison_sociale: 'La Plume Artisanale',
              actif: true
            }
          ]
        }
      });
    }

    const result = await pool.query('SELECT * FROM societes WHERE actif = TRUE ORDER BY raison_sociale');
    res.json({ success: true, data: { societes: result.rows } });
  } catch (error) {
    console.error('Erreur getSocietes:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/multisociete/societes - Créer société
export const createSociete = async (req, res) => {
  try {
    const {
      code_societe, raison_sociale, nom_commercial, forme_juridique,
      capital_social, siret, siren, adresse_siege, code_postal_siege,
      ville_siege, telephone, email, devise
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_societe: Math.floor(Math.random() * 1000),
          message: 'Société créée (mode mock)'
        }
      });
    }

    const result = await pool.query(`
      INSERT INTO societes (
        code_societe, raison_sociale, nom_commercial, forme_juridique,
        capital_social, siret, siren, adresse_siege, code_postal_siege,
        ville_siege, telephone, email, devise
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      code_societe, raison_sociale, nom_commercial, forme_juridique,
      capital_social, siret, siren, adresse_siege, code_postal_siege,
      ville_siege, telephone, email, devise || 'TND'
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erreur createSociete:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// GET /api/multisociete/etablissements - Liste établissements
export const getEtablissements = async (req, res) => {
  try {
    const { id_societe } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_etablissement: 1,
            code_etablissement: 'ETAB-001',
            libelle: 'Siège Social',
            type_etablissement: 'SIEGE'
          }
        ]
      });
    }

    let query = `
      SELECT e.*, s.raison_sociale, u.nom_utilisateur as responsable_nom
      FROM etablissements e
      LEFT JOIN societes s ON e.id_societe = s.id_societe
      LEFT JOIN utilisateurs u ON e.id_responsable = u.id_utilisateur
      WHERE e.actif = TRUE
    `;
    const params = [];
    let paramIndex = 1;

    if (id_societe) {
      query += ` AND e.id_societe = $${paramIndex}`;
      params.push(id_societe);
      paramIndex++;
    }

    query += ` ORDER BY e.libelle`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getEtablissements:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/multisociete/transferts - Liste transferts inter-sociétés
export const getTransferts = async (req, res) => {
  try {
    const { id_societe_origine, id_societe_destination, statut } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_transfert: 1,
            numero_transfert: 'TRF-2024-000001',
            type_transfert: 'STOCK',
            statut: 'VALIDE'
          }
        ]
      });
    }

    let query = `
      SELECT t.*, 
             s1.raison_sociale as societe_origine_nom,
             s2.raison_sociale as societe_destination_nom
      FROM transferts_inter_societes t
      LEFT JOIN societes s1 ON t.id_societe_origine = s1.id_societe
      LEFT JOIN societes s2 ON t.id_societe_destination = s2.id_societe
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_societe_origine) {
      query += ` AND t.id_societe_origine = $${paramIndex}`;
      params.push(id_societe_origine);
      paramIndex++;
    }
    if (id_societe_destination) {
      query += ` AND t.id_societe_destination = $${paramIndex}`;
      params.push(id_societe_destination);
      paramIndex++;
    }
    if (statut) {
      query += ` AND t.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    query += ` ORDER BY t.date_transfert DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getTransferts:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/multisociete/transferts - Créer transfert
export const createTransfert = async (req, res) => {
  try {
    const {
      id_societe_origine, id_societe_destination, type_transfert,
      montant_ht, montant_ttc, motif
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_transfert: Math.floor(Math.random() * 1000),
          numero_transfert: 'TRF-2024-000001',
          message: 'Transfert créé (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Générer numéro
      const numeroResult = await client.query('SELECT generer_numero_transfert() as numero');
      const numero = numeroResult.rows[0].numero;

      const result = await client.query(`
        INSERT INTO transferts_inter_societes (
          numero_transfert, id_societe_origine, id_societe_destination,
          type_transfert, montant_ht, montant_ttc, motif, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'EN_ATTENTE')
        RETURNING *
      `, [numero, id_societe_origine, id_societe_destination, type_transfert, montant_ht, montant_ttc, motif]);

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createTransfert:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// GET /api/multisociete/consolidations - Liste consolidations
export const getConsolidations = async (req, res) => {
  try {
    const { type_consolidation, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_consolidation: 1,
            code_consolidation: 'CONS-2024-001',
            type_consolidation: 'VENTES',
            statut: 'CALCULEE'
          }
        ]
      });
    }

    let query = `SELECT * FROM consolidations WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (type_consolidation) {
      query += ` AND type_consolidation = $${paramIndex}`;
      params.push(type_consolidation);
      paramIndex++;
    }
    if (date_debut) {
      query += ` AND date_debut >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }
    if (date_fin) {
      query += ` AND date_fin <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    query += ` ORDER BY date_debut DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getConsolidations:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
