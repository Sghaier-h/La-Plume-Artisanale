/**
 * Routes BonsLivraison
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getBonsLivraison,
  getStatsGlobal,
  getBonsLivraisonById,
  createBonsLivraison,
  updateBonsLivraison,
  validerBL,
  livrerBL,
  annulerBL,
  deleteBonsLivraison,
} from '../controllers/bons-livraison.controller.js';

const router = express.Router();

router.use(authenticate);

// Specific paths BEFORE /:id
router.get('/stats/global', getStatsGlobal);

// State transitions
router.put('/:id(\\d+)/valider', validerBL);
router.put('/:id(\\d+)/livrer',  livrerBL);
router.put('/:id(\\d+)/annuler', annulerBL);

// CRUD
router.get('/',            getBonsLivraison);
router.post('/',           createBonsLivraison);
router.get('/:id(\\d+)',    getBonsLivraisonById);
router.put('/:id(\\d+)',    updateBonsLivraison);
router.delete('/:id(\\d+)', deleteBonsLivraison);

export default router;
