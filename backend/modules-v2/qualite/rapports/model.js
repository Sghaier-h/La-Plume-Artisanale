import { getPool } from '../../../src/config/database.js';

/**
 * Taux 2e choix par machine sur les 7 derniers jours.
 * taux_2e_choix = Σ qte_2e_choix / Σ qte_1er_choix (basé sur journal_pieces).
 */
export async function taux2eChoixParMachine7j() {
  const { rows } = await getPool().query(`
    WITH agg AS (
      SELECT of_.id_machine_prevue AS id_machine,
             SUM(CASE WHEN jp.categorie = '1er_choix' THEN jp.quantite ELSE 0 END) AS qte_1er,
             SUM(CASE WHEN jp.categorie = '2e_choix'  THEN jp.quantite ELSE 0 END) AS qte_2e,
             SUM(CASE WHEN jp.categorie = 'dechet'    THEN jp.quantite ELSE 0 END) AS qte_dechet,
             SUM(CASE WHEN jp.categorie = 'ourlet_retouche' THEN jp.quantite ELSE 0 END) AS qte_ourlet
      FROM journal_pieces jp
      JOIN ordres_fabrication of_ ON of_.id_of = jp.id_of
      WHERE jp.date_saisie >= NOW() - INTERVAL '7 days'
        AND of_.id_machine_prevue IS NOT NULL
      GROUP BY of_.id_machine_prevue
    )
    SELECT a.id_machine, m.code_machine, m.libelle,
           a.qte_1er, a.qte_2e, a.qte_dechet, a.qte_ourlet,
           CASE WHEN a.qte_1er > 0 THEN ROUND(a.qte_2e / a.qte_1er, 4) ELSE NULL END AS taux_2e_choix,
           CASE WHEN a.qte_1er > 0 THEN ROUND(a.qte_dechet / a.qte_1er, 4) ELSE NULL END AS taux_dechet
    FROM agg a
    LEFT JOIN metiers m ON m.id_machine = a.id_machine
    ORDER BY taux_2e_choix DESC NULLS LAST
  `);
  return rows;
}

export async function defautsParTypeDerniersJours(jours = 7) {
  const { rows } = await getPool().query(`
    SELECT dt.code, dt.libelle, dt.categorie, dt.severite_defaut,
           COUNT(ds.id_defaut_signale) AS nb_signalements,
           SUM(COALESCE(ds.quantite_impactee, 0)) AS qte_impactee
    FROM defauts_signales ds
    JOIN defauts_types dt ON dt.id_defaut_type = ds.id_defaut_type
    WHERE ds.date_signalement >= NOW() - ($1 || ' days')::interval
    GROUP BY dt.code, dt.libelle, dt.categorie, dt.severite_defaut
    ORDER BY nb_signalements DESC
  `, [String(jours)]);
  return rows;
}
