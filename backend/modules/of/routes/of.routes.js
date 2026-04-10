/**
 * Routes Of - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getOf,
  getOfById,
  createOf,
  updateOf,
  deleteOf
} from '../controllers/of.controller.js';

const router = express.Router();

router.get('/', authenticate, getOf);
router.get('/:id', authenticate, getOfById);
router.post('/', authenticate, createOf);
router.put('/:id', authenticate, updateOf);
router.delete('/:id', authenticate, deleteOf);

export default router;
