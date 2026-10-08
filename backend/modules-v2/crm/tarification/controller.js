import * as S from './service.js';
import { ok, created, fail, asyncHandler } from '../../_shared/response.js';

export const listTarifs  = asyncHandler(async (req, res) =>
  ok(res, await S.listTarifs({ actif: req.query.actif === undefined ? undefined : req.query.actif === 'true' })));
export const getTarif    = asyncHandler(async (req, res) => {
  const t = await S.getTarif(Number(req.params.id));
  if (!t) return fail(res, 404, 'not_found', 'Grille introuvable');
  return ok(res, t);
});
export const createTarif = asyncHandler(async (req, res) =>
  created(res, { id_grille: await S.createTarif(req.body || {}, req.user) }));
export const updateTarif = asyncHandler(async (req, res) =>
  ok(res, await S.updateTarif(Number(req.params.id), req.body || {})));
export const deleteTarif = asyncHandler(async (req, res) => { await S.deleteTarif(Number(req.params.id)); return ok(res, { deactivated: 1 }); });

export const upsertLigne = asyncHandler(async (req, res) =>
  ok(res, { id_ligne: await S.upsertLigne(Number(req.params.id),
                                          { ...req.body, id_ligne: req.params.idl ? Number(req.params.idl) : undefined }) }));
export const deleteLigne = asyncHandler(async (req, res) => { await S.deleteLigne(Number(req.params.id), Number(req.params.idl)); return ok(res, { deleted: 1 }); });

export const listRemises  = asyncHandler(async (req, res) =>
  ok(res, await S.listRemises({ id_client: req.query.id_client, actif: req.query.actif === undefined ? undefined : req.query.actif === 'true' })));
export const upsertRemise = asyncHandler(async (req, res) =>
  ok(res, { id_remise: await S.upsertRemise({ ...req.body, id_remise: req.params.id ? Number(req.params.id) : undefined }, req.user) }));
export const deleteRemise = asyncHandler(async (req, res) => { await S.deleteRemise(Number(req.params.id)); return ok(res, { deactivated: 1 }); });

export const compute = asyncHandler(async (req, res) => ok(res, await S.computePrice(req.body || {})));
