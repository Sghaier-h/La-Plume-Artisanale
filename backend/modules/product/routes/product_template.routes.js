/**
 * ProductTemplate Routes
 */

import express from 'express';
import {
  getProductTemplates,
  getProductTemplate,
  createProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
  getProductStock,
  getProductMovements,
  uploadProductImage,
  deleteProductImage,
  getProductImages
} from '../controllers/product_template.controller.js';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { uploadSingle } from '../utils/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getProductTemplates);
router.get('/:id', getProductTemplate);
router.post('/', createProductTemplate);
router.put('/:id', updateProductTemplate);
router.delete('/:id', deleteProductTemplate);

// Routes pour les relations
router.get('/:id/stock', getProductStock);
router.get('/:id/movements', getProductMovements);

// Routes pour les images
router.post('/:id/image', uploadSingle, uploadProductImage);
router.delete('/:id/image/:imageId', deleteProductImage);
router.get('/:id/images', getProductImages);

export default router;
