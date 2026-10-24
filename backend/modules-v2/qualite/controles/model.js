import { getPool } from '../../../src/config/database.js';

export async function findAll({ id_of, id_controleur, est_bloquant, limit = 50, offset = 0 } = {}) {
  const p = []; const c = [];
  if (id_of)         { p.push(id_of);         c.push(`id_of = $${p.length}`); }
  if (id_controleur) { p.push(id_controleur); c.push(`id_controleur = $${p.length}`); }
  if (est_bloquant !== undefined) { p.push(!!est_bloquant); c.push(`est_bloquant = $${p.length}`); }
  const where = c.length ? `WHERE ${c.join(' AND ')}` : '';
  p.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM controles_qualite ${where} ORDER BY date_controle DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(`SELECT * FROM controles_qualite WHERE id_ctrl = $1`, [id]);
  return rows[0] ?? null;
}

export async function insert(ctrl) {
  const cols = Object.keys(ctrl), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO controles_qualite (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(c => ctrl[c]));
  return rows[0];
}

export async function update(id, patch) {
  const cols = Object.keys(patch); if (!cols.length) return findById(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE controles_qualite SET ${sets}, updated_at = NOW() WHERE id_ctrl = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}
