/**
 * Rate limiting simple en mémoire (MVP — pas de Redis).
 *   - loginRateLimit : 5 tentatives / IP / 15 min sur les endpoints d'auth
 *   - apiRateLimit   : 300 requêtes / IP / minute sur l'API
 *
 * Chaque limiteur maintient une Map<ip, {count, windowStart}>.
 * Un balayage périodique élague les fenêtres expirées pour éviter les fuites.
 */

const buckets = new Map(); // key -> { count, windowStart }
const PRUNE_INTERVAL_MS = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > entry.windowMs) buckets.delete(key);
  }
}, PRUNE_INTERVAL_MS).unref?.();

function getClientIp(req) {
  return (
    req.ip ||
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

function makeLimiter({ windowMs, max, keyPrefix, message }) {
  return function rateLimiter(req, res, next) {
    const key = `${keyPrefix}:${getClientIp(req)}`;
    const now = Date.now();
    let entry = buckets.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 0, windowStart: now, windowMs };
      buckets.set(key, entry);
    }

    entry.count += 1;

    const remaining = Math.max(0, max - entry.count);
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil((entry.windowStart + windowMs) / 1000)));

    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.windowStart + windowMs - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        error: { message }
      });
    }
    return next();
  };
}

export const loginRateLimit = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'login',
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
});

export const apiRateLimit = makeLimiter({
  windowMs: 60 * 1000,
  max: 300,
  keyPrefix: 'api',
  message: 'Trop de requêtes. Veuillez patienter.'
});

export default { loginRateLimit, apiRateLimit };
