/**
 * Contrôleur Contacts Client
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { sendError, sendSuccess } from '../../../src/utils/error.helper.js';
import { securityManager } from '../../../src/core/SecurityManager.js';

export const getContactsClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'contacts_client', 'read')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        c.*,
        a.type_adresse,
        a.nom_adresse as nom_adresse_associee
      FROM contacts_client c
      LEFT JOIN adresses_client a ON c.id_adresse = a.id_adresse
      WHERE c.id_client = $1 AND c.actif = true
      ORDER BY c.contact_principal DESC, c.date_creation ASC`,
      [id]
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    logger.error('Error in getContactsClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération des contacts', 500);
  }
};

export const createContactClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'contacts_client', 'create')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;
    const {
      id_adresse,
      civilite,
      nom,
      prenom,
      fonction,
      service_bureau,
      email,
      telephone_fixe,
      telephone_portable,
      fax,
      contact_principal = false
    } = req.body;

    if (!nom) {
      return sendError(res, 'Le nom est requis', 400);
    }

    // Si contact principal, désactiver les autres
    if (contact_principal) {
      await pool.query(
        `UPDATE contacts_client 
         SET contact_principal = false 
         WHERE id_client = $1 AND actif = true`,
        [id]
      );
    }

    // Vérifier que l'adresse appartient au client si fournie
    if (id_adresse) {
      const adresseCheck = await pool.query(
        'SELECT id_client FROM adresses_client WHERE id_adresse = $1 AND id_client = $2 AND actif = true',
        [id_adresse, id]
      );
      if (adresseCheck.rows.length === 0) {
        return sendError(res, 'L\'adresse n\'appartient pas à ce client', 400);
      }
    }

    const result = await pool.query(
      `INSERT INTO contacts_client 
        (id_client, id_adresse, civilite, nom, prenom, fonction, service_bureau,
         email, telephone_fixe, telephone_portable, fax, contact_principal, actif)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      RETURNING *`,
      [id, id_adresse || null, civilite || null, nom, prenom || null,
       fonction || null, service_bureau || null, email || null,
       telephone_fixe || null, telephone_portable || null, fax || null,
       contact_principal]
    );

    return sendSuccess(res, result.rows[0], 'Contact créé avec succès', 201);
  } catch (error) {
    logger.error('Error in createContactClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la création du contact', 500);
  }
};

export const updateContactClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'contacts_client', 'write')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id, id_contact } = req.params;
    const {
      id_adresse,
      civilite,
      nom,
      prenom,
      fonction,
      service_bureau,
      email,
      telephone_fixe,
      telephone_portable,
      fax,
      contact_principal
    } = req.body;

    // Vérifier que le contact appartient au client
    const check = await pool.query(
      'SELECT id_client FROM contacts_client WHERE id_contact = $1 AND id_client = $2',
      [id_contact, id]
    );

    if (check.rows.length === 0) {
      return sendError(res, 'Contact non trouvé', 404);
    }

    // Si contact principal, désactiver les autres
    if (contact_principal) {
      await pool.query(
        `UPDATE contacts_client 
         SET contact_principal = false 
         WHERE id_client = $1 AND id_contact != $2 AND actif = true`,
        [id, id_contact]
      );
    }

    // Vérifier l'adresse si fournie
    if (id_adresse) {
      const adresseCheck = await pool.query(
        'SELECT id_client FROM adresses_client WHERE id_adresse = $1 AND id_client = $2 AND actif = true',
        [id_adresse, id]
      );
      if (adresseCheck.rows.length === 0) {
        return sendError(res, 'L\'adresse n\'appartient pas à ce client', 400);
      }
    }

    // Construire la requête de mise à jour
    const updates = [];
    const values = [];
    let paramIndex = 1;

    const fields = {
      id_adresse, civilite, nom, prenom, fonction,
      service_bureau, email, telephone_fixe, telephone_portable, fax, contact_principal
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
    values.push(id_contact, id);

    const query = `
      UPDATE contacts_client
      SET ${updates.join(', ')}
      WHERE id_contact = $${paramIndex++} AND id_client = $${paramIndex++}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return sendSuccess(res, result.rows[0], 'Contact mis à jour avec succès');
  } catch (error) {
    logger.error('Error in updateContactClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la mise à jour du contact', 500);
  }
};

export const deleteContactClient = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'contacts_client', 'unlink')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id, id_contact } = req.params;

    // Vérifier que le contact appartient au client
    const check = await pool.query(
      'SELECT id_client FROM contacts_client WHERE id_contact = $1 AND id_client = $2',
      [id_contact, id]
    );

    if (check.rows.length === 0) {
      return sendError(res, 'Contact non trouvé', 404);
    }

    // Soft delete
    await pool.query(
      `UPDATE contacts_client
       SET actif = false, date_modification = NOW()
       WHERE id_contact = $1 AND id_client = $2`,
      [id_contact, id]
    );

    return sendSuccess(res, null, 'Contact supprimé avec succès');
  } catch (error) {
    logger.error('Error in deleteContactClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la suppression du contact', 500);
  }
};
