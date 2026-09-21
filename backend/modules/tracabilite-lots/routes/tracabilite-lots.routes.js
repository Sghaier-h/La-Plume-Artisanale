/**
 * Routes TracabiliteLots - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getTracabiliteLots,
  getTracabiliteLotsById,
  createTracabiliteLots,
  updateTracabiliteLots,
  deleteTracabiliteLots
} from '../controllers/tracabilite-lots.controller.js';

const router = express.Router();

router.get('/', authenticate, getTracabiliteLots);
router.get('/:id', authenticate, getTracabiliteLotsById);
router.post('/', authenticate, createTracabiliteLots);
router.put('/:id', authenticate, updateTracabiliteLots);
router.delete('/:id', authenticate, deleteTracabiliteLots);

export default router;
