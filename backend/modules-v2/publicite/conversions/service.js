// service.js — publicite/conversions
// Tracking public : purchase, add_to_cart, page_view, etc. + attribution UTM.
import { model } from './model.js';

const TYPES = ['page_view','add_to_cart','initiate_checkout','purchase','signup','lead','contact','custom'];

/** Extrait les IDs de campagne/créative depuis un cookie ou querystring UTM. */
function normalizeIncoming(body = {}, cookies = {}, query = {}) {
  const merged = { ...cookies, ...query, ...body };
  return {
    id_campagne:     merged.id_campagne    || null,
    id_creative:     merged.id_creative    || null,
    id_commande_web: merged.id_commande_web || null,
    id_site:         merged.id_site        || null,
    type_conversion: merged.type_conversion || 'custom',
    utm_source:      merged.utm_source   || null,
    utm_medium:      merged.utm_medium   || null,
    utm_campaign:    merged.utm_campaign || null,
    utm_content:     merged.utm_content  || null,
    utm_term:        merged.utm_term     || null,
    valeur:          merged.valeur       || null,
    devise:          merged.devise       || 'EUR',
    fbclid:          merged.fbclid       || null,
    gclid:           merged.gclid        || null,
    ttclid:          merged.ttclid       || null,
  };
}

export const service = {
  async list(opts) { return model.list(opts); },

  async track(body, cookies, query, meta = {}) {
    const entry = normalizeIncoming(body, cookies, query);
    if (!TYPES.includes(entry.type_conversion)) {
      const e = new Error(`type_conversion invalide : ${entry.type_conversion}`);
      e.code = 'TYPE_INVALIDE'; e.httpStatus = 400; throw e;
    }
    entry.user_agent = meta.userAgent || null;
    entry.ip         = meta.ip || null;
    return model.insert(entry);
  },

  async summaryByUtm(filter) { return model.summaryByUtm(filter); },
};

export default service;
