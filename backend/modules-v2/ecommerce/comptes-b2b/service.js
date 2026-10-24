// service.js — ecommerce/comptes-b2b
// KYC B2B (§11quinquies.1bis) : upload docs (RC / MF / CIN), valider, refuser.
import crypto from 'crypto';
import { model, baseService } from './model.js';

/** Hash bcrypt-like via scrypt (évite dépendance externe). */
function hashPassword(plain) {
  if (!plain) return null;
  const salt = crypto.randomBytes(16);
  const key  = crypto.scryptSync(plain, salt, 32);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export const service = {
  ...baseService,

  async create(payload, userId) {
    const clean = { ...payload };
    if (clean.mot_de_passe) {
      clean.mot_de_passe_hash = hashPassword(clean.mot_de_passe);
      delete clean.mot_de_passe;
    }
    return baseService.create(clean, userId);
  },

  async update(id, payload, userId) {
    const clean = { ...payload };
    if (clean.mot_de_passe) {
      clean.mot_de_passe_hash = hashPassword(clean.mot_de_passe);
      delete clean.mot_de_passe;
    }
    return baseService.update(id, clean, userId);
  },

  /** Enregistre un document KYC (upload d'URL déjà stockée sur GED/S3). */
  async uploadKycDocument(id, kind, url) {
    if (!['rc','mf','cin'].includes(kind)) {
      const e = new Error(`Type KYC invalide : ${kind}`);
      e.code = 'KYC_TYPE_INVALIDE';
      e.httpStatus = 400;
      throw e;
    }
    if (!url || !/^https?:\/\//.test(url)) {
      const e = new Error('URL du document manquante ou invalide');
      e.code = 'KYC_URL_INVALIDE';
      e.httpStatus = 400;
      throw e;
    }
    const row = await model.setKycDocument(id, kind, url);
    if (!row) {
      const e = new Error('Compte B2B introuvable');
      e.code = 'NOT_FOUND'; e.httpStatus = 404; throw e;
    }
    return row;
  },

  /** Valider un dossier KYC (rôle ADMIN ou COMMERCIAL). */
  async validerKyc(id, userId) {
    const compte = await model.findById(id);
    if (!compte) {
      const e = new Error('Compte B2B introuvable');
      e.code = 'NOT_FOUND'; e.httpStatus = 404; throw e;
    }
    if (!compte.kyc_rc_url || !compte.kyc_mf_url) {
      const e = new Error('Documents RC et MF requis avant validation KYC');
      e.code = 'KYC_DOCS_MANQUANTS'; e.httpStatus = 422; throw e;
    }
    return model.setKycStatut(id, 'valide', userId, null);
  },

  /** Refuser un dossier KYC avec motif obligatoire. */
  async refuserKyc(id, userId, motif) {
    if (!motif || motif.trim().length < 5) {
      const e = new Error('Motif de refus requis (≥ 5 caractères)');
      e.code = 'KYC_MOTIF_REQUIS'; e.httpStatus = 400; throw e;
    }
    const row = await model.setKycStatut(id, 'refuse', userId, motif.trim());
    if (!row) {
      const e = new Error('Compte B2B introuvable');
      e.code = 'NOT_FOUND'; e.httpStatus = 404; throw e;
    }
    return row;
  },

  /** Suspendre un compte KYC déjà validé (fraude, impayés). */
  async suspendreKyc(id, userId, motif) {
    const row = await model.setKycStatut(id, 'suspendu', userId, motif || null);
    if (!row) {
      const e = new Error('Compte B2B introuvable');
      e.code = 'NOT_FOUND'; e.httpStatus = 404; throw e;
    }
    return row;
  },

  async listPendingKyc(siteId) {
    return model.listPendingKyc(siteId);
  },
};

export default service;
