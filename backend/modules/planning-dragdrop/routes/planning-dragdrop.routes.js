/**
 * Routes Planning Drag-and-Drop
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getPlanning,
  getPlanningByMachine,
  getChargeStats,
  assignerOf,
  reordonnerUn,
  reordonnerBatch,
  demarrer,
  terminer,
  deletePlanning,
} from '../controllers/planning-dragdrop.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/stats/charge', getChargeStats);
router.get('/machine/:id_machine(\\d+)', getPlanningByMachine);
router.post('/assigner', assignerOf);
router.post('/reordonner', reordonnerBatch);
router.put('/:id(\\d+)/reordonner', reordonnerUn);
router.put('/:id(\\d+)/demarrer', demarrer);
router.put('/:id(\\d+)/terminer', terminer);

router.get('/', getPlanning);
router.delete('/:id(\\d+)', deletePlanning);

export default router;
