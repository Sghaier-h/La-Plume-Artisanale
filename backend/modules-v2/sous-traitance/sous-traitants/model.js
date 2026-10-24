// Phase B §14quater.3 — Model sous-traitants étendus
import { getPool } from '../../../src/config/database.js';

export async function list({ type_activite, actif, q, limit = 100, offset = 0 } = {}) {
  const params = [];
  const conds = [];
  if (type_activite) { params.push(type_activite); conds.push(`st.type_activite = $${params.length}`); }
  if (actif !== undefined) { params.push(actif); conds.push(`st.actif = $${params.length}`); }
  if (q) {
    params.push(`%${q}%`);
    conds.push(`(st.raison_sociale ILIKE $${params.length} OR st.code ILIKE $${params.length} OR st.identification ILIKE $${params.length})`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT st.*,
            cst.solde_courant, cst.solde_initial, cst.date_dernier_mouvement, cst.inactif AS compte_inactif,
            (SELECT COUNT(*) FROM travaux_sous_traitants t WHERE t.id_soustraitant = st.id_soustraitant AND t.statut = 'en_cours') AS travaux_en_cours,
            (SELECT COUNT(*) FROM anomalies_sous_traitant a WHERE a.id_soustraitant = st.id_soustraitant AND a.resolu = FALSE) AS anomalies_ouvertes
       FROM sous_traitants st
       LEFT JOIN comptes_sous_traitants cst ON cst.id_soustraitant = st.id_soustraitant
       ${where}
       ORDER BY st.raison_sociale ASC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT st.*,
            cst.id_compte_st, cst.solde_courant, cst.solde_initial,
            cst.date_dernier_mouvement, cst.date_reset_solde, cst.inactif AS compte_inactif
       FROM sous_traitants st
       LEFT JOIN comptes_sous_traitants cst ON cst.id_soustraitant = st.id_soustraitant
      WHERE st.id_soustraitant = $1`, [id]);
  return rows[0] ?? null;
}

export async function insert(payload) {
  const cols = Object.keys(payload);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO sous_traitants (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => payload[c]));
  return rows[0];
}

export async function update(id, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return findById(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE sous_traitants SET ${sets}, updated_at = NOW()
      WHERE id_soustraitant = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}

export async function remove(id) {
  const { rowCount } = await getPool().query(
    `UPDATE sous_traitants SET actif = FALSE, date_fin_relation = NOW(), updated_at = NOW()
      WHERE id_soustraitant = $1`, [id]);
  return rowCount > 0;
}

export async function listTravaux(id) {
  const { rows } = await getPool().query(
    `SELECT t.*
       FROM travaux_sous_traitants t
      WHERE t.id_soustraitant = $1
      ORDER BY t.date_debut DESC NULLS LAST, t.created_at DESC
      LIMIT 500`, [id]);
  return rows;
}

export async function listBons(id) {
  const { rows } = await getPool().query(
    `SELECT ost.*
       FROM of_sous_traitance ost
      WHERE ost.id_soustraitant = $1
      ORDER BY ost.created_at DESC
      LIMIT 500`, [id]);
  return rows;
}

export async function getCompte(id) {
  const { rows } = await getPool().query(
    `SELECT cst.*
       FROM comptes_sous_traitants cst
      WHERE cst.id_soustraitant = $1`, [id]);
  return rows[0] ?? null;
}

export async function ensureCompte(id_soustraitant, solde_initial = 0) {
  const { rows } = await getPool().query(
    `INSERT INTO comptes_sous_traitants (id_soustraitant, solde_initial, solde_courant)
     VALUES ($1, $2, $2)
     ON CONFLICT (id_soustraitant) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [id_soustraitant, solde_initial]);
  return rows[0];
}

export async function statsParType() {
  const { rows } = await getPool().query(`SELECT * FROM v_sous_traitants_par_type`);
  return rows;
}

export async function statsGlobal() {
  const { rows } = await getPool().query(
    `SELECT
       (SELECT COUNT(*) FROM sous_traitants WHERE actif) AS nb_actifs,
       (SELECT COUNT(*) FROM sous_traitants WHERE NOT actif) AS nb_inactifs,
       (SELECT COALESCE(SUM(solde_courant), 0) FROM comptes_sous_traitants) AS creances_total,
       (SELECT COUNT(*) FROM travaux_sous_traitants WHERE statut = 'en_cours') AS travaux_en_cours,
       (SELECT COUNT(*) FROM anomalies_sous_traitant WHERE resolu = FALSE) AS anomalies_ouvertes,
       (SELECT COUNT(*) FROM of_sous_traitance WHERE statut IN ('expedie','chez_st','en_retour_partiel')) AS bons_ouverts`);
  return rows[0] ?? {};
}

export async function anomaliesList({ id_soustraitant, resolu, gravite, limit = 200, offset = 0 } = {}) {
  const params = []; const conds = [];
  if (id_soustraitant) { params.push(id_soustraitant); conds.push(`id_soustraitant = $${params.length}`); }
  if (resolu !== undefined) { params.push(resolu); conds.push(`resolu = $${params.length}`); }
  if (gravite) { params.push(gravite); conds.push(`gravite = $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT * FROM anomalies_sous_traitant ${where}
      ORDER BY date_anomalie DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
}

export async function anomalieInsert(payload) {
  const cols = Object.keys(payload);
  const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `INSERT INTO anomalies_sous_traitant (${cols.join(', ')}) VALUES (${vals}) RETURNING *`,
    cols.map(c => payload[c]));
  return rows[0];
}

export async function anomalieResolve(id, { resolu_par, commentaire_resolution }) {
  const { rows } = await getPool().query(
    `UPDATE anomalies_sous_traitant
        SET resolu = TRUE, resolu_par = $1, date_resolution = NOW(),
            commentaire_resolution = $2, updated_at = NOW()
      WHERE id_anomalie = $3 RETURNING *`,
    [resolu_par ?? null, commentaire_resolution ?? null, id]);
  return rows[0] ?? null;
}
