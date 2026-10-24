/**
 * Contrôleur Qualité Avancée (variante orthographique) —
 * réexporte l'implémentation `qualite-avance` pour rétro-compatibilité.
 */

export {
  getControles, getControleById, createControle, updateControle, deleteControle,
  getNonConformites, getNonConformiteById, createNonConformite, updateNonConformite,
  traiterNonConformite, resoudreNonConformite, validerNonConformite,
  getDeclarations, createDeclaration,
  getStatsGlobal,
  getQualiteAvance, getQualiteAvanceById, createQualiteAvance,
  updateQualiteAvance, deleteQualiteAvance,
} from '../../qualite-avance/controllers/qualite-avance.controller.js';
