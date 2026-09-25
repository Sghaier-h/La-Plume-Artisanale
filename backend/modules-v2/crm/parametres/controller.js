import * as S from './service.js';
import * as N from '../../_shared/numerotation/service.js';
import { ok, created, fail, asyncHandler } from '../../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  try {
    const rows = await S.list(req.params.kind, {
      actif: req.query.actif === 'true' ? true : (req.query.actif === 'false' ? false : undefined),
    });
    return ok(res, rows);
  } catch (e) { return fail(res, e.status || 500, e.code || 'internal_error', e.message); }
});

export const upsert = asyncHandler(async (req, res) => {
  try {
    const out = await S.upsert(req.params.kind, req.body || {});
    return created(res, out, 'Enregistré');
  } catch (e) { return fail(res, e.status || 500, e.code || 'internal_error', e.message); }
});

export const remove = asyncHandler(async (req, res) => {
  try {
    const out = await S.remove(req.params.kind, req.params.id);
    return ok(res, out);
  } catch (e) { return fail(res, e.status || 500, e.code || 'internal_error', e.message); }
});

// -- Numérotation configurable
export const numListe = asyncHandler(async (req, res) => ok(res, await N.list()));

export const numGet = asyncHandler(async (req, res) => {
  const c = await N.get(req.params.entite);
  if (!c) return fail(res, 404, 'not_found', 'Config absente');
  return ok(res, c);
});

export const numUpdate = asyncHandler(async (req, res) =>
  ok(res, await N.update(req.params.entite, req.body || {})));

export const numPreview = asyncHandler(async (req, res) => {
  try {
    const out = await N.preview(req.params.entite, req.body || {});
    if (!out) return fail(res, 404, 'not_found', 'Config absente');
    return ok(res, out);
  } catch (e) { return fail(res, e.status || 500, e.code || 'internal_error', e.message); }
});
