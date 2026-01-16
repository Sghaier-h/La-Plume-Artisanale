import express from 'express';
import {
  getBudgets,
  getCoutTheorique,
  getCoutReel,
  analyserEcarts
} from '../controllers/couts.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/budgets', authenticate, getBudgets);
router.get('/cout-theorique/:id_of', authenticate, getCoutTheorique);
router.get('/cout-reel/:id_of', authenticate, getCoutReel);
router.get('/analyse-ecarts/:id_of', authenticate, analyserEcarts);

export default router;
