/**
 * Routes stock_quant - Module stock
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getStockQuant,
  getStockQuantById,
  createStockQuant,
  updateStockQuant,
  deleteStockQuant
} from '../controllers/stock_quant.controller.js';

const router = express.Router();

router.get('/', authenticate, getStockQuant);
router.get('/:id', authenticate, getStockQuantById);
router.post('/', authenticate, createStockQuant);
router.put('/:id', authenticate, updateStockQuant);
router.delete('/:id', authenticate, deleteStockQuant);

export default router;
