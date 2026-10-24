// service.js — comptabilite/compensations
import * as model from './model.js';
export const list     = (q)    => model.list(q);
export const getOne   = (id)   => model.findById(id);
export const create   = (b, u) => model.create(b, u);
export const valider  = (id, u)=> model.valider(id, u);
export const annuler  = (id, b)=> model.annuler(id, b?.motif);
