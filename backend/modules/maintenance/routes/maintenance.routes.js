/**
 * Routes Maintenance - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance
} from '../controllers/maintenance.controller.js';

const router = express.Router();

router.get('/', authenticate, getMaintenance);
router.get('/:id', authenticate, getMaintenanceById);
router.post('/', authenticate, createMaintenance);
router.put('/:id', authenticate, updateMaintenance);
router.delete('/:id', authenticate, deleteMaintenance);

export default router;
