import { getPool } from '../../../src/config/database.js';

export async function findAll({ limit = 50, offset = 0, id_machine, statut } = {}) {
  const params = []; const clauses = [];
  if (id_machine) { params.push(id_machine); clauses.push(`id_machine = $${params.length}`); }
  if (statut)     { params.push(statut);     clauses.push(`statut = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM ourdissages ${where} ORDER BY date_demande DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(`SELECT * FROM ourdissages WHERE id_ourdissage = $1`, [id]);
  return rows[0] ?? null;
}

export async function insert(o) {
  const cols = Object.keys(o);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO ourdissages (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => o[c])
  );
  return rows[0];
}

export async function update(id, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return findById(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE ourdissages SET ${sets}, updated_at = NOW() WHERE id_ourdissage = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]
  );
  return rows[0] ?? null;
}

export async function ajouterLot(lot) {
  const cols = Object.keys(lot);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO ourdissage_lots (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => lot[c])
  );
  return rows[0];
}
