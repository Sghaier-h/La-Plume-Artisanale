/**
 * Contrôleur Adresses Client
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { sendError, sendSuccess } from '../../../src/utils/error.helper.js';
import { securityManager } from '../../../src/core/SecurityManager.js';

export const getAdressesClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'adresses_client', 'read')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;
    const { type } = req.query;

    let query = `
      SELECT * FROM adresses_client
      WHERE id_client = $1 AND actif = true
    `;
    const params = [id];

    if (type) {
      query += ` AND type_adresse = $2`;
      params.push(type);
    }

    query += ` ORDER BY principale DESC, date_creation ASC`;

    const result = await pool.query(query, params);
    return sendSuccess(res, result.rows);
  } catch (error) {
    logger.error('Error in getAdressesClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération des adresses', 500);
  }
};

export const createAdresseClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'adresses_client', 'create')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;
    const {
      type_adresse,
      civilite,
      nom_adresse,
      adresse_ligne1,
      adresse_ligne2,
      adresse_ligne3,
      adresse_ligne4,
      code_postal,
      ville,
      departement,
      pays = 'Tunisie',
      site_web,
      principale = false
    } = req.body;

    if (!type_adresse || !adresse_ligne1 || !pays) {
      return sendError(res, 'type_adresse, adresse_ligne1 et pays sont requis', 400);
    }

    if (!['FACTURATION', 'LIVRAISON', 'AUTRE'].includes(type_adresse)) {
      return sendError(res, 'Type d\'adresse invalide', 400);
    }

    // Si principale, désactiver les autres
    if (principale) {
      await pool.query(
        `UPDATE adresses_client 
         SET principale = false 
         WHERE id_client = $1 AND type_adresse = $2 AND actif = true`,
        [id, type_adresse]
      );
    }

    const result = await pool.query(
      `INSERT INTO adresses_client 
        (id_client, type_adresse, civilite, nom_adresse, adresse_ligne1, 
         adresse_ligne2, adresse_ligne3, adresse_ligne4, code_postal, ville, 
         departement, pays, site_web, principale, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
      RETURNING *`,
      [id, type_adresse, civilite || null, nom_adresse || null, adresse_ligne1,
       adresse_ligne2 || null, adresse_ligne3 || null, adresse_ligne4 || null,
       code_postal || null, ville || null, departement || null, pays,
       site_web || null, principale]
    );

    return sendSuccess(res, result.rows[0], 'Adresse créée avec succès', 201);
  } catch (error) {
    logger.error('Error in createAdresseClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la création de l\'adresse', 500);
  }
};

export const updateAdresseClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'adresses_client', 'write')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id, id_adresse } = req.params;
    const {
      type_adresse,
      civilite,
      nom_adresse,
      adresse_ligne1,
      adresse_ligne2,
      adresse_ligne3,
      adresse_ligne4,
      code_postal,
      ville,
      departement,
      pays,
      site_web,
      principale
    } = req.body;

    // Vérifier que l'adresse appartient au client
    const check = await pool.query(
      'SELECT id_client FROM adresses_client WHERE id_adresse = $1 AND id_client = $2',
      [id_adresse, id]
    );

    if (check.rows.length === 0) {
      return sendError(res, 'Adresse non trouvée', 404);
    }

    // Si principale, désactiver les autres
    if (principale) {
      await pool.query(
        `UPDATE adresses_client 
         SET principale = false 
         WHERE id_client = $1 AND type_adresse = $2 AND id_adresse != $3 AND actif = true`,
        [id, type_adresse || check.rows[0].type_adresse, id_adresse]
      );
    }

    // Construire la requête de mise à jour
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fields = {
      type_adresse, civilite, nom_adresse, adresse_ligne1,
      adresse_ligne2, adresse_ligne3, adresse_ligne4, code_postal,
      ville, departement, pays, site_web, principale
    };

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', 400);
    }

    updates.push(`date_modification = NOW()`);
    values.push(id_adresse, id);

    const query = `
      UPDATE adresses_client
      SET ${updates.join(', ')}
      WHERE id_adresse = $${paramIndex++} AND id_client = $${paramIndex++}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return sendSuccess(res, result.rows[0], 'Adresse mise à jour avec succès');
  } catch (error) {
    logger.error('Error in updateAdresseClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la mise à jour de l\'adresse', 500);
  }
};

export const deleteAdresseClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'adresses_client', 'unlink')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id, id_adresse } = req.params;

    // Vérifier que l'adresse appartient au client
    const check = await pool.query(
      'SELECT id_client FROM adresses_client WHERE id_adresse = $1 AND id_client = $2',
      [id_adresse, id]
    );

    if (check.rows.length === 0) {
      return sendError(res, 'Adresse non trouvée', 404);
    }

    // Soft delete
    await pool.query(
      `UPDATE adresses_client
       SET actif = false, date_modification = NOW()
       WHERE id_adresse = $1 AND id_client = $2`,
      [id_adresse, id]
    );

    return sendSuccess(res, null, 'Adresse supprimée avec succès');
  } catch (error) {
    logger.error('Error in deleteAdresseClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la suppression de l\'adresse', 500);
  }
};
