// service.js — comptabilite/apport-gerant (§14quater.6)
import * as model from './model.js';

function userId(user) {
  return Number(user?.id_user || user?.id || 0) || null;
}

export async function saisir(body, user) {
  const idUser = userId(user);
  if (!idUser) throw new Error('Utilisateur non identifié');
  // L'ADMIN peut aussi saisir pour le compte d'un autre gérant via id_user_gerant
  const idGerant = body.id_user_gerant != null ? Number(body.id_user_gerant) : idUser;

  return model.saisirApport({
    id_user_gerant: idGerant,
    id_societe: body.id_societe != null ? Number(body.id_societe) : null,
    montant: body.montant,
    type_mvt: body.type_mvt || 'apport',
    mode_paiement: body.mode_paiement || 'espece',
    id_caisse_destination: body.id_caisse_destination != null ? Number(body.id_caisse_destination) : null,
    id_document_archive: body.id_document_archive != null ? Number(body.id_document_archive) : null,
    reference: body.reference || null,
    libelle: body.libelle || null,
    notes: body.notes || null,
    saisi_par: idUser,
  });
}

export async function historique(query, user) {
  const idUser = userId(user);
  const idGerant = query.id_user_gerant != null ? Number(query.id_user_gerant) : idUser;
  return model.listHistorique({
    id_user_gerant: idGerant,
    id_societe: query.id_societe != null ? Number(query.id_societe) : null,
    limit: Math.min(Number(query.limit) || 100, 500),
    offset: Number(query.offset) || 0,
  });
}

export async function soldeCca(query, user) {
  const idUser = userId(user);
  const idGerant = query.id_user_gerant != null ? Number(query.id_user_gerant) : idUser;
  const row = await model.getSoldeCCA({
    id_user_gerant: idGerant,
    id_societe: query.id_societe != null ? Number(query.id_societe) : null,
  });
  return row || {
    id_cca: null,
    id_user_gerant: idGerant,
    solde_calcule: 0,
    solde_stocke: 0,
    nb_mouvements: 0,
    dernier_mouvement: null,
  };
}
