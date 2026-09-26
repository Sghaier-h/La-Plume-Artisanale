// service.js — ecommerce/promo
// CRUD codes promo + validation d'un code au moment du checkout.
import { model, baseService } from './model.js';

export const service = {
  ...baseService,

  /** Valide un code promo pour un panier (id_site, canal, montant, id_compte). */
  async validerCode({ id_site, code, canal = 'B2C', montant_ht = 0, id_compte = null }) {
    if (!code) {
      const e = new Error('Code manquant'); e.code = 'CODE_MANQUANT'; e.httpStatus = 400; throw e;
    }
    const promo = await model.findActifParCode(id_site, code.trim().toUpperCase());
    if (!promo) return { valide: false, motif: 'introuvable_ou_expire' };

    if (promo.canal_cible && promo.canal_cible !== 'tous' && promo.canal_cible !== canal) {
      return { valide: false, motif: 'canal_incompatible' };
    }
    if (promo.montant_min_commande != null && Number(montant_ht) < Number(promo.montant_min_commande)) {
      return { valide: false, motif: 'montant_min_non_atteint', montant_min: promo.montant_min_commande };
    }
    if (promo.usage_max_total != null && promo.usage_courant >= promo.usage_max_total) {
      return { valide: false, motif: 'quota_total_atteint' };
    }

    // Calcul de la remise
    let remise = 0;
    let livraisonGratuite = false;
    let produitOffert = false;
    if (promo.type_remise === 'pct') {
      remise = Number(montant_ht) * (Number(promo.valeur) / 100);
    } else if (promo.type_remise === 'montant') {
      remise = Math.min(Number(promo.valeur), Number(montant_ht));
    } else if (promo.type_remise === 'livraison_gratuite') {
      livraisonGratuite = true;
    } else if (promo.type_remise === 'produit_offert') {
      produitOffert = true;
    }

    return {
      valide: true,
      id_promo: promo.id_promo,
      type_remise: promo.type_remise,
      remise_ht: Math.round(remise * 1000) / 1000,
      livraison_gratuite: livraisonGratuite,
      produit_offert: produitOffert,
      usages_restants: promo.usage_max_total != null ? promo.usage_max_total - promo.usage_courant : null,
    };
  },

  /** Incrémente le compteur d'usage après application effective. */
  async marquerUtilise(idPromo) {
    return model.incrementUsage(idPromo);
  },
};

export default service;
