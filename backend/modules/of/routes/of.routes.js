/**
 * Routes Of - Module modulaire
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getOf,
  getOfById,
  createOf,
  updateOf,
  deleteOf
} from '../controllers/of.controller.js';
import {
  getAnalyseAlimentation,
  creerOfArticle,
  creerOfLot
} from '../controllers/alimentation.controller.js';

const router = express.Router();

// ─── Alimentation stock (AVANT /:id pour éviter conflits) ───
router.get('/alimentation/analyse', authenticate, getAnalyseAlimentation);
router.post('/alimentation/article/:id(\\d+)', authenticate, creerOfArticle);
router.post('/alimentation/lot', authenticate, creerOfLot);

// ─── CRUD OF ───
router.get('/', authenticate, getOf);
router.get('/:id(\\d+)', authenticate, getOfById);
router.post('/', authenticate, createOf);
router.put('/:id(\\d+)', authenticate, updateOf);
router.delete('/:id(\\d+)', authenticate, deleteOf);

export default router;
