/**
 * Ecommerce Product Routes
 * Routes pour les produits e-commerce
 */

import express from 'express';
import {
  getEcommerceProducts,
  getEcommerceProduct,
  createEcommerceProduct,
  updateEcommerceProduct,
  deleteEcommerceProduct
} from '../controllers/ecommerce_product.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEcommerceProducts);
router.get('/:id', getEcommerceProduct);
router.post('/', createEcommerceProduct);
router.put('/:id', updateEcommerceProduct);
router.delete('/:id', deleteEcommerceProduct);

export default router;
