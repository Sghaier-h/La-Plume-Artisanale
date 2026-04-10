/**
 * Account Reconciliation Routes
 * Routes pour les rapprochements bancaires
 */

import express from 'express';
import {
  getReconciliations,
  getReconciliation,
  createReconciliation,
  updateReconciliation,
  deleteReconciliation,
  validateReconciliation,
  autoMatch,
  getUnmatchedLines,
  matchLines
} from '../controllers/account_reconciliation.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Routes CRUD
router.get('/', getReconciliations);
router.get('/:id', getReconciliation);
router.post('/', createReconciliation);
router.put('/:id', updateReconciliation);
router.delete('/:id', deleteReconciliation);

// Routes d'action
router.post('/:id/validate', validateReconciliation);
router.post('/:id/auto-match', autoMatch);
router.get('/:id/unmatched-lines', getUnmatchedLines);
router.post('/:id/match', matchLines);

export default router;
