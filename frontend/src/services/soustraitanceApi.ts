/**
 * soustraitanceApi.ts — client API Phase B §14quater.3
 *
 * Endpoints backend `/api/v2/sous-traitance/*` :
 *  - sous-traitants      CRUD + compte, travaux, bons
 *  - travaux             CRUD + validate/refuse/pay
 *  - bons                sortie/retour signatures + contrôle qualité
 *  - comptes             mouvements, ajustement, compensation, paiement, créance
 */
import api from './api';

export type TypeActiviteST =
  | 'ourdissage' | 'nouage' | 'tissage' | 'frange' | 'couture'
  | 'teinture'   | 'broderie' | 'personnalisation' | 'finition' | 'autre';

export type UniteFacturationST = 'piece' | 'metre' | 'kg' | 'heure' | 'forfait';

export type StatutTravailST = 'en_cours' | 'termine' | 'valide' | 'refuse' | 'paye';

export type GraviteAnomalie = 'info' | 'a_corriger' | 'critique' | 'corrige_auto';

export interface SousTraitant {
  id_soustraitant: number;
  code: string;
  raison_sociale: string;
  contact_nom?: string;
  contact_telephone?: string;
  contact_email?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  type_activite: TypeActiviteST;
  activites_secondaires?: string[];
  specialites?: string[];
  tarif_unitaire?: number;
  unite_facturation?: UniteFacturationST;
  delai_moyen_jours?: number;
  qualite_moyenne_pct?: number;
  note_qualite?: number;
  date_debut_relation?: string;
  date_fin_relation?: string;
  siret_matricule_fiscal?: string;
  matricule_fiscal?: string;
  rib_bancaire?: string;
  banque?: string;
  conditions_paiement?: string;
  caisse_defaut_paiement?: number;
  identification?: string;
  actif: boolean;
  notes?: string;
  // enrichi par JOIN
  solde_courant?: number;
  solde_initial?: number;
  travaux_en_cours?: number;
  anomalies_ouvertes?: number;
}

export interface CompteSousTraitant {
  id_compte_st: number;
  id_soustraitant: number;
  solde_initial: number;
  solde_courant: number;
  devise: string;
  date_dernier_mouvement?: string;
  date_reset_solde?: string;
  inactif: boolean;
  notes?: string;
  sous_traitant_nom?: string;
  sous_traitant_code?: string;
  type_activite?: TypeActiviteST;
}

export interface MouvementCompteST {
  id_mouvement_cst: number;
  id_compte_st: number;
  date_mouvement: string;
  type_mvt: 'creance' | 'paiement' | 'ajustement' | 'compensation';
  montant: number;
  libelle?: string;
  reference_externe?: string;
  id_travail?: number;
  id_paiement?: number;
}

export interface TravailST {
  id_travail: number;
  id_soustraitant: number;
  sous_traitant_nom?: string;
  type_activite: TypeActiviteST;
  id_bon_sortie?: number;
  id_bon_retour?: number;
  id_of_lie?: number;
  date_debut?: string;
  date_fin?: string;
  quantite: number;
  unite: UniteFacturationST;
  tarif_applique?: number;
  montant?: number;
  statut: StatutTravailST;
  date_validation?: string;
  motif_refus?: string;
  date_paiement?: string;
  reference_paiement?: string;
  notes?: string;
}

export interface BonST {
  id_of_st: number;
  numero_bon: string;
  id_soustraitant: number;
  sous_traitant_nom?: string;
  type_activite?: TypeActiviteST;
  date_envoi_prevue?: string;
  date_envoi_reel?: string;
  date_retour_prevue: string;
  date_retour_reel?: string;
  date_livraison_prevue?: string;
  instructions_speciales?: string;
  quantite_envoyee: number;
  quantite_retournee: number;
  quantite_rejetee?: number;
  quantite_perdue?: number;
  motif_rejet?: string;
  cout_prestation_ht?: number;
  statut:
    | 'en_preparation' | 'expedie' | 'chez_st'
    | 'en_retour_partiel' | 'retour_complet' | 'litige' | 'annule';
  signature_sortie_svg?: string;
  signature_recepteur_svg?: string;
  signature_retour_svg?: string;
  photos_urls?: string[];
  litige_en_cours?: boolean;
  motif_litige?: string;
  controle_qualite?: ControleQualiteExpress;
  date_controle?: string;
  controle_par?: number;
  notes?: string;
}

export interface ControleQualiteExpress {
  defauts_couture?: boolean;
  defauts_teinture?: boolean;
  defauts_dimension?: boolean;
  defauts_autre?: boolean;
  autre_description?: string;
  photo_url?: string;
}

export interface AnomalieST {
  id_anomalie: number;
  id_soustraitant: number;
  gravite: GraviteAnomalie;
  type_anomalie: string;
  description?: string;
  numero_suivi?: string;
  id_of?: number;
  date_anomalie: string;
  qte_sortie?: number;
  qte_retour?: number;
  detaille?: string;
  proposition?: string;
  resolu: boolean;
  resolu_par?: number;
  date_resolution?: string;
  commentaire_resolution?: string;
}

export interface StatsGlobalST {
  nb_actifs: number;
  nb_inactifs: number;
  creances_total: number;
  travaux_en_cours: number;
  anomalies_ouvertes: number;
  bons_ouverts: number;
}

export interface StatsParType {
  type_activite: TypeActiviteST;
  nb_actifs: number;
  nb_inactifs: number;
  creances_total: number;
  qualite_moyenne?: number;
}

type Envelope<T> = { success: boolean; data: T; meta?: any; error?: any };

const unwrap = <T>(r: { data: Envelope<T> }): T => r.data?.data as T;
const unwrapMeta = <T>(r: { data: Envelope<T> }): { data: T; meta?: any } =>
  ({ data: r.data?.data as T, meta: r.data?.meta });

// ─── Sous-traitants ───────────────────────────────────────────────────
export const soustraitantsApi = {
  list: (p?: { type_activite?: TypeActiviteST; actif?: boolean; q?: string; limit?: number; offset?: number }) =>
    api.get<Envelope<SousTraitant[]>>('/v2/sous-traitance/sous-traitants', { params: p }).then(unwrapMeta),
  detail: (id: number | string) =>
    api.get<Envelope<SousTraitant>>(`/v2/sous-traitance/sous-traitants/${id}`).then(unwrap),
  create: (payload: Partial<SousTraitant> & { solde_initial?: number }) =>
    api.post<Envelope<SousTraitant>>('/v2/sous-traitance/sous-traitants', payload).then(unwrap),
  update: (id: number | string, patch: Partial<SousTraitant>) =>
    api.put<Envelope<SousTraitant>>(`/v2/sous-traitance/sous-traitants/${id}`, patch).then(unwrap),
  remove: (id: number | string) =>
    api.delete<Envelope<any>>(`/v2/sous-traitance/sous-traitants/${id}`).then(unwrap),
  compte: (id: number | string) =>
    api.get<Envelope<CompteSousTraitant>>(`/v2/sous-traitance/sous-traitants/${id}/compte`).then(unwrap),
  travaux: (id: number | string) =>
    api.get<Envelope<TravailST[]>>(`/v2/sous-traitance/sous-traitants/${id}/travaux`).then(unwrap),
  bons: (id: number | string) =>
    api.get<Envelope<BonST[]>>(`/v2/sous-traitance/sous-traitants/${id}/bons`).then(unwrap),
  stats: () =>
    api.get<Envelope<{ global: StatsGlobalST; par_type: StatsParType[] }>>('/v2/sous-traitance/sous-traitants/stats').then(unwrap),
  anomalies: (p?: { id_soustraitant?: number; resolu?: boolean; gravite?: GraviteAnomalie }) =>
    api.get<Envelope<AnomalieST[]>>('/v2/sous-traitance/sous-traitants/anomalies', { params: p }).then(unwrap),
  anomalieCreate: (payload: Partial<AnomalieST>) =>
    api.post<Envelope<AnomalieST>>('/v2/sous-traitance/sous-traitants/anomalies', payload).then(unwrap),
  anomalieResolve: (id: number | string, commentaire_resolution?: string) =>
    api.post<Envelope<AnomalieST>>(`/v2/sous-traitance/sous-traitants/anomalies/${id}/resolve`, { commentaire_resolution }).then(unwrap),
};

// ─── Travaux ──────────────────────────────────────────────────────────
export const travauxApi = {
  list: (p?: { id_soustraitant?: number; type_activite?: TypeActiviteST; statut?: StatutTravailST; date_from?: string; date_to?: string }) =>
    api.get<Envelope<TravailST[]>>('/v2/sous-traitance/travaux', { params: p }).then(unwrap),
  detail: (id: number | string) =>
    api.get<Envelope<TravailST>>(`/v2/sous-traitance/travaux/${id}`).then(unwrap),
  create: (payload: Partial<TravailST>) =>
    api.post<Envelope<TravailST>>('/v2/sous-traitance/travaux', payload).then(unwrap),
  update: (id: number | string, patch: Partial<TravailST>) =>
    api.put<Envelope<TravailST>>(`/v2/sous-traitance/travaux/${id}`, patch).then(unwrap),
  valider: (id: number | string) =>
    api.post<Envelope<TravailST>>(`/v2/sous-traitance/travaux/${id}/valider`).then(unwrap),
  refuser: (id: number | string, motif_refus: string) =>
    api.post<Envelope<TravailST>>(`/v2/sous-traitance/travaux/${id}/refuser`, { motif_refus }).then(unwrap),
  payer: (id: number | string, reference_paiement?: string) =>
    api.post<Envelope<TravailST>>(`/v2/sous-traitance/travaux/${id}/payer`, { reference_paiement }).then(unwrap),
  stats: () =>
    api.get<Envelope<any[]>>('/v2/sous-traitance/travaux/stats').then(unwrap),
  parMois: (months_back = 6) =>
    api.get<Envelope<any[]>>('/v2/sous-traitance/travaux/par-mois', { params: { months_back } }).then(unwrap),
};

// ─── Bons sortie / retour ─────────────────────────────────────────────
export const bonsSTApi = {
  list: (p?: { id_soustraitant?: number; statut?: BonST['statut'] }) =>
    api.get<Envelope<BonST[]>>('/v2/sous-traitance/bons', { params: p }).then(unwrap),
  detail: (id: number | string) =>
    api.get<Envelope<BonST>>(`/v2/sous-traitance/bons/${id}`).then(unwrap),
  signer: (id: number | string, role: 'sortie' | 'recepteur' | 'retour', svg: string) =>
    api.post<Envelope<BonST>>(`/v2/sous-traitance/bons/${id}/signer`, { role, svg }).then(unwrap),
  controle: (id: number | string, payload: {
    quantite_retournee?: number;
    quantite_rejetee?: number;
    motif_rejet?: string;
    controle_qualite?: ControleQualiteExpress;
    signature_retour_svg?: string;
  }) =>
    api.post<Envelope<BonST>>(`/v2/sous-traitance/bons/${id}/controle`, payload).then(unwrap),
  stats: () =>
    api.get<Envelope<any>>('/v2/sous-traitance/bons/stats').then(unwrap),
};

// ─── Comptes ──────────────────────────────────────────────────────────
export const comptesSTApi = {
  list: () =>
    api.get<Envelope<CompteSousTraitant[]>>('/v2/sous-traitance/comptes').then(unwrap),
  detail: (id: number | string) =>
    api.get<Envelope<CompteSousTraitant>>(`/v2/sous-traitance/comptes/${id}`).then(unwrap),
  mouvements: (id: number | string) =>
    api.get<Envelope<MouvementCompteST[]>>(`/v2/sous-traitance/comptes/${id}/mouvements`).then(unwrap),
  ajustement: (p: { id_compte_st: number; montant: number; libelle?: string; reference?: string }) =>
    api.post<Envelope<MouvementCompteST>>('/v2/sous-traitance/comptes/ajustement', p).then(unwrap),
  compensation: (p: { id_compte_st: number; montant: number; libelle?: string; reference?: string }) =>
    api.post<Envelope<MouvementCompteST>>('/v2/sous-traitance/comptes/compensation', p).then(unwrap),
  paiement: (p: { id_compte_st: number; montant: number; libelle?: string; reference?: string }) =>
    api.post<Envelope<MouvementCompteST>>('/v2/sous-traitance/comptes/paiement', p).then(unwrap),
  creance: (p: { id_compte_st: number; montant: number; libelle?: string; id_travail?: number; reference?: string }) =>
    api.post<Envelope<MouvementCompteST>>('/v2/sous-traitance/comptes/creance', p).then(unwrap),
};

// Helpers formattage
export const fmtMoney = (n: number | null | undefined, currency = 'TND') =>
  (n ?? 0).toLocaleString('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 });
export const fmtInt = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString('fr-FR');
export const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export const TYPE_ACTIVITE_LABEL: Record<TypeActiviteST, string> = {
  ourdissage: 'Ourdissage',
  nouage: 'Nouage',
  tissage: 'Tissage',
  frange: 'Franges',
  couture: 'Couture',
  teinture: 'Teinture',
  broderie: 'Broderie',
  personnalisation: 'Personnalisation',
  finition: 'Finition',
  autre: 'Autre',
};

export const TYPE_ACTIVITE_TONE: Record<TypeActiviteST, 'terracotta' | 'sage' | 'indigo' | 'gold'> = {
  ourdissage: 'terracotta',
  nouage: 'terracotta',
  tissage: 'terracotta',
  frange: 'sage',
  couture: 'sage',
  teinture: 'indigo',
  broderie: 'indigo',
  personnalisation: 'gold',
  finition: 'gold',
  autre: 'gold',
};
