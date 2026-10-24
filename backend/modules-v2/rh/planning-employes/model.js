// model.js — rh/planning-employes
import { getPool } from '../../_shared/db.js';
const pool = getPool();

const TABLE = 'planning_employes';
const PK    = 'id_planning';

export async function findAll({ limit = 500, offset = 0, filters = {} } = {}) {
  const where = [];
  const values = [];
  let i = 1;
  if (filters.id_employe)   { where.push(`p.id_employe = $${i++}`); values.push(filters.id_employe); }
  if (filters.date_debut)   { where.push(`p.date_planning >= $${i++}`); values.push(filters.date_debut); }
  if (filters.date_fin)     { where.push(`p.date_planning <= $${i++}`); values.push(filters.date_fin); }
  if (filters.statut)       { where.push(`p.statut = $${i++}`); values.push(filters.statut); }
  if (filters.machine_assignee) { where.push(`p.machine_assignee = $${i++}`); values.push(filters.machine_assignee); }

  const sql = `
    SELECT p.*, e.matricule, e.nom, e.prenom
      FROM ${TABLE} p
      JOIN employes e ON e.id_employe = p.id_employe
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY p.date_planning ASC, p.horaire_debut ASC
     LIMIT $${i++} OFFSET $${i}`;
  values.push(limit, offset);
  const { rows } = await pool.query(sql, values);
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT p.*, e.matricule, e.nom, e.prenom
       FROM ${TABLE} p
       JOIN employes e ON e.id_employe = p.id_employe
      WHERE p.${PK} = $1 LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function insert(payload, user) {
  const cols = [
    'id_employe','date_planning','horaire_debut','horaire_fin',
    'type_shift','machine_assignee','of_assigne','statut','notes','cree_par',
  ];
  const vals = cols.map((c) => c === 'cree_par' ? user?.id || null : (payload[c] ?? null));
  const { rows } = await pool.query(
    `INSERT INTO ${TABLE} (${cols.join(',')})
     VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})
     ON CONFLICT (id_employe, date_planning, horaire_debut) DO UPDATE SET
       horaire_fin = EXCLUDED.horaire_fin,
       type_shift = EXCLUDED.type_shift,
       machine_assignee = EXCLUDED.machine_assignee,
       of_assigne = EXCLUDED.of_assigne,
       statut = EXCLUDED.statut,
       notes = EXCLUDED.notes,
       updated_at = NOW()
     RETURNING *`,
    vals
  );
  return rows[0];
}

export async function updateById(id, payload) {
  const allowed = ['date_planning','horaire_debut','horaire_fin','type_shift',
                   'machine_assignee','of_assigne','statut','notes'];
  const sets = [];
  const vals = [];
  let i = 1;
  for (const c of allowed) {
    if (payload[c] !== undefined) { sets.push(`${c} = $${i++}`); vals.push(payload[c]); }
  }
  if (!sets.length) return findById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE ${TABLE} SET ${sets.join(', ')}, updated_at = NOW()
      WHERE ${PK} = $${i} RETURNING *`,
    vals
  );
  return rows[0] || null;
}

export async function deleteById(id) {
  const { rowCount } = await pool.query(`DELETE FROM ${TABLE} WHERE ${PK} = $1`, [id]);
  return { deleted: rowCount };
}

export async function monPlanning(idEmploye, { jours = 7 } = {}) {
  const { rows } = await pool.query(
    `SELECT * FROM ${TABLE}
      WHERE id_employe = $1
        AND date_planning BETWEEN CURRENT_DATE AND CURRENT_DATE + ($2 || ' days')::interval
      ORDER BY date_planning ASC, horaire_debut ASC`,
    [idEmploye, String(jours)]
  );
  return rows;
}
