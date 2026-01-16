import { pool } from '../utils/db.js';

// GET /api/selecteurs-machines/:machineId - Obtenir la configuration sélecteurs d'une machine
export const getConfigSelecteursMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_machine: parseInt(machineId),
          selecteurs: [
            { position: 1, id_mp: 1, code_mp: 'FIL-001', designation: 'Fil Rouge', actif: true },
            { position: 2, id_mp: 2, code_mp: 'FIL-002', designation: 'Fil Blanc', actif: true },
            { position: 3, id_mp: null, code_mp: null, designation: null, actif: false },
          ]
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        csm.position,
        csm.id_mp,
        mp.code_mp,
        mp.designation,
        csm.actif
      FROM config_selecteurs_machines csm
      LEFT JOIN matieres_premieres mp ON csm.id_mp = mp.id_mp
      WHERE csm.id_machine = $1
      ORDER BY csm.position
    `, [machineId]);

    res.json({
      success: true,
      data: {
        id_machine: parseInt(machineId),
        selecteurs: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getConfigSelecteursMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/selecteurs-machines/:machineId - Mettre à jour la configuration sélecteurs
export const updateConfigSelecteursMachine = async (req, res) => {
  try {
    const { machineId } = req.params;
    const { selecteurs } = req.body; // [{ position, id_mp, actif }, ...]

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Configuration sélecteurs mise à jour (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Supprimer l'ancienne configuration
      await client.query('DELETE FROM config_selecteurs_machines WHERE id_machine = $1', [machineId]);

      // Insérer la nouvelle configuration
      for (const sel of selecteurs) {
        if (sel.id_mp) {
          await client.query(`
            INSERT INTO config_selecteurs_machines (id_machine, position, id_mp, actif)
            VALUES ($1, $2, $3, $4)
          `, [machineId, sel.position, sel.id_mp, sel.actif !== false]);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'Configuration sélecteurs mise à jour avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur updateConfigSelecteursMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/selecteurs-of/:ofId - Obtenir la configuration sélecteurs d'un OF
export const getConfigSelecteursOF = async (req, res) => {
  try {
    const { ofId } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_of: parseInt(ofId),
          selecteurs: [
            { position: 1, id_mp: 1, code_mp: 'FIL-001', quantite_kg: 0.24 },
            { position: 2, id_mp: 2, code_mp: 'FIL-002', quantite_kg: 0.11 },
          ]
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        cso.position,
        cso.id_mp,
        mp.code_mp,
        mp.designation,
        cso.quantite_kg
      FROM config_of_selecteurs cso
      LEFT JOIN matieres_premieres mp ON cso.id_mp = mp.id_mp
      WHERE cso.id_of = $1
      ORDER BY cso.position
    `, [ofId]);

    res.json({
      success: true,
      data: {
        id_of: parseInt(ofId),
        selecteurs: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getConfigSelecteursOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/selecteurs-of/:ofId - Mettre à jour la configuration sélecteurs d'un OF
export const updateConfigSelecteursOF = async (req, res) => {
  try {
    const { ofId } = req.params;
    const { selecteurs } = req.body; // [{ position, id_mp, quantite_kg }, ...]

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Configuration sélecteurs OF mise à jour (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Supprimer l'ancienne configuration
      await client.query('DELETE FROM config_of_selecteurs WHERE id_of = $1', [ofId]);

      // Insérer la nouvelle configuration
      for (const sel of selecteurs) {
        if (sel.id_mp) {
          await client.query(`
            INSERT INTO config_of_selecteurs (id_of, position, id_mp, quantite_kg)
            VALUES ($1, $2, $3, $4)
          `, [ofId, sel.position, sel.id_mp, sel.quantite_kg]);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'Configuration sélecteurs OF mise à jour avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur updateConfigSelecteursOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/selecteurs-of/:ofId/copier-depuis-bom - Copier la configuration depuis le BOM de l'article
export const copierSelecteursDepuisBOM = async (req, res) => {
  try {
    const { ofId } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Sélecteurs copiés depuis BOM (mode mock)' }
      });
    }

    // Récupérer l'OF et son article
    const ofResult = await pool.query(`
      SELECT id_article FROM ordres_fabrication WHERE id_of = $1
    `, [ofId]);

    if (ofResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    const id_article = ofResult.rows[0].id_article;

    // Récupérer la nomenclature de l'article
    const bomResult = await pool.query(`
      SELECT position, id_mp, quantite_kg
      FROM nomenclature_selecteurs
      WHERE id_article = $1
      ORDER BY position
    `, [id_article]);

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Supprimer l'ancienne configuration
      await client.query('DELETE FROM config_of_selecteurs WHERE id_of = $1', [ofId]);

      // Copier depuis le BOM
      for (const bom of bomResult.rows) {
        await client.query(`
          INSERT INTO config_of_selecteurs (id_of, position, id_mp, quantite_kg)
          VALUES ($1, $2, $3, $4)
        `, [ofId, bom.position, bom.id_mp, bom.quantite_kg]);
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: { message: 'Sélecteurs copiés depuis BOM avec succès' }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur copierSelecteursDepuisBOM:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
