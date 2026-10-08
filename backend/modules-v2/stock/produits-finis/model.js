import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'produits_finis',
  pk: 'id_produit_fini',
  columns: [
    'id_article','qualite','id_catalogue_principal',
    'stock_minimum','stock_maximum','actif',
  ],
  searchColumns: [],
  orderBy: 'id_produit_fini DESC',
});
export const { model, routes, service, controller } = crud;
