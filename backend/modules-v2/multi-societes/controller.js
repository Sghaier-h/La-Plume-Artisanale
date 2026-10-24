/**
 * backend/modules-v2/multi-societes/controller.js
 */
import * as S from './service.js';
import { ok, okList, fail, asyncHandler } from '../_shared/response.js';

export const list = asyncHandler(async (req, res) => {
  const rows = await S.listForUser(req.user);
  return okList(res, rows, { page: 1, limit: rows.length, total: rows.length, total_pages: 1 });
});

export const get = asyncHandler(async (req, res) => {
  const row = await S.getOne(req.params.id);
  if (!row) return fail(res, 404, 'not_found', 'Société introuvable');
  return ok(res, row);
});

export const update = asyncHandler(async (req, res) => {
  const row = await S.update(req.params.id, req.body || {});
  if (!row) return fail(res, 404, 'not_found', 'Société introuvable');
  return ok(res, row, { message: 'Société mise à jour' });
});

export const basculer = asyncHandler(async (req, res) => {
  try {
    const { societe, token } = await S.basculer({
      user: req.user,
      idSociete: req.params.id,
    });
    return ok(res, { societe, token }, { message: 'Société courante mise à jour' });
  } catch (e) {
    return fail(res, e.status || 400, e.code || 'bad_request', e.message);
  }
});

export const consolideVentes = asyncHandler(async (req, res) => {
  try {
    const rows = await S.getConsolideVentes({ user: req.user });
    return ok(res, rows);
  } catch (e) {
    return fail(res, e.status || 500, e.code || 'internal_error', e.message);
  }
});
