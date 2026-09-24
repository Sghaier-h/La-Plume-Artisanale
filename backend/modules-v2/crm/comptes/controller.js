import * as S from './service.js';
import { ok, okList, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1', 10));
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  const { rows, total } = await S.list({
    q: req.query.q, statut: req.query.statut, id_commercial: req.query.id_commercial ? Number(req.query.id_commercial) : undefined,
    limit, offset: (page - 1) * limit,
  }, req.user);
  return okList(res, rows, { page, limit, total, total_pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  try {
    const c = await S.get(Number(req.params.id), req.user);
    if (!c) return fail(res, 404, 'not_found', 'Compte introuvable');
    return ok(res, c);
  } catch (e) { return fail(res, e.status || 500, e.code || 'internal_error', e.message); }
});

export const create = asyncHandler(async (req, res) => {
  const c = await S.create(req.body || {}, req.user);
  return created(res, c, 'Compte créé');
});

export const update = asyncHandler(async (req, res) => {
  try { return ok(res, await S.update(Number(req.params.id), req.body || {}, req.user)); }
  catch (e) { return fail(res, e.status || 500, e.code || 'internal_error', e.message); }
});

export const archive = asyncHandler(async (req, res) => ok(res, await S.archive(Number(req.params.id), req.user)));

// --- Sous-collections ---
export const listContacts   = asyncHandler(async (req, res) => ok(res, await S.listContacts(Number(req.params.id))));
export const upsertContact  = asyncHandler(async (req, res) =>
  ok(res, { id_contact: await S.upsertContact(Number(req.params.id),
                                              { ...req.body, id_contact: req.params.idc ? Number(req.params.idc) : undefined }) }));
export const deleteContact  = asyncHandler(async (req, res) => { await S.deleteContact(Number(req.params.id), Number(req.params.idc)); return ok(res, { deleted: 1 }); });

export const listAdresses   = asyncHandler(async (req, res) => ok(res, await S.listAdresses(Number(req.params.id))));
export const upsertAdresse  = asyncHandler(async (req, res) =>
  ok(res, { id_adresse: await S.upsertAdresse(Number(req.params.id),
                                              { ...req.body, id_adresse: req.params.ida ? Number(req.params.ida) : undefined }) }));
export const deleteAdresse  = asyncHandler(async (req, res) => { await S.deleteAdresse(Number(req.params.id), Number(req.params.ida)); return ok(res, { deleted: 1 }); });

export const listHistorique = asyncHandler(async (req, res) => ok(res, await S.listHistorique(Number(req.params.id), 100)));
export const addHistorique  = asyncHandler(async (req, res) =>
  ok(res, { id_historique: await S.addHistorique(Number(req.params.id), { ...req.body, id_user: req.user?.id_user }) }));
