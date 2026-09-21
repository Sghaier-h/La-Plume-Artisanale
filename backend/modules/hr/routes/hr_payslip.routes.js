/**
 * HR Payslip Routes
 */

import express from 'express';
import hrPayslipController from '../controllers/hr_payslip.controller.js';
import { pool } from '../../../src/utils/db.js';

const router = express.Router();

hrPayslipController(router, pool);

export default router;
