/**
 * Routes Pos - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPos,
  getPosById,
  createPos,
  updatePos,
  deletePos
} from '../controllers/pos.controller.js';

const router = express.Router();

router.get('/', authenticate, getPos);
router.get('/:id', authenticate, getPosById);
router.post('/', authenticate, createPos);
router.put('/:id', authenticate, updatePos);
router.delete('/:id', authenticate, deletePos);

export default router;
