/**
 * Routes hr_leave - Module hr
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getHrLeave,
  getHrLeaveById,
  createHrLeave,
  updateHrLeave,
  deleteHrLeave
} from '../controllers/hr_leave.controller.js';

const router = express.Router();

router.get('/', authenticate, getHrLeave);
router.get('/:id', authenticate, getHrLeaveById);
router.post('/', authenticate, createHrLeave);
router.put('/:id', authenticate, updateHrLeave);
router.delete('/:id', authenticate, deleteHrLeave);

export default router;
