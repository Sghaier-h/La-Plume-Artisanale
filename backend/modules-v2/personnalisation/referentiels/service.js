// service.js — personnalisation/referentiels
// Wrappers business, permet d'ajouter plus tard cache/tri/enrichissement.
import { model } from './model.js';

export const service = {
  listZones:         (opts) => model.listZones(opts),
  listPolices:       (opts) => model.listPolices(opts),
  listFilsCouleurs:  (opts) => model.listFilsCouleurs(opts),
};

export default service;
