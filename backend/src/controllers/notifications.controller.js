import { pool } from '../utils/db.js';

// GET /api/notifications - Mes notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lue } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          notifications: [
            {
              id_notification: 1,
              type_notification: 'NOUVELLE_TACHE',
              titre: 'Nouvelle tâche TISSAGE',
              message: 'Tâche assignée pour OF-001',
              lue: false,
              priorite: 1
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT * FROM notifications
      WHERE id_user = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (lue !== undefined) {
      query += ` AND lue = $${paramIndex}`;
      params.push(lue === 'true');
      paramIndex++;
    }

    query += ` ORDER BY priorite ASC, created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// GET /api/notifications/non-lues - Notifications non lues
export const getNotificationsNonLues = async (req, res) => {
  try {
    const userId = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          notifications: [
            {
              id_notification: 1,
              type_notification: 'NOUVELLE_TACHE',
              titre: 'Nouvelle tâche TISSAGE',
              lue: false
            }
          ],
          count: 1
        }
      });
    }

    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE id_user = $1 AND lue = FALSE
      ORDER BY priorite ASC, created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Erreur getNotificationsNonLues:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/notifications/:id/lue - Marquer comme lue
export const marquerLue = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Notification marquée comme lue (mode mock)' }
      });
    }

    const result = await pool.query(`
      UPDATE notifications
      SET lue = TRUE, date_lecture = CURRENT_TIMESTAMP
      WHERE id_notification = $1 AND id_user = $2
      RETURNING *
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification non trouvée' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur marquerLue:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// PUT /api/notifications/lire-toutes - Marquer toutes comme lues
export const lireToutes = async (req, res) => {
  try {
    const userId = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Toutes les notifications marquées comme lues (mode mock)' }
      });
    }

    await pool.query(`
      UPDATE notifications
      SET lue = TRUE, date_lecture = CURRENT_TIMESTAMP
      WHERE id_user = $1 AND lue = FALSE
    `, [userId]);

    res.json({
      success: true,
      data: { message: 'Toutes les notifications marquées comme lues' }
    });
  } catch (error) {
    console.error('Erreur lireToutes:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};

// DELETE /api/notifications/:id - Supprimer notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: { message: 'Notification supprimée (mode mock)' }
      });
    }

    const result = await pool.query(`
      DELETE FROM notifications
      WHERE id_notification = $1 AND id_user = $2
      RETURNING *
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification non trouvée' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification supprimée' }
    });
  } catch (error) {
    console.error('Erreur deleteNotification:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
};
