import * as model from './model.js';

export const historique = (id) => model.historiqueMouvements(id);

/** Réception retour partiel ou complet. */
export async function receptionner(id_of_st, payload, { id_utilisateur } = {}) {
  const bon = await model.findBon(id_of_st);
  if (!bon) return null;

  const totalReturne = Number(bon.quantite_retournee) + Number(payload.quantite_retournee ?? 0);
  const totalPerdu   = Number(bon.quantite_perdue)    + Number(payload.quantite_perdue    ?? 0);
  const restant      = Number(bon.quantite_envoyee) - totalReturne - totalPerdu;

  let nouveauStatut;
  if (restant <= 0)               nouveauStatut = 'retour_complet';
  else if (totalReturne > 0)      nouveauStatut = 'en_retour_partiel';
  else                             nouveauStatut = bon.statut;

  const majBon = await model.updateBon(id_of_st, {
    quantite_retournee: totalReturne,
    quantite_perdue:    totalPerdu,
    date_retour_reel:   new Date(),
    signature_receveur_url: payload.signature_receveur_url ?? bon.signature_receveur_url,
    id_utilisateur_reception: id_utilisateur ?? null,
    statut: nouveauStatut
  });

  if (payload.quantite_retournee > 0) await model.insertMouvement({
    id_of_st, type_mouvement: 'retour',
    quantite: payload.quantite_retournee,
    id_utilisateur: id_utilisateur ?? null,
    reference_document: bon.numero_bon,
    motif: payload.motif_retour ?? null
  });
  if (payload.quantite_perdue > 0) await model.insertMouvement({
    id_of_st, type_mouvement: 'perte',
    quantite: payload.quantite_perdue,
    id_utilisateur: id_utilisateur ?? null,
    reference_document: bon.numero_bon,
    motif: payload.motif_perte ?? null
  });

  return majBon;
}

export async function declarerLitige(id_of_st, { motif_litige, id_utilisateur }) {
  return model.updateBon(id_of_st, {
    statut: 'litige',
    litige_en_cours: true,
    motif_litige: motif_litige ?? null,
    id_utilisateur_reception: id_utilisateur ?? null
  });
}
