import { pool } from '../utils/db.js';

// GET /api/soustraitants - Liste tous les sous-traitants
export const getSoustraitants = async (req, res) => {
  try {
    const { search, actif } = req.query;
    
    let query = `
      SELECT 
        id_sous_traitant,
        code_sous_traitant,
        raison_sociale,
        adresse,
        telephone,
        email,
        contact_principal,
        specialite,
        capacite_production,
        delai_moyen_jours,
        taux_qualite,
        actif,
        date_creation
      FROM sous_traitants
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (code_sous_traitant ILIKE $${paramCount} OR raison_sociale ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (actif !== undefined) {
      paramCount++;
      query += ` AND actif = $${paramCount}`;
      params.push(actif === 'true');
    }

    query += ` ORDER BY raison_sociale`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getSoustraitants:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/soustraitants/:id - Détails d'un sous-traitant
export const getSoustraitant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM sous_traitants WHERE id_sous_traitant = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sous-traitant non trouvé' }
      });
    }

    // Récupérer les mouvements en cours
    const mouvements = await pool.query(
      `SELECT 
        mst.*,
        of.numero_of,
        a.code_article,
        a.designation as article_designation
      FROM mouvements_sous_traitance mst
      LEFT JOIN ordres_fabrication of ON mst.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE mst.id_sous_traitant = $1
        AND mst.statut IN ('en_cours')
      ORDER BY mst.date_mouvement DESC`,
      [id]
    );

    // Calculer les statistiques
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_mouvements,
        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
        SUM(CASE WHEN statut = 'en_retard' THEN 1 ELSE 0 END) as en_retard,
        SUM(CASE WHEN statut = 'retourne' THEN 1 ELSE 0 END) as retournes
      FROM mouvements_sous_traitance
      WHERE id_sous_traitant = $1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        mouvements: mouvements.rows,
        statistiques: stats.rows[0]
      }
    });
  } catch (error) {
    console.error('Erreur getSoustraitant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/soustraitants - Créer un sous-traitant
export const createSoustraitant = async (req, res) => {
  try {
    const {
      code_sous_traitant,
      raison_sociale,
      adresse,
      telephone,
      email,
      contact_principal,
      specialite,
      capacite_production,
      delai_moyen_jours = 12,
      taux_qualite,
      actif = true
    } = req.body;

    // Validation
    if (!code_sous_traitant || !raison_sociale) {
      return res.status(400).json({
        success: false,
        error: { message: 'Code et raison sociale requis' }
      });
    }

    // Vérifier si le code existe déjà
    const existing = await pool.query(
      'SELECT id_sous_traitant FROM sous_traitants WHERE code_sous_traitant = $1',
      [code_sous_traitant]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ce code sous-traitant existe déjà' }
      });
    }

    const result = await pool.query(
      `INSERT INTO sous_traitants 
        (code_sous_traitant, raison_sociale, adresse, telephone, email, 
         contact_principal, specialite, capacite_production, delai_moyen_jours, 
         taux_qualite, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        code_sous_traitant, raison_sociale, adresse || null, telephone || null,
        email || null, contact_principal || null, specialite || null,
        capacite_production || null, delai_moyen_jours, taux_qualite || null, actif
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createSoustraitant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/soustraitants/:id - Modifier un sous-traitant
export const updateSoustraitant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si le sous-traitant existe
    const existing = await pool.query(
      'SELECT id_sous_traitant FROM sous_traitants WHERE id_sous_traitant = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sous-traitant non trouvé' }
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
      `UPDATE sous_traitants 
      SET ${fields.join(', ')}
      WHERE id_sous_traitant = $${paramCount}
      RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateSoustraitant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/soustraitants/:id/mouvements - Mouvements d'un sous-traitant
export const getMouvementsSoustraitant = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, date_debut, date_fin } = req.query;

    let query = `
      SELECT 
        mst.*,
        of.numero_of,
        a.code_article,
        a.designation as article_designation
      FROM mouvements_sous_traitance mst
      LEFT JOIN ordres_fabrication of ON mst.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE mst.id_sous_traitant = $1
    `;
    const params = [id];
    let paramCount = 1;

    if (statut) {
      paramCount++;
      query += ` AND mst.statut = $${paramCount}`;
      params.push(statut);
    }

    if (date_debut) {
      paramCount++;
      query += ` AND mst.date_sortie >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND mst.date_sortie <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY mst.date_sortie DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getMouvementsSoustraitant:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/soustraitants/:id/sortie - Enregistrer une sortie
export const enregistrerSortie = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_of, quantite, date_sortie_prevue, observations } = req.body;

    // Validation
    if (!id_of || !quantite || !date_sortie_prevue) {
      return res.status(400).json({
        success: false,
        error: { message: 'OF, quantité et date de sortie prévue requis' }
      });
    }

    // Vérifier que le sous-traitant existe
    const st = await pool.query(
      'SELECT id_sous_traitant FROM sous_traitants WHERE id_sous_traitant = $1 AND actif = true',
      [id]
    );

    if (st.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Sous-traitant non trouvé ou inactif' }
      });
    }

    // Générer le numéro de mouvement
    const count = await pool.query('SELECT COUNT(*) as count FROM mouvements_sous_traitance');
    const numero = `MST-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    // Calculer la date de retour prévue (delai_traitement_moyen)
    const delaiResult = await pool.query(
      'SELECT delai_traitement_moyen FROM sous_traitants WHERE id_sous_traitant = $1',
      [id]
    );
    const delai = delaiResult.rows[0]?.delai_traitement_moyen || 12;
    const dateRetourPrevue = new Date(date_sortie_prevue);
    dateRetourPrevue.setDate(dateRetourPrevue.getDate() + delai);

    const result = await pool.query(
      `INSERT INTO mouvements_sous_traitance 
        (numero_mouvement, id_sous_traitant, id_of, type_mouvement, 
         date_mouvement, date_retour_prevue, statut, observations)
      VALUES ($1, $2, $3, 'sortie', CURRENT_TIMESTAMP, $4, 'en_cours', $5)
      RETURNING *`,
      [numero, id, id_of, dateRetourPrevue.toISOString().split('T')[0], observations || null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur enregistrerSortie:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/soustraitants/:id/retour - Enregistrer un retour
export const enregistrerRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_mouvement, quantite_retournee, date_retour, conforme, observations } = req.body;

    // Validation
    if (!id_mouvement || !date_retour) {
      return res.status(400).json({
        success: false,
        error: { message: 'Mouvement et date de retour requis' }
      });
    }

    const result = await pool.query(
      `UPDATE mouvements_sous_traitance 
      SET type_mouvement = 'retour',
          date_mouvement = CURRENT_TIMESTAMP,
          date_retour_reelle = $1,
          statut = 'retourne',
          observations = COALESCE($2, observations)
      WHERE id_mouvement_st = $3 AND id_sous_traitant = $4
      RETURNING *`,
      [date_retour, observations || null, id_mouvement, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Mouvement non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur enregistrerRetour:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/soustraitants/alertes/retard - Alertes retards
export const getAlertesRetard = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        mst.*,
        st.raison_sociale,
        st.code_sous_traitant,
        of.numero_of,
        a.code_article
      FROM mouvements_sous_traitance mst
      LEFT JOIN sous_traitants st ON mst.id_sous_traitant = st.id_sous_traitant
      LEFT JOIN ordres_fabrication of ON mst.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE mst.statut = 'en_cours'
        AND mst.date_retour_prevue IS NOT NULL
        AND mst.date_retour_prevue < CURRENT_DATE
      ORDER BY mst.date_retour_prevue ASC`
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAlertesRetard:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
