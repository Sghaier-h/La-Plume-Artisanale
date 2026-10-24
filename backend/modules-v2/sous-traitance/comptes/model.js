import { getPool } from '../../../src/config/database.js';

export async function list({ inactif, limit = 100, offset = 0 } = {}) {
  const params = []; const conds = [];
  if (inactif !== undefined) { params.push(inactif); conds.push(`cst.inactif = $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT cst.*, st.code AS sous_traitant_code, st.raison_sociale AS sous_traitant_nom,
            st.type_activite
       FROM comptes_sous_traitants cst
       JOIN sous_traitants st ON st.id_soustraitant = cst.id_soustraitant
       ${where}
       ORDER BY cst.solde_courant DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT cst.*, st.code AS sous_traitant_code, st.raison_sociale AS sous_traitant_nom
       FROM comptes_sous_traitants cst
       JOIN sous_traitants st ON st.id_soustraitant = cst.id_soustraitant
      WHERE cst.id_compte_st = $1`, [id]);
  return rows[0] ?? null;
}

export async function listMouvements(id_compte_st, { limit = 300, offset = 0 } = {}) {
  const { rows } = await getPool().query(
    `SELECT *
       FROM comptes_sous_traitants_mouvements
      WHERE id_compte_st = $1
      ORDER BY date_mouvement DESC, id_mouvement_cst DESC
      LIMIT $2 OFFSET $3`, [id_compte_st, limit, offset]);
  return rows;
}

export async function insertMouvement(m) {
  const cols = Object.keys(m);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO comptes_sous_traitants_mouvements (${cols.join(', ')})
     VALUES (${vals}) RETURNING *`, cols.map(c => m[c]));
  return rows[0];
}
