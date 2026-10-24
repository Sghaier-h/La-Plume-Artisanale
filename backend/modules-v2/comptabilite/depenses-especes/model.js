// model.js — comptabilite/depenses-especes (§9.9 + §14quater)
import { getPool, withTransaction } from '../../_shared/db.js';
const pool = getPool();

export async function list({ periode, id_caisse, comptabilisee, limit = 200, offset = 0 } = {}) {
  const where = []; const vals = []; let i = 1;
  if (periode)   { where.push(`to_char(date_depense,'YYYY-MM') = $${i++}`); vals.push(periode); }
  if (id_caisse) { where.push(`id_caisse = $${i++}`);                       vals.push(id_caisse); }
  if (comptabilisee != null) { where.push(`comptabilisee = $${i++}`);       vals.push(comptabilisee === 'true' || comptabilisee === true); }
  const sql = `
    SELECT * FROM depenses_courantes_espece
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY date_depense DESC, id_depense DESC
     LIMIT $${i++} OFFSET $${i}
  `;
  vals.push(limit, offset);
  const { rows } = await pool.query(sql, vals);
  return rows;
}

export async function totaux(periode) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(montant), 0)::NUMERIC(14,3) AS total,
            COUNT(*)                                 AS nb,
            COUNT(*) FILTER (WHERE NOT comptabilisee) AS nb_non_cloturees
       FROM depenses_courantes_espece
      WHERE to_char(date_depense,'YYYY-MM') = $1`,
    [periode],
  );
  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM depenses_courantes_espece WHERE id_depense = $1', [id]);
  return rows[0] || null;
}

export async function create(body, user) {
  const montant = Number(body.montant || 0);
  const requireSignature = montant > 50;
  if (requireSignature && !body.signature_svg) {
    throw new Error('Signature tactile requise pour montant > 50 DT');
  }
  const { rows } = await pool.query(
    `INSERT INTO depenses_courantes_espece
       (id_caisse, date_depense, categorie, libelle, montant, beneficiaire,
        signature_svg, cree_par, comptabilisee, notes)
     VALUES ($1, COALESCE($2, CURRENT_DATE), $3, $4, $5, $6, $7, $8, FALSE, $9)
     RETURNING *`,
    [body.id_caisse || null, body.date_depense || null,
     body.categorie, body.libelle || null, montant,
     body.beneficiaire || null, body.signature_svg || null,
     user?.id_user || null, body.notes || null],
  );
  return rows[0];
}

export async function update(id, body) {
  const allowed = ['date_depense','categorie','libelle','montant','beneficiaire','signature_svg','notes'];
  const sets = []; const vals = []; let i = 1;
  for (const k of allowed) if (k in body) { sets.push(`${k} = $${i++}`); vals.push(body[k]); }
  if (sets.length === 0) return findById(id);
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE depenses_courantes_espece SET ${sets.join(', ')} WHERE id_depense = $${i} AND NOT comptabilisee RETURNING *`,
    vals,
  );
  return rows[0] || null;
}

export async function remove(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM depenses_courantes_espece WHERE id_depense = $1 AND NOT comptabilisee',
    [id],
  );
  return { deleted: rowCount };
}

/** Clôture mensuelle : agrège les dépenses non comptabilisées en un bloc OD. */
export async function cloturerMois(periode, user) {
  return withTransaction(async (client) => {
    const { rows: exists } = await client.query(
      'SELECT * FROM depenses_bloc_comptabilise WHERE periode_mois = $1',
      [periode],
    );
    if (exists[0]) throw new Error(`Période ${periode} déjà clôturée (bloc #${exists[0].id_bloc})`);

    const { rows: dep } = await client.query(
      `SELECT id_depense, montant
         FROM depenses_courantes_espece
        WHERE to_char(date_depense,'YYYY-MM') = $1 AND NOT comptabilisee
        FOR UPDATE`,
      [periode],
    );
    if (dep.length === 0) throw new Error(`Aucune dépense non comptabilisée pour ${periode}`);

    const total = dep.reduce((s, r) => s + Number(r.montant), 0);
    const { rows: blocRows } = await client.query(
      `INSERT INTO depenses_bloc_comptabilise
         (periode_mois, montant_total, nb_depenses, date_cloture, cree_par)
       VALUES ($1, $2, $3, NOW(), $4) RETURNING *`,
      [periode, total, dep.length, user?.id_user || null],
    );
    const bloc = blocRows[0];
    await client.query(
      `UPDATE depenses_courantes_espece
          SET comptabilisee = TRUE, id_ecriture_bloc = $1
        WHERE id_depense = ANY($2::BIGINT[])`,
      [bloc.id_bloc, dep.map((d) => d.id_depense)],
    );
    return { bloc, nb_depenses: dep.length, montant_total: total };
  });
}
