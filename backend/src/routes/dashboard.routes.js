import express from 'express';
import { getKPIs, getProductionStats, getCommandesStats, getAlertes } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/kpis', authenticate, getKPIs);
router.get('/production', authenticate, getProductionStats);
router.get('/commandes', authenticate, getCommandesStats);
router.get('/alertes', authenticate, getAlertes);

export default router;
