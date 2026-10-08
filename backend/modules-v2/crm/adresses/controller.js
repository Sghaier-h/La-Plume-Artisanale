import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(500, parseInt(req.query.limit || '100', 10));
  const { rows, total } = await S.list({
    id_client: req.query.id_client ? Number(req.query.id_client) : undefined,
    limit,     offset: (page - 1) * limit,
  });
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  const a = await S.get(Number(req.params.id));
  if (!a) return fail(res, 404, 'not_found', 'Adresse introuvable');
  return ok(res, a);
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.id_client) return fail(res, 400, 'invalid_input', 'id_client requis');
  const id = await S.create(b);
  return created(res, { id_adresse: id }, 'Adresse créée');
});

export const update = asyncHandler(async (req, res) =>
  ok(res, await S.update(Number(req.params.id), req.body || {})));

export const remove = asyncHandler(async (req, res) =>
  ok(res, await S.remove(Number(req.params.id))));
