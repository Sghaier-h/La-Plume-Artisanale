/**
 * Alias /api/entrepots -> re-utilise les handlers warehouse.
 */
import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWarehouse,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from '../../warehouse/controllers/warehouse.controller.js';

const router = express.Router();

router.get('/', authenticate, getWarehouse);
router.post('/', authenticate, createWarehouse);
router.get('/:id(\\d+)', authenticate, getWarehouseById);
router.put('/:id(\\d+)', authenticate, updateWarehouse);
router.delete('/:id(\\d+)', authenticate, deleteWarehouse);

export default router;
