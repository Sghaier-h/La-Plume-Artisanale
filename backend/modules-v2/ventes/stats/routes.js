// routes.js — ventes/stats (Phase G2)
import { Router } from 'express';
import * as ctrl from './controller.js';

const router = Router();

// Courbe CA 12 mois (DashboardCommercial)
router.get('/ca-12-mois', ctrl.ca12Mois);

export default router;
