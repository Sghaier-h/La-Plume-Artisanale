// model.js — personnalisation/config
// Data-access layer sur `personnalisations_config` (§5.8.2 domain.md).
import { buildCrud } from '../../_shared/crudFactory.js';

const crud = buildCrud({
  table: 'personnalisations_config',
  pk: 'id_config',
  columns: [
    'id_article',
    'id_modele',
    'types_autorises',
    'moq_par_type_json',
    'zones_impression_json',
    'surfaces_max_cm2_json',
    'couleurs_disponibles_json',
    'polices_disponibles_json',
    'supplements_prix_json',
    'delai_supplementaire_jours',
    'prix_degressifs_json',
    'actif',
  ],
  orderBy: 'id_config DESC',
});

export const model = crud.model;
export const baseService = crud.service;
export const baseController = crud.controller;
export const baseRoutes = crud.routes;
