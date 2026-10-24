/**
 * backend/modules-v2/multi-societes/model.js
 * Accès bas-niveau à la table `societes` et aux ACL `users_societes_acces`.
 */
import { getPool } from '../_shared/db.js';

const BASE_COLUMNS = `
  id_societe, code_societe, raison_sociale, nom_commercial, forme_juridique,
  type_societe, siret, tva_intracommunautaire,
  adresse, code_postal, ville, pays,
  telephone, email, site_web, logo_url,
  devise, langue, fuseau_horaire,
  est_consolidation, actif, created_at, updated_at
`;

/**
 * Liste les sociétés visibles.
 *
 * - `idUser` fourni + non-admin : filtre via `users_societes_acces`.
 *   Si l'utilisateur n'a AUCUNE ligne dans `users_societes_acces`,
 *   on retombe sur « toutes les sociétés actives » (back-compat).
 * - `isAdmin = true` ou aucun idUser : liste complète.
 */
export async function listSocietes({ idUser = null, isAdmin = false, activesOnly = true } = {}) {
  const pool = getPool();
  const wh = [];
  const params = [];
  if (activesOnly) wh.push(`s.actif = TRUE`);

  if (!isAdmin && idUser) {
    // vérifie si l'user a des ACL : si oui, filtre, sinon retourne tout
    const acl = await pool.query(
      `SELECT 1 FROM users_societes_acces WHERE id_user = $1 LIMIT 1`,
      [idUser]
    );
    if (acl.rowCount > 0) {
      params.push(idUser);
      wh.push(`s.id_societe IN (
        SELECT id_societe FROM users_societes_acces WHERE id_user = $${params.length}
      )`);
    }
  }

  const where = wh.length ? `WHERE ${wh.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ${BASE_COLUMNS}
       FROM societes s
       ${where}
      ORDER BY s.est_consolidation ASC, s.id_societe ASC`
  );
  return rows;
}

export async function findSocieteById(id) {
  const { rows } = await getPool().query(
    `SELECT ${BASE_COLUMNS} FROM societes WHERE id_societe = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateSociete(id, data) {
  const allowed = [
    'raison_sociale', 'nom_commercial', 'forme_juridique', 'type_societe',
    'siret', 'tva_intracommunautaire',
    'adresse', 'code_postal', 'ville', 'pays',
    'telephone', 'email', 'site_web', 'logo_url',
    'devise', 'langue', 'fuseau_horaire',
    'est_consolidation', 'actif',
  ];
  const fields = [];
  const params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) {
      params.push(data[k]);
      fields.push(`${k} = $${params.length}`);
    }
  }
  if (fields.length === 0) return findSocieteById(id);
  params.push(id);
  const { rows } = await getPool().query(
    `UPDATE societes
        SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id_societe = $${params.length}
      RETURNING ${BASE_COLUMNS}`,
    params
  );
  return rows[0] || null;
}

/**
 * Vérifie qu'un user a accès à une société donnée.
 * - admin : toujours vrai
 * - pas d'ACL : vrai (back-compat)
 * - sinon : présence dans users_societes_acces
 */
export async function userCanAccessSociete({ idUser, idSociete, isAdmin = false }) {
  if (isAdmin) return true;
  const { rows } = await getPool().query(
    `SELECT
       (SELECT COUNT(*)::int FROM users_societes_acces WHERE id_user = $1)       AS acl_count,
       (SELECT COUNT(*)::int FROM users_societes_acces
         WHERE id_user = $1 AND id_societe = $2)                                 AS acces_count`,
    [idUser, idSociete]
  );
  const row = rows[0];
  if (!row) return false;
  if (row.acl_count === 0) return true; // pas d'ACL : accès à tout (back-compat)
  return row.acces_count > 0;
}

export async function setUserSocieteCourante(idUser, idSociete) {
  await getPool().query(
    `UPDATE users SET societe_courante = $1, updated_at = NOW() WHERE id_user = $2`,
    [idSociete, idUser]
  );
}

/**
 * Vue consolidée des ventes (§14quater.1 + v_consolide_ventes).
 */
export async function getConsolideVentes() {
  const { rows } = await getPool().query(
    `SELECT * FROM v_consolide_ventes ORDER BY id_societe ASC`
  );
  return rows;
}
