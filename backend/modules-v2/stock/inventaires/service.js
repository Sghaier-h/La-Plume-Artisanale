import { baseService, model } from './model.js';

/** Numéro auto `INV-YYYYMMDD-NN` (compteur non fourni ici → timestamp fallback). */
function genererNumeroInventaire() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()).padStart(5, '0');
  return `INV-${ymd}-${seq}`;
}

export const service = {
  ...baseService,
  create(payload, userId) {
    if (!payload.numero_inventaire) payload.numero_inventaire = genererNumeroInventaire();
    return baseService.create(payload, userId);
  },
  listLignes: (id) => model.listLignes(id),
  addLigne: (id, ligne, userId) => model.addLigne(id, ligne, userId),
};
export default service;
