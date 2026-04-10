/**
 * Contrôleur Clients - Utilise le modèle Client avec BaseModel
 */

import { Client } from '../models/Client.js';
import { logger } from '../../../src/utils/logger.js';
import { Environment } from '../../../src/core/Environment.js';
import { securityManager } from '../../../src/core/SecurityManager.js';
import { sendError, sendSuccess } from '../../../src/utils/error.helper.js';
import { getPaginationParams, buildPaginationResponse } from '../../../src/utils/pagination.helper.js';
import { loadOne2Many } from '../../../src/core/Relations.js';
import { getTableName, getIdField } from '../../../src/core/TableMapping.js';
import { pool } from '../../../src/utils/db.js';

const clientModel = new Client();

/**
 * GET /api/clients - Liste tous les clients
 */
export const getClients = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!securityManager.checkAccess(req.user, 'clients', 'read')) {
      return sendError(res, 'Accès refusé', 403);
    }

    // Récupérer l'environnement
    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    // Construire le domaine (filtres)
    const domain = [];
    const { search, actif, type_client, id_categorie, id_commercial } = req.query;

    if (search) {
      domain.push('|');
      domain.push(['raison_sociale', 'ilike', search]);
      domain.push(['code_client', 'ilike', search]);
    }

    if (actif !== undefined) {
      domain.push(['actif', '=', actif === 'true']);
    }

    if (type_client) {
      domain.push(['type_client', '=', type_client]);
    }

    if (id_categorie) {
      domain.push(['id_categorie', '=', parseInt(id_categorie)]);
    }

    if (id_commercial) {
      domain.push(['id_commercial', '=', parseInt(id_commercial)]);
    }

    // Appliquer les règles d'accès
    const finalDomain = securityManager.applyRecordRules(req.user, 'clients', domain);

    // Pagination
    const { page, limit, offset } = getPaginationParams(req, 20, 100);

    // Rechercher avec relations
    const loadRelations = req.query.loadRelations === 'true';
    const clients = await clientModel.search(finalDomain, {
      limit,
      offset,
      order: 'date_creation DESC',
      loadRelations: loadRelations ? {
        many2one: true,
        one2many: ['sale_order_ids', 'invoice_ids'],
        many2oneFields: ['country_id']
      } : undefined
    });

    // Compter le total
    const totalQuery = clientModel.search(finalDomain, {});
    const total = Array.isArray(totalQuery) ? totalQuery.length : 0;

    return sendSuccess(res, {
      data: clients,
      pagination: buildPaginationResponse(page, limit, total)
    });
  } catch (error) {
    logger.error('Error in getClients', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération des clients', 500);
  }
};

/**
 * GET /api/clients/:id - Récupère un client
 */
export const getClient = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!securityManager.checkAccess(req.user, 'clients', 'read')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;
    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    // Vérifier les règles d'accès avec relations
    const loadRelations = req.query.loadRelations === 'true';
    const clients = await clientModel.read([parseInt(id)], {
      loadRelations: loadRelations ? {
        many2one: true,
        one2many: ['sale_order_ids', 'purchase_order_ids', 'invoice_ids', 'child_ids'],
        many2oneFields: ['country_id', 'state_id', 'parent_id']
      } : undefined
    });
    
    if (clients.length === 0) {
      return sendError(res, 'Client non trouvé', 404);
    }

    const client = clients[0];

    // Récupérer les statistiques
    const stats = await clientModel.getStats(parseInt(id));

    return sendSuccess(res, {
      ...client,
      stats
    });
  } catch (error) {
    logger.error('Error in getClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération du client', 500);
  }
};

/**
 * POST /api/clients - Crée un client
 */
export const createClient = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!securityManager.checkAccess(req.user, 'clients', 'create')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    const client = await clientModel.create(req.body);

    return sendSuccess(res, client, 'Client créé avec succès', 201);
  } catch (error) {
    logger.error('Error in createClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la création du client', 500);
  }
};

/**
 * PUT /api/clients/:id - Met à jour un client
 */
export const updateClient = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!securityManager.checkAccess(req.user, 'clients', 'write')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;
    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    const clients = await clientModel.write([parseInt(id)], req.body);

    return sendSuccess(res, clients[0], 'Client mis à jour avec succès');
  } catch (error) {
    logger.error('Error in updateClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la mise à jour du client', 500);
  }
};

/**
 * DELETE /api/clients/:id - Supprime (désactive) un client
 */
export const deleteClient = async (req, res) => {
  try {
    // Vérifier les permissions
    if (!securityManager.checkAccess(req.user, 'clients', 'unlink')) {
      return sendError(res, 'Accès refusé', 403);
    }

    const { id } = req.params;
    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    await clientModel.unlink([parseInt(id)]);

    return sendSuccess(res, null, 'Client désactivé avec succès');
  } catch (error) {
    logger.error('Error in deleteClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la suppression du client', 500);
  }
};

/**
 * GET /api/clients/:id/stats - Récupère les statistiques d'un client
 */
export const getClientStats = async (req, res) => {
  try {
    const { id } = req.params;
    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    const stats = await clientModel.getStats(parseInt(id));

    return sendSuccess(res, stats);
  } catch (error) {
    logger.error('Error in getClientStats', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la récupération des statistiques', 500);
  }
};

/**
 * POST /api/clients/:id/determiner-type - Détermine le type de client
 */
export const determinerTypeClient = async (req, res) => {
  try {
    const { id } = req.params;
    const env = Environment.get(req.user);
    clientModel.setEnvironment(env);

    const type = await clientModel.determinerTypeClient(parseInt(id));

    return sendSuccess(res, { type_client: type });
  } catch (error) {
    logger.error('Error in determinerTypeClient', { error: error.message });
    return sendError(res, error.message || 'Erreur lors de la détermination du type', 500);
  }
};
