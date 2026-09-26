/**
 * Contrôleur Clients CRUD — Fonctionnel (pg pool direct)
 * Remplace le controller Odoo-style qui dépend de Environment.get()
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/clients ────────────────────────────────────────────────────
export const getClients = async (req, res) => {
  try {
    const { search, actif, type_client, id_categorie, id_commercial, page, limit } = req.query;

    const qb = new QueryBuilder('clients', 'c')
      .select([
        'c.id_client', 'c.code_client', 'c.raison_sociale',
        'c.type_client', 'c.adresse', 'c.code_postal', 'c.ville', 'c.pays',
        'c.telephone', 'c.email', 'c.contact_principal',
        'c.conditions_paiement', 'c.plafond_credit', 'c.devise',
        'c.taux_remise', 'c.actif', 'c.date_creation'
      ])
      .search(['c.code_client', 'c.raison_sociale', 'c.email'], search)
      .whereBool('c.actif = $?', actif)
      .whereIf('c.type_client = $?', type_client)
      .whereIf('c.id_categorie = $?', id_categorie)
      .whereIf('c.id_commercial = $?', id_commercial)
      .orderBy('c.date_creation DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getClients');
  }
};

// ── GET /api/clients/categories ─────────────────────────────────────────
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories_clients ORDER BY libelle');
    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getCategories');
  }
};

// ── GET /api/clients/types-commerciaux ──────────────────────────────────
export const getTypesCommerciaux = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM types_commerciaux ORDER BY libelle');
    return sendSuccess(res, result.rows);
  } catch (error) {
    return handleError(res, error, 'getTypesCommerciaux');
  }
};

// ── GET /api/clients/:id ────────────────────────────────────────────────
export const getClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM comptes WHERE id_client = $1', [id]);
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Client'));
    }

    // Dernières commandes
    const commandes = await pool.query(
      `SELECT id_commande, numero_commande, date_commande, date_livraison_prevue, statut, montant_total
       FROM commandes WHERE id_client = $1 ORDER BY date_commande DESC LIMIT 10`,
      [id]
    );

    return sendSuccess(res, { ...result.rows[0], commandes: commandes.rows });
  } catch (error) {
    return handleError(res, error, 'getClient');
  }
};

// ── POST /api/clients ───────────────────────────────────────────────────
export const createClient = async (req, res) => {
  try {
    const {
      code_client, raison_sociale, adresse, code_postal, ville,
      pays = 'Tunisie', telephone, email, contact_principal,
      conditions_paiement, plafond_credit, devise = 'TND',
      taux_remise = 0, actif = true, type_client, id_categorie, id_commercial
    } = req.body;

    if (!raison_sociale) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('raison_sociale'));
    }

    // Vérifier code unique
    if (code_client) {
      const existing = await pool.query('SELECT id_client FROM comptes WHERE code_client = $1', [code_client]);
      if (existing.rows.length > 0) {
        return sendError(res, 'Ce code client existe déjà', HTTP_STATUS.CONFLICT);
      }
    }

    const userId = getUserId(req);
    const result = await pool.query(
      `INSERT INTO comptes
        (code_client, raison_sociale, type_client, id_categorie, id_commercial,
         adresse, code_postal, ville, pays, telephone, email, contact_principal,
         conditions_paiement, plafond_credit, devise, taux_remise, actif, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
      [
        code_client || null, raison_sociale, type_client || 'PROSPECT',
        id_categorie || null, id_commercial || null,
        adresse || null, code_postal || null, ville || null, pays,
        telephone || null, email || null, contact_principal || null,
        conditions_paiement || null, plafond_credit || null,
        devise, taux_remise, actif, userId
      ]
    );

    logger.info('Client créé', { id: result.rows[0].id_client, raison_sociale });
    return sendSuccess(res, result.rows[0], null, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createClient');
  }
};

// ── PUT /api/clients/:id ────────────────────────────────────────────────
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existing = await pool.query('SELECT id_client FROM comptes WHERE id_client = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Client'));
    }

    // Vérifier unicité du code
    if (updateData.code_client) {
      const codeExists = await pool.query(
        'SELECT id_client FROM comptes WHERE code_client = $1 AND id_client != $2',
        [updateData.code_client, id]
      );
      if (codeExists.rows.length > 0) {
        return sendError(res, 'Ce code client existe déjà', HTTP_STATUS.CONFLICT);
      }
    }

    const userId = getUserId(req);
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && !['id_client', 'created_by', 'updated_by'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    if (userId) {
      fields.push(`updated_by = $${paramCount}`);
      values.push(userId);
      paramCount++;
    }
    fields.push('date_modification = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      `UPDATE comptes SET ${fields.join(', ')} WHERE id_client = $${paramCount} RETURNING *`,
      values
    );

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateClient');
  }
};

// ── GET /api/clients/:id/stats ───────────────────────────────────────────
export const getClientStats = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM commandes WHERE id_client = $1) as nb_commandes,
        (SELECT COUNT(*) FROM commandes WHERE id_client = $1 AND statut = 'LIVREE') as nb_commandes_livrees,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE id_client = $1) as chiffre_affaires,
        (SELECT COALESCE(SUM(montant_ttc), 0) FROM factures WHERE id_client = $1 AND statut = 'PAYEE') as montant_paye,
        (SELECT COUNT(*) FROM adresses_client WHERE id_client = $1 AND actif = true) as nb_adresses,
        (SELECT COUNT(*) FROM contacts WHERE id_client = $1 AND actif = true) as nb_contacts
    `, [id]);
    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getClientStats');
  }
};

// ── POST /api/clients/:id/determiner-type ───────────────────────────────
export const determinerTypeClient = async (req, res) => {
  try {
    const { id } = req.params;
    const countResult = await pool.query('SELECT COUNT(*) as nb FROM commandes WHERE id_client = $1', [id]);
    const nbCommandes = parseInt(countResult.rows[0].nb);
    const type = nbCommandes > 0 ? 'CLIENT' : 'PROSPECT';

    await pool.query('UPDATE comptes SET type_client = $1 WHERE id_client = $2', [type, id]);
    return sendSuccess(res, { type_client: type });
  } catch (error) {
    return handleError(res, error, 'determinerTypeClient');
  }
};

// ── DELETE /api/clients/:id (soft delete) ───────────────────────────────
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE comptes SET actif = false WHERE id_client = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Client'));
    }

    logger.info('Client désactivé', { id });
    return sendSuccess(res, { message: 'Client désactivé avec succès' });
  } catch (error) {
    return handleError(res, error, 'deleteClient');
  }
};
