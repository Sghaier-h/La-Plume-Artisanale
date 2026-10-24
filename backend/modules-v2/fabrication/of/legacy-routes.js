/**
 * Routes Of - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getOf,
  getOfById,
  createOf,
  updateOf,
  deleteOf,
  getOFDetailComplet
} from './legacy-controller.js';
import {
  getAnalyseAlimentation,
  creerOfArticle,
  creerOfLot
} from './legacy-alimentation-controller.js';
import {
  lancerProduction,
  terminerProduction,
  updateProduction,
} from './legacy-production-controller.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';

const router = express.Router();

// ─── Alimentation stock (AVANT /:id pour éviter conflits) ───
router.get('/alimentation/analyse', authenticate, getAnalyseAlimentation);
router.post('/alimentation/article/:id(\\d+)', authenticate, creerOfArticle);
router.post('/alimentation/lot', authenticate, creerOfLot);

// ─── Actions (proxies vers production) ───
router.post('/:id(\\d+)/demarrer', authenticate, lancerProduction);
router.post('/:id(\\d+)/terminer', authenticate, terminerProduction);
router.post('/:id(\\d+)/assigner-machine', authenticate, async (req, res) => {
  try {
    const { id_machine, date_debut_prevue, date_fin_prevue } = req.body || {};
    const idOf = parseInt(req.params.id, 10);
    const userId = req.user?.id || req.user?.userId || null;

    // Phase T1 — fix: la table `ordres_fabrication` utilise `id_machine_prevue`
    // (pas `id_machine`) et sa PK est `id_of` (pas `id`).
    const r = await pool.query(
      `UPDATE ordres_fabrication
          SET id_machine_prevue = $1,
              date_debut_prevue = COALESCE($2, date_debut_prevue),
              date_fin_prevue   = COALESCE($3, date_fin_prevue),
              date_modification = NOW(),
              updated_by        = COALESCE($4, updated_by)
        WHERE id_of = $5
        RETURNING *`,
      [id_machine, date_debut_prevue || null, date_fin_prevue || null, userId, idOf]
    );
    if (r.rows.length === 0) {
      return sendError(res, 'OF introuvable', 404);
    }

    // Enregistre la planification côté planning_machines (best-effort)
    try {
      await pool.query(
        `INSERT INTO planning_machines
           (id_machine, id_of, date_debut_prevue, date_fin_prevue, statut,
            observations, date_creation, created_by)
         VALUES ($1, $2, $3, $4, 'planifie', $5, NOW(), $6)`,
        [id_machine, idOf, date_debut_prevue || null, date_fin_prevue || null,
         `Assignation machine OF ${r.rows[0].numero_of}`, userId]
      );
    } catch (e) { /* non bloquant si planning_machines rejette */ }

    return sendSuccess(res, r.rows[0], 'Machine assignée');
  } catch (error) {
    return handleError(res, error, 'assignerMachineOf');
  }
});

// ─── Détail complet (timeline, suivis, coûts, lots, NC, MP) ───
router.get('/:id(\\d+)/detail-complet', authenticate, getOFDetailComplet);

// ─── CRUD OF ───
router.get('/', authenticate, getOf);
router.get('/:id(\\d+)', authenticate, getOfById);
router.post('/', authenticate, createOf);
router.put('/:id(\\d+)', authenticate, updateOf);
router.delete('/:id(\\d+)', authenticate, deleteOf);

export default router;
