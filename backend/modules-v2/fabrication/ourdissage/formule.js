// Formule poids fil chaîne (§7.17 / §7.21)
//
//   poids_kg = (nb_fils × metres × 2) / (NM × 1000)
//
// - nb_fils : nombre de fils de chaîne
// - metres  : métrage cible ensouple (≤ 5000)
// - NM      : numéro métrique (grosseur). Extrait comme dernier entier du
//             code MP (ex "NM2/50" → 50). Défaut 50.
//
// Constantes officielles (§7.17)
export const OURD_SEUIL_ALERTE_M       = 500;
export const OURD_METRAGE_MAX_ENSOUPLE = 5000;
export const NM_DEFAUT                 = 50;

export function extraireNM(codeMP, defaut = NM_DEFAUT) {
  if (typeof codeMP !== 'string' || !codeMP) return defaut;
  const entiers = codeMP.match(/\d+/g);
  if (!entiers || entiers.length === 0) return defaut;
  const dernier = parseInt(entiers[entiers.length - 1], 10);
  return Number.isFinite(dernier) && dernier > 0 ? dernier : defaut;
}

/**
 * Calcule le poids théorique de fil chaîne pour une ensouple.
 * @param {{nbFils:number, metres:number, nm:number}} p
 * @returns {number} poids en kg (4 décimales max)
 */
export function calculPoidsChaineKg({ nbFils, metres, nm = NM_DEFAUT }) {
  if (!Number.isFinite(nbFils) || nbFils <= 0)
    throw new Error('nbFils doit être un entier > 0');
  if (!Number.isFinite(metres) || metres <= 0)
    throw new Error('metres doit être > 0');
  if (metres > OURD_METRAGE_MAX_ENSOUPLE)
    throw new Error(`metres dépasse le plafond ensouple (${OURD_METRAGE_MAX_ENSOUPLE} m)`);
  const NM = Number.isFinite(nm) && nm > 0 ? nm : NM_DEFAUT;

  const poids = (nbFils * metres * 2) / (NM * 1000);
  return Math.round(poids * 10000) / 10000;
}

export function estSousSeuilAlerte(metresRestants) {
  return Number(metresRestants) < OURD_SEUIL_ALERTE_M;
}
