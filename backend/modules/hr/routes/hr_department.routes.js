/**
 * Routes hr_department - Module hr
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getHrDepartment,
  getHrDepartmentById,
  createHrDepartment,
  updateHrDepartment,
  deleteHrDepartment
} from '../controllers/hr_department.controller.js';

const router = express.Router();

router.get('/', authenticate, getHrDepartment);
router.get('/:id', authenticate, getHrDepartmentById);
router.post('/', authenticate, createHrDepartment);
router.put('/:id', authenticate, updateHrDepartment);
router.delete('/:id', authenticate, deleteHrDepartment);

export default router;
