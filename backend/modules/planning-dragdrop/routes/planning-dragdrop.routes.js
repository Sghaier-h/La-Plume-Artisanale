/**
 * Routes PlanningDragdrop - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPlanningDragdrop,
  getPlanningDragdropById,
  createPlanningDragdrop,
  updatePlanningDragdrop,
  deletePlanningDragdrop
} from '../controllers/planning-dragdrop.controller.js';

const router = express.Router();

router.get('/', authenticate, getPlanningDragdrop);
router.get('/:id', authenticate, getPlanningDragdropById);
router.post('/', authenticate, createPlanningDragdrop);
router.put('/:id', authenticate, updatePlanningDragdrop);
router.delete('/:id', authenticate, deletePlanningDragdrop);

export default router;
