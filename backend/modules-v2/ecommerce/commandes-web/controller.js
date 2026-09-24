// controller.js — ecommerce/commandes-web
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

/** Récupère le body brut : soit req.rawBody (middleware amont) soit re-sérialise req.body. */
function extractRawBody(req) {
  if (req.rawBody) return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  return Buffer.from(JSON.stringify(req.body || {}), 'utf8');
}

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || null;
}

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_site)    where.id_site    = req.query.id_site;
    if (req.query.statut_web) where.statut_web = req.query.statut_web;
    if (req.query.canal)      where.canal      = req.query.canal;
    const { rows, total } = await service.list({ limit, offset, q: req.query.q || null, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Commande web introuvable' } } };
    return ok(row);
  }),

  /** POST /webhook/:site_code — plateforme = 'shopify' */
  webhookShopify: asyncHandler(async (req) => {
    const result = await service.receiveWebhook({
      siteCode:   req.params.site_code,
      plateforme: 'shopify',
      rawBody:    extractRawBody(req),
      headers:    req.headers,
      ip:         clientIp(req),
    });
    return ok(result);
  }),

  /** POST /webhook-woo/:site_code */
  webhookWoo: asyncHandler(async (req) => {
    const result = await service.receiveWebhook({
      siteCode:   req.params.site_code,
      plateforme: 'woocommerce',
      rawBody:    extractRawBody(req),
      headers:    req.headers,
      ip:         clientIp(req),
    });
    return ok(result);
  }),

  /** POST /:id/convertir → crée la commande ERP */
  convertir: asyncHandler(async (req) => {
    const result = await service.convertirEnCommandeErp(parseInt(req.params.id, 10), req.user?.id);
    return ok(result);
  }),
};

export default controller;
