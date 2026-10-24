// service.js — rh/demandes-rh
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}
export async function getOne(id)         { return model.findById(id); }
export async function create(payload)    { return model.insert(payload); }
export async function traiter(id, b, u)  { return model.traiter(id, b, u); }
export async function remove(id)         { return model.deleteById(id); }
