import express from 'express';
import {
  recevoirWebhookTimeMoto,
  testerWebhook
} from '../controllers/webhooks.controller.js';

const router = express.Router();

// Endpoint pour recevoir les webhooks TimeMoto
// IMPORTANT: Pas d'authentification standard car TimeMoto envoie directement
// Mais on peut ajouter une vérification de signature si TimeMoto le supporte
router.post('/timemoto/pointage', recevoirWebhookTimeMoto);

// Endpoint de test
router.get('/timemoto/test', testerWebhook);

export default router;
