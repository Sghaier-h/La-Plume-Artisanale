import * as svc from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

export const receptionner = asyncHandler(async (req, res) => {
  const b = await svc.receptionner(req.params.id, req.body, { id_utilisateur: req.user?.id });
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon envoi ST introuvable', null, 404));
  res.json(ok(b));
});

export const litige = asyncHandler(async (req, res) => {
  const b = await svc.declarerLitige(req.params.id, { ...req.body, id_utilisateur: req.user?.id });
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon envoi ST introuvable', null, 404));
  res.json(ok(b));
});

export const historique = asyncHandler(async (req, res) => {
  const rows = await svc.historique(req.params.id);
  res.json(ok(rows, { count: rows.length }));
});
