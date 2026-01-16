import { pool } from '../utils/db.js';
import QRCode from 'qrcode';

// GET /api/tracabilite-lots - Liste des lots
export const getLots = async (req, res) => {
  try {
    const { search, id_mp, statut } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          lots: [
            { id_lot: 1, numero_lot: 'LOT-001', id_mp: 1, quantite: 100, qr_code: 'data:image/png;base64,...' }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        l.*,
        mp.code_mp, mp.designation as mp_designation,
        s.quantite_disponible, s.emplacement
      FROM lots_mp l
      LEFT JOIN matieres_premieres mp ON l.id_mp = mp.id_mp
      LEFT JOIN stock_mp s ON l.id_stock_mp = s.id_stock_mp
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (l.numero_lot ILIKE $${paramIndex} OR mp.code_mp ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (id_mp) {
      query += ` AND l.id_mp = $${paramIndex}`;
      params.push(id_mp);
      paramIndex++;
    }

    if (statut) {
      query += ` AND l.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    query += ` ORDER BY l.date_creation DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        lots: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getLots:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/tracabilite-lots - Créer un lot avec QR code
export const createLot = async (req, res) => {
  try {
    const { id_mp, id_stock_mp, quantite, date_reception, numero_bon_livraison } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_lot: Math.floor(Math.random() * 1000),
          numero_lot: 'LOT-MOCK-001',
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Générer le numéro de lot
      const numero_lot = `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      // Créer le lot
      const lotResult = await client.query(`
        INSERT INTO lots_mp (
          numero_lot, id_mp, id_stock_mp, quantite, date_reception,
          numero_bon_livraison, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, 'disponible')
        RETURNING *
      `, [numero_lot, id_mp, id_stock_mp, quantite, date_reception, numero_bon_livraison]);

      const lot = lotResult.rows[0];

      // Générer le QR code
      const qrData = JSON.stringify({
        type: 'lot_mp',
        id_lot: lot.id_lot,
        numero_lot: lot.numero_lot,
        id_mp: lot.id_mp,
        quantite: lot.quantite
      });

      const qrCodeDataURL = await QRCode.toDataURL(qrData);

      // Mettre à jour le lot avec le QR code
      await client.query(`
        UPDATE lots_mp SET qr_code = $1 WHERE id_lot = $2
      `, [qrCodeDataURL, lot.id_lot]);

      await client.query('COMMIT');

      res.json({
        success: true,
        data: {
          ...lot,
          qr_code: qrCodeDataURL
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createLot:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/tracabilite-lots/:id/qr-code - Obtenir le QR code d'un lot
export const getQRCodeLot = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
      });
    }

    const result = await pool.query('SELECT qr_code FROM lots_mp WHERE id_lot = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lot non trouvé' }
      });
    }

    res.json({
      success: true,
      data: {
        qr_code: result.rows[0].qr_code
      }
    });
  } catch (error) {
    console.error('Erreur getQRCodeLot:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/tracabilite-lots/:id/imprimer-etiquette - Générer une étiquette imprimable
export const genererEtiquette = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          etiquette: {
            numero_lot: 'LOT-MOCK-001',
            qr_code: 'data:image/png;base64,...',
            designation: 'Fil Rouge',
            quantite: 100
          }
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        l.*,
        mp.code_mp, mp.designation
      FROM lots_mp l
      LEFT JOIN matieres_premieres mp ON l.id_mp = mp.id_mp
      WHERE l.id_lot = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lot non trouvé' }
      });
    }

    const lot = result.rows[0];

    res.json({
      success: true,
      data: {
        etiquette: {
          numero_lot: lot.numero_lot,
          qr_code: lot.qr_code,
          designation: lot.designation,
          code_mp: lot.code_mp,
          quantite: lot.quantite,
          date_reception: lot.date_reception
        }
      }
    });
  } catch (error) {
    console.error('Erreur genererEtiquette:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
