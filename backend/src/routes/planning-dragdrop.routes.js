import express from 'express';
import {
  getPlanning,
  assignerOFMachine,
  reordonnerOF
} from '../controllers/planning-dragdrop.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getPlanning);
router.post('/assigner', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), assignerOFMachine);
router.post('/reordonner', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), reordonnerOF);

export default router;
