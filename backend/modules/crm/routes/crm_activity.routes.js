/**
 * CRM Activity Routes — table réelle `activites_crm`
 * Colonnes: id_activite, nom, type_activite, date_activite, description, created_at, ...
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { type_activite, search } = req.query;
    const where = [];
    const params = [];
    if (type_activite) { params.push(type_activite); where.push(`type_activite = $${params.length}`); }
    if (search)        { params.push(`%${search}%`); where.push(`(nom ILIKE $${params.length} OR description ILIKE $${params.length})`); }

    const r = await pool.query(
      `SELECT id_activite AS id, nom, type_activite, date_activite, description, created_at, updated_at
       FROM activites_crm
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY date_activite DESC NULLS LAST, id_activite DESC`,
      params
    );
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) { return handleError(res, error, 'getActivites'); }
});

router.get('/:id(\\d+)', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM activites_crm WHERE id_activite = $1 LIMIT 1`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Activité introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) { return handleError(res, error, 'getActiviteById'); }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { nom, type_activite, date_activite, description } = req.body || {};
    if (!nom) return sendError(res, 'nom requis', 400);
    const r = await pool.query(
      `INSERT INTO activites_crm (nom, type_activite, date_activite, description, created_by)
       VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, $5) RETURNING *`,
      [nom, type_activite || 'note', date_activite || null, description || null, req.user?.id || null]
    );
    return sendSuccess(res, r.rows[0], 'Activité créée', 201);
  } catch (error) { return handleError(res, error, 'createActivite'); }
});

router.put('/:id(\\d+)', authenticate, async (req, res) => {
  try {
    const { nom, type_activite, date_activite, description } = req.body || {};
    const r = await pool.query(
      `UPDATE activites_crm
         SET nom = COALESCE($2, nom), type_activite = COALESCE($3, type_activite),
             date_activite = COALESCE($4, date_activite), description = COALESCE($5, description),
             updated_by = $6
       WHERE id_activite = $1 RETURNING *`,
      [req.params.id, nom ?? null, type_activite ?? null, date_activite ?? null, description ?? null, req.user?.id || null]
    );
    if (!r.rows[0]) return sendError(res, 'Activité introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) { return handleError(res, error, 'updateActivite'); }
});

router.delete('/:id(\\d+)', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM activites_crm WHERE id_activite = $1 RETURNING id_activite`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Activité introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_activite }, 'Supprimée');
  } catch (error) { return handleError(res, error, 'deleteActivite'); }
});

export default router;
