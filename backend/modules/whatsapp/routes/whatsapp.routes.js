/**
 * Routes Whatsapp
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getWhatsapp,
  getWhatsappById,
  getTemplates,
  getStatsGlobal,
  envoyerMessage,
  envoyerFacture,
  envoyerBL,
  envoyerCommandeConfirmation,
  webhook,
} from '../controllers/whatsapp.controller.js';

const router = express.Router();

// Webhook public — pas d'authentification
router.post('/webhook', webhook);

router.use(authenticate);

// Chemins spécifiques avant /:id
router.get('/templates', getTemplates);
router.get('/stats/global', getStatsGlobal);
router.post('/envoyer', envoyerMessage);
router.post('/envoyer/facture/:id_facture(\\d+)', envoyerFacture);
router.post('/envoyer/bl/:id_bl(\\d+)', envoyerBL);
router.post('/envoyer/commande-confirmation/:id_commande(\\d+)', envoyerCommandeConfirmation);

router.get('/', getWhatsapp);
router.get('/:id(\\d+)', getWhatsappById);

export default router;
