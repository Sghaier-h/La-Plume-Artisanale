// service.js — rh/avertissements
import * as model from './model.js';
import { verifyToken } from '../pin-tablette/service.js';

export async function list(query = {}) {
  const { limit = 200, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}
export async function getOne(id) { return model.findById(id); }
export async function kpi(query) { return model.kpi(query || {}); }

/** Self-service tablette : requiert un token tablette signé (header x-tablette-token). */
export async function listMes(req) {
  const token = req.headers['x-tablette-token'] || req.query.token;
  const payload = verifyToken(token);
  if (!payload?.id_employe) {
    const err = new Error('Token tablette invalide ou expiré');
    err.code = 'TABLETTE_TOKEN';
    throw err;
  }
  return model.findForEmploye(payload.id_employe, { limit: 100 });
}

export async function accuserReception(id, body, req) {
  // Marque la lecture en passant par le même chemin ; si token tablette, on
  // force l'ownership (self-service strict).
  const token = req.headers['x-tablette-token'] || req.query?.token;
  if (token) {
    const payload = verifyToken(token);
    if (!payload?.id_employe) {
      const err = new Error('Token tablette invalide');
      err.code = 'TABLETTE_TOKEN';
      throw err;
    }
    const avert = await model.findById(id);
    if (!avert || avert.id_employe !== payload.id_employe) {
      const err = new Error('Avertissement inaccessible');
      err.code = 'FORBIDDEN';
      throw err;
    }
  }
  return model.accuserReception(id, body || {});
}

export async function contester(id, body, req) {
  const token = req.headers['x-tablette-token'] || req.query?.token;
  if (token) {
    const payload = verifyToken(token);
    if (!payload?.id_employe) {
      const err = new Error('Token tablette invalide');
      err.code = 'TABLETTE_TOKEN';
      throw err;
    }
    const avert = await model.findById(id);
    if (!avert || avert.id_employe !== payload.id_employe) {
      const err = new Error('Avertissement inaccessible');
      err.code = 'FORBIDDEN';
      throw err;
    }
  }
  return model.contester(id, body || {});
}

export async function create(payload, user) {
  return model.insert({
    ...payload,
    auto_genere: false,
    genere_par: user?.email || user?.username || 'rh',
    statut: payload.statut || 'nouveau',
  });
}

export async function scan() {
  return model.runScan({ now: new Date() });
}
