// model.js — colisage
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'colis';
const PK    = 'id_colis';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}){
  const where = [], values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
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
  const { rows: lignes } = await pool.query(`SELECT * FROM colis_lignes WHERE id_colis = $1 ORDER BY scanned_at`, [id]);
  return { ...rows[0], lignes };
}

export async function insert(payload){
  const cols = Object.keys(payload).filter(k => k !== 'ref_bl');
  const vals = cols.map(c => payload[c]);
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
    `UPDATE ${TABLE} SET ${set}, updated_at = NOW() WHERE ${PK} = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => payload[c]), id]);
  return rows[0] || null;
}

export async function deleteById(id){
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

export async function nextSeqColis(){
  const { rows } = await pool.query(`SELECT COUNT(*)::int + 1 AS n FROM ${TABLE}`);
  return rows[0].n;
}

export async function nextOrdreDansBl(idBl){
  const { rows } = await pool.query(`SELECT COUNT(*)::int + 1 AS n FROM ${TABLE} WHERE id_bl = $1`, [idBl || null]);
  return rows[0].n;
}

export async function ajouterLigne(idColis, payload){
  const cols = ['id_colis', ...Object.keys(payload)];
  const vals = [idColis, ...Object.values(payload)];
  const ph   = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO colis_lignes (${cols.join(', ')}) VALUES (${ph}) RETURNING *`, vals);
  return rows[0];
}
