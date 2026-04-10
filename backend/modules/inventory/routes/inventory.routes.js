/**
 * Routes inventory - Module inventory
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
} from '../controllers/inventory.controller.js';

const router = express.Router();

router.get('/', authenticate, getInventory);
router.get('/:id', authenticate, getInventoryById);
router.post('/', authenticate, createInventory);
router.put('/:id', authenticate, updateInventory);
router.delete('/:id', authenticate, deleteInventory);

export default router;
