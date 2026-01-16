import express from 'express';
import {
  getEntrepots,
  getStockEntrepot,
  demanderTransfert,
  validerTransfert,
  getTransferts
} from '../controllers/stock-multi-entrepots.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/entrepots', authenticate, getEntrepots);
router.get('/:entrepotId/stock', authenticate, getStockEntrepot);
router.get('/transferts', authenticate, getTransferts);
router.post('/transfert', authenticate, authorize('ADMIN', 'MAGASINIER'), demanderTransfert);
router.post('/transfert/:id/valider', authenticate, authorize('ADMIN', 'CHEF_PRODUCTION'), validerTransfert);

export default router;
