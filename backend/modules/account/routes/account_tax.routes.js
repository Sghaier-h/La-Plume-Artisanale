/**
 * Routes account_tax - Module account
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAccountTax,
  getAccountTaxById,
  createAccountTax,
  updateAccountTax,
  deleteAccountTax
} from '../controllers/account_tax.controller.js';

const router = express.Router();

router.get('/', authenticate, getAccountTax);
router.get('/:id', authenticate, getAccountTaxById);
router.post('/', authenticate, createAccountTax);
router.put('/:id', authenticate, updateAccountTax);
router.delete('/:id', authenticate, deleteAccountTax);

export default router;
