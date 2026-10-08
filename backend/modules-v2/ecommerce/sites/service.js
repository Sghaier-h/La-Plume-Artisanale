// service.js — ecommerce/sites
// Chiffrement AES-256-GCM des clés API + HMAC webhook.
import { model, baseService } from './model.js';
import { encryptToken, decryptToken, maskToken } from '../../_shared/crypto.js';

const SECRET_FIELDS_PLAIN = ['api_key','api_secret','webhook_secret'];

/** Convertit champs clairs (api_key, api_secret, webhook_secret) en champs chiffrés. */
function encryptPayload(payload = {}) {
  const out = { ...payload };
  if (payload.api_key !== undefined)        out.api_key_encrypted     = encryptToken(payload.api_key);
  if (payload.api_secret !== undefined)     out.api_secret_encrypted  = encryptToken(payload.api_secret);
  if (payload.webhook_secret !== undefined) out.webhook_secret_hmac   = encryptToken(payload.webhook_secret);
  for (const f of SECRET_FIELDS_PLAIN) delete out[f];
  return out;
}

/** Masque les valeurs secrètes retournées à l'API. */
function sanitize(row) {
  if (!row) return row;
  const clone = { ...row };
  for (const f of ['api_key_encrypted','api_secret_encrypted','webhook_secret_hmac']) {
    if (clone[f]) clone[f] = maskToken(clone[f], 6);
  }
  return clone;
}

export const service = {
  ...baseService,

  async list(opts) {
    const { rows, total } = await model.list(opts);
    return { rows: rows.map(sanitize), total };
  },

  async get(id) {
    const row = await model.findById(id);
    return sanitize(row);
  },

  async create(payload, userId) {
    const row = await baseService.create(encryptPayload(payload), userId);
    return sanitize(row);
  },

  async update(id, payload, userId) {
    const row = await baseService.update(id, encryptPayload(payload), userId);
    return sanitize(row);
  },

  /** Récupère un site avec ses secrets déchiffrés (usage interne : sync, webhook). */
  async getWithSecrets(id) {
    const row = await model.findById(id);
    if (!row) return null;
    return {
      ...row,
      api_key:        decryptToken(row.api_key_encrypted),
      api_secret:     decryptToken(row.api_secret_encrypted),
      webhook_secret: decryptToken(row.webhook_secret_hmac),
    };
  },

  async getByCodeWithSecrets(code) {
    const row = await model.findByCode(code);
    if (!row) return null;
    return {
      ...row,
      api_key:        decryptToken(row.api_key_encrypted),
      api_secret:     decryptToken(row.api_secret_encrypted),
      webhook_secret: decryptToken(row.webhook_secret_hmac),
    };
  },
};

export default service;
