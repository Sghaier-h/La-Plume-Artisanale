/**
 * Routes Reports
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  reportProduction,
  reportVentes,
  reportStock,
  reportQualite,
  reportRh,
  reportFinancier,
  reportCustom,
  listReports,
  createReport,
  deleteReport,
} from '../controllers/reports.controller.js';

const router = express.Router();

router.use(authenticate);

// Rapports agrégés (spécifiques AVANT /:id)
router.get('/production', reportProduction);
router.get('/ventes', reportVentes);
router.get('/stock', reportStock);
router.get('/qualite', reportQualite);
router.get('/rh', reportRh);
router.get('/financier', reportFinancier);
router.post('/custom', reportCustom);

// CRUD sur définitions de rapports
router.get('/', listReports);
router.post('/', createReport);
router.delete('/:id(\\d+)', deleteReport);

export default router;
