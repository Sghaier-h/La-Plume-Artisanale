/**
 * Routes Sous-traitants — bridge vers `mouvements_sous_traitance`.
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getSoustraitants, getSoustraitantById, createSoustraitant, updateSoustraitant,
  retourSoustraitant, annulerSoustraitant, deleteSoustraitant, getStatsGlobal,
  getMouvementsBySoustraitant, createSortieSoustraitant, getAlertesRetard,
} from '../controllers/soustraitants.controller.js';

const router = express.Router();
router.use(authenticate);

// Routes statiques AVANT `/:id(\\d+)` pour éviter la capture
router.get('/stats/global',       getStatsGlobal);
router.get('/alertes/retard',     getAlertesRetard);

router.get('/',                   getSoustraitants);
router.post('/',                  createSoustraitant);
router.get('/:id(\\d+)',          getSoustraitantById);
router.put('/:id(\\d+)',          updateSoustraitant);
router.delete('/:id(\\d+)',       deleteSoustraitant);

router.put('/:id(\\d+)/retour',   retourSoustraitant);
router.post('/:id(\\d+)/retour',  retourSoustraitant);
router.put('/:id(\\d+)/annuler',  annulerSoustraitant);

router.get('/:id(\\d+)/mouvements', getMouvementsBySoustraitant);
router.post('/:id(\\d+)/sortie',    createSortieSoustraitant);

export default router;
