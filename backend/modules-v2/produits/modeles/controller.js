import { asyncHandler, ok } from '../../_shared/apiEnvelope.js';
import { baseController } from './model.js';
import { service } from './service.js';

export const controller = {
  ...baseController,
  listVariantes: asyncHandler(async (req) => {
    const rows = await service.listVariantes(parseInt(req.params.id, 10));
    return ok(rows);
  }),
};

export default controller;
