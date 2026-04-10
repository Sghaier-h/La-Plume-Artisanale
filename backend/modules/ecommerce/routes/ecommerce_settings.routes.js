/**
 * Ecommerce Settings Routes
 * Routes pour les paramètres e-commerce
 */

import express from 'express';
import {
  getEcommerceSettings,
  updateEcommerceSettings
} from '../controllers/ecommerce_settings.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEcommerceSettings);
router.put('/', updateEcommerceSettings);

export default router;
