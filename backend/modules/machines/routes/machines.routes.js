/**
 * Routes Machines
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getMachines,
  getMachineById,
  getMachineByNumero,
  createMachine,
  updateMachine,
  updateMachineStatut,
  updateMachineMaintenance,
  deleteMachine,
  getMachinesStats,
  getHistoriqueArrets,
} from '../controllers/machines.controller.js';

const router = express.Router();
router.use(authenticate);

// Routes spécifiques AVANT /:id
router.get('/stats/global', getMachinesStats);
router.get('/numero/:numero', getMachineByNumero);

// CRUD standard
router.get('/', getMachines);
router.post('/', createMachine);
router.get('/:id(\\d+)', getMachineById);
router.put('/:id(\\d+)', updateMachine);
router.put('/:id(\\d+)/statut', updateMachineStatut);
router.put('/:id(\\d+)/maintenance', updateMachineMaintenance);
router.delete('/:id(\\d+)', deleteMachine);
router.get('/:id(\\d+)/historique-arrets', getHistoriqueArrets);

export default router;
