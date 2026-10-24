import * as svc from './service.js';
import { ok, asyncHandler } from '../../_shared/api-envelope.js';

export const rafraichir = asyncHandler(async (_req, res) => {
  const out = await svc.rafraichirMaintenant();
  res.json(ok(out));
});

export const parMachine = asyncHandler(async (req, res) => {
  const rows = await svc.dernierParMachine(req.params.id_machine);
  res.json(ok(rows, { count: rows.length }));
});

export const demarrer = asyncHandler(async (_req, res) => {
  res.json(ok(svc.demarrerService()));
});

export const arreter = asyncHandler(async (_req, res) => {
  res.json(ok(svc.arreterService()));
});
