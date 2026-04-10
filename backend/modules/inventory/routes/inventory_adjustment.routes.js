/**
 * Routes inventory_adjustment - Module inventory
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getInventoryAdjustment,
  getInventoryAdjustmentById,
  createInventoryAdjustment,
  updateInventoryAdjustment,
  deleteInventoryAdjustment
} from '../controllers/inventory_adjustment.controller.js';

const router = express.Router();

router.get('/', authenticate, getInventoryAdjustment);
router.get('/:id', authenticate, getInventoryAdjustmentById);
router.post('/', authenticate, createInventoryAdjustment);
router.put('/:id', authenticate, updateInventoryAdjustment);
router.delete('/:id', authenticate, deleteInventoryAdjustment);

export default router;
