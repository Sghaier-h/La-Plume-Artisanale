/**
 * Routes Dashboard - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getDashboard,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard
} from '../controllers/dashboard.controller.js';
import {
  getKpisAdmin,
  getKpisProduction,
  getActiviteRecente,
  getVentesParMois,
  getTopClients,
  getProductionStats,
  getCommandesStats,
  getAlertes
} from '../controllers/dashboard-kpis.controller.js';

const router = express.Router();

// Routes KPI (avant /:id pour éviter le conflit)
router.get('/kpis', authenticate, getKpisAdmin);
router.get('/kpis-admin', authenticate, getKpisAdmin);
router.get('/kpis-production', authenticate, getKpisProduction);
router.get('/activite-recente', authenticate, getActiviteRecente);
router.get('/ventes-par-mois', authenticate, getVentesParMois);
router.get('/top-clients', authenticate, getTopClients);

// Stats attendues par le frontend
router.get('/production', authenticate, getProductionStats);
router.get('/commandes', authenticate, getCommandesStats);
router.get('/alertes', authenticate, getAlertes);

// Routes CRUD génériques
router.get('/', authenticate, getDashboard);
router.get('/:id(\\d+)', authenticate, getDashboardById);
router.post('/', authenticate, createDashboard);
router.put('/:id(\\d+)', authenticate, updateDashboard);
router.delete('/:id(\\d+)', authenticate, deleteDashboard);

export default router;
