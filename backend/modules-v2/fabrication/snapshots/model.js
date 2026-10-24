import { getPool } from '../../../src/config/database.js';

/**
 * Régénère les snapshots temps réel pour les OF en tissage.
 * Requête dénormalisée sur ordres_fabrication × metiers × commandes × comptes × articles.
 */
export async function rafraichirSnapshotOFsTissage() {
  const pool = getPool();
  const { rowCount } = await pool.query(`
    INSERT INTO snapshots_ofs_tissage (
      id_of, numero_of, id_machine, code_machine, ordre_planif_machine,
      id_article, code_article, libelle_article, dimensions,
      id_client, nom_client,
      qte_a_fabriquer, qte_fabriquee, qte_restante,
      unite_compteur, longueur_cible_m, compteur_actuel, metres_restants,
      etat_prep_mp, etat_tissage, etat_coupe, coupe_confirme,
      vitesse_duite_min, duites_par_cm, duites_restantes, temps_restant_min,
      laize_cm, notes_speciales, alerte_500m
    )
    SELECT
      of_.id_of, of_.numero_of, of_.id_machine_prevue, m.code_machine, of_.ordre_planif_machine,
      of_.id_article, a.code_article, a.libelle, a.dimensions,
      cmd.id_client, cli.raison_sociale,
      of_.quantite_prevue, of_.quantite_produite,
      GREATEST(of_.quantite_prevue - of_.quantite_produite, 0),
      m.unite_compteur, of_.longueur_tissu_m, of_.compteur_machine_affichage,
      GREATEST(of_.longueur_tissu_m - COALESCE(of_.compteur_machine_affichage, 0), 0),
      of_.etat_preparation_mp, of_.etat_tissage, of_.etat_coupe,
      (of_.etat_coupe = 'termine'),
      m.vitesse_max_duite_min, of_.duite_par_cm,
      -- duites_restantes ≈ nb_duites × (qte_restante / qte_prevue)
      CASE WHEN of_.quantite_prevue > 0
           THEN (of_.nb_duites_total_production * ((of_.quantite_prevue - of_.quantite_produite) / of_.quantite_prevue))::int
           ELSE NULL END,
      -- temps_restant_min = duites_restantes / vitesse
      CASE WHEN m.vitesse_max_duite_min > 0 AND of_.nb_duites_total_production > 0
           THEN ROUND((of_.nb_duites_total_production * ((of_.quantite_prevue - of_.quantite_produite) / NULLIF(of_.quantite_prevue, 0))) / m.vitesse_max_duite_min)::int
           ELSE NULL END,
      of_.largeur_tissu_cm, of_.notes_speciales,
      (GREATEST(of_.longueur_tissu_m - COALESCE(of_.compteur_machine_affichage, 0), 0) < 500)
    FROM ordres_fabrication of_
    LEFT JOIN metiers m ON m.id_machine = of_.id_machine_prevue
    LEFT JOIN articles a ON a.id_article = of_.id_article
    LEFT JOIN commandes cmd ON cmd.id_commande = of_.id_commande
    LEFT JOIN comptes cli ON cli.id_compte = cmd.id_client
    WHERE of_.statut IN ('planifie','prep_mp','ourdissage','tissage','coupe','finition','controle')
       AND of_.etat_tissage IN ('planifier','machine_alimentee','depart','en_cours','pause','termine_qte_manquante')
  `);
  return rowCount;
}

/** Purge : garde 24 h de snapshots (12 par heure × 24 = 288 / OF max). */
export async function purger(anciennete_h = 24) {
  const { rowCount } = await getPool().query(
    `DELETE FROM snapshots_ofs_tissage WHERE date_snapshot < NOW() - ($1 || ' hours')::interval`,
    [String(anciennete_h)]
  );
  return rowCount;
}

export async function dernierSnapshotParMachine(id_machine) {
  const { rows } = await getPool().query(
    `SELECT DISTINCT ON (id_of) *
       FROM snapshots_ofs_tissage
      WHERE id_machine = $1
      ORDER BY id_of, date_snapshot DESC`, [id_machine]);
  return rows;
}
