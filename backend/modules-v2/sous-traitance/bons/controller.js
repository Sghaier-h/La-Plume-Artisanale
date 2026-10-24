import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.list({ ...req.query, limit, offset });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const b = await svc.detail(req.params.id);
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon introuvable', null, 404));
  res.json(ok(b));
});

export const signer = asyncHandler(async (req, res) => {
  try {
    const b = await svc.signer(req.params.id, {
      role: req.body?.role,
      svg: req.body?.svg,
      user_id: req.user?.id
    });
    if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon introuvable', null, 404));
    res.json(ok(b));
  } catch (e) {
    res.status(e.status || 400).json(fail('BAD_INPUT', e.message));
  }
});

export const controle = asyncHandler(async (req, res) => {
  const b = await svc.enregistrerControle(req.params.id, req.body ?? {}, { user_id: req.user?.id });
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon introuvable', null, 404));
  res.json(ok(b));
});

export const stats = asyncHandler(async (_req, res) => {
  const s = await svc.stats();
  res.json(ok(s));
});
