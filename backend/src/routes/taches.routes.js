import express from 'express';
import {
  getTaches,
  getMesTaches,
  getTachesPoste,
  getTache,
  createTache,
  assignerTache,
  demarrerTache,
  terminerTache,
  pauseTache
} from '../controllers/taches.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getTaches);
router.get('/mes-taches', authenticate, getMesTaches);
router.get('/poste/:poste', authenticate, getTachesPoste);
router.get('/:id', authenticate, getTache);
router.post('/', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), createTache);
router.post('/:id/assigner', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), assignerTache);
router.post('/:id/demarrer', authenticate, demarrerTache);
router.post('/:id/terminer', authenticate, terminerTache);
router.post('/:id/pause', authenticate, pauseTache);

export default router;
