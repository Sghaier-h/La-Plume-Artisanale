// service.js — rh/comptes-employes
import * as model from './model.js';

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.listComptes({ limit: +limit, offset: +offset, filters });
}

export async function getSolde(id) {
  return model.findSoldeById(id);
}

export async function getMouvements(id, query = {}) {
  const { limit = 100, offset = 0 } = query;
  return model.listMouvements(id, { limit: +limit, offset: +offset });
}

export async function updateCompte(id, payload) {
  return model.updateCompte(id, payload);
}

export async function creerMouvement(payload, user) {
  // utilitaire interne pour les autres modules (bulletins, paie...)
  return model.appliquerMouvement({ ...payload, creePar: user?.id });
}

export async function kpi() {
  return model.kpiSoldes();
}
