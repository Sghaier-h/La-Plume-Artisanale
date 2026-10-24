import { getPool } from '../../../src/config/database.js';

export async function listSessions({ limit = 50, offset = 0, id_of, id_machine, statut, id_operateur } = {}) {
  const params = []; const clauses = [];
  if (id_of)        { params.push(id_of);        clauses.push(`id_of = $${params.length}`); }
  if (id_machine)   { params.push(id_machine);   clauses.push(`id_machine = $${params.length}`); }
  if (statut)       { params.push(statut);       clauses.push(`statut = $${params.length}`); }
  if (id_operateur) { params.push(id_operateur); clauses.push(`id_operateur = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM sessions_tissage ${where} ORDER BY date_debut DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function findSession(id) {
  const { rows } = await getPool().query(`SELECT * FROM sessions_tissage WHERE id_session = $1`, [id]);
  return rows[0] ?? null;
}

export async function insertSession(s) {
  const cols = Object.keys(s);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO sessions_tissage (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => s[c])
  );
  return rows[0];
}

export async function updateSession(id, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return findSession(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE sessions_tissage SET ${sets}, updated_at = NOW() WHERE id_session = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]
  );
  return rows[0] ?? null;
}

export async function appendIncident(id, incident) {
  const { rows } = await getPool().query(
    `UPDATE sessions_tissage
     SET incidents_json = incidents_json || $1::jsonb,
         nb_incidents   = nb_incidents + 1,
         updated_at     = NOW()
     WHERE id_session = $2 RETURNING *`,
    [JSON.stringify([incident]), id]
  );
  return rows[0] ?? null;
}
