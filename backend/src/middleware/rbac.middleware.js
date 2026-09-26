/**
 * RBAC (Role-Based Access Control) middleware
 * Fournit :
 *  - requireRole(...allowedRoles) : vérifie que req.user.role ∈ allowedRoles
 *  - requirePermission(perm)      : vérifie une permission via utilisateurs_roles/roles/role_permissions
 *  - isAdmin(req)                 : helper booléen
 *
 * Ne casse pas l'existant : auth.middleware.js expose déjà `authorize` (alias `requireRole`).
 * Les consommateurs qui veulent le nouveau RBAC importent explicitement depuis ce fichier.
 */

import { pool } from '../utils/db.js';

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

export const isAdmin = (req) => {
  return !!(req?.user?.role && ADMIN_ROLES.has(req.user.role));
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Non authentifié' }
    });
  }
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { message: 'Réservé aux rôles: ' + allowedRoles.join(', ') }
    });
  }
  next();
};

export const requirePermission = (perm) => async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Non authentifié' }
      });
    }

    // Fallback : ADMIN a tous les droits
    if (isAdmin(req)) return next();

    const userId = parseInt(req.user.id, 10);
    if (!Number.isFinite(userId)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Identifiant utilisateur invalide' }
      });
    }

    const { rows } = await pool.query(
      `SELECT 1
         FROM utilisateurs_roles ur
         JOIN roles r          ON r.id_role = ur.id_role
         JOIN role_permissions rp ON rp.id_role = r.id_role
        WHERE ur.id_utilisateur = $1
          AND rp.code_permission = $2
        LIMIT 1`,
      [userId, perm]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { message: `Permission requise : ${perm}` }
      });
    }
    return next();
  } catch (err) {
    // En cas d'erreur DB : ne pas laisser passer par défaut
    return res.status(500).json({
      success: false,
      error: { message: 'Erreur RBAC', detail: err.message }
    });
  }
};

export default { requireRole, requirePermission, isAdmin };
