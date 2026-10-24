// service.js — documents/archive
import * as model from './model.js';
export const search     = (q)         => model.search(q);
export const getOne     = (id)        => model.findById(id);
export const create     = (b, u)      => model.create(b, u);
export const attach     = (b, u)      => model.attachTo(b, u);
export const detach     = (b)         => model.detach(b);
export const forEntity  = (q)         => model.listForEntity(q);
export const remove     = (id, u)     => model.softDelete(id, u);
