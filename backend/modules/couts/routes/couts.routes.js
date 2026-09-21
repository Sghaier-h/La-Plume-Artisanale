/**
 * Routes Couts
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getCouts,
  getCoutsById,
  createCouts,
  updateCouts,
  deleteCouts,
  getCoutsByOf,
  getCoutsStats,
  recalculerCouts,
} from '../controllers/couts.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/stats/global', getCoutsStats);
router.get('/of/:id_of(\\d+)', getCoutsByOf);
router.post('/:id_of(\\d+)/recalculer', recalculerCouts);

router.get('/', getCouts);
router.post('/', createCouts);
router.get('/:id(\\d+)', getCoutsById);
router.put('/:id(\\d+)', updateCouts);
router.delete('/:id(\\d+)', deleteCouts);

export default router;
