/**
 * Routes PayrollTunisia - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPayrollTunisia,
  getPayrollTunisiaById,
  createPayrollTunisia,
  updatePayrollTunisia,
  deletePayrollTunisia
} from '../controllers/payroll-tunisia.controller.js';

const router = express.Router();

router.get('/', authenticate, getPayrollTunisia);
router.get('/:id', authenticate, getPayrollTunisiaById);
router.post('/', authenticate, createPayrollTunisia);
router.put('/:id', authenticate, updatePayrollTunisia);
router.delete('/:id', authenticate, deletePayrollTunisia);

export default router;
