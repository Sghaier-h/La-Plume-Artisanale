import express from 'express';
import { getOFs, getOF, createOF, updateOF, assignerMachine, demarrerOF, terminerOF } from '../controllers/of.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getOFs);
router.get('/:id', authenticate, getOF);
router.post('/', authenticate, createOF);
router.put('/:id', authenticate, updateOF);
router.post('/:id/assigner-machine', authenticate, assignerMachine);
router.post('/:id/demarrer', authenticate, demarrerOF);
router.post('/:id/terminer', authenticate, terminerOF);

export default router;
