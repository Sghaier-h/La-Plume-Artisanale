/**
 * Routes Planification Gantt
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProjets,
  getTachesGantt,
  getRessources,
  getGanttData,
  createTacheGantt,
} from '../controllers/planification-gantt.controller.js';

const router = express.Router();
router.use(authenticate);

router.get('/projets', getProjets);
router.get('/taches', getTachesGantt);
router.get('/ressources', getRessources);
router.get('/gantt-data', getGanttData);
router.post('/taches', createTacheGantt);

export default router;
