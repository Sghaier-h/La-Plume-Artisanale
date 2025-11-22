// Gestion des devices mobiles
import { pool } from './db.js';

export const registerDevice = async (userId, deviceId, deviceInfo) => {
  try {
    await pool.query(
      `INSERT INTO devices_mobile (id_utilisateur, device_id, device_info, date_connexion)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (id_utilisateur, device_id) 
       DO UPDATE SET date_connexion = CURRENT_TIMESTAMP, device_info = $3`,
      [userId, deviceId, JSON.stringify(deviceInfo)]
    );
  } catch (error) {
    console.error('Erreur registerDevice:', error);
  }
};

export const getDeviceInfo = async (userId, deviceId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM devices_mobile WHERE id_utilisateur = $1 AND device_id = $2',
      [userId, deviceId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Erreur getDeviceInfo:', error);
    return null;
  }
};

