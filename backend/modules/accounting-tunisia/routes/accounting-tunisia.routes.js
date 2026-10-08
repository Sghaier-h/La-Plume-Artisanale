/**
 * Routes Accounting Tunisia
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getTaxes,
  getTaxById,
  getFiscalPositions,
  getTaxReports,
  generateTaxReport,
  validateTaxReport,
  getChartOfAccounts,
  initChartOfAccounts,
} from '../controllers/accounting-tunisia.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/taxes', getTaxes);
router.get('/taxes/:id', getTaxById);

router.get('/fiscal-positions', getFiscalPositions);

router.get('/tax-reports', getTaxReports);
router.post('/tax-reports/generate', generateTaxReport);
router.put('/tax-reports/:id(\\d+)/validate', validateTaxReport);
router.post('/tax-reports/:id(\\d+)/validate', validateTaxReport);

router.get('/chart-of-accounts', getChartOfAccounts);
router.post('/chart-of-accounts/init', initChartOfAccounts);

export default router;
