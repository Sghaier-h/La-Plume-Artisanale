/**
 * Routes product_category - Module product
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProductCategory,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
} from '../controllers/product_category.controller.js';

const router = express.Router();

router.get('/', authenticate, getProductCategory);
router.get('/:id', authenticate, getProductCategoryById);
router.post('/', authenticate, createProductCategory);
router.put('/:id', authenticate, updateProductCategory);
router.delete('/:id', authenticate, deleteProductCategory);

export default router;
