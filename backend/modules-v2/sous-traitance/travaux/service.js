import * as model from './model.js';

export const list   = (o) => model.list(o);
export const detail = (id) => model.findById(id);
export const stats  = () => model.stats();
export const parMois = (o) => model.parMois(o);

export async function create(p) {
  if (!p.id_soustraitant || !p.type_activite) {
    throw Object.assign(new Error('id_soustraitant et type_activite sont obligatoires'), { status: 400 });
  }
  const montant = (p.quantite ?? 0) * (p.tarif_applique ?? 0);
  return model.insert({
    id_soustraitant: p.id_soustraitant,
    type_activite: p.type_activite,
    id_bon_sortie: p.id_bon_sortie ?? null,
    id_bon_retour: p.id_bon_retour ?? null,
    id_of_lie: p.id_of_lie ?? null,
    date_debut: p.date_debut ?? null,
    date_fin: p.date_fin ?? null,
    quantite: p.quantite ?? 0,
    unite: p.unite ?? 'piece',
    tarif_applique: p.tarif_applique ?? null,
    montant: p.montant ?? montant,
    statut: p.statut ?? 'en_cours',
    notes: p.notes ?? null
  });
}

export const update = (id, patch) => model.update(id, patch);

export async function valider(id, { user_id }) {
  return model.update(id, {
    statut: 'valide',
    date_validation: new Date(),
    valide_par: user_id ?? null
  });
}

export async function refuser(id, { user_id, motif_refus }) {
  return model.update(id, {
    statut: 'refuse',
    motif_refus: motif_refus ?? null,
    date_validation: new Date(),
    valide_par: user_id ?? null
  });
}

export async function payer(id, { reference_paiement }) {
  return model.update(id, {
    statut: 'paye',
    date_paiement: new Date(),
    reference_paiement: reference_paiement ?? null
  });
}
