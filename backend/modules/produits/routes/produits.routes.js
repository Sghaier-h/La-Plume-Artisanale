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
  deleteProduits,
  getAttributs,
  createAttribut,
  updateAttribut,
  deleteAttribut,
} from '../controllers/produits.controller.js';

const router = express.Router();

// Static routes BEFORE /:id catch-all so Express doesn't parse "attributs" as an integer id
router.get('/attributs', authenticate, getAttributs);
router.post('/attributs', authenticate, createAttribut);
router.put('/attributs/:id(\\d+)', authenticate, updateAttribut);
router.delete('/attributs/:id(\\d+)', authenticate, deleteAttribut);

router.get('/', authenticate, getProduits);
router.get('/:id(\\d+)', authenticate, getProduitsById);
router.post('/', authenticate, createProduits);
router.put('/:id(\\d+)', authenticate, updateProduits);
router.delete('/:id(\\d+)', authenticate, deleteProduits);

export default router;
