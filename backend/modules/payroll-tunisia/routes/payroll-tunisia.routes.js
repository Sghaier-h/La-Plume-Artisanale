/**
 * Routes Payroll Tunisia
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSalaryRules,
  getCnssRates,
  getIrppBrackets,
  getStructures,
  createStructure,
  computePayroll,
  computeFromPointage,
} from '../controllers/payroll-tunisia.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/salary-rules', getSalaryRules);
router.get('/cnss-rates', getCnssRates);
router.get('/irpp-bracket', getIrppBrackets);
router.get('/irpp-brackets', getIrppBrackets); // alias

router.get('/structures', getStructures);
router.post('/structures', createStructure);

router.post('/compute', computePayroll);
router.post('/compute-from-pointage', computeFromPointage);

export default router;
