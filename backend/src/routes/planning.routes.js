import express from 'express';
import {
  getPlanning,
  updatePlanning,
  assignMachine,
} from '../controllers/planning.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getPlanning);
router.put('/', updatePlanning);
router.post('/assign/:ofId', assignMachine);

export default router;

