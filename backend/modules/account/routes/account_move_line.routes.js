/**
 * Routes account_move_line - Module account
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAccountMoveLine,
  getAccountMoveLineById,
  createAccountMoveLine,
  updateAccountMoveLine,
  deleteAccountMoveLine
} from '../controllers/account_move_line.controller.js';

const router = express.Router();

router.get('/', authenticate, getAccountMoveLine);
router.get('/:id', authenticate, getAccountMoveLineById);
router.post('/', authenticate, createAccountMoveLine);
router.put('/:id', authenticate, updateAccountMoveLine);
router.delete('/:id', authenticate, deleteAccountMoveLine);

export default router;
