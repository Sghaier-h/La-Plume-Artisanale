import * as S from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/response.js';

const idSoc = (req) => Number(req.query.id_societe || req.body?.id_societe || 1);

export const list = asyncHandler(async (req, res) => ok(res, await S.listByCompany(idSoc(req))));

export const get = asyncHandler(async (req, res) => {
  const c = await S.get(idSoc(req), req.params.code);
  if (!c) return fail(res, 404, 'not_found', 'Code numérotation introuvable');
  return ok(res, c);
});

export const update = asyncHandler(async (req, res) => {
  try { return ok(res, await S.update(idSoc(req), req.params.code, req.body || {}, req.user?.id_user)); }
  catch (e) { return fail(res, e.status || 400, e.code || 'bad_request', e.message); }
});

export const reset = asyncHandler(async (req, res) =>
  ok(res, await S.reset(idSoc(req), req.params.code, req.user?.id_user)));

export const apercu = asyncHandler(async (req, res) => {
  try { return ok(res, await S.previewApi(idSoc(req), req.params.code, req.body || {})); }
  catch (e) { return fail(res, e.status || 400, e.code || 'bad_request', e.message); }
});

export const next = asyncHandler(async (req, res) => {
  const { code_document, contexte, extra } = req.body || {};
  try {
    const out = await S.next({
      id_societe: idSoc(req),
      code_document,
      contexte,
      id_user: req.user?.id_user,
      extra,
    });
    return ok(res, out);
  } catch (e) { return fail(res, e.status || 400, e.code || 'bad_request', e.message); }
});
