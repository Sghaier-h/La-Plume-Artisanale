/**
 * Middleware d'authentification v2 minimaliste.
 * Ré-implémentation isolée du legacy — vérifie un JWT dans Authorization: Bearer <token>.
 * Ne modifie AUCUN middleware existant.
 */
import jwt from 'jsonwebtoken';
import { fail } from './response.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 401, 'unauthorized', 'Token manquant');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id_user, email, role_principal, roles, permissions }
    return next();
  } catch (err) {
    return fail(res, 401, 'invalid_token', 'Token invalide ou expiré');
  }
}

/**
 * requirePermission('facture:emettre')
 * Vérifie ABAC via req.user.permissions (chargées au login).
 */
export function requirePermission(code) {
  return (req, res, next) => {
    const u = req.user;
    if (!u) return fail(res, 401, 'unauthorized', 'Non authentifié');
    if (u.role_principal === 'ADMIN') return next();
    const perms = new Set(u.permissions || []);
    const blocked = new Set(u.permissions_bloquees || []);
    if (blocked.has(code)) return fail(res, 403, 'forbidden', `Permission ${code} bloquée`);
    if (!perms.has(code)) return fail(res, 403, 'forbidden', `Permission ${code} requise`);
    return next();
  };
}
