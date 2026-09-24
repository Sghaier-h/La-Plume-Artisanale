// controller.js — publicite/conversions
import { asyncHandler, ok, parsePagination } from '../../_shared/apiEnvelope.js';
import { service } from './service.js';

function clientIp(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || null;
}

/** Parse manuel des cookies (évite dépendance cookie-parser). */
function parseCookies(req) {
  const raw = req.headers.cookie;
  if (!raw) return {};
  const out = {};
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = decodeURIComponent(part.slice(idx + 1).trim());
    if (k) out[k] = v;
  }
  return out;
}

export const controller = {
  list: asyncHandler(async (req) => {
    const { page, limit, offset } = parsePagination(req);
    const where = {};
    if (req.query.id_campagne)     where.id_campagne     = req.query.id_campagne;
    if (req.query.id_creative)     where.id_creative     = req.query.id_creative;
    if (req.query.id_site)         where.id_site         = req.query.id_site;
    if (req.query.type_conversion) where.type_conversion = req.query.type_conversion;
    if (req.query.utm_campaign)    where.utm_campaign    = req.query.utm_campaign;
    if (req.query.date_from)       where.date_from       = req.query.date_from;
    if (req.query.date_to)         where.date_to         = req.query.date_to;
    const { rows, total } = await service.list({ limit, offset, where });
    return { success: true, data: rows, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }),

  /** POST /track — public : appelé depuis pixel/JS avec cookies UTM. */
  track: asyncHandler(async (req) => {
    const cookies = req.cookies || parseCookies(req);
    const row = await service.track(req.body || {}, cookies, req.query || {}, {
      userAgent: req.headers['user-agent'] || null,
      ip:        clientIp(req),
    });
    return ok(row);
  }),

  summaryByUtm: asyncHandler(async (req) => {
    return ok(await service.summaryByUtm({
      date_from: req.query.date_from,
      date_to:   req.query.date_to,
    }));
  }),
};

export default controller;
