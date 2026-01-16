import express from 'express';
import {
  getConfigSelecteursMachine,
  updateConfigSelecteursMachine,
  getConfigSelecteursOF,
  updateConfigSelecteursOF,
  copierSelecteursDepuisBOM
} from '../controllers/selecteurs-machines.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Routes pour machines
router.get('/machines/:machineId', authenticate, getConfigSelecteursMachine);
router.put('/machines/:machineId', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), updateConfigSelecteursMachine);

// Routes pour OF
router.get('/of/:ofId', authenticate, getConfigSelecteursOF);
router.put('/of/:ofId', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), updateConfigSelecteursOF);
router.post('/of/:ofId/copier-depuis-bom', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), copierSelecteursDepuisBOM);

export default router;
