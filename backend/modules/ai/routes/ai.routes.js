/**
 * Routes Ai - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAi,
  getAiById,
  createAi,
  updateAi,
  deleteAi
} from '../controllers/ai.controller.js';

const router = express.Router();

router.get('/', authenticate, getAi);
router.get('/:id', authenticate, getAiById);
router.post('/', authenticate, createAi);
router.put('/:id', authenticate, updateAi);
router.delete('/:id', authenticate, deleteAi);

export default router;
