import { getPool } from '../../../src/config/database.js';

export async function listBons({ id_soustraitant, id_of, statut, limit = 50, offset = 0 } = {}) {
  const p = []; const c = [];
  if (id_soustraitant) { p.push(id_soustraitant); c.push(`id_soustraitant = $${p.length}`); }
  if (id_of)           { p.push(id_of);           c.push(`id_of = $${p.length}`); }
  if (statut)          { p.push(statut);          c.push(`statut = $${p.length}`); }
  const where = c.length ? `WHERE ${c.join(' AND ')}` : '';
  p.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM of_sous_traitance ${where} ORDER BY created_at DESC LIMIT $${p.length - 1} OFFSET $${p.length}`, p);
  return rows;
}

export async function findBon(id) {
  const { rows } = await getPool().query(`SELECT * FROM of_sous_traitance WHERE id_of_st = $1`, [id]);
  return rows[0] ?? null;
}

export async function insertBon(b) {
  const cols = Object.keys(b), vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO of_sous_traitance (${cols.join(', ')}) VALUES (${vals}) RETURNING *`, cols.map(c => b[c]));
  return rows[0];
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

// Sous-traitants
export async function listSousTraitants({ actif = true } = {}) {
  const { rows } = await getPool().query(
    `SELECT * FROM sous_traitants WHERE actif = $1 ORDER BY raison_sociale`, [actif]);
  return rows;
}
