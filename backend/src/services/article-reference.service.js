/**
 * Article Reference Service
 *
 * Génère les références commerciales et de fabrication pour un article
 * selon les règles métier du catalogue La Plume Artisanale.
 *
 * Inspirée de la logique du module GAS 04_Catalogue.gs (généraion refs article).
 *
 * Format des références :
 *   REF_COMMERCIALE  = MODELE + DIM + "-" + NC + SEL01[+SEL02...]
 *   REF_FABRICATION  = MODELE + DIM + "-" + NC + "-" + SEL01[+"-"+SEL02...]
 *
 * Exemples :
 *   Modèle AR (Arthur), dim 1020, 2 couleurs (B), sélecteurs [02, 03]
 *     → commerciale  = "AR1020-B02-03"
 *     → fabrication  = "AR1020-B-02-03"
 *
 *   Modèle AR, dim 1020, Uni (U), sélecteur [01]
 *     → commerciale  = "AR1020-U01"
 *     → fabrication  = "AR1020-U-01"
 *
 * Règle sélecteurs selon code_nc (code nombre de couleurs) :
 *   U (1) : 1 sélecteur
 *   B (2) : 2 sélecteurs
 *   T (3) : 3 sélecteurs
 *   Q (4) : 4 sélecteurs
 *   C (5) : 5 sélecteurs
 *   S (6) : 6 sélecteurs
 */

/**
 * Normalise un sélecteur en chaîne 2 caractères (padding zéros)
 * @param {string|number} sel
 * @returns {string}
 */
function normalizeSelecteur(sel) {
  if (sel === null || sel === undefined || sel === '') return '';
  const s = String(sel).trim();
  if (s === '') return '';
  // Si déjà plus de 2 chars, on laisse tel quel
  if (s.length >= 2) return s;
  return s.padStart(2, '0');
}

/**
 * Nombre de sélecteurs attendus selon le code NC
 * @param {string} codeNc
 * @returns {number}
 */
export function getNombreSelecteursForCodeNc(codeNc) {
  const c = String(codeNc || '').toUpperCase().trim();
  const map = { U: 1, B: 2, T: 3, Q: 4, C: 5, S: 6 };
  return map[c] || 1;
}

/**
 * Génère la référence commerciale d'un article
 * @param {Object} params
 * @param {string} params.codeModele - Code modèle (ex: "AR")
 * @param {string} params.codeDimension - Code dimension (ex: "1020")
 * @param {string} params.codeNc - Code nombre couleurs (ex: "B")
 * @param {string[]} params.selecteurs - Liste des sélecteurs (ex: ["02", "03"])
 * @returns {string}
 */
export function buildRefCommerciale({ codeModele, codeDimension, codeNc, selecteurs = [] }) {
  if (!codeModele || !codeDimension || !codeNc) return '';

  const nbAttendu = getNombreSelecteursForCodeNc(codeNc);
  const selsNormalized = selecteurs
    .slice(0, nbAttendu)
    .map(normalizeSelecteur)
    .filter(s => s !== '');

  if (selsNormalized.length === 0) return '';

  // Format : MODELE + DIM + "-" + NC + SEL01 + ("-" + SELN pour les suivants)
  // Ex: AR1020-B02-03
  const prefix = `${codeModele}${codeDimension}-${codeNc}${selsNormalized[0]}`;
  const rest = selsNormalized.slice(1).join('-');
  return rest ? `${prefix}-${rest}` : prefix;
}

/**
 * Génère la référence de fabrication d'un article
 * Format : MODELE + DIM + "-" + NC + "-" + SEL01 + ("-" + SELN ...)
 * Ex: AR1020-B-02-03
 */
export function buildRefFabrication({ codeModele, codeDimension, codeNc, selecteurs = [] }) {
  if (!codeModele || !codeDimension || !codeNc) return '';

  const nbAttendu = getNombreSelecteursForCodeNc(codeNc);
  const selsNormalized = selecteurs
    .slice(0, nbAttendu)
    .map(normalizeSelecteur)
    .filter(s => s !== '');

  if (selsNormalized.length === 0) return '';

  // Format : MODELE + DIM + "-" + NC + "-" + SEL01 + "-" + SELN ...
  return `${codeModele}${codeDimension}-${codeNc}-${selsNormalized.join('-')}`;
}

/**
 * Génère les deux références en une seule passe
 */
export function buildReferences(params) {
  return {
    ref_commerciale: buildRefCommerciale(params),
    ref_fabrication: buildRefFabrication(params)
  };
}

/**
 * Parse une référence commerciale pour extraire ses composants
 * Réciproque de buildRefCommerciale
 *
 * @param {string} ref - Ex: "AR1020-B02-03"
 * @returns {{ codeModele, codeDimension, codeNc, selecteurs } | null}
 */
export function parseRefCommerciale(ref) {
  if (!ref) return null;
  const s = String(ref).trim();

  // Le modèle peut être 2-5 lettres, la dimension 2-5 chiffres
  // Format: LETTRES + CHIFFRES + "-" + LETTRE + CHIFFRES + ("-" + CHIFFRES)*
  const match = s.match(/^([A-Z]+)(\d+)-([UBTQCS])(\d+)(?:-(.+))?$/i);
  if (!match) return null;

  const [, codeModele, codeDimension, codeNc, firstSel, rest] = match;
  const selecteurs = [firstSel];
  if (rest) {
    selecteurs.push(...rest.split('-'));
  }

  return {
    codeModele: codeModele.toUpperCase(),
    codeDimension,
    codeNc: codeNc.toUpperCase(),
    selecteurs
  };
}

/**
 * Parse une référence de fabrication
 * Format: MODELE + DIM + "-" + NC + "-" + SEL01 + "-" + ...
 * Ex: "AR1020-B-02-03"
 */
export function parseRefFabrication(ref) {
  if (!ref) return null;
  const s = String(ref).trim();

  const match = s.match(/^([A-Z]+)(\d+)-([UBTQCS])-(.+)$/i);
  if (!match) return null;

  const [, codeModele, codeDimension, codeNc, rest] = match;
  const selecteurs = rest.split('-');

  return {
    codeModele: codeModele.toUpperCase(),
    codeDimension,
    codeNc: codeNc.toUpperCase(),
    selecteurs
  };
}

/**
 * Valide qu'une référence commerciale respecte le format attendu
 */
export function isValidRefCommerciale(ref) {
  return parseRefCommerciale(ref) !== null;
}

/**
 * Génère la désignation (description humaine) d'un article
 * Format : "<type_produit> Modèle <MODELE_LIBELLE> Couleur <couleurs>"
 * Ex : "Fouta Modèle ARTHUR Couleur Ecru Beige"
 */
export function buildDesignation({
  typeProduit,       // "Fouta", "Jeté", etc.
  modeleLibelle,     // "ARTHUR"
  couleursLabels     // ["Ecru", "Beige"] ou "Ecru Beige"
}) {
  const type = String(typeProduit || '').trim();
  const modele = String(modeleLibelle || '').trim();
  const couleurs = Array.isArray(couleursLabels)
    ? couleursLabels.filter(Boolean).join(' ')
    : String(couleursLabels || '').trim();

  const parts = [];
  if (type) parts.push(type);
  if (modele) parts.push(`Modèle ${modele}`);
  if (couleurs) parts.push(`Couleur ${couleurs}`);
  return parts.join(' ');
}
