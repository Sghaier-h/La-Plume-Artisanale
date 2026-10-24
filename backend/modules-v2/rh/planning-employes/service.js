// service.js — rh/planning-employes
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 500, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}
export async function getOne(id)     { return model.findById(id); }
export async function create(p, u)   { return model.insert(p, u); }
export async function update(id, p)  { return model.updateById(id, p); }
export async function remove(id)     { return model.deleteById(id); }

export async function monPlanning(idEmploye, q) {
  return model.monPlanning(idEmploye, { jours: +(q?.jours || 7) });
}
