// service.js — comptabilite/dossiers-import
import * as model from './model.js';

export const list      = (q) => model.list(q);
export const kpi       = ()  => model.kpi();
export const getOne    = (id)=> model.findById(id);
export const create    = (b,u)=> model.create(b, u);
export const update    = (id,b)=> model.update(id, b);
export const addLigne  = (id,b)=> model.addLigne(id, b);
export const addFrais  = (id,b)=> model.addFrais(id, b);
export const recalculerCessions = (id, b, u) => model.recalculerCessions(id, b, u);
