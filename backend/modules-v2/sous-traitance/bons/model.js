import { getPool } from '../../../src/config/database.js';

export async function list({ id_soustraitant, statut, limit = 100, offset = 0 } = {}) {
  const params = []; const conds = [];
  if (id_soustraitant) { params.push(id_soustraitant); conds.push(`ost.id_soustraitant = $${params.length}`); }
  if (statut)          { params.push(statut);          conds.push(`ost.statut = $${params.length}`); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  params.push(limit, offset);
  const { rows } = await getPool().query(
    `SELECT ost.*, st.raison_sociale AS sous_traitant_nom, st.type_activite
       FROM of_sous_traitance ost
       JOIN sous_traitants st ON st.id_soustraitant = ost.id_soustraitant
       ${where}
       ORDER BY ost.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
}

export async function findById(id) {
  const { rows } = await getPool().query(
    `SELECT ost.*, st.raison_sociale AS sous_traitant_nom, st.type_activite
       FROM of_sous_traitance ost
       JOIN sous_traitants st ON st.id_soustraitant = ost.id_soustraitant
      WHERE ost.id_of_st = $1`, [id]);
  return rows[0] ?? null;
}

export async function updateSignature(id, patch) {
  const cols = Object.keys(patch);
  if (!cols.length) return findById(id);
  const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
  const { rows } = await getPool().query(
    `UPDATE of_sous_traitance SET ${sets}, updated_at = NOW()
      WHERE id_of_st = $${cols.length + 1} RETURNING *`,
    [...cols.map(c => patch[c]), id]);
  return rows[0] ?? null;
}

export async function enregistrerControle(id, {
  quantite_retournee, quantite_rejetee, motif_rejet, controle_qualite,
  signature_retour_svg, controle_par
}) {
  const { rows } = await getPool().query(
    `UPDATE of_sous_traitance
        SET quantite_retournee = COALESCE($1, quantite_retournee),
            quantite_rejetee   = COALESCE($2, quantite_rejetee),
            motif_rejet        = COALESCE($3, motif_rejet),
            controle_qualite   = COALESCE($4, controle_qualite),
            signature_retour_svg = COALESCE($5, signature_retour_svg),
            controle_par       = COALESCE($6, controle_par),
            date_controle      = NOW(),
            date_retour_reel   = COALESCE(date_retour_reel, NOW()),
            statut             = CASE
              WHEN (COALESCE($1, quantite_retournee) + COALESCE($2, quantite_rejetee)) >= quantite_envoyee THEN 'retour_complet'
              ELSE 'en_retour_partiel'
            END,
            updated_at = NOW()
      WHERE id_of_st = $7 RETURNING *`,
    [quantite_retournee, quantite_rejetee, motif_rejet, controle_qualite,
     signature_retour_svg, controle_par, id]);
  return rows[0] ?? null;
}

export async function stats() {
  const { rows } = await getPool().query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE statut = 'en_preparation')     AS en_preparation,
       COUNT(*) FILTER (WHERE statut = 'expedie')            AS expedies,
       COUNT(*) FILTER (WHERE statut = 'chez_st')            AS chez_st,
       COUNT(*) FILTER (WHERE statut = 'en_retour_partiel')  AS retours_partiels,
       COUNT(*) FILTER (WHERE statut = 'retour_complet')     AS retours_complets,
       COUNT(*) FILTER (WHERE statut = 'litige')             AS litiges,
       COUNT(*) FILTER (WHERE date_retour_prevue < NOW()::date
                              AND statut IN ('expedie','chez_st','en_retour_partiel')) AS retards
     FROM of_sous_traitance`);
  return rows[0] ?? {};
}
