// routes.js — fabrication/planning-gantt
//
// Phase G3 — fusion : les 2 modules legacy
//   - `backend/modules/planification-gantt/` (vue Gantt projets/tâches/ressources)
//   - `backend/modules/planning-dragdrop/`   (planning OF drag & drop)
// ont été portés verbatim ici et fusionnés sous un seul router sous
// `/api/v2/fabrication/planning-gantt`.
//
// Convention : les routes Gantt (projets/tâches/ressources) sont préfixées
// `/gantt/*` pour ne pas entrer en conflit avec les routes drag-and-drop,
// qui restent exposées à la racine (comportement legacy identique).

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProjets,
  getTachesGantt,
  getRessources,
  getGanttData,
  createTacheGantt,
} from './legacy-gantt-controller.js';
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
} from './legacy-dragdrop-controller.js';

const router = express.Router();
router.use(authenticate);

// ── Gantt (projets, tâches, ressources) ────────────────────────────────
router.get('/gantt/projets', getProjets);
router.get('/gantt/taches', getTachesGantt);
router.get('/gantt/ressources', getRessources);
router.get('/gantt/gantt-data', getGanttData);
router.post('/gantt/taches', createTacheGantt);

// Compat legacy — anciens chemins /projets, /taches, /ressources, /gantt-data
router.get('/projets', getProjets);
router.get('/taches', getTachesGantt);
router.get('/ressources', getRessources);
router.get('/gantt-data', getGanttData);
router.post('/taches', createTacheGantt);

// ── Drag & drop ────────────────────────────────────────────────────────
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
