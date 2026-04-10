/**
 * Contrôleur Paramètres Clients (Catégories, Types Commerciaux)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { sendError, sendSuccess } from '../../../src/utils/error.helper.js';
import { securityManager } from '../../../src/core/SecurityManager.js';

export const getCategoriesClients = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'categories_clients', 'read')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const result = await pool.query(
      `SELECT * FROM categories_clients
       ORDER BY libelle ASC`
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    logger.error('Error in getCategoriesClients', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération des catégories', 500);
  }
};

export const getTypesCommerciaux = async (req, res) => {
  try {
    if (!securityManager.checkAccess(req.user, 'types_commerciaux', 'read')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const result = await pool.query(
      `SELECT * FROM types_commerciaux
       ORDER BY libelle ASC`
    );

    return sendSuccess(res, result.rows);
  } catch (error) {
    logger.error('Error in getTypesCommerciaux', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération des types commerciaux', 500);
  }
};
