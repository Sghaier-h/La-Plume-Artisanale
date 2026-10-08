/**
 * Routes Couts
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';
import {
  getCouts,
  getCoutsById,
  createCouts,
  updateCouts,
  deleteCouts,
  getCoutsByOf,
  getCoutsStats,
  recalculerCouts,
} from '../controllers/couts.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/stats/global', getCoutsStats);
router.get('/of/:id_of(\\d+)', getCoutsByOf);
router.post('/:id_of(\\d+)/recalculer', recalculerCouts);

// Budgets groupés par mois
router.get('/budgets', async (req, res) => {
  try {
    const q = `SELECT TO_CHAR(date_creation_of, 'YYYY-MM') AS mois,
                      SUM(COALESCE(cout_estime, 0))::numeric AS budget_estime,
                      SUM(COALESCE(cout_reel, 0))::numeric AS budget_reel
                 FROM ordres_fabrication
                 WHERE date_creation_of IS NOT NULL
                 GROUP BY 1 ORDER BY 1 DESC`;
    const result = await pool.query(q);
    return sendSuccess(res, result.rows, 'Budgets par mois');
  } catch (error) {
    return handleError(res, error, 'getBudgets');
  }
});

router.get('/cout-theorique/:id_of(\\d+)', async (req, res) => {
  try {
    const r = await pool.query(`SELECT id_of, cout_estime FROM ordres_fabrication WHERE id_of = $1`, [req.params.id_of]);
    return sendSuccess(res, r.rows[0] || { cout_estime: 0 }, 'Coût théorique');
  } catch (error) {
    return handleError(res, error, 'getCoutTheorique');
  }
});

router.get('/cout-reel/:id_of(\\d+)', async (req, res) => {
  try {
    const r = await pool.query(`SELECT id_of, cout_reel FROM ordres_fabrication WHERE id_of = $1`, [req.params.id_of]);
    return sendSuccess(res, r.rows[0] || { cout_reel: 0 }, 'Coût réel');
  } catch (error) {
    return handleError(res, error, 'getCoutReel');
  }
});

router.get('/analyse-ecarts/:id_of(\\d+)', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id_of, cout_estime, cout_reel, temps_production_estime, temps_production_reel FROM ordres_fabrication WHERE id_of = $1`,
      [req.params.id_of]
    );
    const row = r.rows[0] || {};
    const ecart_cout = Number(row.cout_reel || 0) - Number(row.cout_estime || 0);
    const ecart_temps = Number(row.temps_production_reel || 0) - Number(row.temps_production_estime || 0);
    return sendSuccess(res, { id_of: Number(req.params.id_of), ecart_cout, ecart_temps }, 'Analyse écarts');
  } catch (error) {
    return handleError(res, error, 'getAnalyseEcarts');
  }
});

router.get('/', getCouts);
router.post('/', createCouts);
router.get('/:id(\\d+)', getCoutsById);
router.put('/:id(\\d+)', updateCouts);
router.delete('/:id(\\d+)', deleteCouts);

export default router;
