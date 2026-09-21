/**
 * Routes Relances Factures
 *   Prefix: /api/relances
 */
import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getRelances,
  getRelanceById,
  getRelancesFacture,
  getFacturesImpayees,
  genererRelances,
  envoyerRelanceManuelle,
  enregistrerReponse,
  getStatsGlobal,
} from '../controllers/relances.controller.js';

const router = express.Router();
router.use(authenticate);

// Spécifiques d'abord
router.get('/factures-impayees', getFacturesImpayees);
router.get('/stats/global', getStatsGlobal);
router.get('/facture/:id_facture(\\d+)', getRelancesFacture);
router.post('/facture/:id_facture(\\d+)/envoyer', envoyerRelanceManuelle);
router.post('/generer', genererRelances);
router.put('/:id(\\d+)/reponse', enregistrerReponse);

// CRUD light
router.get('/', getRelances);
router.get('/:id(\\d+)', getRelanceById);

export default router;
