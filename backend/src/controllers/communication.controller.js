import { pool } from '../utils/db.js';

// GET /api/communication/canaux - Liste canaux
export const getCanaux = async (req, res) => {
  try {
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_canal: 1,
            code_canal: 'WHATSAPP_TWILIO',
            libelle: 'WhatsApp via Twilio',
            type_canal: 'WHATSAPP',
            actif: true
          }
        ]
      });
    }

    const result = await pool.query('SELECT * FROM canaux_communication WHERE actif = TRUE ORDER BY type_canal');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getCanaux:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/communication/messages - Liste messages
export const getMessages = async (req, res) => {
  try {
    const { id_canal, statut, type_message, date_debut, date_fin } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: {
          messages: [
            {
              id_message: 1,
              destinataire: '+21612345678',
              type_message: 'DEVIS',
              statut: 'ENVOYE',
              date_envoi: '2024-01-15T10:00:00Z'
            }
          ],
          total: 1
        }
      });
    }

    let query = `
      SELECT m.*, c.libelle as canal_libelle, c.type_canal
      FROM messages_externes m
      LEFT JOIN canaux_communication c ON m.id_canal = c.id_canal
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_canal) {
      query += ` AND m.id_canal = $${paramIndex}`;
      params.push(id_canal);
      paramIndex++;
    }
    if (statut) {
      query += ` AND m.statut = $${paramIndex}`;
      params.push(statut);
      paramIndex++;
    }
    if (type_message) {
      query += ` AND m.type_message = $${paramIndex}`;
      params.push(type_message);
      paramIndex++;
    }
    if (date_debut) {
      query += ` AND m.date_envoi >= $${paramIndex}`;
      params.push(date_debut);
      paramIndex++;
    }
    if (date_fin) {
      query += ` AND m.date_envoi <= $${paramIndex}`;
      params.push(date_fin);
      paramIndex++;
    }

    query += ` ORDER BY m.date_envoi DESC LIMIT 100`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: { messages: result.rows, total: result.rows.length } });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// POST /api/communication/messages - Envoyer message
export const envoyerMessage = async (req, res) => {
  try {
    const {
      id_canal, destinataire, type_message, sujet, message_text,
      id_document, type_document, id_client
    } = req.body;

    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.status(201).json({
        success: true,
        data: {
          id_message: Math.floor(Math.random() * 1000),
          message: 'Message envoyé (mode mock)',
          statut: 'ENVOYE'
        }
      });
    }

    const client = await pool.connect();
    await client.query('BEGIN');

    try {
      const result = await client.query(`
        INSERT INTO messages_externes (
          id_canal, destinataire, type_destinataire, type_message,
          sujet, message_text, id_document, type_document, id_client, statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'EN_ATTENTE')
        RETURNING *
      `, [
        id_canal, destinataire, 'CLIENT', type_message,
        sujet, message_text, id_document, type_document, id_client
      ]);

      // TODO: Appel API externe (Twilio, WhatsApp, etc.)
      // Pour l'instant, on simule l'envoi
      await client.query(`
        UPDATE messages_externes
        SET statut = 'ENVOYE', date_envoi = CURRENT_TIMESTAMP
        WHERE id_message = $1
      `, [result.rows[0].id_message]);

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur envoyerMessage:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Erreur serveur' } });
  }
};

// GET /api/communication/templates - Liste templates
export const getTemplates = async (req, res) => {
  try {
    const { type_canal, type_message } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_template: 1,
            code_template: 'DEVIS_WHATSAPP',
            libelle: 'Envoi Devis WhatsApp',
            type_message: 'DEVIS'
          }
        ]
      });
    }

    let query = `SELECT * FROM templates_messages WHERE actif = TRUE`;
    const params = [];
    let paramIndex = 1;

    if (type_canal) {
      query += ` AND type_canal = $${paramIndex}`;
      params.push(type_canal);
      paramIndex++;
    }
    if (type_message) {
      query += ` AND type_message = $${paramIndex}`;
      params.push(type_message);
      paramIndex++;
    }

    query += ` ORDER BY libelle`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getTemplates:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};

// GET /api/communication/conversations - Liste conversations
export const getConversations = async (req, res) => {
  try {
    const { id_canal } = req.query;
    const useMockAuth = process.env.USE_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';
    
    if (useMockAuth) {
      return res.json({
        success: true,
        data: [
          {
            id_conversation: 1,
            numero_whatsapp: '+21612345678',
            statut: 'ACTIVE',
            date_dernier_message: '2024-01-15T10:00:00Z'
          }
        ]
      });
    }

    let query = `
      SELECT c.*, COUNT(m.id_message) as nb_messages
      FROM conversations c
      LEFT JOIN messages_conversation m ON c.id_conversation = m.id_conversation
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (id_canal) {
      query += ` AND c.id_canal = $${paramIndex}`;
      params.push(id_canal);
      paramIndex++;
    }

    query += ` GROUP BY c.id_conversation ORDER BY c.date_dernier_message DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
};
