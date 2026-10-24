// model.js — rh/demandes-rh
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'demandes_rh';
const PK    = 'id_demande';

export async function findAll({ limit = 100, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue;
    where.push(`d.${k} = $${i++}`);
    values.push(v);
  }
  const sql = `
    SELECT d.*, e.matricule, e.nom, e.prenom
      FROM ${TABLE} d
      JOIN employes e ON e.id_employe = d.id_employe
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY d.date_demande DESC, d.${PK} DESC
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT d.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} d
       JOIN employes e ON e.id_employe = d.id_employe
      WHERE d.${PK} = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function insert(payload) {
  const cols = [
    'id_employe','type_demande','objet','description',
    'piece_jointe_path','signature_svg',
    'montant_demande','date_debut_conge','date_fin_conge',
  ];
  const vals = cols.map((c) => payload[c] ?? null);
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(',')})
     VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})
     RETURNING *`,
    vals
  );
  return rows[0];
}

export async function traiter(id, { statut, motif_refus, reponse_rh }, user) {
  if (!['approuvee','refusee','en_cours','cloturee'].includes(statut)) {
    throw new Error('statut invalide');
  }
  const { rows } = await pool.query(
    `UPDATE ${TABLE}
        SET statut = $1,
            motif_refus = $2,
            reponse_rh = $3,
            date_traitement = NOW(),
            traite_par = $4,
            updated_at = NOW()
      WHERE ${PK} = $5
      RETURNING *`,
    [statut, motif_refus || null, reponse_rh || null, user?.id || null, id]
  );
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}
