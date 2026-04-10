/**
 * Routes Parametrage - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getParametrage,
  getParametrageById,
  createParametrage,
  updateParametrage,
  deleteParametrage
} from '../controllers/parametrage.controller.js';

const router = express.Router();

router.get('/', authenticate, getParametrage);
router.get('/:id', authenticate, getParametrageById);
router.post('/', authenticate, createParametrage);
router.put('/:id', authenticate, updateParametrage);
router.delete('/:id', authenticate, deleteParametrage);

export default router;
