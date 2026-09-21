/**
 * PurchaseOrder Routes
 */

import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrder,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseOrderLines
} from '../controllers/purchase_order.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrder);
router.post('/:id/confirm', confirmPurchaseOrder);
router.post('/:id/cancel', cancelPurchaseOrder);

// Routes pour les relations
router.get('/:id/lines', getPurchaseOrderLines);

export default router;
