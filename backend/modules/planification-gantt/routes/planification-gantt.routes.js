/**
 * Routes PlanificationGantt - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPlanificationGantt,
  getPlanificationGanttById,
  createPlanificationGantt,
  updatePlanificationGantt,
  deletePlanificationGantt
} from '../controllers/planification-gantt.controller.js';

const router = express.Router();

router.get('/', authenticate, getPlanificationGantt);
router.get('/:id', authenticate, getPlanificationGanttById);
router.post('/', authenticate, createPlanificationGantt);
router.put('/:id', authenticate, updatePlanificationGantt);
router.delete('/:id', authenticate, deletePlanificationGantt);

export default router;
