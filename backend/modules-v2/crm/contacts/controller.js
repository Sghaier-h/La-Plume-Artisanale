import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  const { rows, total } = await S.list({
    q:          req.query.q,
    id_client:  req.query.id_client ? Number(req.query.id_client) : undefined,
    role:       req.query.role,
    limit,      offset: (page - 1) * limit,
  });
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  const c = await S.get(Number(req.params.id));
  if (!c) return fail(res, 404, 'not_found', 'Contact introuvable');
  return ok(res, c);
});

export const create = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (!body.id_client || !body.nom) {
    return fail(res, 400, 'invalid_input', 'id_client et nom requis');
  }
  const id = await S.create(body);
  return created(res, { id_contact: id }, 'Contact créé');
});

export const update = asyncHandler(async (req, res) =>
  ok(res, await S.update(Number(req.params.id), req.body || {})));

export const remove = asyncHandler(async (req, res) =>
  ok(res, await S.remove(Number(req.params.id))));
