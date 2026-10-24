import { asyncHandler, ok } from '../../_shared/apiEnvelope.js';
import { baseController } from './model.js';
import { service } from './service.js';

export const controller = {
  ...baseController,
  create: asyncHandler(async (req) => ok(await service.create(req.body || {}, req.user?.id))),
  update: asyncHandler(async (req) => {
    const row = await service.update(parseInt(req.params.id, 10), req.body || {}, req.user?.id);
    if (!row) return { _httpStatus: 404, body: { success: false, error: { code: 'NOT_FOUND', message: 'Composant introuvable' } } };
    return ok(row);
  }),
};
export default controller;
