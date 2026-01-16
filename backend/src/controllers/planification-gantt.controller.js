import { pool } from '../utils/db.js';

// GET /api/planification-gantt/projets - Liste projets
export const getProjets = async (req, res) => {
  try {
    const { statut } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          projets: [
            {
              id_projet: 1,
              code_projet: 'PROJ-001',
              libelle: 'Production Janvier 2024',
              statut: 'EN_COURS',
              progression_pourcentage: 45
            }
          ]
        }
      });
    }

    let query = `SELECT * FROM projets WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (statut) {
      query += ` AND statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    query += ` ORDER BY date_debut_prevue DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { projets: result.rows } });
  } catch (error) {
    console.error('Erreur getProjets:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/planification-gantt/taches - Liste tâches avec dépendances
export const getTaches = async (req, res) => {
  try {
    const { id_projet, id_of } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          taches: [
            {
              id_tache: 1,
              libelle: 'Préparation MP',
              date_debut_prevue: '2024-01-15',
              date_fin_prevue: '2024-01-16',
              statut: 'EN_COURS',
              progression_pourcentage: 50
            }
          ]
        }
      });
    }

    let query = `
      SELECT t.*, m.numero_machine, u.nom_utilisateur as operateur_nom
      FROM taches_planification t
      LEFT JOIN machines m ON t.id_machine = m.id_machine
      LEFT JOIN utilisateurs u ON t.id_operateur = u.id_utilisateur
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_projet) {
      query += ` AND t.id_projet = $${paramIndex}`;
      params.push(id_projet);
      paramIndex++;
    }
    if (id_of) {
      query += ` AND t.id_of = $${paramIndex}`;
      params.push(id_of);
      paramIndex++;
    }

    query += ` ORDER BY t.date_debut_prevue ASC`;

    const result = await pool.query(query, params);
    
    // Parser les tableaux JSON
    const taches = result.rows.map(t => ({
      ...t,
      taches_precedentes: Array.isArray(t.taches_precedentes) ? t.taches_precedentes : [],
      taches_suivantes: Array.isArray(t.taches_suivantes) ? t.taches_suivantes : [],
      equipe: Array.isArray(t.equipe) ? t.equipe : []
    }));

    res.json({ success: true, data: { taches } });
  } catch (error) {
    console.error('Erreur getTaches:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/planification-gantt/taches - Créer tâche
export const createTache = async (req, res) => {
  try {
    const {
      id_projet, id_of, libelle, date_debut_prevue, date_fin_prevue,
      id_machine, id_operateur, taches_precedentes
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_tache: Math.floor(Math.random() * 1000),
          message: 'Tâche créée (mode mock)'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      const duree_jours = Math.ceil((new Date(date_fin_prevue) - new Date(date_debut_prevue)) / (1000 * 60 * 60 * 24));

      const result = await client.query(`
        INSERT INTO taches_planification (
          id_projet, id_of, libelle, date_debut_prevue, date_fin_prevue,
          duree_prevue_jours, id_machine, id_operateur, taches_precedentes, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PLANIFIEE')
        RETURNING *
      `, [
        id_projet, id_of, libelle, date_debut_prevue, date_fin_prevue,
        duree_jours, id_machine, id_operateur,
        taches_precedentes ? JSON.stringify(taches_precedentes) : null
      ]);

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createTache:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// GET /api/planification-gantt/ressources - Liste ressources
export const getRessources = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_ressource: 1,
            type_ressource: 'MACHINE',
            id_machine: 1,
            capacite_max_heures_jour: 8
          }
        ]
      });
    }

    const result = await pool.query(`
      SELECT r.*, m.numero_machine, u.nom_utilisateur
      FROM ressources_planification r
      LEFT JOIN machines m ON r.id_machine = m.id_machine
      LEFT JOIN utilisateurs u ON r.id_utilisateur = u.id_utilisateur
      WHERE r.actif = TRUE
      ORDER BY r.type_ressource
    `);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getRessources:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/planification-gantt/gantt-data - Données pour diagramme Gantt
export const getGanttData = async (req, res) => {
  try {
    const { id_projet } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          tasks: [
            {
              id: 1,
              text: 'Préparation MP',
              start_date: '2024-01-15',
              duration: 1,
              progress: 0.5,
              parent: 0
            }
          ],
          links: []
        }
      });
    }

    // Récupérer tâches
    const tachesResult = await pool.query(`
      SELECT id_tache, libelle, date_debut_prevue, date_fin_prevue,
             duree_prevue_jours, progression_pourcentage, parent_tache,
             taches_precedentes
      FROM taches_planification
      WHERE id_projet = $1
      ORDER BY date_debut_prevue
    `, [id_projet]);

    // Formater pour Gantt
    const tasks = tachesResult.rows.map(t => ({
      id: t.id_tache,
      text: t.libelle,
      start_date: t.date_debut_prevue,
      duration: t.duree_prevue_jours || 1,
      progress: (t.progression_pourcentage || 0) / 100,
      parent: t.parent_tache || 0
    }));

    // Créer liens (dépendances)
    const links = [];
    tachesResult.rows.forEach(t => {
      if (t.taches_precedentes && Array.isArray(t.taches_precedentes)) {
        t.taches_precedentes.forEach(tachePrecedente => {
          links.push({
            id: `link_${tachePrecedente}_${t.id_tache}`,
            source: tachePrecedente,
            target: t.id_tache,
            type: 0 // Finish to Start
          });
        });
      }
    });

    res.json({ success: true, data: { tasks, links } });
  } catch (error) {
    console.error('Erreur getGanttData:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
