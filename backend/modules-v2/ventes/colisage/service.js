// service.js — colisage
// Format numéro : C{XXX}-{YYY}-{NNN}
//   XXX = séquence colis (3 digits)
//   YYY = référence BL (ex: BL0005)
//   NNN = ordre dans le BL (3 digits)
// Utilise NumeroSequenceService fourni par l'Agent A (§16bis)
import * as model from './model.js';

let NumeroSequenceService;
try {
  // Import optionnel — le service partagé peut être présent ou non selon l'état du repo
  ({ NumeroSequenceService } = await import('../../../src/services/numero-sequence.service.js'));
} catch { /* fallback interne */ }

async function nextSeqColis(idBl) {
  if (NumeroSequenceService?.next) {
    return NumeroSequenceService.next('COLIS');
  }
  return model.nextSeqColis();
}

async function nextOrdreDansBl(idBl) {
  return model.nextOrdreDansBl(idBl);
}

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) { return model.findById(id); }

export async function create(payload, user) {
  const seqColis = String(await nextSeqColis(payload.id_bl)).padStart(3, '0');
  const refBl = payload.ref_bl || (payload.id_bl ? `BL${String(payload.id_bl).padStart(4, '0')}` : 'BL0000');
  const ordre = String(await nextOrdreDansBl(payload.id_bl)).padStart(3, '0');
  const numero = `C${seqColis}-${refBl}-${ordre}`;
  return model.insert({ ...payload, numero, id_utilisateur_scan: user?.id });
}

export async function update(id, payload, user) { return model.updateById(id, payload, user); }
export async function remove(id, user)          { return model.deleteById(id, user); }

export async function fermer(id, user) {
  return model.updateById(id, { statut: 'ferme', date_fermeture: new Date() });
}

export async function scanArticle(idColis, payload, user) {
  // Ajoute une ligne au colis (crée mouvement_stock côté service stock — à intégrer)
  return model.ajouterLigne(idColis, { ...payload, id_utilisateur_scan: user?.id });
}
