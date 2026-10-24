// service.js — rh/entretiens
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) { return model.findById(id); }
export async function create(payload, user) { return model.insert(payload, user); }
export async function update(id, payload) { return model.updateById(id, payload); }
export async function remove(id) { return model.deleteById(id); }

// Dashboard
export const kpi      = ()     => model.kpi();
export const parMois  = (opts) => model.parMois(opts);
export const upcoming = (opts) => model.upcoming(opts);
export const enRetard = (opts) => model.enRetard(opts);
