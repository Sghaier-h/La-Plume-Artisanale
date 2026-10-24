import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.list({ ...req.query, limit, offset });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const t = await svc.detail(req.params.id);
  if (!t) return res.status(404).json(fail('NOT_FOUND', 'Travail introuvable', null, 404));
  res.json(ok(t));
});

export const create = asyncHandler(async (req, res) => {
  try {
    const t = await svc.create(req.body);
    res.status(201).json(ok(t));
  } catch (e) {
    res.status(e.status || 400).json(fail('BAD_INPUT', e.message));
  }
});

export const update = asyncHandler(async (req, res) => {
  const t = await svc.update(req.params.id, req.body);
  if (!t) return res.status(404).json(fail('NOT_FOUND', 'Travail introuvable', null, 404));
  res.json(ok(t));
});

export const valider = asyncHandler(async (req, res) => {
  const t = await svc.valider(req.params.id, { user_id: req.user?.id });
  if (!t) return res.status(404).json(fail('NOT_FOUND', 'Travail introuvable', null, 404));
  res.json(ok(t));
});

export const refuser = asyncHandler(async (req, res) => {
  const t = await svc.refuser(req.params.id, {
    user_id: req.user?.id,
    motif_refus: req.body?.motif_refus
  });
  if (!t) return res.status(404).json(fail('NOT_FOUND', 'Travail introuvable', null, 404));
  res.json(ok(t));
});

export const payer = asyncHandler(async (req, res) => {
  const t = await svc.payer(req.params.id, { reference_paiement: req.body?.reference_paiement });
  if (!t) return res.status(404).json(fail('NOT_FOUND', 'Travail introuvable', null, 404));
  res.json(ok(t));
});

export const stats = asyncHandler(async (_req, res) => {
  const rows = await svc.stats();
  res.json(ok(rows, { count: rows.length }));
});

export const parMois = asyncHandler(async (req, res) => {
  const rows = await svc.parMois({ months_back: Number(req.query.months_back || 6) });
  res.json(ok(rows, { count: rows.length }));
});
