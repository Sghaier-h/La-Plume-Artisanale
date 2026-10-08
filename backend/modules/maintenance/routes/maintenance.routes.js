/**
 * Routes Maintenance — bridge vers `demandes_intervention`.
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMaintenance, getMaintenanceById, createMaintenance, updateMaintenance,
  assignerMaintenance, demarrerMaintenance, terminerMaintenance,
  cloturerMaintenance, annulerMaintenance, deleteMaintenance,
  getHistoriqueMachine, getStatsGlobal,
} from '../controllers/maintenance.controller.js';

const router = express.Router();
router.use(authenticate);

// Routes spécifiques d'abord
router.get('/stats/global',           getStatsGlobal);
router.get('/machine/:id_machine(\\d+)', getHistoriqueMachine);

// CRUD + transitions
router.get('/',                       getMaintenance);
router.post('/',                      createMaintenance);
router.get('/:id(\\d+)',              getMaintenanceById);
router.put('/:id(\\d+)',              updateMaintenance);
router.delete('/:id(\\d+)',           deleteMaintenance);

router.put('/:id(\\d+)/assigner',     assignerMaintenance);
router.put('/:id(\\d+)/demarrer',     demarrerMaintenance);
router.put('/:id(\\d+)/terminer',     terminerMaintenance);
router.put('/:id(\\d+)/cloturer',     cloturerMaintenance);
router.put('/:id(\\d+)/annuler',      annulerMaintenance);

export default router;
