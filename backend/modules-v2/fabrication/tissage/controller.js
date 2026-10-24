import * as svc from './service.js';
import { ok, fail, asyncHandler, paginateFromReq } from '../../_shared/api-envelope.js';

export const list = asyncHandler(async (req, res) => {
  const { limit, offset } = paginateFromReq(req);
  const rows = await svc.listSessions({ limit, offset,
    id_of: req.query.id_of, id_machine: req.query.id_machine,
    statut: req.query.statut, id_operateur: req.query.id_operateur });
  res.json(ok(rows, { limit, offset, count: rows.length }));
});

export const detail = asyncHandler(async (req, res) => {
  const s = await svc.getSession(req.params.id);
  if (!s) return res.status(404).json(fail('SESSION_NOT_FOUND', 'Session tissage introuvable', null, 404));
  res.json(ok(s));
});

export const demarrer = asyncHandler(async (req, res) => {
  const s = await svc.demarrer(req.body);
  res.status(201).json(ok(s));
});

export const pauser = asyncHandler(async (req, res) => {
  const s = await svc.pauser(req.params.id, req.body.motif);
  res.json(ok(s));
});
export const reprendre = asyncHandler(async (req, res) => {
  const s = await svc.reprendre(req.params.id);
  res.json(ok(s));
});

export const cloturer = asyncHandler(async (req, res) => {
  const s = await svc.cloturer(req.params.id, req.body);
  if (!s) return res.status(404).json(fail('SESSION_NOT_FOUND', 'Session tissage introuvable', null, 404));
  res.json(ok(s));
});

export const incident = asyncHandler(async (req, res) => {
  const s = await svc.declarerIncident(req.params.id, req.body);
  res.status(201).json(ok(s));
});
