/**
 * Routes Taches
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getTaches,
  getTachesById,
  createTaches,
  updateTaches,
  deleteTaches,
  demarrerTache,
  terminerTache,
  updateProgression,
  getTachesStats,
  getTachesOperateurDay,
} from '../controllers/taches.controller.js';

const router = express.Router();
router.use(authenticate);

// Chemins spécifiques avant /:id
router.get('/stats/global', getTachesStats);
router.get('/operateur/:id_operateur(\\d+)/day', getTachesOperateurDay);
router.put('/:id(\\d+)/demarrer', demarrerTache);
router.put('/:id(\\d+)/terminer', terminerTache);
router.put('/:id(\\d+)/progression', updateProgression);

// CRUD
router.get('/', getTaches);
router.post('/', createTaches);
router.get('/:id(\\d+)', getTachesById);
router.put('/:id(\\d+)', updateTaches);
router.delete('/:id(\\d+)', deleteTaches);

export default router;
