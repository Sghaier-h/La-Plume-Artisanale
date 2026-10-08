/**
 * Routes Email
 */

import express from 'express';
import { authenticate } from '../../../src/middleware/auth.middleware.js';
import {
  getEmails,
  getEmailById,
  getTemplates,
  testEmail,
  envoyerEmail,
  envoyerFacture,
  envoyerBL,
  envoyerDevis,
} from '../controllers/email.controller.js';

const router = express.Router();

router.use(authenticate);

// Routes spécifiques avant /:id
router.get('/templates', getTemplates);
router.post('/test', testEmail);
router.post('/envoyer', envoyerEmail);
router.post('/send', envoyerEmail);
router.post('/task-notification', async (req, res, next) => {
  const { user_id, task_id, task_title } = req.body || {};
  req.body = {
    id_destinataire: user_id,
    sujet: `Nouvelle tache #${task_id || ''}`,
    corps_html: `<p>Vous avez une nouvelle tache : <b>${task_title || ''}</b></p>`,
    entity_type: 'tache',
    entity_id: task_id,
  };
  return envoyerEmail(req, res, next);
});
router.post('/order-confirmation', async (req, res, next) => {
  const { id_destinataire, destinataire, order_number, order_id } = req.body || {};
  req.body = {
    id_destinataire,
    destinataire,
    sujet: `Confirmation commande ${order_number || order_id || ''}`,
    corps_html: `<p>Votre commande <b>${order_number || order_id || ''}</b> a bien ete enregistree.</p>`,
    entity_type: 'commande',
    entity_id: order_id,
  };
  return envoyerEmail(req, res, next);
});
router.post('/envoyer/facture/:id_facture(\\d+)', envoyerFacture);
router.post('/envoyer/bl/:id_bl(\\d+)', envoyerBL);
router.post('/envoyer/devis/:id_devis(\\d+)', envoyerDevis);

// Listing / détail
router.get('/', getEmails);
router.get('/:id(\\d+)', getEmailById);

export default router;
