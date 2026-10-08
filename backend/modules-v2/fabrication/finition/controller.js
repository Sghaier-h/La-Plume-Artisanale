import * as svc from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const rows = await svc.list(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const p = await svc.detail(req.params.id);
  if (!p) return res.status(404).json(fail('NOT_FOUND', 'Poste finition introuvable', null, 404));
  res.json(ok(p));
});

export const demarrer = asyncHandler(async (req, res) => {
  const p = await svc.demarrer(req.params.id, req.body.id_operateur ?? req.user?.id);
  res.json(ok(p));
});

export const terminer = asyncHandler(async (req, res) => {
  const p = await svc.terminer(req.params.id, req.body);
  res.json(ok(p));
});
