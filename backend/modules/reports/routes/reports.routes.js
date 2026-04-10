/**
 * Routes Reports - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getReports,
  getReportsById,
  createReports,
  updateReports,
  deleteReports
} from '../controllers/reports.controller.js';

const router = express.Router();

router.get('/', authenticate, getReports);
router.get('/:id', authenticate, getReportsById);
router.post('/', authenticate, createReports);
router.put('/:id', authenticate, updateReports);
router.delete('/:id', authenticate, deleteReports);

export default router;
