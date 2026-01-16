import express from 'express';
import {
  getBoutiques,
  getProduitsBoutique,
  getCommandesEcommerce,
  getRecommandationsIA,
  genererRecommandationsIA
} from '../controllers/ecommerce.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/boutiques', authenticate, getBoutiques);
router.get('/produits', authenticate, getProduitsBoutique);
router.get('/commandes', authenticate, getCommandesEcommerce);
router.get('/recommandations/:id_produit', authenticate, getRecommandationsIA);
router.post('/generer-recommandations', authenticate, authorize('ADMIN'), genererRecommandationsIA);

export default router;
