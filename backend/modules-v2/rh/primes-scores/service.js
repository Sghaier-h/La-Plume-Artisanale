// service.js — rh/primes-scores
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

export async function cumulSemaine(idEmploye, annee, numeroSemaine) {
  return model.cumulSemaineEmploye(idEmploye, annee, numeroSemaine);
}

export async function bulkCalcul({ date_journee, atelier, id_employes }) {
  return model.bulkCalculJournalier({ date_journee, atelier, id_employes });
}
