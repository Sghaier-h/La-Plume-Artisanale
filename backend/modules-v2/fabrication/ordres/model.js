// Accès SQL — ordres_fabrication (§7.5)
import { getPool } from '../../../src/config/database.js';

const TABLE = 'ordres_fabrication';

export async function findAll({ limit = 50, offset = 0, statut, id_machine_prevue, id_commande } = {}) {
  const pool = getPool();
  const clauses = [];
  const params  = [];
  if (statut)             { params.push(statut);            clauses.push(`statut = $${params.length}`); }
  if (id_machine_prevue)  { params.push(id_machine_prevue); clauses.push(`id_machine_prevue = $${params.length}`); }
  if (id_commande)        { params.push(id_commande);       clauses.push(`id_commande = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE} ${where} ORDER BY date_creation_of DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(`SELECT * FROM ${TABLE} WHERE id_of = $1`, [id]);
  return rows[0] ?? null;
}

export async function findByNumero(numero) {
  const { rows } = await getPool().query(`SELECT * FROM ${TABLE} WHERE numero_of = $1`, [numero]);
  return rows[0] ?? null;
}

export async function insert(of) {
  const cols = Object.keys(of);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => of[c])
  );
  return rows[0];
}

export async function update(id, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return findById(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE ${TABLE} SET ${sets}, updated_at = NOW() WHERE id_of = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]
  );
  return rows[0] ?? null;
}

export async function remove(id) {
  const { rowCount } = await getPool().query(`DELETE FROM ${TABLE} WHERE id_of = $1`, [id]);
  return rowCount > 0;
}

export async function insertStatusTransition(id_of, avant, apres, motif, id_utilisateur) {
  await getPool().query(
    `INSERT INTO of_status_transitions (id_of, statut_avant, statut_apres, motif, id_utilisateur)
     VALUES ($1,$2,$3,$4,$5)`,
    [id_of, avant, apres, motif, id_utilisateur]
  );
}
