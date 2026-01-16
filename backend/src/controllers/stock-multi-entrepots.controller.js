import { pool } from '../utils/db.js';

// GET /api/stock-multi-entrepots/entrepots - Liste des entrepôts
export const getEntrepots = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          { id_entrepot: 1, code: 'E1', libelle: 'Entrepôt 1', type: 'stockage', actif: true },
          { id_entrepot: 2, code: 'E2', libelle: 'Entrepôt 2', type: 'stockage', actif: true },
          { id_entrepot: 3, code: 'E3', libelle: 'Entrepôt 3', type: 'stockage', actif: true },
          { id_entrepot: 4, code: 'USINE', libelle: 'Usine', type: 'production', actif: true },
          { id_entrepot: 5, code: 'FAB', libelle: 'Fabrication', type: 'production', actif: true }
        ]
      });
    }

    const result = await pool.query(`
      SELECT * FROM entrepots WHERE actif = true ORDER BY code
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    if (error.code === '42P01') {
      // Table n'existe pas encore, retourner données mock
      return res.json({
        success: true,
        data: [
          { id_entrepot: 1, code: 'E1', libelle: 'Entrepôt 1', type: 'stockage', actif: true },
          { id_entrepot: 2, code: 'E2', libelle: 'Entrepôt 2', type: 'stockage', actif: true },
          { id_entrepot: 3, code: 'E3', libelle: 'Entrepôt 3', type: 'stockage', actif: true },
          { id_entrepot: 4, code: 'USINE', libelle: 'Usine', type: 'production', actif: true },
          { id_entrepot: 5, code: 'FAB', libelle: 'Fabrication', type: 'production', actif: true }
        ]
      });
    }
    console.error('Erreur getEntrepots:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/stock-multi-entrepots/:entrepotId/stock - Stock d'un entrepôt
export const getStockEntrepot = async (req, res) => {
  try {
    const { entrepotId } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          entrepot: { id_entrepot: parseInt(entrepotId), code: 'E1' },
          stock: [
            { id_mp: 1, code_mp: 'FIL-001', designation: 'Fil Rouge', quantite: 500, unite: 'kg' }
          ]
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        s.id_stock,
        s.id_mp,
        mp.code_mp,
        mp.designation,
        s.quantite_disponible as quantite,
        mp.unite_achat as unite
      FROM stock_entrepots s
      LEFT JOIN matieres_premieres mp ON s.id_mp = mp.id_mp
      WHERE s.id_entrepot = $1 AND s.quantite_disponible > 0
      ORDER BY mp.designation
    `, [entrepotId]);

    const entrepotResult = await pool.query('SELECT * FROM entrepots WHERE id_entrepot = $1', [entrepotId]);

    res.json({
      success: true,
      data: {
        entrepot: entrepotResult.rows[0] || {},
        stock: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getStockEntrepot:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/stock-multi-entrepots/transfert - Demander un transfert entre entrepôts
export const demanderTransfert = async (req, res) => {
  try {
    const { id_mp, id_entrepot_source, id_entrepot_destination, quantite, raison } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_transfert: Math.floor(Math.random() * 1000),
          numero_transfert: 'TRF-MOCK-001',
          message: 'Transfert demandé (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Vérifier le stock disponible
      const stockResult = await client.query(`
        SELECT quantite_disponible FROM stock_entrepots
        WHERE id_mp = $1 AND id_entrepot = $2
      `, [id_mp, id_entrepot_source]);

      if (stockResult.rows.length === 0 || stockResult.rows[0].quantite_disponible < quantite) {
        throw new Error('Stock insuffisant dans l\'entrepôt source');
      }

      // Créer la demande de transfert
      const transfertResult = await client.query(`
        INSERT INTO transferts_entrepots (
          numero_transfert, id_mp, id_entrepot_source, id_entrepot_destination,
          quantite, raison, statut, date_demande
        ) VALUES (
          'TRF-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS') || '-' || LPAD(NEXTVAL('transferts_entrepots_id_transfert_seq')::TEXT, 4, '0'),
          $1, $2, $3, $4, $5, 'en_attente', CURRENT_TIMESTAMP
        ) RETURNING *
      `, [id_mp, id_entrepot_source, id_entrepot_destination, quantite, raison || '']);

      await client.query('COMMIT');

      res.json({
        success: true,
        data: transfertResult.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur demanderTransfert:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/stock-multi-entrepots/transfert/:id/valider - Valider un transfert
export const validerTransfert = async (req, res) => {
  try {
    const { id } = req.params;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Transfert validé (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Récupérer le transfert
      const transfertResult = await client.query('SELECT * FROM transferts_entrepots WHERE id_transfert = $1', [id]);
      if (transfertResult.rows.length === 0) {
        throw new Error('Transfert non trouvé');
      }

      const transfert = transfertResult.rows[0];
      if (transfert.statut !== 'en_attente') {
        throw new Error('Ce transfert a déjà été traité');
      }

      // Déduire du stock source
      await client.query(`
        UPDATE stock_entrepots
        SET quantite_disponible = quantite_disponible - $1
        WHERE id_mp = $2 AND id_entrepot = $3
      `, [transfert.quantite, transfert.id_mp, transfert.id_entrepot_source]);

      // Ajouter au stock destination
      await client.query(`
        INSERT INTO stock_entrepots (id_mp, id_entrepot, quantite_disponible)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_mp, id_entrepot)
        DO UPDATE SET quantite_disponible = stock_entrepots.quantite_disponible + $3
      `, [transfert.id_mp, transfert.id_entrepot_destination, transfert.quantite]);

      // Mettre à jour le statut
      await client.query(`
        UPDATE transferts_entrepots
        SET statut = 'valide', date_validation = CURRENT_TIMESTAMP
        WHERE id_transfert = $1
      `, [id]);

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'Transfert validé avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur validerTransfert:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// GET /api/stock-multi-entrepots/transferts - Liste des transferts
export const getTransferts = async (req, res) => {
  try {
    const { statut } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          transferts: [
            { id_transfert: 1, numero_transfert: 'TRF-001', statut: 'en_attente', quantite: 50 }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        t.*,
        mp.code_mp, mp.designation,
        e1.libelle as entrepot_source_libelle,
        e2.libelle as entrepot_destination_libelle
      FROM transferts_entrepots t
      LEFT JOIN matieres_premieres mp ON t.id_mp = mp.id_mp
      LEFT JOIN entrepots e1 ON t.id_entrepot_source = e1.id_entrepot
      LEFT JOIN entrepots e2 ON t.id_entrepot_destination = e2.id_entrepot
      WHERE 1=1
    `;
    const params = [];

    if (statut) {
      query += ` AND t.statut = $1`;
      params.push(statut);
    }

    query += ` ORDER BY t.date_demande DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        transferts: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getTransferts:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
