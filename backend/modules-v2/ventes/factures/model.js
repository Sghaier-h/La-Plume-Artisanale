// model.js — factures (avec lignes)
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'factures';
const PK    = 'id_facture';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    where.push(`${k} = $${i++}`);
    values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${PK} DESC LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  if (!rows[0]) return null;
  const { rows: lignes } = await pool.query(`SELECT * FROM factures_lignes WHERE id_facture = $1 ORDER BY ordre`, [id]);
  return { ...rows[0], lignes };
}

export async function insertWithLignes(header, lignes = []) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cols = Object.keys(header);
    const vals = Object.values(header);
    const ph   = cols.map((_, i) => `$${i + 1}`).join(', ');
    const sql  = `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`;
    const { rows } = await client.query(sql, vals);
    const facture = rows[0];
    let ordre = 1;
    for (const l of lignes) {
      const lc = { ordre: ordre++, id_facture: facture.id_facture, ...l };
      const lcols = Object.keys(lc);
      const lvals = Object.values(lc);
      const lph   = lcols.map((_, i) => `$${i + 1}`).join(', ');
      await client.query(`INSERT INTO factures_lignes (${lcols.join(', ')}) VALUES (${lph})`, lvals);
    }
    await client.query('COMMIT');
    return facture;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function updateById(id, payload) {
  const cols = Object.keys(payload).filter(k => k !== 'lignes');
  if (cols.length === 0) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const sql = `UPDATE ${TABLE} SET ${set}, updated_at = NOW() WHERE ${PK} = $${cols.length + 1} RETURNING *`;
  const vals = cols.map(c => payload[c]);
  const { rows } = await pool.query(sql, [...vals, id]);
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}
