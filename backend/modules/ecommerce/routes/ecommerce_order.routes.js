/**
 * Ecommerce Order Routes
 * Routes pour les commandes e-commerce
 */

import express from 'express';
import {
  getEcommerceOrders,
  getEcommerceOrder,
  updateEcommerceOrder,
  confirmEcommerceOrder,
  cancelEcommerceOrder
} from '../controllers/ecommerce_order.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEcommerceOrders);
router.get('/:id', getEcommerceOrder);
router.put('/:id', updateEcommerceOrder);
router.post('/:id/confirm', confirmEcommerceOrder);
router.post('/:id/cancel', cancelEcommerceOrder);

export default router;
