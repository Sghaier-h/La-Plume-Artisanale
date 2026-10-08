/**
 * Alias /api/inventaires -> re-utilise les handlers inventory_adjustment.
 */
import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getInventoryAdjustment,
  getInventoryAdjustmentById,
  createInventoryAdjustment,
  updateInventoryAdjustment,
  deleteInventoryAdjustment
} from '../../inventory/controllers/inventory_adjustment.controller.js';

const router = express.Router();

router.get('/', authenticate, getInventoryAdjustment);
router.post('/', authenticate, createInventoryAdjustment);
router.get('/:id(\\d+)', authenticate, getInventoryAdjustmentById);
router.put('/:id(\\d+)', authenticate, updateInventoryAdjustment);
router.delete('/:id(\\d+)', authenticate, deleteInventoryAdjustment);

export default router;
