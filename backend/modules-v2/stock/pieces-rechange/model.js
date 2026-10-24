import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'pieces_rechange',
  pk: 'id_piece',
  columns: [
    'id_article','code_piece','libelle','id_famille_piece',
    'reference_fabricant','fabricant','machine_compatible',
    'stock_minimum','prix_unitaire','id_fournisseur_defaut','actif',
  ],
  searchColumns: ['code_piece','libelle','reference_fabricant','fabricant'],
  orderBy: 'code_piece ASC',
});
export const { model, routes, service, controller } = crud;
