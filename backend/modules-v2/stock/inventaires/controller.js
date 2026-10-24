import { asyncHandler, ok } from '../../_shared/apiEnvelope.js';
import { baseController } from './model.js';
import { service } from './service.js';

export const controller = {
  ...baseController,
  create: asyncHandler(async (req) => ok(await service.create(req.body || {}, req.user?.id))),
  listLignes: asyncHandler(async (req) => ok(await service.listLignes(parseInt(req.params.id, 10)))),
  addLigne: asyncHandler(async (req) => ok(await service.addLigne(
    parseInt(req.params.id, 10), req.body || {}, req.user?.id,
  ))),
};
export default controller;
