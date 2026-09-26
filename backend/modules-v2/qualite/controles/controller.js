import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.list({ limit, offset,
    id_of: req.query.id_of, id_controleur: req.query.id_controleur,
    est_bloquant: req.query.est_bloquant === 'true' });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const c = await svc.detail(req.params.id);
  if (!c) return res.status(404).json(fail('NOT_FOUND', 'Contrôle introuvable', null, 404));
  res.json(ok(c));
});

export const creer = asyncHandler(async (req, res) => {
  const c = await svc.enregistrer(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(c));
});

export const decider = asyncHandler(async (req, res) => {
  const c = await svc.decider(req.params.id, { ...req.body, id_utilisateur: req.user?.id });
  if (!c) return res.status(404).json(fail('NOT_FOUND', 'Contrôle introuvable', null, 404));
  res.json(ok(c));
});
