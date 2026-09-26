// service.js — publicite/metriques
// Ingestion journalière + agrégats ROAS/CTR/CPC.
import { model } from './model.js';

export const service = {
  async list(opts)                                { return model.list(opts); },
  async upsert(entry)                             { return model.upsert(entry); },
  async ingestBatch(entries)                      {
    if (!Array.isArray(entries) || entries.length === 0) {
      const e = new Error('entries: array non vide requis'); e.code = 'BATCH_VIDE'; e.httpStatus = 400; throw e;
    }
    const rows = await model.upsertBatch(entries);
    return { total: entries.length, upserted: rows.length };
  },
  async aggregateByCampagne(filter)               { return model.aggregateByCampagne(filter); },
  async summaryCampagne(idCampagne, filter)       { return model.summaryCampagne(idCampagne, filter); },
};

export default service;
