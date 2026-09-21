/**
 * Routes Avoirs
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getAvoirs,
  getStatsGlobal,
  getAvoirById,
  createAvoir,
  updateAvoir,
  validerAvoir,
  appliquerAvoir,
  annulerAvoir,
  deleteAvoir,
} from '../controllers/avoirs.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats/global', getStatsGlobal);

router.put('/:id(\\d+)/valider',   validerAvoir);
router.put('/:id(\\d+)/appliquer', appliquerAvoir);
router.put('/:id(\\d+)/annuler',   annulerAvoir);

router.get('/',            getAvoirs);
router.post('/',           createAvoir);
router.get('/:id(\\d+)',    getAvoirById);
router.put('/:id(\\d+)',    updateAvoir);
router.delete('/:id(\\d+)', deleteAvoir);

export default router;
