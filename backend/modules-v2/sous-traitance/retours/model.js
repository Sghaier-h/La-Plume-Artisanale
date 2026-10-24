import { getPool } from '../../../src/config/database.js';

export async function findBon(id) {
  const { rows } = await getPool().query(`SELECT * FROM of_sous_traitance WHERE id_of_st = $1`, [id]);
  return rows[0] ?? null;
}

export async function updateBon(id, patch) {
  const cols = Object.keys(patch); if (!cols.length) return findBon(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE of_sous_traitance SET ${sets}, updated_at = NOW() WHERE id_of_st = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}

export async function insertMouvement(m) {
  const cols = Object.keys(m), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO mouvements_st (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(c => m[c]));
  return rows[0];
}

export async function historiqueMouvements(id_of_st) {
  const { rows } = await getPool().query(
    `SELECT * FROM mouvements_st WHERE id_of_st = $1 ORDER BY date_mouvement DESC`, [id_of_st]);
  return rows;
}
