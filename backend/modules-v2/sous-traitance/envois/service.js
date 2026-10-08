import * as model from './model.js';
import { nextBonSortieSt } from '../../_shared/numero-sequence.js';

export const listBons        = (o) => model.listBons(o);
export const detailBon       = (id) => model.findBon(id);
export const listSousTraitants = (o) => model.listSousTraitants(o);

export async function creerBon(payload, { id_utilisateur } = {}) {
  const numero_bon = payload.numero_bon ?? await nextBonSortieSt();
  return model.insertBon({
    numero_bon,
    id_of: payload.id_of,
    id_of_poste: payload.id_of_poste ?? null,
    id_soustraitant: payload.id_soustraitant,
    date_envoi_prevue: payload.date_envoi_prevue ?? null,
    date_retour_prevue: payload.date_retour_prevue,   // obligatoire (§7.11)
    quantite_envoyee: payload.quantite_envoyee,
    cout_prestation_ht: payload.cout_prestation_ht ?? null,
    statut: 'en_preparation',
    id_utilisateur_expedition: id_utilisateur ?? null,
    notes: payload.notes ?? null
  });
}

export async function expedier(id, { signature_expediteur_url, photos_urls, id_utilisateur }) {
  const bon = await model.updateBon(id, {
    statut: 'expedie',
    date_envoi_reel: new Date(),
    signature_expediteur_url: signature_expediteur_url ?? null,
    photos_urls: photos_urls ?? null,
    id_utilisateur_expedition: id_utilisateur ?? null
  });
  if (bon) await model.insertMouvement({
    id_of_st: id, type_mouvement: 'envoi', quantite: bon.quantite_envoyee,
    id_utilisateur: id_utilisateur ?? null, reference_document: bon.numero_bon
  });
  return bon;
}

export const majBon = (id, patch) => model.updateBon(id, patch);
