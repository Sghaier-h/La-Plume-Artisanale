import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'bom_master',
  pk: 'id_bom',
  columns: [
    'id_article','code_bom_master','version','est_active','type_fabrication',
    'largeur_cm','longueur_cm','laize_cm','poids_theorique_g','grammage_g_m2',
    'duites_par_cm','nb_duites_total','nb_fils_chaine',
    'numero_metrique_chaine','numero_metrique_trame',
    'perte_theorique_pct','perte_reelle_pct',
    'id_selecteur_s01','id_selecteur_s02','id_selecteur_s03','id_selecteur_s04',
    'id_selecteur_s05','id_selecteur_s06','id_selecteur_s07','id_selecteur_s08',
    'notes',
  ],
  searchColumns: ['code_bom_master','notes'],
  orderBy: 'id_bom DESC',
});
export const { model, routes, service, controller } = crud;
