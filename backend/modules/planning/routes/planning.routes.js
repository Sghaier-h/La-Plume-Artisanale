/**
 * Routes Planning - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPlanning,
  getPlanningById,
  createPlanning,
  updatePlanning,
  deletePlanning
} from '../controllers/planning.controller.js';

const router = express.Router();

router.get('/', authenticate, getPlanning);
router.get('/:id', authenticate, getPlanningById);
router.post('/', authenticate, createPlanning);
router.put('/:id', authenticate, updatePlanning);
router.delete('/:id', authenticate, deletePlanning);

export default router;
