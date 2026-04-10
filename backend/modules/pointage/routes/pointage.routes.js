/**
 * Routes Pointage - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPointage,
  getPointageById,
  createPointage,
  updatePointage,
  deletePointage
} from '../controllers/pointage.controller.js';

const router = express.Router();

router.get('/', authenticate, getPointage);
router.get('/:id', authenticate, getPointageById);
router.post('/', authenticate, createPointage);
router.put('/:id', authenticate, updatePointage);
router.delete('/:id', authenticate, deletePointage);

export default router;
