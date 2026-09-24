// controller.js — personnalisation/commandes
// CRUD standard + endpoints métier "valider-client" et "valider-commercial".
import { asyncHandler, ok, fail } from '../../_shared/apiEnvelope.js';
import { baseController } from './model.js';
import { service } from './service.js';

export const controller = {
  ...baseController,

  validerClient: asyncHandler(async (req) => {
    const row = await service.validerClient(parseInt(req.params.id, 10));
    if (!row) return fail('NOT_FOUND', 'Personnalisation introuvable', 404);
    return ok(row);
  }),

  validerCommercial: asyncHandler(async (req) => {
    const row = await service.validerCommercial(
      parseInt(req.params.id, 10),
      req.body || {},
      req.user,
    );
    if (!row) return fail('NOT_FOUND', 'Personnalisation introuvable', 404);
    return ok(row);
  }),
};

export default controller;
