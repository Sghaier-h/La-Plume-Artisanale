/**
 * Routes stock_lot - Module stock
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getStockLot,
  getStockLotById,
  createStockLot,
  updateStockLot,
  deleteStockLot
} from '../controllers/stock_lot.controller.js';

const router = express.Router();

router.get('/', authenticate, getStockLot);
router.get('/:id', authenticate, getStockLotById);
router.post('/', authenticate, createStockLot);
router.put('/:id', authenticate, updateStockLot);
router.delete('/:id', authenticate, deleteStockLot);

export default router;
