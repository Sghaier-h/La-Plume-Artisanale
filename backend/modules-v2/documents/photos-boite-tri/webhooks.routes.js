// webhooks.routes.js — documents/photos-boite-tri (§14quater.4)
//
// Routes PUBLIQUES (sans JWT), protégées par signature HMAC-SHA256 vérifiée
// dans le controller. Monté à part de l'index v2 (voir server.js) sur
// `/api/v2/webhooks/*`.
//
// IMPORTANT : le body brut doit être capturé pour vérifier la signature.
// On installe un `express.json({ verify })` local qui stocke `req.rawBody`.

import { Router } from 'express';
import express from 'express';
import * as ctrl from './controller.js';

const router = Router();

// Parser JSON local qui capture le body brut (pour HMAC) sans impacter
// le parsing global de l'app.
const jsonWithRaw = express.json({
  limit: '25mb',
  verify: (req, _res, buf) => { req.rawBody = buf?.toString('utf8') || ''; },
});

router.post('/teams/photo',    jsonWithRaw, ctrl.webhookTeams);
router.post('/whatsapp/photo', jsonWithRaw, ctrl.webhookWhatsapp);
router.post('/email/photo',    jsonWithRaw, ctrl.webhookEmail);

// Petit health-check pour les plateformes qui testent la cible avant d'envoyer.
router.get('/health', (_req, res) => res.json({ ok: true, module: 'photos-boite-tri' }));

export default router;
