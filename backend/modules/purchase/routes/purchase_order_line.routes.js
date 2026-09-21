/**
 * Routes purchase_order_line - Module purchase
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPurchaseOrderLine,
  getPurchaseOrderLineById,
  createPurchaseOrderLine,
  updatePurchaseOrderLine,
  deletePurchaseOrderLine
} from '../controllers/purchase_order_line.controller.js';

const router = express.Router();

router.get('/', authenticate, getPurchaseOrderLine);
router.get('/:id', authenticate, getPurchaseOrderLineById);
router.post('/', authenticate, createPurchaseOrderLine);
router.put('/:id', authenticate, updatePurchaseOrderLine);
router.delete('/:id', authenticate, deletePurchaseOrderLine);

export default router;
