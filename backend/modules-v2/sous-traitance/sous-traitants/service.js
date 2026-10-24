// Phase B — service sous-traitants étendus
import * as model from './model.js';

export const list        = (o) => model.list(o);
export const detail      = (id) => model.findById(id);
export const listTravaux = (id) => model.listTravaux(id);
export const listBons    = (id) => model.listBons(id);
export const getCompte   = (id) => model.getCompte(id);
export const statsGlobal = () => model.statsGlobal();
export const statsParType = () => model.statsParType();

export async function create(payload) {
  // validations minimales
  if (!payload.code || !payload.raison_sociale || !payload.type_activite) {
    throw Object.assign(new Error('code, raison_sociale et type_activite sont obligatoires'), { status: 400 });
  }
  const st = await model.insert({
    code: payload.code,
    raison_sociale: payload.raison_sociale,
    contact_nom: payload.contact_nom ?? null,
    contact_telephone: payload.contact_telephone ?? null,
    contact_email: payload.contact_email ?? null,
    adresse: payload.adresse ?? null,
    ville: payload.ville ?? null,
    pays: payload.pays ?? 'Tunisie',
    matricule_fiscal: payload.matricule_fiscal ?? null,
    siret_matricule_fiscal: payload.siret_matricule_fiscal ?? null,
    specialites: payload.specialites ?? [],
    type_activite: payload.type_activite,
    activites_secondaires: payload.activites_secondaires ?? [],
    tarif_unitaire: payload.tarif_unitaire ?? null,
    unite_facturation: payload.unite_facturation ?? 'piece',
    delai_moyen_jours: payload.delai_moyen_jours ?? null,
    qualite_moyenne_pct: payload.qualite_moyenne_pct ?? null,
    note_qualite: payload.note_qualite ?? null,
    date_debut_relation: payload.date_debut_relation ?? null,
    rib_bancaire: payload.rib_bancaire ?? null,
    banque: payload.banque ?? null,
    conditions_paiement: payload.conditions_paiement ?? null,
    caisse_defaut_paiement: payload.caisse_defaut_paiement ?? null,
    identification: payload.identification ?? null,
    actif: payload.actif ?? true,
    notes: payload.notes ?? null
  });
  // crée compte associé automatiquement
  await model.ensureCompte(st.id_soustraitant, payload.solde_initial ?? 0);
  return model.findById(st.id_soustraitant);
}

export async function update(id, patch) {
  const allowed = [
    'raison_sociale','contact_nom','contact_telephone','contact_email','adresse','ville','pays',
    'matricule_fiscal','siret_matricule_fiscal','specialites','type_activite','activites_secondaires',
    'tarif_unitaire','unite_facturation','delai_moyen_jours','qualite_moyenne_pct','note_qualite',
    'date_debut_relation','date_fin_relation','rib_bancaire','banque','conditions_paiement',
    'caisse_defaut_paiement','identification','actif','notes'
  ];
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)));
  const st = await model.update(id, clean);
  return st;
}

export const remove = (id) => model.remove(id);

// Anomalies
export const anomaliesList  = (o) => model.anomaliesList(o);
export const anomalieCreate = (p) => model.anomalieInsert(p);
export const anomalieResolve = (id, p) => model.anomalieResolve(id, p);
