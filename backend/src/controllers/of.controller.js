import { pool } from '../utils/db.js';
import QRCode from 'qrcode';

// GET /api/of - Liste tous les OF
export const getOFs = async (req, res) => {
  try {
    const { search, statut, article_id, date_debut, date_fin } = req.query;
    
    let query = `
      SELECT 
        of.id_of,
        of.numero_of,
        of.id_article_commande,
        of.id_article,
        a.code_article,
        a.designation as article_designation,
        of.quantite_a_produire,
        of.quantite_produite,
        of.unite,
        of.date_creation_of,
        of.date_debut_prevue,
        of.date_fin_prevue,
        of.date_debut_reelle,
        of.date_fin_reelle,
        of.priorite,
        of.statut,
        of.temps_production_estime,
        of.temps_production_reel,
        of.cout_estime,
        of.cout_reel,
        of.observations
      FROM ordres_fabrication of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (of.numero_of ILIKE $${paramCount} OR a.code_article ILIKE $${paramCount} OR a.designation ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (statut) {
      paramCount++;
      query += ` AND of.statut = $${paramCount}`;
      params.push(statut);
    }

    if (article_id) {
      paramCount++;
      query += ` AND of.id_article = $${paramCount}`;
      params.push(article_id);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND of.date_creation_of >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND of.date_creation_of <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY of.date_creation_of DESC`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getOFs:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/of/:id - Détails d'un OF
export const getOF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const of = await pool.query(
      `SELECT 
        of.*,
        a.code_article,
        a.designation as article_designation,
        ac.id_commande,
        c.numero_commande
      FROM ordres_fabrication of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      LEFT JOIN articles_commande ac ON of.id_article_commande = ac.id_article_commande
      LEFT JOIN commandes c ON ac.id_commande = c.id_commande
      WHERE of.id_of = $1`,
      [id]
    );

    if (of.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    // Récupérer le planning (machines assignées)
    const planning = await pool.query(
      `SELECT 
        pm.*,
        m.numero_machine,
        m.marque,
        m.modele,
        e.nom as operateur_nom,
        e.prenom as operateur_prenom
      FROM planning_machines pm
      LEFT JOIN machines m ON pm.id_machine = m.id_machine
      LEFT JOIN equipe_fabrication e ON pm.id_operateur = e.id_operateur
      WHERE pm.id_of = $1
      ORDER BY pm.date_debut_prevue`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...of.rows[0],
        planning: planning.rows
      }
    });
  } catch (error) {
    console.error('Erreur getOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/of - Créer un OF
export const createOF = async (req, res) => {
  try {
    const {
      id_article_commande,
      id_article,
      quantite_a_produire,
      date_debut_prevue,
      date_fin_prevue,
      priorite = 'normale',
      observations
    } = req.body;

    // Validation
    if (!id_article || !quantite_a_produire) {
      return res.status(400).json({
        success: false,
        error: { message: 'Article et quantité requis' }
      });
    }

    // Vérifier que l'article existe
    const article = await pool.query(
      'SELECT id_article, temps_production_standard FROM articles_catalogue WHERE id_article = $1',
      [id_article]
    );

    if (article.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Article non trouvé' }
      });
    }

    // Générer le numéro OF
    const count = await pool.query('SELECT COUNT(*) as count FROM ordres_fabrication WHERE date_creation_of >= CURRENT_DATE');
    const numero = `OF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    // Calculer le temps estimé
    const tempsStandard = article.rows[0].temps_production_standard || 0;
    const tempsEstime = tempsStandard * quantite_a_produire;

    // Générer le QR code
    const qrCodeData = await QRCode.toDataURL(numero);

    const result = await pool.query(
      `INSERT INTO ordres_fabrication 
        (numero_of, id_article_commande, id_article, quantite_a_produire, 
         unite, date_debut_prevue, date_fin_prevue, priorite, 
         statut, temps_production_estime, qr_code_of, observations, cree_par)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        numero, id_article_commande || null, id_article, quantite_a_produire,
        'mètre', date_debut_prevue || null, date_fin_prevue || null,
        priorite, 'planifie', tempsEstime, qrCodeData, observations || null,
        req.user?.id || null
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/of/:id - Modifier un OF
export const updateOF = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si l'OF existe
    const existing = await pool.query(
      'SELECT id_of, statut FROM ordres_fabrication WHERE id_of = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    // Ne pas modifier un OF en cours ou terminé
    if (['en_cours', 'termine'].includes(existing.rows[0].statut) && updateData.statut) {
      return res.status(400).json({
        success: false,
        error: { message: 'Impossible de modifier un OF en cours ou terminé' }
      });
    }

    // Construire la requête dynamique
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucune donnée à mettre à jour' }
      });
    }

    values.push(id);
    paramCount++;
    
    const result = await pool.query(
      `UPDATE ordres_fabrication 
      SET ${fields.join(', ')}, date_modification = CURRENT_TIMESTAMP
      WHERE id_of = $${paramCount}
      RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/of/:id/assigner-machine - Assigner une machine à un OF
export const assignerMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_machine, date_debut_prevue, date_fin_prevue, id_operateur } = req.body;

    // Validation
    if (!id_machine || !date_debut_prevue || !date_fin_prevue) {
      return res.status(400).json({
        success: false,
        error: { message: 'Machine et dates requises' }
      });
    }

    // Vérifier que l'OF existe
    const of = await pool.query(
      'SELECT id_of, statut FROM ordres_fabrication WHERE id_of = $1',
      [id]
    );

    if (of.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    // Vérifier que la machine existe
    const machine = await pool.query(
      'SELECT id_machine FROM machines WHERE id_machine = $1 AND actif = true',
      [id_machine]
    );

    if (machine.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Machine non trouvée ou inactive' }
      });
    }

    // Créer ou mettre à jour le planning
    const existing = await pool.query(
      'SELECT id_planning FROM planning_machines WHERE id_of = $1 AND id_machine = $2',
      [id, id_machine]
    );

    let result;
    if (existing.rows.length > 0) {
      result = await pool.query(
        `UPDATE planning_machines 
        SET date_debut_prevue = $1, date_fin_prevue = $2, id_operateur = $3
        WHERE id_planning = $4
        RETURNING *`,
        [date_debut_prevue, date_fin_prevue, id_operateur || null, existing.rows[0].id_planning]
      );
    } else {
      result = await pool.query(
        `INSERT INTO planning_machines 
          (id_machine, id_of, date_debut_prevue, date_fin_prevue, id_operateur, statut)
        VALUES ($1, $2, $3, $4, $5, 'planifie')
        RETURNING *`,
        [id_machine, id, date_debut_prevue, date_fin_prevue, id_operateur || null]
      );
    }

    // Mettre à jour le statut de l'OF
    if (of.rows[0].statut === 'planifie') {
      await pool.query(
        'UPDATE ordres_fabrication SET statut = $1 WHERE id_of = $2',
        ['attribue', id]
      );
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur assignerMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/of/:id/demarrer - Démarrer un OF
export const demarrerOF = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE ordres_fabrication 
      SET statut = 'en_cours', 
          date_debut_reelle = CURRENT_TIMESTAMP
      WHERE id_of = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    // Mettre à jour le planning
    await pool.query(
      `UPDATE planning_machines 
      SET statut = 'en_cours', date_debut_reelle = CURRENT_TIMESTAMP
      WHERE id_of = $1`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur demarrerOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/of/:id/terminer - Terminer un OF
export const terminerOF = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantite_produite } = req.body;

    const result = await pool.query(
      `UPDATE ordres_fabrication 
      SET statut = 'termine', 
          date_fin_reelle = CURRENT_TIMESTAMP,
          quantite_produite = COALESCE($1, quantite_produite)
      WHERE id_of = $2
      RETURNING *`,
      [quantite_produite || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'OF non trouvé' }
      });
    }

    // Mettre à jour le planning
    await pool.query(
      `UPDATE planning_machines 
      SET statut = 'termine', date_fin_reelle = CURRENT_TIMESTAMP
      WHERE id_of = $1`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur terminerOF:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
