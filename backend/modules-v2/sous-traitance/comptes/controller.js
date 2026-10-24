import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.list({ ...req.query, limit, offset });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const c_ = await svc.detail(req.params.id);
  if (!c_) return res.status(404).json(fail('NOT_FOUND', 'Compte introuvable', null, 404));
  res.json(ok(c_));
});

export const listMouvements = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.listMouvements(req.params.id, { limit, offset });
  res.json(ok(rows, { count: rows.length }));
});

async function mvtHandler(fn, req, res) {
  try {
    const m = await fn({ ...req.body, user_id: req.user?.id });
    res.status(201).json(ok(m));
  } catch (e) {
    res.status(e.status || 400).json(fail('BAD_INPUT', e.message));
  }
}

export const ajustement   = asyncHandler((req, res) => mvtHandler(svc.ajustement, req, res));
export const compensation = asyncHandler((req, res) => mvtHandler(svc.compensation, req, res));
export const paiement     = asyncHandler((req, res) => mvtHandler(svc.paiement, req, res));
export const creance      = asyncHandler((req, res) => mvtHandler(svc.creance, req, res));
