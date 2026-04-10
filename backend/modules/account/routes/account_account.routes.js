/**
 * Routes account_account - Module account
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAccountAccount,
  getAccountAccountById,
  createAccountAccount,
  updateAccountAccount,
  deleteAccountAccount
} from '../controllers/account_account.controller.js';

const router = express.Router();

router.get('/', authenticate, getAccountAccount);
router.get('/:id', authenticate, getAccountAccountById);
router.post('/', authenticate, createAccountAccount);
router.put('/:id', authenticate, updateAccountAccount);
router.delete('/:id', authenticate, deleteAccountAccount);

export default router;
