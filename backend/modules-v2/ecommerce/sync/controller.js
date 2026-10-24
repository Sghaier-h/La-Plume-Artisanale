// controller.js — ecommerce/sync
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_site)   where.id_site   = req.query.id_site;
    if (req.query.type_sync) where.type_sync = req.query.type_sync;
    if (req.query.statut)    where.statut    = req.query.statut;
    const { rows, total } = await service.list({ limit, offset, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Log de sync introuvable' } } };
    return ok(row);
  }),

  pushArticle: asyncHandler(async (req) => {
    const { id_site, id_article } = req.body || {};
    return ok(await service.pushArticle(parseInt(id_site, 10), parseInt(id_article, 10)));
  }),

  pushStock: asyncHandler(async (req) => {
    const { id_site, id_article } = req.body || {};
    return ok(await service.pushStock(parseInt(id_site, 10), parseInt(id_article, 10)));
  }),

  pushPrix: asyncHandler(async (req) => {
    const { id_site, id_article } = req.body || {};
    return ok(await service.pushPrix(parseInt(id_site, 10), parseInt(id_article, 10)));
  }),

  pushBatch: asyncHandler(async (req) => {
    const { id_site, id_articles } = req.body || {};
    if (!Array.isArray(id_articles) || id_articles.length === 0) {
      return { _httpStatus: 400, body: { success: false, error: { code: 'ID_ARTICLES_REQUIS', message: 'id_articles: array non vide requis' } } };
    }
    return ok(await service.pushBatch(parseInt(id_site, 10), id_articles.map(Number)));
  }),
};

export default controller;
