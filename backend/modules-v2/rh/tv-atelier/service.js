// service.js — rh/tv-atelier
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) {
  return model.findById(id);
}

export async function create(payload) {
  return model.insert(payload);
}

export async function update(id, payload) {
  return model.updateById(id, payload);
}

export async function remove(id) {
  return model.deleteById(id);
}

export async function publicByToken(token, remoteIp) {
  const config = await model.findByToken(token);
  if (!config) return null;
  await model.derniereConnexion(config.id_ecran, remoteIp);
  const snapshot = await model.dernierSnapshot(config.id_ecran);
  return { config, snapshot };
}

export async function snapshot(id) {
  return model.genererSnapshot(id);
}
