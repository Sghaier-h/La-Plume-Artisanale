import * as svc from './service.js';
import { ok, fail, asyncHandler } from '../../_shared/api-envelope.js';

export const gantt = asyncHandler(async (req, res) => {
  const { date_debut, date_fin, id_machine } = req.query;
  if (!date_debut || !date_fin)
    return res.status(400).json(fail('BAD_INPUT', 'date_debut et date_fin requis'));
  const rows = await svc.getGantt({ dateDebut: date_debut, dateFin: date_fin, id_machine });
  res.json(ok(rows, { count: rows.length }));
});

export const assigner = asyncHandler(async (req, res) => {
  const out = await svc.assignerMachine(req.params.id, req.body);
  if (!out) return res.status(404).json(fail('OF_NOT_FOUND', 'OF introuvable', null, 404));
  res.json(ok(out));
});

export const replanifier = asyncHandler(async (req, res) => {
  const out = await svc.replanifier(req.params.id, req.body);
  if (!out) return res.status(404).json(fail('OF_NOT_FOUND', 'OF introuvable', null, 404));
  res.json(ok(out));
});
