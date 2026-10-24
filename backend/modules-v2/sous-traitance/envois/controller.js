import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.listBons({ limit, offset, ...req.query });
  res.json(ok(rows, { count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const b = await svc.detailBon(req.params.id);
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon envoi ST introuvable', null, 404));
  res.json(ok(b));
});

export const creer = asyncHandler(async (req, res) => {
  if (!req.body.date_retour_prevue)
    return res.status(400).json(fail('BAD_INPUT', 'date_retour_prevue obligatoire (§7.11)'));
  const b = await svc.creerBon(req.body, { id_utilisateur: req.user?.id });
  res.status(201).json(ok(b));
});

export const expedier = asyncHandler(async (req, res) => {
  const b = await svc.expedier(req.params.id, { ...req.body, id_utilisateur: req.user?.id });
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon envoi ST introuvable', null, 404));
  res.json(ok(b));
});

export const maj = asyncHandler(async (req, res) => {
  const b = await svc.majBon(req.params.id, req.body);
  if (!b) return res.status(404).json(fail('NOT_FOUND', 'Bon envoi ST introuvable', null, 404));
  res.json(ok(b));
});

export const listSousTraitants = asyncHandler(async (_req, res) => {
  const rows = await svc.listSousTraitants({});
  res.json(ok(rows, { count: rows.length }));
});
