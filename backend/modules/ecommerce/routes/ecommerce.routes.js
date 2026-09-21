/**
 * Routes Ecommerce - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getEcommerce,
  getEcommerceById,
  createEcommerce,
  updateEcommerce,
  deleteEcommerce
} from '../controllers/ecommerce.controller.js';

const router = express.Router();

router.get('/', authenticate, getEcommerce);
router.get('/:id(\\d+)', authenticate, getEcommerceById);
router.post('/', authenticate, createEcommerce);
router.put('/:id(\\d+)', authenticate, updateEcommerce);
router.delete('/:id(\\d+)', authenticate, deleteEcommerce);

export default router;
