// service.js — comptabilite/rapprochement
import * as model from './model.js';
export const listImports  = ()         => model.listImports();
export const listLignes   = (q)        => model.listLignes(q);
export const createImport = (b, u)     => model.createImport(b, u);
export const matchingAuto = (id)       => model.matchingAuto(id);
export const rapprocher   = (id, b, u) => model.rapprocher(id, b, u);
export const ignorer      = (id)       => model.ignorer(id);
