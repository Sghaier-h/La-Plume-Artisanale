// service.js — comptabilite/depenses-especes
import * as model from './model.js';
export const list       = (q)      => model.list(q);
export const totaux     = (p)      => model.totaux(p);
export const getOne     = (id)     => model.findById(id);
export const create     = (b, u)   => model.create(b, u);
export const update     = (id, b)  => model.update(id, b);
export const remove     = (id)     => model.remove(id);
export const cloturer   = (p, u)   => model.cloturerMois(p, u);
