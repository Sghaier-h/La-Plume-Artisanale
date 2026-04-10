/**
 * Routes stock_warehouse - Module stock
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getStockWarehouse,
  getStockWarehouseById,
  createStockWarehouse,
  updateStockWarehouse,
  deleteStockWarehouse
} from '../controllers/stock_warehouse.controller.js';

const router = express.Router();

router.get('/', authenticate, getStockWarehouse);
router.get('/:id', authenticate, getStockWarehouseById);
router.post('/', authenticate, createStockWarehouse);
router.put('/:id', authenticate, updateStockWarehouse);
router.delete('/:id', authenticate, deleteStockWarehouse);

export default router;
