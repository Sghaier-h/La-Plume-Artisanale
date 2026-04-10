/**
 * Routes BonsLivraison - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getBonsLivraison,
  getBonsLivraisonById,
  createBonsLivraison,
  updateBonsLivraison,
  deleteBonsLivraison
} from '../controllers/bons-livraison.controller.js';

const router = express.Router();

router.get('/', authenticate, getBonsLivraison);
router.get('/:id', authenticate, getBonsLivraisonById);
router.post('/', authenticate, createBonsLivraison);
router.put('/:id', authenticate, updateBonsLivraison);
router.delete('/:id', authenticate, deleteBonsLivraison);

export default router;
