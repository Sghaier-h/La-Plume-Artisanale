/**
 * Routes PurchaseRequests - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPurchaseRequests,
  getPurchaseRequestsById,
  createPurchaseRequests,
  updatePurchaseRequests,
  deletePurchaseRequests,
  validatePurchaseRequest,
  rejectPurchaseRequest,
  getPurchaseRequestLines,
  createPurchaseRequestLine,
  updatePurchaseRequestLine,
  deletePurchaseRequestLine
} from '../controllers/purchase-requests.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes CRUD
router.get('/', getPurchaseRequests);
router.get('/:id', getPurchaseRequestsById);
router.post('/', createPurchaseRequests);
router.put('/:id', updatePurchaseRequests);
router.delete('/:id', deletePurchaseRequests);

// Routes d'action
router.post('/:id/validate', validatePurchaseRequest);
router.post('/:id/reject', rejectPurchaseRequest);

// Routes pour les lignes
router.get('/:id/lignes', getPurchaseRequestLines);
router.post('/:id/lignes', createPurchaseRequestLine);
router.put('/:id/lignes/:lineId', updatePurchaseRequestLine);
router.delete('/:id/lignes/:lineId', deletePurchaseRequestLine);

export default router;
