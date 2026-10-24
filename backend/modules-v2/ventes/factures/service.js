// service.js — factures (ventes)
// Calcul TVA + timbre fiscal 1 DT (§13.1)
import * as model from './model.js';

const TIMBRE_FISCAL_TND = 1.000;

/**
 * Calcule les totaux d'une facture à partir de ses lignes.
 * @param {Array<{quantite:number, prix_unitaire_ht:number, remise_pct?:number, taux_tva?:number}>} lignes
 * @param {{devise?:string, applique_timbre?:boolean}} opts
 * @returns {{montant_ht:number, montant_tva:number, timbre_fiscal:number, montant_ttc:number, lignes:Array}}
 */
export function calculerTotaux(lignes = [], opts = {}) {
  const applique_timbre = opts.applique_timbre !== false && (opts.devise || 'TND') === 'TND';
  let ht = 0, tva = 0;
  const lignesEnrichies = lignes.map(l => {
    const q = Number(l.quantite) || 0;
    const pu = Number(l.prix_unitaire_ht) || 0;
    const remise = Number(l.remise_pct) || 0;
    const taux = l.taux_tva == null ? 19 : Number(l.taux_tva);
    const brut = q * pu;
    const montant_ht = +(brut * (1 - remise / 100)).toFixed(3);
    const montant_tva = +(montant_ht * taux / 100).toFixed(3);
    const montant_ttc = +(montant_ht + montant_tva).toFixed(3);
    ht += montant_ht;
    tva += montant_tva;
    return { ...l, montant_ht, montant_tva, montant_ttc, taux_tva: taux };
  });
  const montant_ht = +ht.toFixed(3);
  const montant_tva = +tva.toFixed(3);
  const timbre_fiscal = applique_timbre ? TIMBRE_FISCAL_TND : 0;
  const montant_ttc = +(montant_ht + montant_tva + timbre_fiscal).toFixed(3);
  return { montant_ht, montant_tva, timbre_fiscal, montant_ttc, lignes: lignesEnrichies };
}

export async function list(query = {}) {
  const { limit = 100, offset = 0, ...filters } = query;
  return model.findAll({ limit: +limit, offset: +offset, filters });
}

export async function getOne(id) {
  return model.findById(id);
}

export async function create(payload, user) {
  const { lignes = [], ...header } = payload;
  const totaux = calculerTotaux(lignes, { devise: header.devise, applique_timbre: header.applique_timbre });
  const facture = await model.insertWithLignes({
    ...header,
    montant_ht: totaux.montant_ht,
    montant_tva: totaux.montant_tva,
    timbre_fiscal: totaux.timbre_fiscal,
    montant_ttc: totaux.montant_ttc,
    montant_restant: totaux.montant_ttc,
    id_utilisateur_creation: user?.id
  }, totaux.lignes);
  return facture;
}

export async function update(id, payload, user) {
  return model.updateById(id, payload, user);
}

export async function remove(id, user) {
  return model.deleteById(id, user);
}
