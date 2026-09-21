/**
 * Routes StockMultiEntrepots - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getStockMultiEntrepots,
  getStockMultiEntrepotsById,
  createStockMultiEntrepots,
  updateStockMultiEntrepots,
  deleteStockMultiEntrepots
} from '../controllers/stock-multi-entrepots.controller.js';

const router = express.Router();

router.get('/', authenticate, getStockMultiEntrepots);
router.get('/:id', authenticate, getStockMultiEntrepotsById);
router.post('/', authenticate, createStockMultiEntrepots);
router.put('/:id', authenticate, updateStockMultiEntrepots);
router.delete('/:id', authenticate, deleteStockMultiEntrepots);

export default router;
