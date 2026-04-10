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
router.get('/:id', authenticate, getEcommerceById);
router.post('/', authenticate, createEcommerce);
router.put('/:id', authenticate, updateEcommerce);
router.delete('/:id', authenticate, deleteEcommerce);

export default router;
