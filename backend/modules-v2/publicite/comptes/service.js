// service.js — publicite/comptes
// Chiffrement AES-256-GCM des access_token / refresh_token (Meta, Google, TikTok...).
import { model, baseService } from './model.js';
import { encryptToken, decryptToken, maskToken } from '../../_shared/crypto.js';

function encryptPayload(payload = {}) {
  const out = { ...payload };
  if (payload.access_token !== undefined)  out.access_token_encrypted  = encryptToken(payload.access_token);
  if (payload.refresh_token !== undefined) out.refresh_token_encrypted = encryptToken(payload.refresh_token);
  delete out.access_token; delete out.refresh_token;
  return out;
}

function sanitize(row) {
  if (!row) return row;
  const clone = { ...row };
  if (clone.access_token_encrypted)  clone.access_token_encrypted  = maskToken(clone.access_token_encrypted, 6);
  if (clone.refresh_token_encrypted) clone.refresh_token_encrypted = maskToken(clone.refresh_token_encrypted, 6);
  return clone;
}

export const service = {
  ...baseService,

  async list(opts)   { const { rows, total } = await model.list(opts); return { rows: rows.map(sanitize), total }; },
  async get(id)      { return sanitize(await model.findById(id)); },
  async create(p, u) { return sanitize(await baseService.create(encryptPayload(p), u)); },
  async update(id, p, u) { return sanitize(await baseService.update(id, encryptPayload(p), u)); },

  /** Récupère un compte avec ses tokens déchiffrés (usage interne : appel API pub). */
  async getWithTokens(id) {
    const row = await model.findById(id);
    if (!row) return null;
    return {
      ...row,
      access_token:  decryptToken(row.access_token_encrypted),
      refresh_token: decryptToken(row.refresh_token_encrypted),
    };
  },
};

export default service;
