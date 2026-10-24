import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.list({ ...req.query, limit, offset });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const st = await svc.detail(req.params.id);
  if (!st) return res.status(404).json(fail('NOT_FOUND', 'Sous-traitant introuvable', null, 404));
  res.json(ok(st));
});

export const create = asyncHandler(async (req, res) => {
  try {
    const st = await svc.create(req.body);
    res.status(201).json(ok(st));
  } catch (e) {
    res.status(e.status || 400).json(fail('BAD_INPUT', e.message));
  }
});

export const update = asyncHandler(async (req, res) => {
  const st = await svc.update(req.params.id, req.body);
  if (!st) return res.status(404).json(fail('NOT_FOUND', 'Sous-traitant introuvable', null, 404));
  res.json(ok(st));
});

export const remove = asyncHandler(async (req, res) => {
  const ok_ = await svc.remove(req.params.id);
  if (!ok_) return res.status(404).json(fail('NOT_FOUND', 'Sous-traitant introuvable', null, 404));
  res.json(ok({ deactivated: true }));
});

export const getCompte = asyncHandler(async (req, res) => {
  const compte = await svc.getCompte(req.params.id);
  res.json(ok(compte));
});

export const listTravaux = asyncHandler(async (req, res) => {
  const rows = await svc.listTravaux(req.params.id);
  res.json(ok(rows, { count: rows.length }));
});

export const listBons = asyncHandler(async (req, res) => {
  const rows = await svc.listBons(req.params.id);
  res.json(ok(rows, { count: rows.length }));
});

export const stats = asyncHandler(async (_req, res) => {
  const [g, parType] = await Promise.all([svc.statsGlobal(), svc.statsParType()]);
  res.json(ok({ global: g, par_type: parType }));
});

// Anomalies
export const anomaliesList = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.anomaliesList({ ...req.query, limit, offset });
  res.json(ok(rows, { count: rows.length }));
});

export const anomalieCreate = asyncHandler(async (req, res) => {
  if (!req.body.id_soustraitant || !req.body.type_anomalie) {
    return res.status(400).json(fail('BAD_INPUT', 'id_soustraitant et type_anomalie requis'));
  }
  const a = await svc.anomalieCreate(req.body);
  res.status(201).json(ok(a));
});

export const anomalieResolve = asyncHandler(async (req, res) => {
  const a = await svc.anomalieResolve(req.params.id, {
    resolu_par: req.user?.id ?? null,
    commentaire_resolution: req.body?.commentaire_resolution
  });
  if (!a) return res.status(404).json(fail('NOT_FOUND', 'Anomalie introuvable', null, 404));
  res.json(ok(a));
});
