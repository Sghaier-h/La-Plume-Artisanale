import * as S from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/response.js';

const idSoc = (req) => Number(req.query.id_societe || req.body?.id_societe || 1);

export const get = asyncHandler(async (req, res) => {
  const full = await S.getFull(idSoc(req));
  if (!full) return fail(res, 404, 'not_found', 'Société introuvable');
  return ok(res, full);
});
export const update = asyncHandler(async (req, res) => ok(res, await S.updateSociete(idSoc(req), req.body || {})));

export const upsertAdresse   = asyncHandler(async (req, res) => ok(res, { id_adresse:   await S.upsertAdresse(idSoc(req),   { ...req.body, id_adresse:   req.params.id ? Number(req.params.id) : undefined }) }));
export const deleteAdresse   = asyncHandler(async (req, res) => { await S.deleteAdresse(idSoc(req), Number(req.params.id));  return ok(res, { deleted: 1 }); });
export const upsertBancaire  = asyncHandler(async (req, res) => ok(res, { id_bancaire:  await S.upsertBancaire(idSoc(req),  { ...req.body, id_bancaire:  req.params.id ? Number(req.params.id) : undefined }) }));
export const deleteBancaire  = asyncHandler(async (req, res) => { await S.deleteBancaire(idSoc(req), Number(req.params.id)); return ok(res, { deactivated: 1 }); });

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'no_file', 'Fichier logo requis');
  const url = `/uploads/logos/${req.file.filename}`;
  await S.setLogo(idSoc(req), url);
  return ok(res, { logo_url: url });
});
