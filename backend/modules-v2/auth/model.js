/**
 * Auth — accès DB (users, sessions, password_history, login_attempts, audit_log)
 */
import { getPool } from '../_shared/db.js';

export async function findUserByEmail(email) {
  const { rows } = await getPool().query(
    `SELECT id_user, email, username, mot_de_passe_hash, nom, prenom,
            role_principal, roles_supplementaires,
            permissions_supplementaires, permissions_bloquees,
            actif, est_verifie, mfa_actif, mfa_secret_totp,
            nb_echecs_connexion, verrouille_jusqu
       FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await getPool().query(
    `SELECT id_user, email, nom, prenom, role_principal,
            roles_supplementaires, permissions_supplementaires, permissions_bloquees,
            actif, mfa_actif
       FROM users WHERE id_user = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function updatePasswordHash(client, idUser, hash) {
  await client.query(
    `UPDATE users SET mot_de_passe_hash = $1, updated_at = NOW() WHERE id_user = $2`,
    [hash, idUser]
  );
}

export async function insertPasswordHistory(client, idUser, hash) {
  await client.query(
    `INSERT INTO password_history (id_user, mot_de_passe_hash) VALUES ($1, $2)`,
    [idUser, hash]
  );
}

export async function bumpFailedAttempts(idUser) {
  await getPool().query(
    `UPDATE users
        SET nb_echecs_connexion = nb_echecs_connexion + 1,
            verrouille_jusqu    = CASE WHEN nb_echecs_connexion + 1 >= 10
                                       THEN NOW() + INTERVAL '24 hours'
                                       ELSE verrouille_jusqu END,
            updated_at = NOW()
      WHERE id_user = $1`,
    [idUser]
  );
}

export async function resetFailedAttempts(idUser, ip) {
  await getPool().query(
    `UPDATE users SET nb_echecs_connexion = 0,
                       derniere_connexion = NOW(),
                       ip_derniere_connexion = $2,
                       updated_at = NOW()
      WHERE id_user = $1`,
    [idUser, ip || null]
  );
}

export async function logAttempt({ email, idUser, succes, motif, ip, userAgent }) {
  await getPool().query(
    `INSERT INTO login_attempts (email_tente, id_user, succes, motif_echec, ip, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [email || null, idUser || null, !!succes, motif || null, ip || null, userAgent || null]
  );
}

export async function insertSession(s) {
  const { rows } = await getPool().query(
    `INSERT INTO sessions
      (id_user, refresh_token_hash, access_token_jti, type_appareil, nom_appareil,
       user_agent, ip_creation, ip_derniere_utilisation, date_expiration)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$7,$8)
     RETURNING id_session`,
    [s.id_user, s.refresh_hash, s.jti, s.type_appareil, s.nom_appareil,
     s.user_agent, s.ip, s.date_expiration]
  );
  return rows[0];
}

export async function findSession(idSession) {
  const { rows } = await getPool().query(
    `SELECT * FROM sessions WHERE id_session = $1`,
    [idSession]
  );
  return rows[0] || null;
}

export async function revokeSession(idSession, revoquePar, motif) {
  await getPool().query(
    `UPDATE sessions SET revoquee=TRUE, revoquee_par=$2, motif_revocation=$3, updated_at=NOW()
      WHERE id_session=$1`,
    [idSession, revoquePar || null, motif || null]
  );
}

export async function listActiveSessions(idUser) {
  const { rows } = await getPool().query(
    `SELECT id_session, type_appareil, nom_appareil, ip_derniere_utilisation,
            pays_derniere_utilisation, date_derniere_utilisation, date_expiration
       FROM sessions
      WHERE id_user = $1 AND revoquee = FALSE AND date_expiration > NOW()
      ORDER BY date_derniere_utilisation DESC`,
    [idUser]
  );
  return rows;
}

export async function auditEvent({ idUser, type, entite, idEntite, ip, ua, details }) {
  await getPool().query(
    `INSERT INTO audit_log (id_user, type_event, entite, id_entite, ip, user_agent, details_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [idUser || null, type, entite || null, idEntite || null,
     ip || null, ua || null, JSON.stringify(details || {})]
  );
}
