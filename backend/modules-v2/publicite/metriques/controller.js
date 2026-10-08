// controller.js — publicite/metriques
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_campagne) where.id_campagne = req.query.id_campagne;
    if (req.query.id_creative) where.id_creative = req.query.id_creative;
    if (req.query.date_from)   where.date_from   = req.query.date_from;
    if (req.query.date_to)     where.date_to     = req.query.date_to;
    const { rows, total } = await service.list({ limit, offset, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  ingest: asyncHandler(async (req) => ok(await service.ingestBatch(req.body?.entries || []))),

  upsertOne: asyncHandler(async (req) => ok(await service.upsert(req.body || {}))),

  aggregateByCampagne: asyncHandler(async (req) => {
    return ok(await service.aggregateByCampagne({
      id_compte_pub: req.query.id_compte_pub,
      date_from:     req.query.date_from,
      date_to:       req.query.date_to,
    }));
  }),

  summaryCampagne: asyncHandler(async (req) => {
    return ok(await service.summaryCampagne(parseInt(req.params.id_campagne, 10), {
      date_from: req.query.date_from,
      date_to:   req.query.date_to,
    }));
  }),
};

export default controller;
