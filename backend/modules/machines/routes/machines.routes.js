/**
 * Routes Machines - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMachines,
  getMachinesById,
  createMachines,
  updateMachines,
  deleteMachines
} from '../controllers/machines.controller.js';

const router = express.Router();

router.get('/', authenticate, getMachines);
router.get('/:id', authenticate, getMachinesById);
router.post('/', authenticate, createMachines);
router.put('/:id', authenticate, updateMachines);
router.delete('/:id', authenticate, deleteMachines);

export default router;
