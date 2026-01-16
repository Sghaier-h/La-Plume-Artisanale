import express from 'express';
import {
  getSocietes,
  createSociete,
  getEtablissements,
  getTransferts,
  createTransfert,
  getConsolidations
} from '../controllers/multisociete.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/societes', authenticate, getSocietes);
router.post('/societes', authenticate, authorize('ADMIN'), createSociete);
router.get('/etablissements', authenticate, getEtablissements);
router.get('/transferts', authenticate, getTransferts);
router.post('/transferts', authenticate, authorize('ADMIN', 'GESTIONNAIRE'), createTransfert);
router.get('/consolidations', authenticate, getConsolidations);

export default router;
