// controller.js — ecommerce/sites
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const { rows, total } = await service.list({
      limit, offset, q: req.query.q || null, where: {},
    });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),
  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Site introuvable' } } };
    return ok(row);
  }),
  create: asyncHandler(async (req) => ok(await service.create(req.body || {}, req.user?.id))),
  update: asyncHandler(async (req) => {
    const row = await service.update(parseInt(req.params.id, 10), req.body || {}, req.user?.id);
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Site introuvable' } } };
    return ok(row);
  }),
  remove: asyncHandler(async (req) => {
    const row = await service.remove(parseInt(req.params.id, 10), req.user?.id);
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Site introuvable' } } };
    return ok(row);
  }),
};

export default controller;
