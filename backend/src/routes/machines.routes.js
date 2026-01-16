import express from 'express';
import { getMachines, getMachine, createMachine, updateMachine, getTypesMachines, getMachinePlanning } from '../controllers/machines.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getMachines);
router.get('/types', authenticate, getTypesMachines);
router.get('/:id', authenticate, getMachine);
router.get('/:id/planning', authenticate, getMachinePlanning);
router.post('/', authenticate, createMachine);
router.put('/:id', authenticate, updateMachine);

export default router;
