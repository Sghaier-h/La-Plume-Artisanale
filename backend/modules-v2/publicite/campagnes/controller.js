// controller.js — publicite/campagnes
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_compte_pub) where.id_compte_pub = req.query.id_compte_pub;
    if (req.query.statut)        where.statut        = req.query.statut;
    if (req.query.canal_cible)   where.canal_cible   = req.query.canal_cible;
    const { rows, total } = await service.list({ limit, offset, q: req.query.q || null, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Campagne introuvable' } } };
    return ok(row);
  }),
  create: asyncHandler(async (req) => ok(await service.create(req.body || {}, req.user?.id))),
  update: asyncHandler(async (req) => ok(await service.update(parseInt(req.params.id, 10), req.body || {}, req.user?.id))),
  remove: asyncHandler(async (req) => ok(await service.remove(parseInt(req.params.id, 10), req.user?.id))),

  setStatut: asyncHandler(async (req) => ok(await service.setStatut(parseInt(req.params.id, 10), req.body?.statut))),

  // Créatives nested
  listCreatives:   asyncHandler(async (req) => ok(await service.listCreatives(parseInt(req.params.id, 10)))),
  createCreative:  asyncHandler(async (req) => ok(await service.createCreative(parseInt(req.params.id, 10), req.body || {}))),
  getCreative:     asyncHandler(async (req) => {
    const row = await service.getCreative(parseInt(req.params.creative_id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Créative introuvable' } } };
    return ok(row);
  }),
  updateCreative:  asyncHandler(async (req) => ok(await service.updateCreative(parseInt(req.params.creative_id, 10), req.body || {}))),
  deleteCreative:  asyncHandler(async (req) => ok(await service.deleteCreative(parseInt(req.params.creative_id, 10)))),
};

export default controller;
