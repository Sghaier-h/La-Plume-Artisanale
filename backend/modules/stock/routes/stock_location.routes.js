/**
 * Routes stock_location - Module stock
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getStockLocation,
  getStockLocationById,
  createStockLocation,
  updateStockLocation,
  deleteStockLocation
} from '../controllers/stock_location.controller.js';

const router = express.Router();

router.get('/', authenticate, getStockLocation);
router.get('/:id', authenticate, getStockLocationById);
router.post('/', authenticate, createStockLocation);
router.put('/:id', authenticate, updateStockLocation);
router.delete('/:id', authenticate, deleteStockLocation);

export default router;
