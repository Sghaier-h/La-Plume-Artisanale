/**
 * Routes hr_expense - Module hr
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getHrExpense,
  getHrExpenseById,
  createHrExpense,
  updateHrExpense,
  deleteHrExpense
} from '../controllers/hr_expense.controller.js';

const router = express.Router();

router.get('/', authenticate, getHrExpense);
router.get('/:id', authenticate, getHrExpenseById);
router.post('/', authenticate, createHrExpense);
router.put('/:id', authenticate, updateHrExpense);
router.delete('/:id', authenticate, deleteHrExpense);

export default router;
