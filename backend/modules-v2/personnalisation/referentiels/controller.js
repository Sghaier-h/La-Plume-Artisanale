// controller.js — personnalisation/referentiels
// Lecture des 3 référentiels du configurateur.
import { asyncHandler, ok } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

const parseActifFlag = (req) => {
  const raw = req.query.actif_only ?? req.query.actifOnly;
  if (raw === undefined) return true;
  return !(raw === 'false' || raw === '0' || raw === false);
};

export const controller = {
  listZones: asyncHandler(async (req) => {
    const rows = await service.listZones({ actifOnly: parseActifFlag(req) });
    return ok(rows);
  }),

  listPolices: asyncHandler(async (req) => {
    const rows = await service.listPolices({ actifOnly: parseActifFlag(req) });
    return ok(rows);
  }),

  listFilsCouleurs: asyncHandler(async (req) => {
    const rows = await service.listFilsCouleurs({
      actifOnly: parseActifFlag(req),
      marque:    req.query.marque || null,
    });
    return ok(rows);
  }),
};

export default controller;
