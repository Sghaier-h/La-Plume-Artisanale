/**
 * Routes Couts - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCouts,
  getCoutsById,
  createCouts,
  updateCouts,
  deleteCouts
} from '../controllers/couts.controller.js';

const router = express.Router();

router.get('/', authenticate, getCouts);
router.get('/:id', authenticate, getCoutsById);
router.post('/', authenticate, createCouts);
router.put('/:id', authenticate, updateCouts);
router.delete('/:id', authenticate, deleteCouts);

export default router;
