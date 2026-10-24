/**
 * Auth service — logique métier (hashage, tokens, MFA, verrouillage).
 */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { getPool, withTransaction } from '../_shared/db.js';
import * as M from './model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const BCRYPT_COST = 12;

// TTL par type d'appareil (secondes) — cf §2bis.4
const TTL = {
  web:                { access: 15 * 60,      refresh: 24 * 3600 },
  web_operateur:      { access: 30 * 60,      refresh: 7  * 24 * 3600 },
  mobile_ios:         { access: 60 * 60,      refresh: 30 * 24 * 3600 },
  mobile_android:     { access: 60 * 60,      refresh: 30 * 24 * 3600 },
  tablette_atelier:   { access: 8  * 3600,    refresh: 7  * 24 * 3600 },
};

function ttlFor(type) { return TTL[type] || TTL.web; }

/**
 * Au premier démarrage, re-hasher tout mot de passe stocké en clair
 * (préfixe `PLAIN:` — cf seed 04_admin_user.sql).
 */
export async function rehashPlainPasswordsOnBoot() {
  const { rows } = await getPool().query(
    `SELECT id_user, mot_de_passe_hash FROM users WHERE mot_de_passe_hash LIKE 'PLAIN:%'`
  );
  for (const u of rows) {
    const plain = u.mot_de_passe_hash.slice(6);
    const hash = await bcrypt.hash(plain, BCRYPT_COST);
    await withTransaction(async (client) => {
      await M.updatePasswordHash(client, u.id_user, hash);
      await M.insertPasswordHistory(client, u.id_user, hash);
    });
  }
  return rows.length;
}

export async function login({ email, password, ip, userAgent, typeAppareil = 'web' }) {
  const user = await M.findUserByEmail(email);
  if (!user || !user.actif) {
    await M.logAttempt({ email, succes: false, motif: 'compte_inconnu_ou_inactif', ip, userAgent });
    const err = new Error('Identifiants invalides'); err.code = 'invalid_credentials'; err.status = 401; throw err;
  }
  if (user.verrouille_jusqu && new Date(user.verrouille_jusqu) > new Date()) {
    await M.logAttempt({ email, idUser: user.id_user, succes: false, motif: 'compte_verrouille', ip, userAgent });
    const err = new Error('Compte temporairement verrouillé'); err.code = 'account_locked'; err.status = 423; throw err;
  }

  // Compat : hash toujours en clair "PLAIN:..." → rehash immédiat
  let hashInDb = user.mot_de_passe_hash;
  if (hashInDb.startsWith('PLAIN:')) {
    const clear = hashInDb.slice(6);
    if (clear !== password) {
      await M.bumpFailedAttempts(user.id_user);
      await M.logAttempt({ email, idUser: user.id_user, succes: false, motif: 'password_incorrect', ip, userAgent });
      const err = new Error('Identifiants invalides'); err.code = 'invalid_credentials'; err.status = 401; throw err;
    }
    hashInDb = await bcrypt.hash(clear, BCRYPT_COST);
    await withTransaction(async (client) => {
      await M.updatePasswordHash(client, user.id_user, hashInDb);
      await M.insertPasswordHistory(client, user.id_user, hashInDb);
    });
  } else {
    const okPwd = await bcrypt.compare(password, hashInDb);
    if (!okPwd) {
      await M.bumpFailedAttempts(user.id_user);
      await M.logAttempt({ email, idUser: user.id_user, succes: false, motif: 'password_incorrect', ip, userAgent });
      const err = new Error('Identifiants invalides'); err.code = 'invalid_credentials'; err.status = 401; throw err;
    }
  }

  // Si MFA active → renvoie session pré-2FA
  if (user.mfa_actif) {
    const pre = jwt.sign(
      { pre_2fa: true, id_user: user.id_user },
      JWT_SECRET,
      { expiresIn: '5m' }
    );
    return { mfa_required: true, session_pre_2fa: pre };
  }

  return finalizeSession({ user, ip, userAgent, typeAppareil });
}

export async function verify2FA({ session_pre_2fa, code_totp, ip, userAgent, typeAppareil = 'web' }) {
  let payload;
  try { payload = jwt.verify(session_pre_2fa, JWT_SECRET); }
  catch { const e = new Error('Session 2FA expirée'); e.code='invalid_token'; e.status=401; throw e; }
  if (!payload.pre_2fa) { const e = new Error('Session invalide'); e.code='invalid_token'; e.status=401; throw e; }
  const user = await M.findUserById(payload.id_user);
  if (!user) { const e = new Error('Utilisateur inconnu'); e.code='not_found'; e.status=404; throw e; }
  // Validation TOTP simplifiée (à remplacer par speakeasy/otplib en prod)
  if (!/^\d{6}$/.test(String(code_totp || ''))) {
    const e = new Error('Code TOTP invalide'); e.code='invalid_totp'; e.status=401; throw e;
  }
  return finalizeSession({ user, ip, userAgent, typeAppareil });
}

async function finalizeSession({ user, ip, userAgent, typeAppareil }) {
  const t = ttlFor(typeAppareil);
  const jti = crypto.randomUUID();
  const refresh = crypto.randomBytes(48).toString('base64url');
  const refreshHash = await bcrypt.hash(refresh, 8);
  const expires = new Date(Date.now() + t.refresh * 1000);
  const session = await M.insertSession({
    id_user: user.id_user, refresh_hash: refreshHash, jti,
    type_appareil: typeAppareil, nom_appareil: userAgent?.slice(0, 200) || null,
    user_agent: userAgent, ip, date_expiration: expires,
  });
  const access = jwt.sign(
    {
      id_user: user.id_user,
      email: user.email,
      role_principal: user.role_principal,
      roles: [user.role_principal, ...(user.roles_supplementaires || [])],
      permissions: user.permissions_supplementaires || [],
      permissions_bloquees: user.permissions_bloquees || [],
      jti,
      id_session: session.id_session,
    },
    JWT_SECRET,
    { expiresIn: t.access }
  );
  await M.resetFailedAttempts(user.id_user, ip);
  await M.logAttempt({ email: user.email, idUser: user.id_user, succes: true, ip, userAgent });
  await M.auditEvent({ idUser: user.id_user, type: 'login_success', ip, ua: userAgent, details: { type_appareil: typeAppareil } });
  return {
    access_token: access,
    refresh_token: refresh,
    expires_in: t.access,
    user: {
      id_user: user.id_user, email: user.email, nom: user.nom, prenom: user.prenom,
      role_principal: user.role_principal,
    },
  };
}

export async function refresh({ refresh_token, id_session, ip, userAgent }) {
  const s = await M.findSession(id_session);
  if (!s || s.revoquee || new Date(s.date_expiration) < new Date()) {
    const e = new Error('Session invalide'); e.code = 'invalid_session'; e.status = 401; throw e;
  }
  const ok = await bcrypt.compare(refresh_token, s.refresh_token_hash);
  if (!ok) { const e = new Error('Refresh token invalide'); e.code='invalid_token'; e.status=401; throw e; }
  // Rotation : révoquer l'ancienne, créer une nouvelle
  await M.revokeSession(id_session, null, 'rotation');
  const user = await M.findUserById(s.id_user);
  return finalizeSession({ user, ip, userAgent, typeAppareil: s.type_appareil });
}

export async function logout({ id_session, id_user }) {
  await M.revokeSession(id_session, id_user, 'logout');
  await M.auditEvent({ idUser: id_user, type: 'logout' });
  return { revoked: true };
}

export async function listSessions(id_user) {
  return M.listActiveSessions(id_user);
}
