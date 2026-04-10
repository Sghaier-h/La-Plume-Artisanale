/**
 * StockPicking Routes
 */

import express from 'express';
import {
  getStockPickings,
  getStockPicking,
  confirmStockPicking,
  assignStockPicking,
  doneStockPicking,
  getPickingMoves
} from '../controllers/stock_picking.controller.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getStockPickings);
router.get('/:id', getStockPicking);
router.post('/:id/confirm', confirmStockPicking);
router.post('/:id/assign', assignStockPicking);
router.post('/:id/done', doneStockPicking);

// Routes pour les relations
router.get('/:id/moves', getPickingMoves);

export default router;
