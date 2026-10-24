import { baseService } from './model.js';

/**
 * Poids ourdissage (§7.17 domain.md) :
 *   poids_kg = (nb_fils_chaine × metres × 2) / (NM × 1000)
 * NM = dernier entier extrait de code_nm ; défaut 50.
 */
export function calcPoidsOurdissageKg({ nb_fils_chaine, metres_chaine, numero_metrique_valeur }) {
  const nbFils = Number(nb_fils_chaine || 0);
  const metres = Number(metres_chaine || 0);
  const nm = Number(numero_metrique_valeur || 0) || 50;
  if (!nbFils || !metres || !nm) return null;
  const poids = (nbFils * metres * 2) / (nm * 1000);
  return Number(poids.toFixed(4));
}

/**
 * Applique le calcul auto poids ourdissage sur un payload
 * si les 3 champs sont fournis.
 */
function enrichirPayload(payload) {
  if (
    payload.nb_fils_chaine !== undefined &&
    payload.metres_chaine !== undefined &&
    (payload.poids_ourdissage_kg === undefined || payload.poids_ourdissage_kg === null)
  ) {
    const calc = calcPoidsOurdissageKg(payload);
    if (calc !== null) payload.poids_ourdissage_kg = calc;
  }
  // Coût ligne = quantité × prix unitaire
  if (
    payload.quantite !== undefined && payload.prix_unitaire !== undefined &&
    (payload.cout_ligne === undefined || payload.cout_ligne === null)
  ) {
    payload.cout_ligne = Number(
      (Number(payload.quantite) * Number(payload.prix_unitaire)).toFixed(4),
    );
  }
  return payload;
}

export const service = {
  ...baseService,
  create: (payload, userId) => baseService.create(enrichirPayload({ ...payload }), userId),
  update: (id, payload, userId) => baseService.update(id, enrichirPayload({ ...payload }), userId),
};

export default service;
