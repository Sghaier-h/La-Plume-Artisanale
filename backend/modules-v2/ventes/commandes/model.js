// model.js — commandes
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'commandes';
const PK    = 'id_commande';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}){
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

export async function findById(id){
  const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  if (!rows[0]) return null;
  const { rows: lignes } = await pool.query(
    `SELECT * FROM commandes_lignes WHERE id_commande = $1 ORDER BY ordre`, [id]
  );
  return { ...rows[0], lignes };
}

export async function insert(payload){
  const cols = Object.keys(payload).filter(k => k !== 'lignes');
  const vals = cols.map(c => payload[c]);
  const ph   = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`, vals
  );
  return rows[0];
}

export async function updateById(id, payload){
  const cols = Object.keys(payload).filter(k => k !== 'lignes');
  if (cols.length === 0) return findById(id);
  const set = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${set}, updated_at = NOW() WHERE ${PK} = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => payload[c]), id]
  );
  return rows[0] || null;
}

export async function deleteById(id){
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

export async function getLignes(id){
  const { rows } = await pool.query(
    `SELECT * FROM commandes_lignes WHERE id_commande = $1 ORDER BY ordre`, [id]
  );
  return rows;
}

/**
 * Squelette : crée 1 OF par ligne commande (dans une vraie implémentation,
 * délègue à ordres_fabrication.service). Ici on crée seulement le lien de traçabilité.
 */
export async function creerOFsPourLignes(commande, lignes, user){
  const client = await pool.connect();
  const liens = [];
  try {
    await client.query('BEGIN');
    for (const l of lignes){
      // Placeholder : id_of doit exister — ici on prend id_ligne comme référence temporaire.
      // Une vraie implémentation appellera productionService.creerOF(...) et récupérera id_of.
      const idOfTmp = l.id_ligne;   // à remplacer par un vrai id_of retourné
      await client.query(
        `INSERT INTO commande_of_liens (id_commande, id_ligne_commande, id_of, quantite_affectee)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id_ligne_commande, id_of) DO NOTHING`,
        [commande.id_commande, l.id_ligne, idOfTmp, l.quantite]
      );
      liens.push({ id_ligne_commande: l.id_ligne, id_of: idOfTmp, quantite: l.quantite });
    }
    await client.query('COMMIT');
    return liens;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function marquerOFsGeneres(id){
  await pool.query(
    `UPDATE ${TABLE} SET ofs_generes = TRUE, updated_at = NOW() WHERE ${PK} = $1`, [id]
  );
}

export async function getOfLiens(id){
  const { rows } = await pool.query(
    `SELECT l.*, cl.designation, cl.quantite AS quantite_ligne
       FROM commande_of_liens l
       JOIN commandes_lignes cl ON cl.id_ligne = l.id_ligne_commande
      WHERE l.id_commande = $1
      ORDER BY cl.ordre`, [id]
  );
  return rows;
}
