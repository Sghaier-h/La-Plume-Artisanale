// routes.js — ecommerce/commandes-web
// NB : les webhooks Shopify/Woo doivent recevoir le body BRUT pour valider le HMAC.
//     Si express.json() est monté globalement, il faut le désactiver sur ces routes,
//     ou configurer un `verify` qui stocke req.rawBody = buf. Le controller lit
//     req.rawBody en priorité, sinon re-sérialise req.body.
import { Router } from 'express';
import express from 'express';
import { controller } from './controller.js';

const router = Router();

const rawJson = express.raw({ type: 'application/json', limit: '5mb' });

// Webhooks (body brut requis pour HMAC)
router.post('/webhook/:site_code',     rawJson, controller.webhookShopify);
router.post('/webhook-woo/:site_code', rawJson, controller.webhookWoo);

// Consultation & conversion
router.get('/',                controller.list);
router.get('/:id',             controller.get);
router.post('/:id/convertir',  controller.convertir);

export default router;
