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
  deleteOf
} from '../controllers/of.controller.js';
import {
  getAnalyseAlimentation,
  creerOfArticle,
  creerOfLot
} from '../controllers/alimentation.controller.js';
import {
  lancerProduction,
  terminerProduction,
  updateProduction,
} from '../../production/controllers/production.controller.js';
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
    const { id_machine } = req.body || {};
    await pool.query(`UPDATE ordres_fabrication SET id_machine = $1, date_modification = NOW() WHERE id = $2`, [id_machine, req.params.id]);
    return sendSuccess(res, { id: Number(req.params.id), id_machine }, 'Machine assignée');
  } catch (error) {
    return handleError(res, error, 'assignerMachineOf');
  }
});

// ─── CRUD OF ───
router.get('/', authenticate, getOf);
router.get('/:id(\\d+)', authenticate, getOfById);
router.post('/', authenticate, createOf);
router.put('/:id(\\d+)', authenticate, updateOf);
router.delete('/:id(\\d+)', authenticate, deleteOf);

export default router;
