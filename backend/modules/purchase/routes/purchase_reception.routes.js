/**
 * Purchase Reception Routes
 * Routes pour les réceptions fournisseurs
 */

import express from 'express';
import {
  getPurchaseReceptions,
  getPurchaseReception,
  createPurchaseReception,
  createFromOrder,
  updatePurchaseReception,
  deletePurchaseReception,
  validatePurchaseReception
} from '../controllers/purchase_reception.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Routes CRUD
router.get('/', getPurchaseReceptions);
router.get('/:id', getPurchaseReception);
router.post('/', createPurchaseReception);
router.post('/from-order', createFromOrder);
router.put('/:id', updatePurchaseReception);
router.delete('/:id', deletePurchaseReception);

// Routes d'action
router.post('/:id/validate', validatePurchaseReception);

export default router;
