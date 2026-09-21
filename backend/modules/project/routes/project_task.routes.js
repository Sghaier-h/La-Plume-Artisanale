/**
 * Routes project_task - Module project
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProjectTask,
  getProjectTaskById,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask
} from '../controllers/project_task.controller.js';

const router = express.Router();

router.get('/', authenticate, getProjectTask);
router.get('/:id', authenticate, getProjectTaskById);
router.post('/', authenticate, createProjectTask);
router.put('/:id', authenticate, updateProjectTask);
router.delete('/:id', authenticate, deleteProjectTask);

export default router;
