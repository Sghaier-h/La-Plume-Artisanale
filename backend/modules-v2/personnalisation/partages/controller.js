// controller.js — personnalisation/partages
// Endpoints "Partager mon design" (§5.8.8 domain.md).
import { asyncHandler, ok, fail } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

const extractIp = (req) =>
  (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim()
  || req.ip
  || null;

export const controller = {
  create: asyncHandler(async (req) => {
    const row = await service.create(req.body || {}, extractIp(req));
    return { _httpStatus: 201, body: { success: true, data: row } };
  }),

  getByCode: asyncHandler(async (req) => {
    const row = await service.getByCode(req.params.code_court);
    if (!row) return fail('NOT_FOUND', 'Partage introuvable', 404);
    return ok(row);
  }),

  markConversion: asyncHandler(async (req) => {
    const row = await service.markConversion(req.params.code_court);
    if (!row) return fail('NOT_FOUND', 'Partage introuvable', 404);
    return ok(row);
  }),
};

export default controller;
