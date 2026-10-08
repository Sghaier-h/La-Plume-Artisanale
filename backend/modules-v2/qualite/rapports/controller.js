import * as svc from './service.js';
import { ok, asyncHandler } from '../../_shared/api-envelope.js';

export const taux2eChoix = asyncHandler(async (_req, res) => {
  const rows = await svc.tauxDeuxiemeChoix7j();
  res.json(ok(rows, { periode_jours: 7, count: rows.length }));
});

export const defautsParType = asyncHandler(async (req, res) => {
  const j = Math.min(Math.max(parseInt(req.query.jours, 10) || 7, 1), 90);
  const rows = await svc.defautsParType(j);
  res.json(ok(rows, { periode_jours: j, count: rows.length }));
});
