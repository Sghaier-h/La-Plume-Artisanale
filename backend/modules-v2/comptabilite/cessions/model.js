// model.js — comptabilite/cessions (Phase A §14quater.3)
import { getPool } from '../../_shared/db.js';
const pool = getPool();

export async function list({ statut, id_dossier_import, limit = 100, offset = 0 } = {}) {
  const where = []; const vals = []; let i = 1;
  if (statut)            { where.push(`c.statut = $${i++}`);              vals.push(statut); }
  if (id_dossier_import) { where.push(`c.id_dossier_import = $${i++}`);   vals.push(id_dossier_import); }
  const sql = `
    SELECT c.*,
           d.numero_dossier,
           d.pays_origine
      FROM cessions_intragroupe c
 LEFT JOIN dossiers_import d ON d.id_dossier = c.id_dossier_import
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY c.date_calcul DESC, c.id_cession DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  vals.push(limit, offset);
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM cessions_intragroupe WHERE id_cession = $1', [id]);
  return rows[0] || null;
}

export async function annuler(id, motif, user) {
  const { rows } = await pool.query(
    `UPDATE cessions_intragroupe
        SET statut = 'annulee',
            date_annulation = NOW(),
            notes = COALESCE(notes,'') || E'\n[Annulation] ' || COALESCE($2,'')
      WHERE id_cession = $1 AND statut NOT IN ('soldee','annulee')
      RETURNING *`,
    [id, motif || null],
  );
  return rows[0] || null;
}
