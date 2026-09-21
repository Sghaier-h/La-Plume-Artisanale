/**
 * Routes Parametrage — Paramètres généraux ERP
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getParametrage,
  getParametrageById,
  createParametrage,
  updateParametrage,
  deleteParametrage,
  getCategories,
  exportParametrage,
  importParametrage,
  getByCle,
  upsertByCle,
} from '../controllers/parametrage.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/categories', getCategories);
router.get('/export', exportParametrage);
router.post('/import', importParametrage);

router.get('/cle/:cle', getByCle);
router.put('/cle/:cle', upsertByCle);

router.get('/', getParametrage);
router.post('/', createParametrage);
router.get('/:id(\\d+)', getParametrageById);
router.put('/:id(\\d+)', updateParametrage);
router.delete('/:id(\\d+)', deleteParametrage);

export default router;
