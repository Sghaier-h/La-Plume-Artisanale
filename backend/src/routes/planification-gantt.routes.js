import express from 'express';
import {
  getProjets,
  getTaches,
  createTache,
  getRessources,
  getGanttData
} from '../controllers/planification-gantt.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/projets', authenticate, getProjets);
router.get('/taches', authenticate, getTaches);
router.post('/taches', authenticate, authorize('ADMIN', 'RESPONSABLE_PRODUCTION'), createTache);
router.get('/ressources', authenticate, getRessources);
router.get('/gantt-data', authenticate, getGanttData);

export default router;
