/**
 * CRM Opportunity Routes — table réelle `opportunites_crm`
 * Colonnes: id_opportunite, nom, id_client, montant_prevue, probabilite,
 *           date_fermeture_prevue, statut, created_at, ...
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, sendError, handleError } from '../../../src/utils/error.helper.js';

const router = express.Router();

// GET /api/crm/opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    const { statut, id_client, search } = req.query;
    const where = [];
    const params = [];

    if (statut)    { params.push(statut);    where.push(`o.statut = $${params.length}`); }
    if (id_client) { params.push(id_client); where.push(`o.id_client = $${params.length}`); }
    if (search)    { params.push(`%${search}%`); where.push(`(o.nom ILIKE $${params.length} OR c.raison_sociale ILIKE $${params.length})`); }

    const sql = `
      SELECT o.id_opportunite AS id, o.nom, o.id_client, o.montant_prevue, o.probabilite,
             o.date_fermeture_prevue, o.statut, o.created_at, o.updated_at,
             c.raison_sociale AS client_nom
      FROM opportunites_crm o
      LEFT JOIN clients c ON o.id_client = c.id_client
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY o.created_at DESC NULLS LAST, o.id_opportunite DESC
    `;
    const r = await pool.query(sql, params);
    return sendSuccess(res, { items: r.rows, total: r.rows.length });
  } catch (error) {
    return handleError(res, error, 'getOpportunites');
  }
});

router.get('/:id(\\d+)', authenticate, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT o.*, c.raison_sociale AS client_nom
       FROM opportunites_crm o
       LEFT JOIN clients c ON o.id_client = c.id_client
       WHERE o.id_opportunite = $1 LIMIT 1`,
      [req.params.id]
    );
    if (!r.rows[0]) return sendError(res, 'Opportunité introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'getOpportuniteById');
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { nom, id_client, montant_prevue, probabilite, date_fermeture_prevue, statut } = req.body || {};
    if (!nom) return sendError(res, 'nom requis', 400);
    const r = await pool.query(
      `INSERT INTO opportunites_crm (nom, id_client, montant_prevue, probabilite, date_fermeture_prevue, statut, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nom, id_client || null, montant_prevue || 0, probabilite || 0, date_fermeture_prevue || null, statut || 'nouveau', req.user?.id || null]
    );
    return sendSuccess(res, r.rows[0], 'Opportunité créée', 201);
  } catch (error) {
    return handleError(res, error, 'createOpportunite');
  }
});

router.put('/:id(\\d+)', authenticate, async (req, res) => {
  try {
    const { nom, montant_prevue, probabilite, date_fermeture_prevue, statut } = req.body || {};
    const r = await pool.query(
      `UPDATE opportunites_crm
         SET nom = COALESCE($2, nom),
             montant_prevue = COALESCE($3, montant_prevue),
             probabilite = COALESCE($4, probabilite),
             date_fermeture_prevue = COALESCE($5, date_fermeture_prevue),
             statut = COALESCE($6, statut),
             updated_by = $7
       WHERE id_opportunite = $1 RETURNING *`,
      [req.params.id, nom ?? null, montant_prevue ?? null, probabilite ?? null, date_fermeture_prevue ?? null, statut ?? null, req.user?.id || null]
    );
    if (!r.rows[0]) return sendError(res, 'Opportunité introuvable', 404);
    return sendSuccess(res, r.rows[0]);
  } catch (error) {
    return handleError(res, error, 'updateOpportunite');
  }
});

router.put('/:id(\\d+)/qualify', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`UPDATE opportunites_crm SET statut = 'qualifie' WHERE id_opportunite = $1 RETURNING *`, [req.params.id]);
    return sendSuccess(res, r.rows[0], 'Qualifiée');
  } catch (error) { return handleError(res, error, 'qualifyOpp'); }
});

router.put('/:id(\\d+)/win', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`UPDATE opportunites_crm SET statut = 'gagne', probabilite = 100 WHERE id_opportunite = $1 RETURNING *`, [req.params.id]);
    return sendSuccess(res, r.rows[0], 'Gagnée');
  } catch (error) { return handleError(res, error, 'winOpp'); }
});

router.put('/:id(\\d+)/lose', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`UPDATE opportunites_crm SET statut = 'perdu', probabilite = 0 WHERE id_opportunite = $1 RETURNING *`, [req.params.id]);
    return sendSuccess(res, r.rows[0], 'Perdue');
  } catch (error) { return handleError(res, error, 'loseOpp'); }
});

router.delete('/:id(\\d+)', authenticate, async (req, res) => {
  try {
    const r = await pool.query(`DELETE FROM opportunites_crm WHERE id_opportunite = $1 RETURNING id_opportunite`, [req.params.id]);
    if (!r.rows[0]) return sendError(res, 'Opportunité introuvable', 404);
    return sendSuccess(res, { id: r.rows[0].id_opportunite }, 'Supprimée');
  } catch (error) { return handleError(res, error, 'deleteOpp'); }
});

export default router;
