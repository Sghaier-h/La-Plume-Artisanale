// controller.js — ecommerce/comptes-b2b
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

function requireRole(req, roles) {
  const u = req.user;
  if (!u) return { _httpStatus: 401, body: { success: false, error: { code: 'UNAUTHORIZED', message: 'Auth requise' } } };
  const role = u.role_principal || u.role;
  if (role === 'ADMIN') return null;
  if (!roles.includes(role)) {
    return { _httpStatus: 403, body: { success: false, error: { code: 'FORBIDDEN', message: `Rôle requis : ${roles.join(', ')}` } } };
  }
  return null;
}

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_site)     where.id_site     = req.query.id_site;
    if (req.query.kyc_statut)  where.kyc_statut  = req.query.kyc_statut;
    const { rows, total } = await service.list({ limit, offset, q: req.query.q || null, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  get: asyncHandler(async (req) => {
    const row = await service.get(parseInt(req.params.id, 10));
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Compte B2B introuvable' } } };
    return ok(row);
  }),

  create: asyncHandler(async (req) => ok(await service.create(req.body || {}, req.user?.id))),
  update: asyncHandler(async (req) => {
    const row = await service.update(parseInt(req.params.id, 10), req.body || {}, req.user?.id);
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Compte B2B introuvable' } } };
    return ok(row);
  }),
  remove: asyncHandler(async (req) => {
    const row = await service.remove(parseInt(req.params.id, 10), req.user?.id);
    return ok(row);
  }),

  pendingKyc: asyncHandler(async (req) => {
    const rows = await service.listPendingKyc(req.query.id_site || null);
    return ok(rows);
  }),

  uploadKyc: asyncHandler(async (req) => {
    const id = parseInt(req.params.id, 10);
    const { type, url } = req.body || {};
    return ok(await service.uploadKycDocument(id, type, url));
  }),

  validerKyc: asyncHandler(async (req) => {
    const guard = requireRole(req, ['ADMIN','COMMERCIAL']);
    if (guard) return guard;
    return ok(await service.validerKyc(parseInt(req.params.id, 10), req.user?.id));
  }),

  refuserKyc: asyncHandler(async (req) => {
    const guard = requireRole(req, ['ADMIN','COMMERCIAL']);
    if (guard) return guard;
    return ok(await service.refuserKyc(parseInt(req.params.id, 10), req.user?.id, req.body?.motif));
  }),

  suspendreKyc: asyncHandler(async (req) => {
    const guard = requireRole(req, ['ADMIN','COMMERCIAL']);
    if (guard) return guard;
    return ok(await service.suspendreKyc(parseInt(req.params.id, 10), req.user?.id, req.body?.motif));
  }),
};

export default controller;
