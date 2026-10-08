// Générateur numéros de séquence (§16bis contrat domain)
// Formats gérés :
//   - OF Commande        : OF{6chiffres}       ex OF000123
//   - OF Stock catalogue  : CA{4chiffres}       ex CA0042
//   - Sous-OF complément  : <parent>.<n>         ex OF000123.1
//   - Bon Sortie ST       : BSST-{YYYY}-{5chif} ex BSST-2026-00001
//   - Ourdissage          : OURD-{YYYY}-{5chif} ex OURD-2026-00001
//
// Table `sequences_numerotation(scope, annee, dernier_numero)` fournie par
// le module `base` v2. Ici on isole la logique format ; l'incrémentation
// atomique est déléguée à `NumeroSequenceService.next(scope)`.

const pad = (n, w) => String(n).padStart(w, '0');

export const SequenceScopes = Object.freeze({
  OF_COMMANDE:  'of_commande',
  OF_STOCK:     'of_stock',
  BON_SORTIE_ST:'bon_sortie_st',
  OURDISSAGE:   'ourdissage'
});

export function formatOfCommande(n)  { return `OF${pad(n, 6)}`; }
export function formatOfStock(n)     { return `CA${pad(n, 4)}`; }
export function formatBonSortieSt(y, n) { return `BSST-${y}-${pad(n, 5)}`; }
export function formatOurdissage(y, n)  { return `OURD-${y}-${pad(n, 5)}`; }
export function formatComplement(parent, i) { return `${parent}.${i}`; }

/**
 * Service d'accès. On s'attend à ce que le module base v2 injecte
 * une implémentation compatible via `setSequenceProvider(fn)`.
 * Par défaut, fallback en mémoire (utile pour tests).
 */
let _provider = null;
const _memory  = new Map();

export function setSequenceProvider(fn) { _provider = fn; }

export async function nextNumero(scope, opts = {}) {
  if (_provider) return _provider(scope, opts);
  const key = `${scope}:${opts.annee ?? new Date().getFullYear()}`;
  const cur = (_memory.get(key) ?? 0) + 1;
  _memory.set(key, cur);
  return cur;
}

export async function nextOfCommande() {
  const n = await nextNumero(SequenceScopes.OF_COMMANDE);
  return formatOfCommande(n);
}
export async function nextOfStock() {
  const n = await nextNumero(SequenceScopes.OF_STOCK);
  return formatOfStock(n);
}
export async function nextBonSortieSt(annee = new Date().getFullYear()) {
  const n = await nextNumero(SequenceScopes.BON_SORTIE_ST, { annee });
  return formatBonSortieSt(annee, n);
}
export async function nextOurdissage(annee = new Date().getFullYear()) {
  const n = await nextNumero(SequenceScopes.OURDISSAGE, { annee });
  return formatOurdissage(annee, n);
}
