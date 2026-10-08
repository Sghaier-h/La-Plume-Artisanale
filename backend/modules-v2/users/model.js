import { getPool, withTransaction } from '../_shared/db.js';

export async function list({ q, role, actif, limit = 50, offset = 0 }) {
  const params = [];
  const wh = [];
  if (q)     { params.push(`%${q}%`);  wh.push(`(email ILIKE $${params.length} OR nom ILIKE $${params.length} OR prenom ILIKE $${params.length})`); }
  if (role)  { params.push(role);      wh.push(`role_principal = $${params.length}`); }
  if (actif !== undefined) { params.push(!!actif); wh.push(`actif = $${params.length}`); }
  const where = wh.length ? `WHERE ${wh.join(' AND ')}` : '';
  params.push(limit); params.push(offset);
  const sql = `
    SELECT id_user,email,username,nom,prenom,telephone,role_principal,roles_supplementaires,
           actif,est_verifie,mfa_actif,derniere_connexion,created_at
      FROM users ${where}
     ORDER BY id_user
     LIMIT $${params.length - 1} OFFSET $${params.length}`;
  const cnt = await getPool().query(`SELECT COUNT(*)::int AS n FROM users ${where}`, params.slice(0, params.length - 2));
  const { rows } = await getPool().query(sql, params);
  return { rows, total: cnt.rows[0].n };
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT id_user,email,username,nom,prenom,telephone,whatsapp,role_principal,
            roles_supplementaires,permissions_supplementaires,permissions_bloquees,
            actif,est_verifie,mfa_actif,photo_url,id_langue,derniere_connexion,created_at
       FROM users WHERE id_user = $1`, [id]);
  return rows[0] || null;
}

export async function create(u) {
  return withTransaction(async (c) => {
    const { rows } = await c.query(
      `INSERT INTO users (email,username,mot_de_passe_hash,nom,prenom,telephone,whatsapp,
                          role_principal,roles_supplementaires,actif,est_verifie,cree_par)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,TRUE),COALESCE($11,FALSE),$12)
       RETURNING id_user`,
      [u.email, u.username, u.mot_de_passe_hash, u.nom, u.prenom, u.telephone, u.whatsapp,
       u.role_principal, u.roles_supplementaires || [], u.actif, u.est_verifie, u.cree_par || null]);
    const idUser = rows[0].id_user;
    // Attribuer le rôle principal via user_roles
    await c.query(
      `INSERT INTO user_roles (id_user, id_role, est_principal)
       SELECT $1, id_role, TRUE FROM roles WHERE code = $2
       ON CONFLICT DO NOTHING`,
      [idUser, u.role_principal]);
    return idUser;
  });
}

export async function update(id, u) {
  const fields = [];
  const params = [];
  const push = (col, val) => { params.push(val); fields.push(`${col} = $${params.length}`); };
  ['nom','prenom','telephone','whatsapp','role_principal','photo_url','id_langue','actif','est_verifie']
    .forEach(k => { if (u[k] !== undefined) push(k, u[k]); });
  if (Array.isArray(u.roles_supplementaires))       push('roles_supplementaires', u.roles_supplementaires);
  if (Array.isArray(u.permissions_supplementaires)) push('permissions_supplementaires', u.permissions_supplementaires);
  if (Array.isArray(u.permissions_bloquees))        push('permissions_bloquees', u.permissions_bloquees);
  if (!fields.length) return { updated: 0 };
  params.push(id);
  await getPool().query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id_user = $${params.length}`,
    params);
  return { updated: 1 };
}

export async function remove(id) {
  const { rowCount } = await getPool().query(
    `UPDATE users SET actif = FALSE, updated_at = NOW() WHERE id_user = $1`, [id]);
  return { deactivated: rowCount };
}

export async function listRoles() {
  const { rows } = await getPool().query(
    `SELECT id_role, code, libelle, description, systeme, actif FROM roles ORDER BY ordre_affichage`);
  return rows;
}
export async function listPermissions() {
  const { rows } = await getPool().query(
    `SELECT id_permission, code, domaine, action, scope, libelle FROM permissions ORDER BY domaine, action`);
  return rows;
}
