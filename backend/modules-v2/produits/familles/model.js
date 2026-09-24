import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'familles_articles',
  pk: 'id_famille',
  columns: [
    'code','libelle','description','id_famille_parent',
    'ordre_affichage','actif',
  ],
  searchColumns: ['code','libelle'],
  orderBy: 'ordre_affichage ASC, libelle ASC',
});

export const model = crud.model;
export const routes = crud.routes;
export const service = crud.service;
export const controller = crud.controller;
