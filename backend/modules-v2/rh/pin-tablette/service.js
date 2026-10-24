// service.js — rh/pin-tablette
import * as model from './model.js';
import crypto from 'node:crypto';

/**
 * Token tablette court : signé en HMAC sur un secret dérivé de l'env.
 * Format : "<id_employe>.<expiration_unix>.<signature>"
 * Durée max : 30 min.
 */
const TABLETTE_SECRET = process.env.TABLETTE_PIN_SECRET
  || process.env.JWT_SECRET
  || 'dev-tablette-secret';
const TABLETTE_TTL_MIN = 30;

function signToken(idEmploye) {
  const exp = Math.floor(Date.now() / 1000) + TABLETTE_TTL_MIN * 60;
  const payload = `${idEmploye}.${exp}`;
  const sig = crypto.createHmac('sha256', TABLETTE_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [idStr, expStr, sig] = parts;
  const payload = `${idStr}.${expStr}`;
  const expected = crypto.createHmac('sha256', TABLETTE_SECRET).update(payload).digest('hex');
  if (expected !== sig) return null;
  if (parseInt(expStr, 10) * 1000 < Date.now()) return null;
  return { id_employe: parseInt(idStr, 10), exp: parseInt(expStr, 10) };
}

export async function list(query)                 { return model.listAll(query); }
export async function getOne(idEmploye)            { return model.findByEmploye(idEmploye); }
export async function setPin(idEmploye, pin, u)    { return model.setPin(idEmploye, pin, u); }
export async function debloquer(idEmploye, u)      { return model.debloquer(idEmploye, u); }

/**
 * Authentification tablette : vérifie PIN + renvoie employé + token court.
 */
export async function authenticate({ id_employe, pin }) {
  const emp = await model.verifier(id_employe, String(pin));
  return {
    user: emp,
    token: signToken(id_employe),
    expiresInSec: TABLETTE_TTL_MIN * 60,
  };
}
