import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';

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

// GET /api/multisociete/societes/:id - Récupérer une société
export const getSociete = async (req, res) => {
  try {
    const { id } = req.params;
    // Valider que l'ID est un nombre
    const societeId = parseInt(id, 10);
    if (isNaN(societeId)) {
      return res.status(400).json({ success: false, error: { message: 'ID invalide. Un nombre est attendu.' } });
    }
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_societe: parseInt(id),
          code_societe: 'SOC001',
          raison_sociale: 'La Plume Artisanale',
          actif: true
        }
      });
    }

    const result = await pool.query('SELECT * FROM societes WHERE id_societe = $1', [societeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Société non trouvée' } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erreur getSociete:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/multisociete/societes - Créer société
export const createSociete = async (req, res) => {
  try {
    const userId = req.user?.id_utilisateur || req.user?.id;
    const {
      code_societe, raison_sociale, nom_commercial, forme_juridique,
      siret, siren, rcs, rcs_ville, tva_intracommunautaire,
      logo_path, photo_path,
      adresse_siege, code_postal_siege, ville_siege, pays_siege,
      telephone_siege, fax_siege, email_siege, site_web,
      comptable_nom, comptable_prenom, comptable_societe,
      comptable_email, comptable_telephone, comptable_adresse,
      comptable_code_postal, comptable_ville,
      banque_nom, banque_code_guichet, banque_numero_compte,
      banque_cle_rib, banque_iban, banque_bic,
      regime_fiscal, periode_fiscale, date_creation_societe,
      date_debut_exercice, date_fin_exercice, capital_social, devise_capital,
      activite_principale, activite_secondaire, secteur_activite, nombre_salaries,
      societe_mere_id, est_societe_mere,
      devise_principale, langue_principale, fuseau_horaire,
      actif
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
        siret, siren, rcs, rcs_ville, tva_intracommunautaire,
        logo_path, photo_path,
        adresse_siege, code_postal_siege, ville_siege, pays_siege,
        telephone_siege, fax_siege, email_siege, site_web,
        comptable_nom, comptable_prenom, comptable_societe,
        comptable_email, comptable_telephone, comptable_adresse,
        comptable_code_postal, comptable_ville,
        banque_nom, banque_code_guichet, banque_numero_compte,
        banque_cle_rib, banque_iban, banque_bic,
        regime_fiscal, periode_fiscale, date_creation_societe,
        date_debut_exercice, date_fin_exercice, capital_social, devise_capital,
        activite_principale, activite_secondaire, secteur_activite, nombre_salaries,
        societe_mere_id, est_societe_mere,
        devise_principale, langue_principale, fuseau_horaire,
        actif, cree_par
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
        $42, $43, $44, $45, $46, $47, $48, $49
      )
      RETURNING *
    `, [
      code_societe, raison_sociale, nom_commercial, forme_juridique,
      siret, siren, rcs, rcs_ville, tva_intracommunautaire,
      logo_path, photo_path,
      adresse_siege, code_postal_siege, ville_siege, pays_siege || 'France',
      telephone_siege, fax_siege, email_siege, site_web,
      comptable_nom, comptable_prenom, comptable_societe,
      comptable_email, comptable_telephone, comptable_adresse,
      comptable_code_postal, comptable_ville,
      banque_nom, banque_code_guichet, banque_numero_compte,
      banque_cle_rib, banque_iban, banque_bic,
      regime_fiscal, periode_fiscale, date_creation_societe,
      date_debut_exercice, date_fin_exercice, capital_social, devise_capital || 'EUR',
      activite_principale, activite_secondaire, secteur_activite, nombre_salaries,
      societe_mere_id, est_societe_mere || false,
      devise_principale || 'EUR', langue_principale || 'fr_FR', fuseau_horaire || 'Europe/Paris',
      actif !== false, userId
    ]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erreur createSociete:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// PUT /api/multisociete/societes/:id - Mettre à jour une société
export const updateSociete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id_utilisateur || req.user?.id;
    const updateData = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Société mise à jour (mode mock)' }
      });
    }

    // Construire dynamiquement la requête UPDATE
    const fields = Object.keys(updateData).filter(key => 
      key !== 'id' && key !== 'id_societe' && key !== 'date_creation' && key !== 'cree_par'
    );
    
    if (fields.length === 0) {
      return res.json({ success: true, data: { message: 'Aucune modification' } });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const values = fields.map(field => updateData[field]);
    values.push(id);

    const result = await pool.query(`
      UPDATE societes 
      SET ${setClause}, modifie_par = $${values.length}, date_modification = CURRENT_TIMESTAMP
      WHERE id_societe = $${values.length}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Société non trouvée' } });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erreur updateSociete:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// DELETE /api/multisociete/societes/:id - Supprimer une société
export const deleteSociete = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Société supprimée (mode mock)' }
      });
    }

    const result = await pool.query(
      'UPDATE societes SET actif = FALSE WHERE id_societe = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { message: 'Société non trouvée' } });
    }

    res.json({ success: true, data: { message: 'Société supprimée' } });
  } catch (error) {
    console.error('Erreur deleteSociete:', error);
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
