/**
 * Routes product_variant - Module product
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProductVariant,
  getProductVariantById,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant
} from '../controllers/product_variant.controller.js';

const router = express.Router();

router.get('/', authenticate, getProductVariant);
router.get('/:id', authenticate, getProductVariantById);
router.post('/', authenticate, createProductVariant);
router.put('/:id', authenticate, updateProductVariant);
router.delete('/:id', authenticate, deleteProductVariant);

export default router;
