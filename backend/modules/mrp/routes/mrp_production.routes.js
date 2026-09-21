/**
 * MrpProduction Routes
 */

import express from 'express';
import {
  getMrpProductions,
  getMrpProduction,
  confirmMrpProduction,
  startMrpProduction,
  doneMrpProduction,
  getProductionMoves
} from '../controllers/mrp_production.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getMrpProductions);
router.get('/:id', getMrpProduction);
router.post('/:id/confirm', confirmMrpProduction);
router.post('/:id/start', startMrpProduction);
router.post('/:id/done', doneMrpProduction);

// Routes pour les relations
router.get('/:id/moves', getProductionMoves);

export default router;
