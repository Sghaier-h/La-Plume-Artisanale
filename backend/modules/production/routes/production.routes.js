/**
 * Routes Production — Ordres de Fabrication (OF)
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProduction,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction,
  lancerProduction,
  terminerProduction,
  pauseProduction,
  annulerProduction,
  getGlobalStats,
} from '../controllers/production.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques AVANT /:id
router.get('/stats/global', getGlobalStats);

router.put('/:id(\\d+)/lancer',   lancerProduction);
router.put('/:id(\\d+)/terminer', terminerProduction);
router.put('/:id(\\d+)/pause',    pauseProduction);
router.put('/:id(\\d+)/annuler',  annulerProduction);

// CRUD standard
router.get('/',            getProduction);
router.post('/',           createProduction);
router.get('/:id(\\d+)',    getProductionById);
router.put('/:id(\\d+)',    updateProduction);
router.delete('/:id(\\d+)', deleteProduction);

export default router;
