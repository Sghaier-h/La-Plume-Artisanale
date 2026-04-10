/**
 * Routes AccountingTunisia - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAccountingTunisia,
  getAccountingTunisiaById,
  createAccountingTunisia,
  updateAccountingTunisia,
  deleteAccountingTunisia
} from '../controllers/accounting-tunisia.controller.js';

const router = express.Router();

router.get('/', authenticate, getAccountingTunisia);
router.get('/:id', authenticate, getAccountingTunisiaById);
router.post('/', authenticate, createAccountingTunisia);
router.put('/:id', authenticate, updateAccountingTunisia);
router.delete('/:id', authenticate, deleteAccountingTunisia);

export default router;
