import express from 'express';
import {
  getOFs,
  getOF,
  createOF,
  updateOF,
  getMachines,
  getPlanning,
} from '../controllers/production.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

router.get('/ofs', getOFs);
router.get('/ofs/:id', getOF);
router.post('/ofs', createOF);
router.put('/ofs/:id', updateOF);
router.get('/machines', getMachines);
router.get('/planning', getPlanning);

export default router;

