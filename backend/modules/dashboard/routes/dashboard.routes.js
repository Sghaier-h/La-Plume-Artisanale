/**
 * Routes Dashboard - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getDashboard,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.get('/', authenticate, getDashboard);
router.get('/:id', authenticate, getDashboardById);
router.post('/', authenticate, createDashboard);
router.put('/:id', authenticate, updateDashboard);
router.delete('/:id', authenticate, deleteDashboard);

export default router;
