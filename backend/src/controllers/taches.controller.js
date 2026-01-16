import { pool } from '../utils/db.js';
import { io } from '../server.js';

// GET /api/taches - Liste toutes les tâches (avec filtres)
export const getTaches = async (req, res) => {
  try {
    const { statut, type_tache, assigne_a, id_of, id_machine, poste } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          taches: [
            {
              id_tache: 1,
              id_of: 1,
              numero_of: 'OF-001',
              type_tache: 'TISSAGE',
              assigne_a: 2,
              assigne_a_nom: 'Ahmed',
              statut: 'EN_COURS',
              priorite: 1,
              quantite_demandee: 100,
              quantite_realisee: 60
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT 
        t.*,
        of.numero_of,
        a.designation as article_designation,
        u_assigne.nom as assigne_a_nom,
        u_assigne.prenom as assigne_a_prenom,
        u_assigne.poste_travail as assigne_a_poste,
        u_assigneur.nom as assigne_par_nom,
        m.numero_machine
      FROM taches t
      LEFT JOIN ordres_fabrication of ON t.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      LEFT JOIN utilisateurs u_assigne ON t.assigne_a = u_assigne.id_utilisateur
      LEFT JOIN utilisateurs u_assigneur ON t.assigne_par = u_assigneur.id_utilisateur
      LEFT JOIN machines m ON t.id_machine = m.id_machine
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (statut) {
      query += ` AND t.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }

    if (type_tache) {
      query += ` AND t.type_tache = $${paramIndex}`;
      params.push(type_tache);
      paramIndex++;
    }

    if (assigne_a) {
      query += ` AND t.assigne_a = $${paramIndex}`;
      params.push(assigne_a);
      paramIndex++;
    }

    if (id_of) {
      query += ` AND t.id_of = $${paramIndex}`;
      params.push(id_of);
      paramIndex++;
    }

    if (id_machine) {
      query += ` AND t.id_machine = $${paramIndex}`;
      params.push(id_machine);
      paramIndex++;
    }

    if (poste) {
      query += ` AND u_assigne.poste_travail = $${paramIndex}`;
      params.push(poste);
      paramIndex++;
    }

    query += ` ORDER BY t.priorite ASC, t.date_creation DESC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        taches: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getTaches:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/taches/mes-taches - Tâches de l'utilisateur connecté
export const getMesTaches = async (req, res) => {
  try {
    const userId = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          taches: [
            {
              id_tache: 1,
              id_of: 1,
              numero_of: 'OF-001',
              type_tache: 'TISSAGE',
              statut: 'EN_COURS',
              priorite: 1,
              quantite_demandee: 100,
              quantite_realisee: 60
            }
          ]
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        t.*,
        of.numero_of,
        a.designation as article_designation,
        m.numero_machine
      FROM taches t
      LEFT JOIN ordres_fabrication of ON t.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      LEFT JOIN machines m ON t.id_machine = m.id_machine
      WHERE t.assigne_a = $1
      ORDER BY 
        CASE t.statut
          WHEN 'EN_COURS' THEN 1
          WHEN 'ASSIGNEE' THEN 2
          WHEN 'EN_ATTENTE' THEN 3
          ELSE 4
        END,
        t.priorite ASC,
        t.date_creation DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        taches: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getMesTaches:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/taches/poste/:poste - Tâches d'un poste
export const getTachesPoste = async (req, res) => {
  try {
    const { poste } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { taches: [] }
      });
    }

    const result = await pool.query(`
      SELECT 
        t.*,
        of.numero_of,
        a.designation as article_designation,
        u.nom as assigne_a_nom,
        u.prenom as assigne_a_prenom,
        m.numero_machine
      FROM taches t
      LEFT JOIN ordres_fabrication of ON t.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      LEFT JOIN utilisateurs u ON t.assigne_a = u.id_utilisateur
      LEFT JOIN machines m ON t.id_machine = m.id_machine
      WHERE u.poste_travail = $1
      ORDER BY t.priorite ASC, t.date_creation DESC
    `, [poste]);

    res.json({
      success: true,
      data: {
        taches: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getTachesPoste:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/taches - Créer une tâche
export const createTache = async (req, res) => {
  try {
    const {
      id_of, type_tache, assigne_a, id_machine,
      priorite, date_limite, instructions, quantite_demandee,
      tache_precedente_id, notifier_suivant
    } = req.body;

    const assigne_par = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      const newTache = {
        id_tache: Math.floor(Math.random() * 1000),
        id_of,
        type_tache,
        assigne_a,
        statut: assigne_a ? 'ASSIGNEE' : 'EN_ATTENTE',
        message: 'Tâche créée (mode mock)'
      };

      // Simuler notification WebSocket
      if (assigne_a && io) {
        io.to(`user-${assigne_a}`).emit('nouvelle-tache', newTache);
      }

      return res.status(201).json({
        success: true,
        data: newTache
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      const result = await client.query(`
        INSERT INTO taches (
          id_of, type_tache, assigne_a, assigne_par, id_machine,
          priorite, date_limite, instructions, quantite_demandee,
          tache_precedente_id, notifier_suivant, statut, date_assignation
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        id_of, type_tache, assigne_a, assigne_par, id_machine,
        priorite || 2, date_limite, instructions, quantite_demandee,
        tache_precedente_id, notifier_suivant !== false, 
        assigne_a ? 'ASSIGNEE' : 'EN_ATTENTE',
        assigne_a ? new Date() : null
      ]);

      const tache = result.rows[0];

      // Créer notification si assignée
      if (assigne_a) {
        await client.query(`
          INSERT INTO notifications (id_user, type_notification, titre, message, id_tache, id_of, priorite)
          VALUES ($1, 'NOUVELLE_TACHE', $2, $3, $4, $5, $6)
        `, [
          assigne_a,
          `Nouvelle tâche ${type_tache}`,
          `Tâche ${type_tache} assignée pour OF ${id_of}`,
          tache.id_tache,
          id_of,
          priorite || 2
        ]);

        // Notification WebSocket
        if (io) {
          io.to(`user-${assigne_a}`).emit('nouvelle-tache', tache);
          io.to(`user-${assigne_a}`).emit('notification', {
            type: 'NOUVELLE_TACHE',
            titre: `Nouvelle tâche ${type_tache}`,
            message: `Tâche assignée pour OF ${id_of}`,
            priorite: priorite || 2
          });
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: tache
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur createTache:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/taches/:id/assigner - Assigner une tâche
export const assignerTache = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigne_a } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      if (io) {
        io.to(`user-${assigne_a}`).emit('nouvelle-tache', { id_tache: parseInt(id) });
      }
      return res.json({
        success: true,
        data: { message: 'Tâche assignée (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      const result = await client.query(`
        UPDATE taches
        SET assigne_a = $1, statut = 'ASSIGNEE', date_assignation = CURRENT_TIMESTAMP
        WHERE id_tache = $2
        RETURNING *
      `, [assigne_a, id]);

      if (result.rows.length === 0) {
        throw new Error('Tâche non trouvée');
      }

      const tache = result.rows[0];

      // Créer notification
      await client.query(`
        INSERT INTO notifications (id_user, type_notification, titre, message, id_tache, id_of, priorite)
        VALUES ($1, 'NOUVELLE_TACHE', $2, $3, $4, $5, $6)
      `, [
        assigne_a,
        `Nouvelle tâche ${tache.type_tache}`,
        `Tâche ${tache.type_tache} assignée`,
        tache.id_tache,
        tache.id_of,
        tache.priorite
      ]);

      // Notification WebSocket
      if (io) {
        io.to(`user-${assigne_a}`).emit('nouvelle-tache', tache);
        io.to(`user-${assigne_a}`).emit('notification', {
          type: 'NOUVELLE_TACHE',
          titre: `Nouvelle tâche ${tache.type_tache}`,
          message: `Tâche assignée`,
          priorite: tache.priorite
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        data: tache
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur assignerTache:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/taches/:id/demarrer - Démarrer une tâche
export const demarrerTache = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      if (io) {
        io.emit('tache-mise-a-jour', { id_tache: parseInt(id), statut: 'EN_COURS' });
      }
      return res.json({
        success: true,
        data: { message: 'Tâche démarrée (mode mock)' }
      });
    }

    const result = await pool.query(`
      UPDATE taches
      SET statut = 'EN_COURS', date_debut = CURRENT_TIMESTAMP
      WHERE id_tache = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tâche non trouvée' }
      });
    }

    const tache = result.rows[0];

    // Notification WebSocket
    if (io) {
      io.emit('tache-mise-a-jour', tache);
    }

    res.json({
      success: true,
      data: tache
    });
  } catch (error) {
    console.error('Erreur demarrerTache:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// POST /api/taches/:id/terminer - Terminer une tâche
export const terminerTache = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantite_realisee } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      // Simuler workflow suivant
      if (io) {
        io.emit('tache-mise-a-jour', { id_tache: parseInt(id), statut: 'TERMINEE' });
        io.emit('tache-precedente-terminee', { id_tache: parseInt(id) });
      }
      return res.json({
        success: true,
        data: { message: 'Tâche terminée (mode mock)' }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      // Mettre à jour la tâche
      const result = await client.query(`
        UPDATE taches
        SET statut = 'TERMINEE', date_fin = CURRENT_TIMESTAMP,
            quantite_realisee = COALESCE($1, quantite_realisee)
        WHERE id_tache = $2
        RETURNING *
      `, [quantite_realisee, id]);

      if (result.rows.length === 0) {
        throw new Error('Tâche non trouvée');
      }

      const tache = result.rows[0];

      // Trouver les tâches suivantes qui dépendent de celle-ci
      const tachesSuivantesResult = await client.query(`
        SELECT * FROM taches
        WHERE tache_precedente_id = $1 AND notifier_suivant = TRUE
      `, [id]);

      const tachesSuivantes = tachesSuivantesResult.rows;

      // Notifier les tâches suivantes
      for (const tacheSuivante of tachesSuivantes) {
        if (tacheSuivante.assigne_a) {
          await client.query(`
            INSERT INTO notifications (id_user, type_notification, titre, message, id_tache, id_of, priorite)
            VALUES ($1, 'TACHE_TERMINEE_PRECEDENT', $2, $3, $4, $5, $6)
          `, [
            tacheSuivante.assigne_a,
            'Tâche précédente terminée',
            `La tâche précédente est terminée, vous pouvez commencer ${tacheSuivante.type_tache}`,
            tacheSuivante.id_tache,
            tacheSuivante.id_of,
            tacheSuivante.priorite
          ]);

          // Notification WebSocket
          if (io) {
            io.to(`user-${tacheSuivante.assigne_a}`).emit('tache-precedente-terminee', {
              tache: tacheSuivante,
              tache_precedente: tache
            });
            io.to(`user-${tacheSuivante.assigne_a}`).emit('notification', {
              type: 'TACHE_TERMINEE_PRECEDENT',
              titre: 'Tâche précédente terminée',
              message: `Vous pouvez commencer ${tacheSuivante.type_tache}`,
              priorite: tacheSuivante.priorite
            });
          }
        }
      }

      await client.query('COMMIT');

      // Notification WebSocket globale
      if (io) {
        io.emit('tache-mise-a-jour', tache);
      }

      res.json({
        success: true,
        data: tache
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur terminerTache:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Erreur serveur' }
    });
  }
};

// POST /api/taches/:id/pause - Mettre en pause
export const pauseTache = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Tâche en pause (mode mock)' }
      });
    }

    const result = await pool.query(`
      UPDATE taches
      SET statut = 'EN_PAUSE'
      WHERE id_tache = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tâche non trouvée' }
      });
    }

    if (io) {
      io.emit('tache-mise-a-jour', result.rows[0]);
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur pauseTache:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/taches/:id - Détail d'une tâche
export const getTache = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          id_tache: parseInt(id),
          type_tache: 'TISSAGE',
          statut: 'EN_COURS'
        }
      });
    }

    const result = await pool.query(`
      SELECT 
        t.*,
        of.numero_of,
        a.designation as article_designation,
        u_assigne.nom as assigne_a_nom,
        u_assigne.prenom as assigne_a_prenom,
        m.numero_machine
      FROM taches t
      LEFT JOIN ordres_fabrication of ON t.id_of = of.id_of
      LEFT JOIN articles_catalogue a ON of.id_article = a.id_article
      LEFT JOIN utilisateurs u_assigne ON t.assigne_a = u_assigne.id_utilisateur
      LEFT JOIN machines m ON t.id_machine = m.id_machine
      WHERE t.id_tache = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Tâche non trouvée' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getTache:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
