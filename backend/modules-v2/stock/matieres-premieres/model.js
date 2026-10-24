import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'matieres_premieres',
  pk: 'id_matiere_premiere',
  columns: [
    'id_article','code_nm','numero_metrique_valeur','composition',
    'torsion','grammage_g_m2','couleur_hex','poids_bobine_moyen_kg',
    'id_fournisseur_defaut','stock_minimum_kg','actif',
  ],
  searchColumns: ['code_nm','composition'],
  orderBy: 'code_nm ASC',
});
export const { model, routes, service, controller } = crud;
