// model.js — palettes
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'palettes';
const PK    = 'id_palette';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}){
  const where = [], values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)){
    if (v === undefined || v === null || v === '') continue;
    where.push(`${k} = $${i++}`); values.push(v);
  }
  const sql = `SELECT * FROM ${TABLE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${PK} DESC LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id){
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  if (!rows[0]) return null;
  const { rows: colisRows } = await pool.query(`SELECT * FROM colis WHERE id_palette = $1`, [id]);
  return { ...rows[0], colis: colisRows };
}

export async function insert(payload){
  const cols = Object.keys(payload);
  const vals = Object.values(payload);
  const ph   = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`, vals);
  return rows[0];
}

export async function updateById(id, payload){
  const cols = Object.keys(payload);
  if (!cols.length) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${set} WHERE ${PK} = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => payload[c]), id]);
  return rows[0] || null;
}

export async function deleteById(id){
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

export async function nextSeq(){
  const yy = String(new Date().getFullYear()).slice(-2);
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int + 1 AS n FROM ${TABLE} WHERE numero LIKE 'PAL' || $1 || '-%'`, [yy]);
  return rows[0].n;
}
