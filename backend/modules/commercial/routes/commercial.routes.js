/**
 * Routes Commercial - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCommercial,
  getCommercialById,
  createCommercial,
  updateCommercial,
  deleteCommercial
} from '../controllers/commercial.controller.js';

const router = express.Router();

router.get('/', authenticate, getCommercial);
router.get('/:id', authenticate, getCommercialById);
router.post('/', authenticate, createCommercial);
router.put('/:id', authenticate, updateCommercial);
router.delete('/:id', authenticate, deleteCommercial);

export default router;
