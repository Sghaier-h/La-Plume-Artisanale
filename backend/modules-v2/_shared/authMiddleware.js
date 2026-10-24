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
    // ADMIN bypass — accepte les 2 conventions de nommage (legacy `role` + v2 `role_principal`)
    // et normalise la casse pour tolérer 'admin' / 'Admin' / 'ADMIN'.
    const roleUp = String(u.role_principal || u.role || '').toUpperCase();
    if (roleUp === 'ADMIN' || roleUp === 'SUPER_ADMIN') return next();
    // Fallback si les roles multiples sont listés (v2 payload étendu)
    const rolesArr = Array.isArray(u.roles) ? u.roles.map(r => String(r).toUpperCase()) : [];
    if (rolesArr.includes('ADMIN') || rolesArr.includes('SUPER_ADMIN')) return next();
    const perms = new Set(u.permissions || []);
    const blocked = new Set(u.permissions_bloquees || []);
    if (blocked.has(code)) return fail(res, 403, 'forbidden', `Permission ${code} bloquée`);
    if (!perms.has(code)) return fail(res, 403, 'forbidden', `Permission ${code} requise`);
    return next();
  };
}
