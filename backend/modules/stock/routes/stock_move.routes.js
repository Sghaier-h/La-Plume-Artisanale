/**
 * Routes stock_move - Module stock
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getStockMove,
  getStockMoveById,
  createStockMove,
  updateStockMove,
  deleteStockMove
} from '../controllers/stock_move.controller.js';

const router = express.Router();

router.get('/', authenticate, getStockMove);
router.get('/:id', authenticate, getStockMoveById);
router.post('/', authenticate, createStockMove);
router.put('/:id', authenticate, updateStockMove);
router.delete('/:id', authenticate, deleteStockMove);

export default router;
