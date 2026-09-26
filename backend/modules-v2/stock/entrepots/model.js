import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'entrepots',
  pk: 'id_entrepot',
  columns: [
    'code','libelle','type','id_societe_adresse',
    'responsable_id_utilisateur','capacite_m3','permet_vente','actif',
  ],
  searchColumns: ['code','libelle'],
  orderBy: 'code ASC',
});
export const { model, routes, service, controller } = crud;
