import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(500, parseInt(req.query.limit || '50', 10));
  const { rows, total } = await S.list({
    q:              req.query.q,
    id_client:      req.query.id_client      ? Number(req.query.id_client)      : undefined,
    id_lead:        req.query.id_lead        ? Number(req.query.id_lead)        : undefined,
    id_contact:     req.query.id_contact     ? Number(req.query.id_contact)     : undefined,
    id_utilisateur: req.query.id_utilisateur ? Number(req.query.id_utilisateur) : undefined,
    type:           req.query.type,
    direction:      req.query.direction,
    suivi_en_retard: req.query.suivi_en_retard === 'true' || req.query.suivi_en_retard === '1',
    limit,          offset: (page - 1) * limit,
  });
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  const i = await S.get(Number(req.params.id));
  if (!i) return fail(res, 404, 'not_found', 'Interaction introuvable');
  return ok(res, i);
});

export const create = asyncHandler(async (req, res) => {
  const b = req.body || {};
  if (!b.type) return fail(res, 400, 'invalid_input', 'type requis');
  if (!b.id_client && !b.id_lead) return fail(res, 400, 'invalid_input', 'id_client ou id_lead requis');
  const id = await S.create(b, req.user);
  return created(res, { id_interaction: id }, 'Interaction créée');
});

export const update = asyncHandler(async (req, res) =>
  ok(res, await S.update(Number(req.params.id), req.body || {})));

export const remove = asyncHandler(async (req, res) =>
  ok(res, await S.remove(Number(req.params.id))));
