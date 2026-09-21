/**
 * Routes BonsRetour
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getBonsRetour,
  getStatsGlobal,
  getBonsRetourById,
  createBonsRetour,
  updateBonsRetour,
  validerBR,
  traiterBR,
  annulerBR,
  deleteBonsRetour,
} from '../controllers/bons-retour.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats/global', getStatsGlobal);

router.put('/:id(\\d+)/valider', validerBR);
router.put('/:id(\\d+)/traiter', traiterBR);
router.put('/:id(\\d+)/annuler', annulerBR);

router.get('/',            getBonsRetour);
router.post('/',           createBonsRetour);
router.get('/:id(\\d+)',    getBonsRetourById);
router.put('/:id(\\d+)',    updateBonsRetour);
router.delete('/:id(\\d+)', deleteBonsRetour);

export default router;
