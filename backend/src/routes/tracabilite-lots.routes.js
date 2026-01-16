import express from 'express';
import {
  getLots,
  createLot,
  getQRCodeLot,
  genererEtiquette
} from '../controllers/tracabilite-lots.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, getLots);
router.post('/', authenticate, authorize('ADMIN', 'MAGASINIER'), createLot);
router.get('/:id/qr-code', authenticate, getQRCodeLot);
router.post('/:id/imprimer-etiquette', authenticate, genererEtiquette);

export default router;
