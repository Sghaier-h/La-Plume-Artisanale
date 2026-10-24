import * as model from './model.js';
import { nextOurdissage } from '../../_shared/numero-sequence.js';
import { calculPoidsChaineKg, OURD_METRAGE_MAX_ENSOUPLE } from './formule.js';

export const lister    = (opts) => model.findAll(opts);
export const detail    = (id)   => model.findById(id);

export async function creerEnsouple(payload, { id_utilisateur } = {}) {
  const { id_machine, id_article_mp, numero_metrique_nm, nb_fils_chaine, metrage_cible_m } = payload;
  if (metrage_cible_m > OURD_METRAGE_MAX_ENSOUPLE)
    throw new Error(`metrage_cible_m dépasse ${OURD_METRAGE_MAX_ENSOUPLE} m`);
  const poids_theorique_kg = calculPoidsChaineKg({
    nbFils: nb_fils_chaine,
    metres: metrage_cible_m,
    nm: numero_metrique_nm
  });
  const numero_ourdissage = await nextOurdissage();
  return model.insert({
    numero_ourdissage,
    id_machine,
    id_article_mp,
    id_lot_mp: payload.id_lot_mp ?? null,
    id_soustraitant: payload.id_soustraitant ?? null,
    numero_metrique_nm: numero_metrique_nm ?? 50,
    nb_fils_chaine,
    metrage_cible_m,
    poids_theorique_kg,
    statut: 'preparation',
    id_utilisateur_demande: id_utilisateur ?? null,
    notes: payload.notes ?? null
  });
}

export async function receptionner(id, { metrage_reel_m, poids_reel_kg, date_nouage_machine, id_utilisateur }) {
  return model.update(id, {
    metrage_reel_m,
    poids_reel_kg,
    date_reception: new Date(),
    date_nouage_machine: date_nouage_machine ?? new Date(),
    id_utilisateur_ourdisseur: id_utilisateur ?? null,
    statut: 'ensouple_pret'
  });
}

export const ajouterLot = model.ajouterLot;
export const majMetrage = (id, patch) => model.update(id, patch);
