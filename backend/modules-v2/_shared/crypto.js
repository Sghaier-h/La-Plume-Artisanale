// _shared/crypto.js
// Utilitaires de chiffrement/HMAC pour modules e-commerce & publicité.
// - encryptToken/decryptToken : AES-256-GCM pour tokens API (Meta, Google, Shopify).
// - verifyShopifyHmac / verifyWooHmac : validation signature webhook.
// Clé : process.env.ENCRYPTION_KEY (32 octets ; hex ou base64) ; fallback dev.
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;   // GCM standard
const TAG_LEN = 16;

function getKey() {
  const raw = process.env.ENCRYPTION_KEY || 'dev-key-change-me-32bytes-min-!!';
  // Normalise en 32 octets (hex, base64 ou UTF-8 padded/tronqué).
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  if (/^[A-Za-z0-9+/=]{40,}$/.test(raw)) {
    const b = Buffer.from(raw, 'base64');
    if (b.length === 32) return b;
  }
  const buf = Buffer.alloc(32);
  Buffer.from(raw, 'utf8').copy(buf);
  return buf;
}

/** Chiffre un token clair → chaîne base64 "iv:tag:cipher". */
export function encryptToken(plain) {
  if (plain == null || plain === '') return null;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
}

/** Déchiffre un token stocké. Renvoie null si vide/malformé. */
export function decryptToken(payload) {
  if (!payload) return null;
  const parts = String(payload).split(':');
  if (parts.length !== 3) return null;
  try {
    const [ivB64, tagB64, encB64] = parts;
    const iv  = Buffer.from(ivB64,  'base64');
    const tag = Buffer.from(tagB64, 'base64');
    const enc = Buffer.from(encB64, 'base64');
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

/** Masque un token pour affichage (n derniers caractères visibles). */
export function maskToken(plain, keep = 4) {
  if (!plain) return null;
  const s = String(plain);
  return s.length <= keep ? '*'.repeat(s.length) : '*'.repeat(s.length - keep) + s.slice(-keep);
}

/** Vérifie signature webhook Shopify (base64 HMAC-SHA256 du body brut). */
export function verifyShopifyHmac(rawBody, headerSignature, secret) {
  if (!headerSignature || !secret) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(headerSignature));
  } catch { return false; }
}

/** Vérifie signature webhook WooCommerce (base64 HMAC-SHA256 du body brut). */
export function verifyWooHmac(rawBody, headerSignature, secret) {
  if (!headerSignature || !secret) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(headerSignature));
  } catch { return false; }
}
