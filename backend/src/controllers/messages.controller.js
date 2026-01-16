import { pool } from '../utils/db.js';
import { io } from '../server.js';

// POST /api/messages - Envoyer un message
export const envoyerMessage = async (req, res) => {
  try {
    const { destinataire_id, destinataire_poste, sujet, message, id_of } = req.body;
    const expediteur_id = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      if (io) {
        if (destinataire_id) {
          io.to(`user-${destinataire_id}`).emit('message', {
          expediteur: req.user.nom,
          sujet,
          message
        });
        } else if (destinataire_poste) {
          io.to(`poste-${destinataire_poste}`).emit('message', {
            expediteur: req.user.nom,
            sujet,
            message
          });
        }
      }
      return res.json({
        success: true,
        data: { message: 'Message envoyé (mode mock)' }
      });
    }

    const result = await pool.query(`
      INSERT INTO messages_postes (expediteur_id, destinataire_id, destinataire_poste, sujet, message, id_of)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [expediteur_id, destinataire_id, destinataire_poste, sujet, message, id_of]);

    const messageCree = result.rows[0];

    // Notification WebSocket
    if (io) {
      if (destinataire_id) {
        io.to(`user-${destinataire_id}`).emit('message', messageCree);
      } else if (destinataire_poste) {
        io.to(`poste-${destinataire_poste}`).emit('message', messageCree);
      }
    }

    res.json({
      success: true,
      data: messageCree
    });
  } catch (error) {
    console.error('Erreur envoyerMessage:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/messages - Mes messages
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lu } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          messages: [
            {
              id_message: 1,
              expediteur_nom: 'Responsable',
              sujet: 'Priorité OF-001',
              message: 'Priorité sur OF-001, client attend',
              lu: false
            }
          ]
        }
      });
    }

    let query = `
      SELECT 
        m.*,
        u_exp.nom as expediteur_nom,
        u_exp.prenom as expediteur_prenom,
        u_dest.nom as destinataire_nom
      FROM messages_postes m
      LEFT JOIN utilisateurs u_exp ON m.expediteur_id = u_exp.id_utilisateur
      LEFT JOIN utilisateurs u_dest ON m.destinataire_id = u_dest.id_utilisateur
      WHERE (m.destinataire_id = $1 OR (m.destinataire_poste IS NOT NULL AND EXISTS (
        SELECT 1 FROM utilisateurs WHERE id_utilisateur = $1 AND poste_travail = m.destinataire_poste
      )))
    `;
    const params = [userId];
    let paramIndex = 2;

    if (lu !== undefined) {
      query += ` AND m.lu = $${paramIndex}`;
      params.push(lu === 'true');
      paramIndex++;
    }

    query += ` ORDER BY m.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        messages: result.rows
      }
    });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/messages/:id/lu - Marquer comme lu
export const marquerMessageLu = async (req, res) => {
  try {
    const { id } = req.params;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Message marqué comme lu (mode mock)' }
      });
    }

    const result = await pool.query(`
      UPDATE messages_postes
      SET lu = TRUE, date_lecture = CURRENT_TIMESTAMP
      WHERE id_message = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Message non trouvé' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur marquerMessageLu:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
