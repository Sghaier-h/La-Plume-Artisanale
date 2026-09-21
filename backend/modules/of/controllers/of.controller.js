/**
 * Contrôleur OF (Ordres de Fabrication) — Module modulaire
 * Requête la table `ordres_fabrication` (pas la table générique `of`)
 */

import { pool } from '../../../src/utils/db.js';
import { logger } from '../../../src/utils/logger.js';
import { QueryBuilder } from '../../../src/services/query-builder.service.js';
import { getUserId } from '../../../src/utils/audit.helper.js';
import { sendError, sendSuccess, handleError, HTTP_STATUS, ERROR_MESSAGES } from '../../../src/utils/error.helper.js';

// ── GET /api/of ─────────────────────────────────────────────────────────
export const getOf = async (req, res) => {
  try {
    const { search, statut, priorite, id_article, date_debut, date_fin, page, limit } = req.query;

    const qb = new QueryBuilder('ordres_fabrication', 'o')
      .select([
        'o.*',
        'a.code_article', 'a.designation as article_designation',
        'ac.id_commande', 'c.numero_commande'
      ])
      .join('LEFT JOIN articles_catalogue a ON o.id_article = a.id_article')
      .join('LEFT JOIN articles_commande ac ON o.id_article_commande = ac.id_article_commande')
      .join('LEFT JOIN commandes c ON ac.id_commande = c.id_commande')
      .search(['o.numero_of', 'a.code_article', 'a.designation'], search)
      .whereIf('o.statut = $?', statut)
      .whereIf('o.priorite = $?', priorite)
      .whereIf('o.id_article = $?', id_article)
      .dateRange('o.date_creation_of', date_debut, date_fin)
      .orderBy('o.date_creation_of DESC')
      .paginate(parseInt(page) || 1, parseInt(limit) || 50);

    const result = await qb.execute(pool);
    return sendSuccess(res, result);
  } catch (error) {
    return handleError(res, error, 'getOf');
  }
};

// ── GET /api/of/:id ─────────────────────────────────────────────────────
export const getOfById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT o.*,
              a.code_article, a.designation as article_designation,
              ac.id_commande, ac.quantite_commandee, ac.ref_commerciale,
              c.numero_commande, cl.raison_sociale as client_nom
       FROM ordres_fabrication o
       LEFT JOIN articles_catalogue a ON o.id_article = a.id_article
       LEFT JOIN articles_commande ac ON o.id_article_commande = ac.id_article_commande
       LEFT JOIN commandes c ON ac.id_commande = c.id_commande
       LEFT JOIN clients cl ON c.id_client = cl.id_client
       WHERE o.id_of = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('Ordre de fabrication'));
    }

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getOfById');
  }
};

// ── POST /api/of ────────────────────────────────────────────────────────
export const createOf = async (req, res) => {
  try {
    const userId = getUserId(req) || 1;
    const {
      id_article, id_article_commande, quantite_a_produire,
      date_debut_prevue, date_fin_prevue, priorite, observations
    } = req.body;

    if (!id_article || !quantite_a_produire) {
      return sendError(res, 'Article et quantité à produire requis', HTTP_STATUS.BAD_REQUEST);
    }

    // Générer numéro OF
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM ordres_fabrication WHERE date_creation_of >= CURRENT_DATE"
    );
    const numero = `OF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(parseInt(countResult.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await pool.query(
      `INSERT INTO ordres_fabrication (
        numero_of, id_article, id_article_commande, quantite_a_produire,
        date_creation_of, date_debut_prevue, date_fin_prevue,
        priorite, statut, observations, cree_par, created_by
      ) VALUES ($1,$2,$3,$4,CURRENT_DATE,$5,$6,$7,'planifie',$8,$9,$9)
      RETURNING *`,
      [
        numero, id_article, id_article_commande || null,
        quantite_a_produire, date_debut_prevue || null, date_fin_prevue || null,
        priorite || 'normale', observations || null, userId
      ]
    );

    logger.info('OF créé', { id: result.rows[0].id_of, numero });
    return sendSuccess(res, result.rows[0], 'OF créé avec succès', HTTP_STATUS.CREATED);
  } catch (error) {
    return handleError(res, error, 'createOf');
  }
};

// ── PUT /api/of/:id ─────────────────────────────────────────────────────
export const updateOf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || 1;
    const data = req.body;

    const existing = await pool.query('SELECT id_of, statut FROM ordres_fabrication WHERE id_of = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('OF'));
    }

    const excludedFields = ['id_of', 'numero_of', 'date_creation_of', 'created_by', 'updated_by', 'cree_par'];
    const fields = Object.keys(data).filter(f => !excludedFields.includes(f) && data[f] !== undefined);

    if (fields.length === 0) {
      return sendError(res, 'Aucune donnée à mettre à jour', HTTP_STATUS.BAD_REQUEST);
    }

    const values = fields.map(f => data[f]);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE ordres_fabrication SET ${setClause}, date_modification = NOW(), updated_by = $${values.length + 1}
       WHERE id_of = $${values.length + 2} RETURNING *`,
      [...values, userId, id]
    );

    return sendSuccess(res, result.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateOf');
  }
};

// ── DELETE /api/of/:id ──────────────────────────────────────────────────
export const deleteOf = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id_of, statut FROM ordres_fabrication WHERE id_of = $1', [id]);
    if (existing.rows.length === 0) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND('OF'));
    }

    // Soft delete via statut
    await pool.query(
      "UPDATE ordres_fabrication SET statut = 'annule', date_modification = NOW() WHERE id_of = $1",
      [id]
    );

    logger.info('OF annulé', { id });
    return sendSuccess(res, null, 'OF annulé avec succès');
  } catch (error) {
    return handleError(res, error, 'deleteOf');
  }
};
