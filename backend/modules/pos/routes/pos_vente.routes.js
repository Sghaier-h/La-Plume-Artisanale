/**
 * POS Vente Routes
 * Routes pour les ventes POS
 */

import express from 'express';
import {
  getSales,
  getSale,
  createSale
} from '../controllers/pos_vente.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getSales);
router.get('/:id', getSale);
router.post('/', createSale);

export default router;
