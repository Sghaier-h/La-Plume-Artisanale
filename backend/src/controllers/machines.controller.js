import { pool } from '../utils/db.js';

// GET /api/machines - Liste toutes les machines
export const getMachines = async (req, res) => {
  try {
    const { search, type, statut, actif } = req.query;
    
    let query = `
      SELECT 
        m.id_machine,
        m.numero_machine,
        m.id_type_machine,
        tm.libelle as type_machine,
        tm.code_type as code_type_machine,
        m.marque,
        m.modele,
        m.numero_serie,
        m.annee_fabrication,
        m.date_mise_service,
        m.statut,
        m.vitesse_nominale,
        m.largeur_utile,
        m.capacite_production,
        m.id_selecteur_actuel,
        s.code_selecteur,
        m.emplacement,
        m.observations,
        m.date_derniere_maintenance,
        m.date_prochaine_maintenance,
        m.actif,
        m.date_creation
      FROM machines m
      LEFT JOIN types_machines tm ON m.id_type_machine = tm.id_type_machine
      LEFT JOIN selecteurs s ON m.id_selecteur_actuel = s.id_selecteur
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (m.numero_machine ILIKE $${paramCount} OR m.marque ILIKE $${paramCount} OR m.modele ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      query += ` AND m.id_type_machine = $${paramCount}`;
      params.push(type);
    }

    if (statut) {
      paramCount++;
      query += ` AND m.statut = $${paramCount}`;
      params.push(statut);
    }

    if (actif !== undefined) {
      paramCount++;
      query += ` AND m.actif = $${paramCount}`;
      params.push(actif === 'true');
    }

    query += ` ORDER BY m.numero_machine`;

    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getMachines:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/machines/:id - Détails d'une machine
export const getMachine = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        m.*,
        tm.libelle as type_machine,
        tm.code_type as code_type_machine,
        s.code_selecteur
      FROM machines m
      LEFT JOIN types_machines tm ON m.id_type_machine = tm.id_type_machine
      LEFT JOIN selecteurs s ON m.id_selecteur_actuel = s.id_selecteur
      WHERE m.id_machine = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Machine non trouvée' }
      });
    }

    // Récupérer le planning de la machine
    const planning = await pool.query(
      `SELECT 
        pm.*,
        of.numero_of,
        of.quantite_a_produire,
        of.statut as of_statut
      FROM planning_machines pm
      LEFT JOIN ordres_fabrication of ON pm.id_of = of.id_of
      WHERE pm.id_machine = $1
      ORDER BY pm.date_debut_prevue DESC
      LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        planning: planning.rows
      }
    });
  } catch (error) {
    console.error('Erreur getMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/machines - Créer une machine
export const createMachine = async (req, res) => {
  try {
    const {
      numero_machine,
      id_type_machine,
      marque,
      modele,
      numero_serie,
      annee_fabrication,
      date_mise_service,
      statut = 'operationnel',
      vitesse_nominale,
      largeur_utile,
      capacite_production,
      id_selecteur_actuel,
      emplacement,
      observations,
      date_derniere_maintenance,
      date_prochaine_maintenance,
      actif = true
    } = req.body;

    // Validation
    if (!numero_machine || !id_type_machine) {
      return res.status(400).json({
        success: false,
        error: { message: 'Numéro machine et type machine requis' }
      });
    }

    // Vérifier si le numéro existe déjà
    const existing = await pool.query(
      'SELECT id_machine FROM machines WHERE numero_machine = $1',
      [numero_machine]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Ce numéro de machine existe déjà' }
      });
    }

    const result = await pool.query(
      `INSERT INTO machines 
        (numero_machine, id_type_machine, marque, modele, numero_serie, 
         annee_fabrication, date_mise_service, statut, vitesse_nominale, 
         largeur_utile, capacite_production, id_selecteur_actuel, emplacement, 
         observations, date_derniere_maintenance, date_prochaine_maintenance, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        numero_machine, id_type_machine, marque || null, modele || null,
        numero_serie || null, annee_fabrication || null, date_mise_service || null,
        statut, vitesse_nominale || null, largeur_utile || null,
        capacite_production || null, id_selecteur_actuel || null,
        emplacement || null, observations || null,
        date_derniere_maintenance || null, date_prochaine_maintenance || null, actif
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur createMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/machines/:id - Modifier une machine
export const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier si la machine existe
    const existing = await pool.query(
      'SELECT id_machine FROM machines WHERE id_machine = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Machine non trouvée' }
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
      `UPDATE machines 
      SET ${fields.join(', ')}
      WHERE id_machine = $${paramCount}
      RETURNING *`,
      values
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateMachine:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/machines/types - Liste des types de machines
export const getTypesMachines = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM types_machines WHERE actif = true ORDER BY libelle'
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getTypesMachines:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/machines/:id/planning - Planning d'une machine
export const getMachinePlanning = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_debut, date_fin } = req.query;

    let query = `
      SELECT 
        pm.*,
        of.numero_of,
        of.quantite_a_produire,
        of.statut as of_statut,
        a.code_article,
        a.designation as article_designation
      FROM planning_machines pm
      LEFT JOIN ordres_fabrication of ON pm.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      WHERE pm.id_machine = $1
    `;
    const params = [id];
    let paramCount = 1;

    if (date_debut) {
      paramCount++;
      query += ` AND pm.date_debut_prevue >= $${paramCount}`;
      params.push(date_debut);
    }

    if (date_fin) {
      paramCount++;
      query += ` AND pm.date_debut_prevue <= $${paramCount}`;
      params.push(date_fin);
    }

    query += ` ORDER BY pm.date_debut_prevue`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getMachinePlanning:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
