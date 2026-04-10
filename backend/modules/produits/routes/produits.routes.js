/**
 * Routes Produits - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getProduits,
  getProduitsById,
  createProduits,
  updateProduits,
  deleteProduits
} from '../controllers/produits.controller.js';

const router = express.Router();

router.get('/', authenticate, getProduits);
router.get('/:id', authenticate, getProduitsById);
router.post('/', authenticate, createProduits);
router.put('/:id', authenticate, updateProduits);
router.delete('/:id', authenticate, deleteProduits);

export default router;
