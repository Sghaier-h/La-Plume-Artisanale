// service.js — palettes
// Format numéro : PAL{YY}-{seq:6} — ex: PAL26-000123
import * as model from './model.js';

let NumeroSequenceService;
try {
  ({ NumeroSequenceService } = await import('../../../src/services/numero-sequence.service.js'));
} catch { /* fallback */ }

async function nextSeq() {
  if (NumeroSequenceService?.next) return NumeroSequenceService.next('PALETTE');
  return model.nextSeq();
}

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) { return model.findById(id); }

export async function create(payload, user) {
  const yy = String(new Date().getFullYear()).slice(-2);
  const seq = String(await nextSeq()).padStart(6, '0');
  const numero = `PAL${yy}-${seq}`;
  return model.insert({ ...payload, numero });
}

export async function update(id, payload, user) { return model.updateById(id, payload, user); }
export async function remove(id, user)          { return model.deleteById(id, user); }

export async function fermer(id, user) {
  return model.updateById(id, { statut: 'fermee', date_fermeture: new Date() });
}
