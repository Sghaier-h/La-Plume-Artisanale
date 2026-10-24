// controller.js — ecommerce/promo
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_site) where.id_site = req.query.id_site;
    if (req.query.actif != null) where.actif = req.query.actif === 'true';
    const { rows, total } = await service.list({ limit, offset, q: req.query.q || null, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Code promo introuvable' } } };
    return ok(row);
  }),

  create: asyncHandler(async (req) => ok(await service.create(req.body || {}, req.user?.id))),
  update: asyncHandler(async (req) => ok(await service.update(parseInt(req.params.id, 10), req.body || {}, req.user?.id))),
  remove: asyncHandler(async (req) => ok(await service.remove(parseInt(req.params.id, 10), req.user?.id))),

  /** POST /valider — public (appelé au checkout). */
  valider: asyncHandler(async (req) => {
    const { id_site, code, canal, montant_ht, id_compte } = req.body || {};
    return ok(await service.validerCode({
      id_site: parseInt(id_site, 10),
      code, canal, montant_ht, id_compte,
    }));
  }),

  marquerUtilise: asyncHandler(async (req) => {
    return ok(await service.marquerUtilise(parseInt(req.params.id, 10)));
  }),
};

export default controller;
