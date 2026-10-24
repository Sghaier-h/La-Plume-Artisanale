import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  const { rows, total } = await S.list({
    q:              req.query.q,
    statut:         req.query.statut,
    etape:          req.query.etape,
    id_client:      req.query.id_client      ? Number(req.query.id_client)      : undefined,
    id_commercial:  req.query.id_commercial  ? Number(req.query.id_commercial)  : undefined,
    limit,          offset: (page - 1) * limit,
  });
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const stats = asyncHandler(async (req, res) => ok(res, await S.stats()));

export const get = asyncHandler(async (req, res) => {
  const o = await S.get(Number(req.params.id));
  if (!o) return fail(res, 404, 'not_found', 'Opportunité introuvable');
  return ok(res, o);
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.libelle) return fail(res, 400, 'invalid_input', 'libelle requis');
  const id = await S.create(b);
  return created(res, { id_opportunite: id }, 'Opportunité créée');
});

export const update = asyncHandler(async (req, res) =>
  ok(res, await S.update(Number(req.params.id), req.body || {})));

export const remove = asyncHandler(async (req, res) =>
  ok(res, await S.remove(Number(req.params.id))));
