/**
 * Routes Commercial
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCommercial,
  getCommercialById,
  createCommercial,
  updateCommercial,
  deleteCommercial,
  getStatsGlobal,
  getPerformance,
  getDashboard,
  getLeaderboard,
  getPipeline,
  getAgenda,
  setObjectif,
  getTeamPerformance,
} from '../controllers/commercial.controller.js';

const router = express.Router();
router.use(authenticate);

// ─── Routes fixes (avant les paramètres dynamiques) ───────────────
router.get('/stats/global', getStatsGlobal);
router.get('/leaderboard', getLeaderboard);
router.get('/team/performance', getTeamPerformance);

// ─── Routes avec paramètre :id ────────────────────────────────────
router.get('/:id(\\d+)/dashboard', getDashboard);
router.get('/:id(\\d+)/performance', getPerformance);
router.get('/:id(\\d+)/pipeline', getPipeline);
router.get('/:id(\\d+)/agenda', getAgenda);
router.post('/:id(\\d+)/objectif', setObjectif);

router.get('/', getCommercial);
router.post('/', createCommercial);
router.get('/:id(\\d+)', getCommercialById);
router.put('/:id(\\d+)', updateCommercial);
router.delete('/:id(\\d+)', deleteCommercial);

export default router;
