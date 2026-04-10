/**
 * Routes Warehouse - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWarehouse,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../controllers/warehouse.controller.js';

const router = express.Router();

router.get('/', authenticate, getWarehouse);
router.get('/:id', authenticate, getWarehouseById);
router.post('/', authenticate, createWarehouse);
router.put('/:id', authenticate, updateWarehouse);
router.delete('/:id', authenticate, deleteWarehouse);

export default router;
