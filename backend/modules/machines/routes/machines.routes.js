/**
 * Routes Machines
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import { pool } from '../../../src/utils/db.js';
import { sendSuccess, handleError } from '../../../src/utils/error.helper.js';
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
router.get('/types', async (req, res) => {
  try {
    const q = `SELECT DISTINCT id_type_machine AS id FROM machines WHERE id_type_machine IS NOT NULL ORDER BY id_type_machine`;
    const result = await pool.query(q);
    return sendSuccess(res, result.rows, 'Types machines');
  } catch (error) {
    return handleError(res, error, 'getTypesMachines');
  }
});
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
router.get('/:id(\\d+)/planning', async (req, res) => {
  try {
    const q = `SELECT * FROM planning_machines WHERE id_machine = $1 ORDER BY date_debut DESC`;
    const result = await pool.query(q, [req.params.id]);
    return sendSuccess(res, result.rows, 'Planning machine');
  } catch (error) {
    return handleError(res, error, 'getPlanningMachine');
  }
});

export default router;
