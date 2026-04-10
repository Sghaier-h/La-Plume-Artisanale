/**
 * Product Pricelist Routes
 * Routes pour les listes de prix
 */

import express from 'express';
import {
  getPricelists,
  getPricelist,
  createPricelist,
  updatePricelist,
  deletePricelist,
  getPricelistItems,
  createPricelistItem,
  updatePricelistItem,
  deletePricelistItem
} from '../controllers/product_pricelist.controller.js';
import { authMiddleware } from '../../../src/middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

// Routes CRUD pour les listes de prix
router.get('/', getPricelists);
router.get('/:id', getPricelist);
router.post('/', createPricelist);
router.put('/:id', updatePricelist);
router.delete('/:id', deletePricelist);

// Routes pour les items de liste de prix
router.get('/:id/items', getPricelistItems);
router.post('/:id/items', createPricelistItem);
router.put('/:id/items/:itemId', updatePricelistItem);
router.delete('/:id/items/:itemId', deletePricelistItem);

export default router;
