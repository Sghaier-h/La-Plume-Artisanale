/**
 * Project Routes
 */

import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/project_project_new.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
