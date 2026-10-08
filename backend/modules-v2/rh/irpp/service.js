// service.js — irpp
// Business logic layer. Delegates to model.js; add invariants, calculs & side-effects here.
import * as model from './model.js';

export async function list(query = {}){
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id){
  return model.findById(id);
}

export async function create(payload, user){
  // TODO: validation métier spécifique au module
  return model.insert(payload, user);
}

export async function update(id, payload, user){
  return model.updateById(id, payload, user);
}

export async function remove(id, user){
  return model.deleteById(id, user);
}
