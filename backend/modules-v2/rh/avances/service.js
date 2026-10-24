// service.js — rh/avances
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}
export async function getOne(id)        { return model.findById(id); }
export async function create(p, u)      { return model.insert(p, u); }
export async function update(id, p)     { return model.updateById(id, p); }
export async function remove(id)        { return model.deleteById(id); }

export async function approuver(id, u)              { return model.approuver(id, u); }
export async function refuser(id, body, u)          { return model.refuser(id, body?.motif_refus, u); }
export async function payer(id, body, u)            { return model.payer(id, body || {}, u); }
export async function rembourser(id, body, u)       { return model.rembourser(id, body || {}, u); }
