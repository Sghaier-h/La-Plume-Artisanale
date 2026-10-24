// service.js — rh/ajustements
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}
export async function getOne(id)         { return model.findById(id); }
export async function create(p, u)       { return model.insert(p, u); }
export async function remove(id)         { return model.deleteById(id); }

export async function valider(id, u)                 { return model.valider(id, u); }
export async function rejeter(id, body, u)           { return model.rejeter(id, body?.motif_rejet, u); }
