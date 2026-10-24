// service.js — comptabilite/cessions
import * as model from './model.js';
export const list     = (q)       => model.list(q);
export const getOne   = (id)      => model.findById(id);
export const annuler  = (id,b,u)  => model.annuler(id, b?.motif, u);
