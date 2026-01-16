import express from 'express';
import {
  getInterventions,
  createIntervention,
  getAlertes,
  getPlanification,
  getPieces,
  verifierAlertes
} from '../controllers/maintenance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/interventions', authenticate, getInterventions);
router.post('/interventions', authenticate, authorize('ADMIN', 'RESPONSABLE_PRODUCTION'), createIntervention);
router.get('/alertes', authenticate, getAlertes);
router.get('/planification', authenticate, getPlanification);
router.get('/pieces', authenticate, getPieces);
router.post('/verifier-alertes', authenticate, authorize('ADMIN'), verifierAlertes);

export default router;
