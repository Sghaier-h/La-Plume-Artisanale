// service.js — rh/primes-cagnottes
import * as model from './model.js';

const ATELIERS_VALIDES = new Set([
  'tissage','ourdissage','coupe','finition','preparation','emballage','toutes',
]);

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) {
  return model.findById(id);
}

export async function create(payload, user) {
  if (!payload?.annee || !payload?.numero_semaine || !payload?.atelier || payload.montant_dt == null) {
    throw Object.assign(new Error('annee, numero_semaine, atelier, montant_dt requis'), { code: 'VALIDATION' });
  }
  if (!ATELIERS_VALIDES.has(payload.atelier)) {
    throw Object.assign(new Error(`atelier invalide (${payload.atelier})`), { code: 'VALIDATION' });
  }
  if (Number(payload.montant_dt) <= 0) {
    throw Object.assign(new Error('montant_dt doit être > 0'), { code: 'VALIDATION' });
  }
  return model.insert({ ...payload, cree_par: user?.id_user });
}

export async function update(id, payload) {
  const existing = await model.findById(id);
  if (!existing) throw Object.assign(new Error('Cagnotte introuvable'), { code: 'NOT_FOUND' });
  if (existing.statut === 'payee') {
    throw Object.assign(new Error('Cagnotte déjà payée, non modifiable'), { code: 'CONFLICT' });
  }
  return model.updateById(id, payload);
}

export async function remove(id) {
  const existing = await model.findById(id);
  if (!existing) return { deleted: 0 };
  if (existing.statut !== 'ouverte' && existing.statut !== 'annulee') {
    throw Object.assign(new Error('Suppression interdite (statut != ouverte)'), { code: 'CONFLICT' });
  }
  return model.deleteById(id);
}

export async function calculer(id) {
  return model.calculerCagnotte(id);
}

export async function valider(id, user) {
  return model.validerCagnotte(id, user);
}

export async function marquerPayee(id, user) {
  return model.marquerPayee(id, user);
}
