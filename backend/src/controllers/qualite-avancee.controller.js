import { pool } from '../utils/db.js';

// GET /api/qualite-avancee/controles - Liste des contrôles qualité
export const getControles = async (req, res) => {
  try {
    const { ofId, statut } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          controles: [
            { id_controle: 1, id_of: 1, conformite: true, date_controle: new Date() }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        c.*,
        of.numero_of,
        m.numero_machine
      FROM controle_premiere_piece c
      LEFT JOIN ordres_fabrication of ON c.id_of = of.id_of
      LEFT JOIN machines m ON c.id_machine = m.id_machine
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (ofId) {
      query += ` AND c.id_of = $${paramIndex}`;
      params.push(ofId);
      paramIndex++;
    }

    if (statut !== undefined) {
      query += ` AND c.conformite = $${paramIndex}`;
      params.push(statut === 'true');
      paramIndex++;
    }

    query += ` ORDER BY c.date_controle DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        controles: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getControles:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/qualite-avancee/controle-premiere-piece - Enregistrer un contrôle première pièce
export const enregistrerControlePremierePiece = async (req, res) => {
  try {
    const {
      id_machine, id_of, id_operateur,
      poids_mesure, poids_attendu,
      largeur_mesure, largeur_attendue,
      densite_trame, densite_chaine,
      aspect_visuel, conformite, observations, actions_correctives
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_controle: Math.floor(Math.random() * 1000),
          message: 'Contrôle enregistré (mode mock)'
        }
      });
    }

    const ecart_poids = poids_mesure && poids_attendu ? poids_mesure - poids_attendu : null;
    const ecart_largeur = largeur_mesure && largeur_attendue ? largeur_mesure - largeur_attendue : null;

    const result = await pool.query(`
      INSERT INTO controle_premiere_piece (
        id_machine, id_of, id_operateur,
        poids_mesure, poids_attendu, ecart_poids,
        largeur_mesure, largeur_attendue, ecart_largeur,
        densite_trame, densite_chaine,
        aspect_visuel, conformite, observations, actions_correctives
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      id_machine, id_of, id_operateur,
      poids_mesure, poids_attendu, ecart_poids,
      largeur_mesure, largeur_attendue, ecart_largeur,
      densite_trame, densite_chaine,
      aspect_visuel, conformite, observations, actions_correctives
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur enregistrerControlePremierePiece:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/qualite-avancee/non-conformites - Liste des non-conformités
export const getNonConformites = async (req, res) => {
  try {
    const { statut, type } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          nonConformites: [
            { id_nc: 1, type_nc: 'ERR_COULEUR', statut: 'ouverte', date_creation: new Date() }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        nc.*,
        tnc.libelle as type_nc_libelle,
        of.numero_of
      FROM non_conformites nc
      LEFT JOIN types_non_conformites tnc ON nc.id_type_nc = tnc.id_type_nc
      LEFT JOIN ordres_fabrication of ON nc.id_of = of.id_of
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (statut) {
      query += ` AND nc.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (type) {
      query += ` AND tnc.code_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY nc.date_creation DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        nonConformites: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getNonConformites:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/qualite-avancee/non-conformites - Créer une non-conformité
export const createNonConformite = async (req, res) => {
  try {
    const {
      id_type_nc, id_of, id_lot_coupe,
      description, gravite, quantite_affectee,
      id_operateur_detecteur
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_nc: Math.floor(Math.random() * 1000),
          numero_nc: 'NC-MOCK-001',
          message: 'Non-conformité créée (mode mock)'
        }
      });
    }

    const numero_nc = `NC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const result = await pool.query(`
      INSERT INTO non_conformites (
        numero_nc, id_type_nc, id_of, id_lot_coupe,
        description, gravite, quantite_affectee,
        id_operateur_detecteur, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ouverte')
      RETURNING *
    `, [
      numero_nc, id_type_nc, id_of, id_lot_coupe,
      description, gravite, quantite_affectee,
      id_operateur_detecteur
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createNonConformite:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/qualite-avancee/non-conformites/:id/actions-correctives - Ajouter des actions correctives
export const ajouterActionsCorrectives = async (req, res) => {
  try {
    const { id } = req.params;
    const { actions_correctives, responsable, date_limite } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Actions correctives ajoutées (mode mock)' }
      });
    }

    const result = await pool.query(`
      UPDATE non_conformites
      SET 
        actions_correctives = $1,
        responsable_actions = $2,
        date_limite_actions = $3,
        date_modification = CURRENT_TIMESTAMP
      WHERE id_nc = $4
      RETURNING *
    `, [actions_correctives, responsable, date_limite, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Non-conformité non trouvée' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur ajouterActionsCorrectives:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
