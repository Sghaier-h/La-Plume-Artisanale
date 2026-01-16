/**
 * Utilitaires pour générer les références commerciales et de fabrication
 * Basés sur les formules Excel
 */

interface ArticleData {
  code_modele?: string;
  code_dimensions?: string;
  code_nombre_couleur?: string;
  code_selecteur_01?: string;
  code_selecteur_02?: string;
  code_selecteur_03?: string;
  code_selecteur_04?: string;
  code_selecteur_05?: string;
  code_selecteur_06?: string;
}

/**
 * Extrait les caractères de droite (sauf le premier)
 * Équivalent à DROITE(texte, NBCAR(texte)-1) en Excel
 * Exemple: "C02" -> "02"
 */
function droiteSansPremier(texte: string | undefined | null): string {
  if (!texte || texte.length <= 1) return '';
  return texte.substring(1);
}

/**
 * Génère la référence de fabrication selon la formule Excel
 * @param article - Objet contenant les propriétés de l'article
 * @returns Référence de fabrication
 */
export function genererRefFabrication(article: ArticleData): string {
  const {
    code_modele = '',
    code_dimensions = '',
    code_nombre_couleur = '',
    code_selecteur_01 = '',
    code_selecteur_02 = '',
    code_selecteur_03 = '',
    code_selecteur_04 = '',
    code_selecteur_05 = '',
    code_selecteur_06 = ''
  } = article;

  const base = code_modele + code_dimensions;

  switch (code_nombre_couleur) {
    case 'U': // Uni (1 couleur)
      return `${base}-${droiteSansPremier(code_selecteur_01)}`;

    case 'B': // 2 Couleurs
      return `${base}-B-${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}`;

    case 'T': // 3 Couleurs
      return `${base}-T-${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}-${droiteSansPremier(code_selecteur_03)}`;

    case 'Q': // 4 Couleurs
      return `${base}-Q-${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}-${droiteSansPremier(code_selecteur_03)}-${droiteSansPremier(code_selecteur_04)}`;

    case 'C': // 5 Couleurs
      return `${base}-C-${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}-${droiteSansPremier(code_selecteur_03)}-${droiteSansPremier(code_selecteur_04)}-${droiteSansPremier(code_selecteur_05)}`;

    case 'S': // 6 Couleurs
      return `${base}-S-${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}-${droiteSansPremier(code_selecteur_03)}-${droiteSansPremier(code_selecteur_04)}-${droiteSansPremier(code_selecteur_05)}-${droiteSansPremier(code_selecteur_06)}`;

    default:
      // Format par défaut
      return `${base}-${code_nombre_couleur}-${droiteSansPremier(code_selecteur_01)}`;
  }
}

/**
 * Génère la référence commerciale selon la formule Excel exacte
 * Formule: SI(Code Nombre de couleur="U"; Code Modèle + Code Dimensions + "-" + DROITE(Code Selecteur 01);
 *          SI(Code Nombre de couleur="B"; Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + DROITE(Code Selecteur 01) + "-" + DROITE(Code Selecteur 02);
 *          Code Modèle + Code Dimensions + "-" + Code Nombre de couleur + DROITE(Code Selecteur 01) + "-" + DROITE(Code Selecteur 02) + "-" + DROITE(Code Selecteur 03)))
 * @param article - Objet contenant les propriétés de l'article
 * @returns Référence commerciale
 */
export function genererRefCommerciale(article: ArticleData): string {
  const {
    code_modele = '',
    code_dimensions = '',
    code_nombre_couleur = '',
    code_selecteur_01 = '',
    code_selecteur_02 = '',
    code_selecteur_03 = ''
  } = article;

  const base = code_modele + code_dimensions;

  if (code_nombre_couleur === 'U') {
    // Uni (1 couleur)
    return `${base}-${droiteSansPremier(code_selecteur_01)}`;
  } else if (code_nombre_couleur === 'B') {
    // 2 Couleurs
    return `${base}-${code_nombre_couleur}${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}`;
  } else {
    // Par défaut (3+ couleurs) - La formule Excel s'arrête à 3 couleurs
    return `${base}-${code_nombre_couleur}${droiteSansPremier(code_selecteur_01)}-${droiteSansPremier(code_selecteur_02)}-${droiteSansPremier(code_selecteur_03)}`;
  }
}
