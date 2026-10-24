import * as model from './model.js';

export const list = (o) => model.list(o);
export const detail = (id) => model.findById(id);
export const listMouvements = (id, o) => model.listMouvements(id, o);

/** Enregistre un ajustement positif ou négatif sur le compte */
export async function ajustement({ id_compte_st, montant, libelle, user_id, reference }) {
  if (!id_compte_st || !montant) {
    throw Object.assign(new Error('id_compte_st et montant requis'), { status: 400 });
  }
  return model.insertMouvement({
    id_compte_st,
    type_mvt: 'ajustement',
    montant,
    libelle: libelle ?? 'Ajustement',
    reference_externe: reference ?? null,
    cree_par: user_id ?? null
  });
}

/** Compensation = type_mvt 'compensation'. Négatif pour imputer une charge, positif pour compenser. */
export async function compensation({ id_compte_st, montant, libelle, user_id, reference }) {
  if (!id_compte_st || !montant) {
    throw Object.assign(new Error('id_compte_st et montant requis'), { status: 400 });
  }
  return model.insertMouvement({
    id_compte_st,
    type_mvt: 'compensation',
    montant,
    libelle: libelle ?? 'Compensation',
    reference_externe: reference ?? null,
    cree_par: user_id ?? null
  });
}

/** Paiement (toujours négatif pour diminuer la créance) */
export async function paiement({ id_compte_st, montant, libelle, user_id, reference }) {
  if (!id_compte_st || !montant) {
    throw Object.assign(new Error('id_compte_st et montant requis'), { status: 400 });
  }
  const signedMontant = montant > 0 ? -Math.abs(montant) : montant;
  return model.insertMouvement({
    id_compte_st,
    type_mvt: 'paiement',
    montant: signedMontant,
    libelle: libelle ?? 'Paiement',
    reference_externe: reference ?? null,
    cree_par: user_id ?? null
  });
}

export async function creance({ id_compte_st, montant, libelle, id_travail, user_id, reference }) {
  if (!id_compte_st || !montant) {
    throw Object.assign(new Error('id_compte_st et montant requis'), { status: 400 });
  }
  const signedMontant = Math.abs(montant);
  return model.insertMouvement({
    id_compte_st,
    type_mvt: 'creance',
    montant: signedMontant,
    libelle: libelle ?? 'Créance travail',
    id_travail: id_travail ?? null,
    reference_externe: reference ?? null,
    cree_par: user_id ?? null
  });
}
