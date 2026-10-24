// service.js — rh/formations
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) { return model.findById(id); }

export async function create(payload, user) { return model.insert(payload, user); }

export async function update(id, payload) { return model.updateById(id, payload); }

export async function remove(id) { return model.deleteById(id); }

// Participants
export const listParticipants   = (id) => model.listParticipants(id);
export const addParticipant     = (payload) => model.insertParticipant(payload);
export const removeParticipant  = (id) => model.removeParticipant(id);

// KPI / dashboard
export const kpi      = (opts) => model.kpi(opts);
export const parMois  = (opts) => model.parMois(opts);
export const upcoming = (opts) => model.upcoming(opts);
