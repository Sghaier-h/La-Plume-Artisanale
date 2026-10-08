import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const listSessions = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.listSessions({ limit, offset, ...req.query });
  res.json(ok(rows, { count: rows.length }));
});

export const detailSession = asyncHandler(async (req, res) => {
  const s = await svc.getSession(req.params.id);
  if (!s) return res.status(404).json(fail('NOT_FOUND', 'Session coupe introuvable', null, 404));
  res.json(ok(s));
});

export const demarrer = asyncHandler(async (req, res) => {
  const s = await svc.demarrer(req.body);
  res.status(201).json(ok(s));
});

export const ajouterPiece = asyncHandler(async (req, res) => {
  const p = await svc.ajouterPiece({ ...req.body, id_operateur: req.body.id_operateur ?? req.user?.id });
  res.status(201).json(ok(p));
});

export const listPieces = asyncHandler(async (req, res) => {
  const rows = await svc.listPieces(req.query);
  res.json(ok(rows, { count: rows.length }));
});

export const stats = asyncHandler(async (req, res) => {
  const s = await svc.statsOf(req.params.id_of);
  res.json(ok(s));
});

export const cloturer = asyncHandler(async (req, res) => {
  const out = await svc.cloturer(req.params.id, { ...req.body, id_utilisateur: req.user?.id });
  res.json(ok(out));
});
