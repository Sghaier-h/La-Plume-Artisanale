/**
 * BOM Service — Nomenclature (Bill of Materials)
 *
 * Porté depuis 09_BOM.gs :
 * - Génération auto du code BOM Master depuis les caractéristiques produit
 * - Règle métier : Nombre de Duite Total = Longueur Tissage (cm) × Duite par CM
 * - Helpers de parsing numérique robustes (virgule/point, espaces)
 *
 * Formule GAS :
 *   Code BOM Master = CodeProduit + CodeDimensions + "(" + CodeFinition + ")-" + CodeNombreCouleur
 *   Exemple : AR1020(FR)-B
 */

/**
 * Parse un nombre tolérant aux formats européens
 * Accepte : 10,8 | 10.8 | "10 800" | "1 000,50" | etc.
 */
export function parseNumberLoose(v) {
  if (v === undefined || v === null || v === '') return NaN;
  if (typeof v === 'number') return isNaN(v) ? NaN : v;
  let s = String(v).replace(/\s/g, '');
  if (!s) return NaN;

  // Gérer la combinaison virgule + point
  if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      // Format européen : 1.000,50 → 1000.50
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // Format US : 1,000.50 → 1000.50
      s = s.replace(/,/g, '');
    }
  } else if (s.indexOf(',') >= 0) {
    s = s.replace(',', '.');
  }

  const x = parseFloat(s);
  return isNaN(x) ? NaN : x;
}

/**
 * Génère le code BOM Master selon la formule GAS
 *
 * Code BOM Master = codeProduit + codeDimensions + "(" + codeFinition + ")-" + codeNombreCouleur
 * Exemple : AR + 1020 + "(" + FR + ")-" + B → "AR1020(FR)-B"
 */
export function buildCodeBomMaster({
  codeProduit,
  codeDimensions,
  codeFinition,
  codeNombreCouleur
}) {
  if (!codeProduit || !codeDimensions) return '';

  const cp = String(codeProduit).trim();
  const cd = String(codeDimensions).trim();
  const cf = String(codeFinition || '').trim();
  const cnc = String(codeNombreCouleur || '').trim();

  return `${cp}${cd}(${cf})-${cnc}`;
}

/**
 * Génère le code BOM Composant
 * Format libre basé sur le master + suffixe (variante)
 * Exemple : AR1020(FR)-B-001
 */
export function buildCodeBomComposant(codeBomMaster, variant = 1) {
  if (!codeBomMaster) return '';
  const suffix = String(variant).padStart(3, '0');
  return `${codeBomMaster}-${suffix}`;
}

/**
 * Règle métier : calcule/complète les duites
 *
 * Nombre de Duite Total = Longueur Tissage (cm) × Duite par CM
 *
 * Si 2 valeurs sur 3 sont connues, complète la troisième.
 * Retourne un objet avec les 3 valeurs cohérentes.
 */
export function computeDuites({ longueur_tissage_cm, duite_par_cm, nombre_duite_total }) {
  let L = parseNumberLoose(longueur_tissage_cm);
  let D = parseNumberLoose(duite_par_cm);
  let T = parseNumberLoose(nombre_duite_total);

  // Si total+duite connus, déduire longueur
  if (T > 0 && D > 0 && !(L > 0)) {
    L = Math.round((T / D) * 100) / 100;
  }
  // Si total+longueur connus, déduire duite
  if (T > 0 && L > 0 && !(D > 0)) {
    D = Math.round((T / L) * 1000) / 1000;
  }
  // Si longueur+duite connus, calculer total
  if (L > 0 && D > 0) {
    T = Math.round(L * D);
  }

  return {
    longueur_tissage_cm: isNaN(L) ? null : L,
    duite_par_cm: isNaN(D) ? null : D,
    nombre_duite_total: isNaN(T) ? null : T
  };
}

/**
 * Calcule la consommation totale d'un composant (somme des sélecteurs)
 */
export function sumConsommations(composant) {
  let total = 0;
  for (let i = 1; i <= 6; i++) {
    const key = `consommation_s${String(i).padStart(2, '0')}`;
    const v = parseNumberLoose(composant[key]);
    if (v > 0) total += v;
  }
  return total;
}
