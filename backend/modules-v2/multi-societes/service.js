/**
 * backend/modules-v2/multi-societes/service.js
 *
 * Orchestration métier (règles d'accès + émission du JWT raf).
 */
import jwt from 'jsonwebtoken';
import * as M from './model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

function isAdminUser(user) {
  if (!user) return false;
  const role = String(user.role_principal || user.role || '').toUpperCase();
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return true;
  const roles = Array.isArray(user.roles) ? user.roles.map((r) => String(r).toUpperCase()) : [];
  return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN');
}

export async function listForUser(user) {
  return M.listSocietes({
    idUser: user?.id_user || user?.id || null,
    isAdmin: isAdminUser(user),
    activesOnly: true,
  });
}

export async function getOne(id) {
  return M.findSocieteById(Number(id));
}

export async function update(id, data) {
  return M.updateSociete(Number(id), data || {});
}

/**
 * Bascule : met à jour `users.societe_courante` et renvoie un nouveau
 * JWT (refresh/access unique « raf ») portant le claim `societe_id`.
 */
export async function basculer({ user, idSociete }) {
  const idUser = user?.id_user || user?.id;
  if (!idUser) {
    const err = new Error('Utilisateur non authentifié');
    err.status = 401; err.code = 'unauthorized';
    throw err;
  }

  const target = Number(idSociete);
  if (!Number.isFinite(target) || target <= 0) {
    const err = new Error('ID société invalide');
    err.status = 400; err.code = 'bad_request';
    throw err;
  }

  const societe = await M.findSocieteById(target);
  if (!societe) {
    const err = new Error('Société introuvable');
    err.status = 404; err.code = 'not_found';
    throw err;
  }

  const authorized = await M.userCanAccessSociete({
    idUser,
    idSociete: target,
    isAdmin: isAdminUser(user),
  });
  if (!authorized) {
    const err = new Error('Accès refusé à cette société');
    err.status = 403; err.code = 'forbidden';
    throw err;
  }

  await M.setUserSocieteCourante(idUser, target);

  const payload = {
    id_user: idUser,
    email: user.email,
    role_principal: user.role_principal || user.role,
    roles: user.roles || [],
    permissions: user.permissions || [],
    societe_id: target,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return { societe, token };
}

export async function getConsolideVentes({ user }) {
  if (!isAdminUser(user)) {
    const err = new Error('Vue consolidée réservée aux administrateurs');
    err.status = 403; err.code = 'forbidden';
    throw err;
  }
  return M.getConsolideVentes();
}

export const _isAdminUser = isAdminUser;
