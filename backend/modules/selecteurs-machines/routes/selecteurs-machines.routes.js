/**
 * Routes SelecteursMachines - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSelecteursMachines,
  getSelecteursMachinesById,
  createSelecteursMachines,
  updateSelecteursMachines,
  deleteSelecteursMachines
} from '../controllers/selecteurs-machines.controller.js';

const router = express.Router();

router.get('/', authenticate, getSelecteursMachines);
router.get('/:id', authenticate, getSelecteursMachinesById);
router.post('/', authenticate, createSelecteursMachines);
router.put('/:id', authenticate, updateSelecteursMachines);
router.delete('/:id', authenticate, deleteSelecteursMachines);

export default router;
