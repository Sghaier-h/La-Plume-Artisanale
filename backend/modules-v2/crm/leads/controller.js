import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  const { rows, total } = await S.list({
    q:      req.query.q,
    statut: req.query.statut,
    canal:  req.query.canal,
    id_utilisateur_assigne: req.query.id_utilisateur_assigne ? Number(req.query.id_utilisateur_assigne) : undefined,
    limit,  offset: (page - 1) * limit,
  });
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  const l = await S.get(Number(req.params.id));
  if (!l) return fail(res, 404, 'not_found', 'Lead introuvable');
  return ok(res, l);
});

export const create = asyncHandler(async (req, res) => {
  const id = await S.create(req.body || {}, req.user);
  return created(res, { id_lead: id }, 'Lead créé');
});

export const update = asyncHandler(async (req, res) =>
  ok(res, await S.update(Number(req.params.id), req.body || {})));

export const remove = asyncHandler(async (req, res) =>
  ok(res, await S.remove(Number(req.params.id))));

export const convert = asyncHandler(async (req, res) => {
  try {
    const out = await S.convert(Number(req.params.id), req.body || {}, req.user);
    return ok(res, out, 'Lead converti en compte');
  } catch (e) {
    return fail(res, e.status || 500, e.code || 'internal_error', e.message);
  }
});
