import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  const { rows, total } = await S.list({
    q: req.query.q, role: req.query.role,
    actif: req.query.actif === undefined ? undefined : req.query.actif === 'true',
    limit, offset: (page - 1) * limit,
  });
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  const u = await S.get(Number(req.params.id));
  if (!u) return fail(res, 404, 'not_found', 'Utilisateur introuvable');
  return ok(res, u);
});

export const create = asyncHandler(async (req, res) => {
  try {
    const u = await S.create(req.body || {}, req.user?.id_user);
    return created(res, u, 'Utilisateur créé');
  } catch (e) { return fail(res, e.status || 400, e.code || 'bad_request', e.message); }
});

export const update = asyncHandler(async (req, res) => {
  const out = await S.update(Number(req.params.id), req.body || {});
  return ok(res, out);
});

export const deactivate = asyncHandler(async (req, res) => {
  const out = await S.deactivate(Number(req.params.id));
  return ok(res, out, { message: 'Utilisateur désactivé' });
});

export const listRoles       = asyncHandler(async (_, res) => ok(res, await S.listRoles()));
export const listPermissions = asyncHandler(async (_, res) => ok(res, await S.listPermissions()));
