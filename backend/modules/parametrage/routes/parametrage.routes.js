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
  getSociete,
  updateSociete,
  getSysteme,
  updateSystemeCle,
  getByModule,
  updateByModule,
} from '../controllers/parametrage.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/categories', getCategories);
router.get('/export', exportParametrage);
router.post('/import', importParametrage);

router.get('/cle/:cle', getByCle);
router.put('/cle/:cle', upsertByCle);

// Endpoints regroupés attendus par le frontend
router.get('/societe', getSociete);
router.put('/societe', updateSociete);
router.get('/systeme', getSysteme);
router.put('/systeme/:cle', updateSystemeCle);
router.get('/module/:module', getByModule);
router.put('/module/:module', updateByModule);

router.get('/', getParametrage);
router.post('/', createParametrage);
router.get('/:id(\\d+)', getParametrageById);
router.put('/:id(\\d+)', updateParametrage);
router.delete('/:id(\\d+)', deleteParametrage);

export default router;
