// service.js — personnalisation/partages
// Génération du code court + snapshot des paramètres du configurateur (§5.8.8).
import crypto from 'node:crypto';
import { model } from './model.js';

// Alphabet sans caractères ambigus (0/O, 1/I/l).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LEN = 8;
const MAX_ATTEMPTS = 8;

export function genererCodeCourt(len = CODE_LEN) {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/**
 * Boucle courte de génération de code unique (retry sur violation d'unicité).
 */
async function insertWithUniqueCode(payload) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code_court = payload.code_court || genererCodeCourt();
    try {
      return await model.insert({ ...payload, code_court });
    } catch (err) {
      if (err.code === '23505' && !payload.code_court) continue; // conflit sur code_court
      throw err;
    }
  }
  const err = new Error('Impossible de générer un code de partage unique');
  err.code = 'CODE_COURT_COLLISION';
  err.httpStatus = 500;
  throw err;
}

export const service = {
  /**
   * Crée un partage : génère code_court unique + snapshot des paramètres.
   */
  async create(payload, ip = null) {
    const { parametres_snapshot, parametres_json, ...rest } = payload || {};
    const snapshot = parametres_snapshot || parametres_json || {};
    return insertWithUniqueCode({
      ...rest,
      parametres_snapshot: snapshot,
      ip_createur: rest.ip_createur || ip,
    });
  },

  /**
   * Lecture publique par code court : renvoie le snapshot + incrémente nb_vues.
   * Bloque les partages expirés.
   */
  async getByCode(code) {
    const existing = await model.findByCode(code);
    if (!existing) return null;
    if (existing.date_expiration && new Date(existing.date_expiration) < new Date()) {
      const err = new Error('Ce lien de partage a expiré');
      err.code = 'PARTAGE_EXPIRE';
      err.httpStatus = 410;
      throw err;
    }
    return model.incrementVues(code);
  },

  markConversion(code) {
    return model.incrementConversions(code);
  },
};

export default service;
