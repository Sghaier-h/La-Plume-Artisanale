/**
 * Cache local du PIN tablette pour l'authentification hors ligne.
 * §14ter.19 — ERP La Plume Artisanale
 *
 * ⚠ Sécurité :
 *   - On NE STOCKE JAMAIS le PIN en clair.
 *   - On stocke uniquement un hash SHA-256 salé du PIN de la *dernière*
 *     session réussie (un seul PIN à la fois, les anciens sont écrasés).
 *   - Durée de vie du cache : 8 h depuis la dernière auth réussie.
 *   - Le token applicatif associé est également caché 8 h.
 *   - Au logout explicite, l'intégralité du cache (y compris ce PIN)
 *     est purgée (voir `purgeAll` dans `db.ts`).
 */
import { metaGet, metaSet, metaDelete } from './db';

const PIN_META_KEY = 'tablette_pin_v1';
const SESSION_META_KEY = 'tablette_session_v1';
const TTL_MS = 8 * 60 * 60 * 1000; // 8 h

interface PinRecord {
  salt: string;         // hex
  hash: string;         // hex
  utilisateurId: number | string;
  savedAt: number;      // ms
}

interface SessionRecord {
  token: string;
  user: unknown;
  savedAt: number;
}

/** Génère un salt aléatoire 16 octets en hex. */
function randomSalt(): string {
  const bytes = new Uint8Array(16);
  (window.crypto || (window as any).msCrypto).getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await window.crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Enregistre le PIN de la session fraîchement authentifiée.
 * Appelé après POST /v2/rh/pin-tablette/authenticate réussi.
 */
export async function cachePinAfterAuth(
  pin: string,
  utilisateurId: number | string,
): Promise<void> {
  const salt = randomSalt();
  const hash = await sha256(`${salt}:${pin}`);
  const record: PinRecord = { salt, hash, utilisateurId, savedAt: Date.now() };
  await metaSet(PIN_META_KEY, record);
}

/**
 * Vérifie un PIN localement (mode offline).
 * Renvoie l'utilisateurId si valide et non expiré, sinon null.
 */
export async function verifyPinOffline(pin: string): Promise<number | string | null> {
  const rec = await metaGet<PinRecord>(PIN_META_KEY);
  if (!rec) return null;
  if (Date.now() - rec.savedAt > TTL_MS) {
    await metaDelete(PIN_META_KEY);
    return null;
  }
  const h = await sha256(`${rec.salt}:${pin}`);
  // Comparaison constant-time naïve (longueur fixe de SHA-256 = 64 hex)
  if (h.length !== rec.hash.length) return null;
  let diff = 0;
  for (let i = 0; i < h.length; i += 1) diff |= h.charCodeAt(i) ^ rec.hash.charCodeAt(i);
  return diff === 0 ? rec.utilisateurId : null;
}

/** Cache le token applicatif + user pour accès offline aux pages. */
export async function cacheTabletteSession(token: string, user: unknown): Promise<void> {
  const rec: SessionRecord = { token, user, savedAt: Date.now() };
  await metaSet(SESSION_META_KEY, rec);
}

/** Récupère la session cachée si pas expirée. */
export async function getCachedTabletteSession(): Promise<{ token: string; user: unknown } | null> {
  const rec = await metaGet<SessionRecord>(SESSION_META_KEY);
  if (!rec) return null;
  if (Date.now() - rec.savedAt > TTL_MS) {
    await metaDelete(SESSION_META_KEY);
    return null;
  }
  return { token: rec.token, user: rec.user };
}

/** Supprime tout cache PIN + session (logout). */
export async function clearPinCache(): Promise<void> {
  await Promise.all([metaDelete(PIN_META_KEY), metaDelete(SESSION_META_KEY)]);
}
