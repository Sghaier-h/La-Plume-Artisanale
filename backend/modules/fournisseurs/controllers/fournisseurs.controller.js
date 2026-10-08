/**
 * Contrôleur Fournisseurs — Module modulaire
 * CRUD fournisseurs
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/fournisseurs ───────────────────────────────────────────────
export const getFournisseurs = async (req, res) => {
  try {
    const { search, actif, page, limit } = req.query;

    const qb = new QueryBuilder('fournisseurs')
      .search(['code_fournisseur', 'raison_sociale'], search)
      .whereBool('actif = $?', actif)
      .orderBy('raison_sociale')
      .paginate(parseInt(page) || 1, parseInt(limit) || 100);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getFournisseurs');
  }
};

// ── GET /api/fournisseurs/:id ───────────────────────────────────────────
export const getFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM fournisseurs WHERE id_fournisseur = $1', [id]);

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Fournisseur'));
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getFournisseur');
  }
};

// ── POST /api/fournisseurs ──────────────────────────────────────────────
export const createFournisseur = async (req, res) => {
  try {
    const {
      code_fournisseur, raison_sociale, adresse, code_postal, ville, pays,
      telephone, email, contact_principal, delai_livraison_moyen,
      conditions_paiement, devise
    } = req.body;

    if (!raison_sociale) {
      return sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.REQUIRED_FIELD('raison_sociale'));
    }

    const userId = getUserId(req);
    const result = await pool.query(`
      INSERT INTO fournisseurs (
        code_fournisseur, raison_sociale, adresse, code_postal, ville, pays,
        telephone, email, contact_principal, delai_livraison_moyen,
        conditions_paiement, devise, actif, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13)
      RETURNING *
    `, [
      code_fournisseur, raison_sociale, adresse, code_postal, ville, pays,
      telephone, email, contact_principal, delai_livraison_moyen,
      conditions_paiement, devise || 'TND', userId
    ]);

    logger.info('Fournisseur créé', { id: result.rows[0].id_fournisseur, raison_sociale });
    return sendSuccess(res, result.rows[0], null, HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createFournisseur');
  }
};

// ── PUT /api/fournisseurs/:id ───────────────────────────────────────────
export const updateFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = getUserId(req);

    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && !['id_fournisseur', 'created_by', 'updated_by'].includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return sendError(res, 'Aucun champ à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    if (userId !== null) {
      fields.push(`updated_by = $${paramIndex}`);
      values.push(userId);
      paramIndex++;
    }
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      `UPDATE fournisseurs SET ${fields.join(', ')} WHERE id_fournisseur = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Fournisseur'));
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateFournisseur');
  }
};
