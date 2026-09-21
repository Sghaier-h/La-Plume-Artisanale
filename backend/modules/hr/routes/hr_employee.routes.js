/**
 * HR Employee Routes
 */

import express from 'express';
import {
  getHREmployees,
  getHREmployee,
  createHREmployee,
  updateHREmployee,
  deleteHREmployee
} from '../controllers/hr_employee_new.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getHREmployees);
router.get('/:id', getHREmployee);
router.post('/', createHREmployee);
router.put('/:id', updateHREmployee);
router.delete('/:id', deleteHREmployee);

export default router;
