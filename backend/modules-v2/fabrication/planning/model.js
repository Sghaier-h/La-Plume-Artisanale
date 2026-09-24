import { getPool } from '../../../src/config/database.js';

// Vue Gantt : OF planifiés par machine, avec créneaux
export async function ganttEntre(dateDebut, dateFin, id_machine = null) {
  const pool = getPool();
  const params = [dateDebut, dateFin];
  let where = `WHERE of_.date_planification BETWEEN $1 AND $2`;
  if (id_machine) { params.push(id_machine); where += ` AND of_.id_machine_prevue = $${params.length}`; }
  const { rows } = await pool.query(`
    SELECT of_.id_of, of_.numero_of, of_.id_article, of_.id_machine_prevue,
           m.code_machine, of_.date_planification, of_.date_fin_prevue,
           of_.statut, of_.priorite, of_.ordre_planif_machine,
           of_.quantite_prevue, of_.quantite_produite
    FROM ordres_fabrication of_
    LEFT JOIN metiers m ON m.id_machine = of_.id_machine_prevue
    ${where}
    ORDER BY of_.id_machine_prevue, of_.ordre_planif_machine NULLS LAST, of_.date_planification
  `, params);
  return rows;
}

export async function replanifier(id_of, { id_machine_prevue, date_planification, date_fin_prevue, ordre_planif_machine }) {
  const { rows } = await getPool().query(`
    UPDATE ordres_fabrication SET
      id_machine_prevue    = COALESCE($1, id_machine_prevue),
      date_planification   = COALESCE($2, date_planification),
      date_fin_prevue      = COALESCE($3, date_fin_prevue),
      ordre_planif_machine = COALESCE($4, ordre_planif_machine),
      updated_at = NOW()
    WHERE id_of = $5 RETURNING *`,
    [id_machine_prevue, date_planification, date_fin_prevue, ordre_planif_machine, id_of]);
  return rows[0] ?? null;
}
