// service.js — personnalisation/commandes
// Business logic : validations client/commercial + génération des specs atelier.
import { baseService, model } from './model.js';

/**
 * Génère les specs atelier à partir des paramètres client + du type de
 * personnalisation (§5.8.3, §5.8.4 domain.md).
 * Version 1 : passe-plat structuré ; l'orchestration IA/BOM viendra plus tard.
 */
export function genererSpecsAtelier(row) {
  const params = row.parametres_json || {};
  const base = {
    type: row.type_personnalisation,
    zone: params.zone || params.emplacement || null,
    dimensions_mm: params.dimensions_mm || params.taille_mm || null,
    genere_le: new Date().toISOString(),
  };

  switch (row.type_personnalisation) {
    case 'broderie':
      return {
        ...base,
        texte: params.texte || null,
        police: params.police || null,
        couleurs_fils: params.couleurs_fils || params.couleurs || [],
        nb_couleurs: (params.couleurs_fils || params.couleurs || []).length,
        fichier_source_url: row.fichier_source_url || null,
        fichier_dst_url:    row.fichier_dst_url    || null,
      };
    case 'serigraphie':
      return {
        ...base,
        couleurs_encres: params.couleurs_encres || params.couleurs || [],
        nb_couleurs:     (params.couleurs_encres || params.couleurs || []).length,
        fichiers_films_urls: row.fichier_films_urls || [],
      };
    case 'rayures_personnalisees':
      return {
        ...base,
        chaine: params.chaine || null,
        trame:  params.trame  || null,
        proportions: params.proportions || null,
      };
    case 'couleurs_personnalisees':
      return { ...base, palette: params.palette || null };
    case 'dimensions_custom':
      return { ...base, dimensions_cm: params.dimensions_cm || null };
    case 'pack_compose':
      return { ...base, composition: params.composition || [] };
    default:
      return base;
  }
}

export const service = {
  ...baseService,

  async validerClient(id) {
    return model.validerClient(id);
  },

  /**
   * Valide côté commercial. Si les specs n'ont pas été fournies, on les
   * régénère à partir de la ligne + du user courant.
   */
  async validerCommercial(id, { specs_atelier_json = null } = {}, user) {
    const current = await model.findById(id);
    if (!current) return null;
    const specs = specs_atelier_json || genererSpecsAtelier(current);
    return model.validerCommercial(id, {
      id_commercial: user?.id_user ?? user?.id ?? null,
      specs_atelier_json: specs,
    });
  },
};

export default service;
