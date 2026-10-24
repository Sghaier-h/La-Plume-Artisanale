import { getPool } from '../../../src/config/database.js';

export async function list({ id_soustraitant, type_activite, statut, date_from, date_to, limit = 100, offset = 0 } = {}) {
  const params = []; const conds = [];
  if (id_soustraitant) { params.push(id_soustraitant); conds.push(`t.id_soustraitant = $${params.length}`); }
  if (type_activite)   { params.push(type_activite);   conds.push(`t.type_activite = $${params.length}`); }
  if (statut)          { params.push(statut);          conds.push(`t.statut = $${params.length}`); }
  if (date_from)       { params.push(date_from);       conds.push(`t.date_debut >= $${params.length}`); }
  if (date_to)         { params.push(date_to);         conds.push(`t.date_debut <= $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT t.*, st.raison_sociale AS sous_traitant_nom, st.code AS sous_traitant_code
       FROM travaux_sous_traitants t
       JOIN sous_traitants st ON st.id_soustraitant = t.id_soustraitant
       ${where}
       ORDER BY t.date_debut DESC NULLS LAST, t.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT t.*, st.raison_sociale AS sous_traitant_nom
       FROM travaux_sous_traitants t
       JOIN sous_traitants st ON st.id_soustraitant = t.id_soustraitant
      WHERE t.id_travail = $1`, [id]);
  return rows[0] ?? null;
}

export async function insert(payload) {
  const cols = Object.keys(payload);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO travaux_sous_traitants (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => payload[c]));
  return rows[0];
}

export async function update(id, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return findById(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE travaux_sous_traitants SET ${sets}, updated_at = NOW()
      WHERE id_travail = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}

export async function stats() {
  const { rows } = await getPool().query(
    `SELECT type_activite,
            COUNT(*) AS nb,
            COUNT(*) FILTER (WHERE statut = 'en_cours') AS en_cours,
            COUNT(*) FILTER (WHERE statut = 'termine')  AS termines,
            COUNT(*) FILTER (WHERE statut = 'valide')   AS valides,
            COUNT(*) FILTER (WHERE statut = 'paye')     AS payes,
            COUNT(*) FILTER (WHERE statut = 'refuse')   AS refuses,
            COALESCE(SUM(montant), 0) AS montant_total
       FROM travaux_sous_traitants
       GROUP BY type_activite
       ORDER BY type_activite`);
  return rows;
}

export async function parMois({ months_back = 6 } = {}) {
  const { rows } = await getPool().query(
    `SELECT date_trunc('month', date_debut)::date AS mois,
            type_activite,
            COUNT(*) AS nb,
            COALESCE(SUM(montant), 0) AS montant
       FROM travaux_sous_traitants
      WHERE date_debut >= NOW() - ($1 || ' months')::interval
      GROUP BY mois, type_activite
      ORDER BY mois ASC`, [months_back]);
  return rows;
}
