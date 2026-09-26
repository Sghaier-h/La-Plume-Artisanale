// service.js — rh/primes-bordereaux
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

export async function verser(id, user) {
  return model.verser(id, user);
}

export async function genererEcriture(id) {
  return model.genererEcritureComptable(id);
}

export async function enregistrerRecu(id, payload, user) {
  return model.enregistrerRecuSigne(id, payload, user);
}

/**
 * Stub PDF : renvoie un JSON représentant le bordereau + reçu.
 * TODO câbler pdfkit / puppeteer pour un vrai PDF (§16bis).
 */
export async function pdfPayload(id) {
  const bordereau = await model.findById(id);
  if (!bordereau) throw Object.assign(new Error('Bordereau introuvable'), { code: 'NOT_FOUND' });
  const recu = await model.findRecuByBordereau(id);
  return {
    type: 'application/vnd.laplume.bordereau-prime.stub+json',
    version: '1.0.0',
    todo: 'Générateur PDF réel à câbler (pdfkit) — payload JSON pour aperçu.',
    bordereau,
    recu,
  };
}
