// Utilise of_postes (code_poste='finition') pour tracer les postes finition
import { getPool } from '../../../src/config/database.js';

export async function listPostesFinition({ id_of, statut, id_operateur } = {}) {
  const p = []; const c = [`code_poste = 'finition'`];
  if (id_of)        { p.push(id_of);        c.push(`id_of = $${p.length}`); }
  if (statut)       { p.push(statut);       c.push(`statut = $${p.length}`); }
  if (id_operateur) { p.push(id_operateur); c.push(`id_operateur = $${p.length}`); }
  const { rows } = await getPool().query(
    `SELECT * FROM of_postes WHERE ${c.join(' AND ')} ORDER BY ordre, id_of_poste`, p);
  return rows;
}
export async function findPoste(id) {
  const { rows } = await getPool().query(`SELECT * FROM of_postes WHERE id_of_poste = $1`, [id]);
  return rows[0] ?? null;
}
export async function updatePoste(id, patch) {
  const cols = Object.keys(patch); if (!cols.length) return findPoste(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE of_postes SET ${sets}, updated_at = NOW() WHERE id_of_poste = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}
