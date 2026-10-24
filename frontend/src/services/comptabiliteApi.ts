import api from './api';

/**
 * comptabiliteApi.ts — services pour le module Comptabilité (Phase 4)
 * Endpoints (§10 domain.md v2.2 · SYSCOA simplifié Tunisie) :
 *   /api/v2/comptabilite/{ecritures, tva, caisse, cloture, ...}
 *
 * Les modules encore stubbés côté backend (plan-comptes, rapprochement,
 * immobilisations, rapports) utilisent le préfixe standard et se
 * rabattent automatiquement sur des données mock côté frontend.
 */

// ─── Plan comptable ─────────────────────────────────────────────────
export const planComptesService = {
  getComptes: (params?: any) => api.get('/v2/comptabilite/plan-comptes', { params }),
  getCompte: (id: number) => api.get(`/v2/comptabilite/plan-comptes/${id}`),
  createCompte: (data: Partial<CompteComptable>) =>
    api.post('/v2/comptabilite/plan-comptes', data),
  updateCompte: (id: number, data: Partial<CompteComptable>) =>
    api.put(`/v2/comptabilite/plan-comptes/${id}`, data),
  deleteCompte: (id: number) => api.delete(`/v2/comptabilite/plan-comptes/${id}`),
  getSoldes: (params?: { periode?: string }) =>
    api.get('/v2/comptabilite/plan-comptes/soldes', { params }),
};

// ─── Écritures comptables ───────────────────────────────────────────
export const ecrituresService = {
  getEcritures: (params?: any) => api.get('/v2/comptabilite/ecritures', { params }),
  getEcriture: (id: number) => api.get(`/v2/comptabilite/ecritures/${id}`),
  createEcriture: (data: Partial<EcritureComptable>) =>
    api.post('/v2/comptabilite/ecritures', data),
  updateEcriture: (id: number, data: Partial<EcritureComptable>) =>
    api.put(`/v2/comptabilite/ecritures/${id}`, data),
  deleteEcriture: (id: number) => api.delete(`/v2/comptabilite/ecritures/${id}`),
  valider: (id: number) => api.post(`/v2/comptabilite/ecritures/${id}/valider`),
  annuler: (id: number) => api.post(`/v2/comptabilite/ecritures/${id}/annuler`),
  verrouillerPeriode: (periode: string) =>
    api.post('/v2/comptabilite/ecritures/verrouiller', { periode }),
};

// ─── Rapprochement bancaire ─────────────────────────────────────────
export const rapprochementService = {
  getReleves: (params?: any) => api.get('/v2/comptabilite/rapprochement/releves', { params }),
  getLignesNonRapprochees: (id_releve: number) =>
    api.get(`/v2/comptabilite/rapprochement/releves/${id_releve}/non-rapprochees`),
  getEcrituresBanque: (params?: { compte?: string; periode?: string }) =>
    api.get('/v2/comptabilite/rapprochement/ecritures-banque', { params }),
  matcher: (payload: { id_ligne_releve: number; id_ecriture: number }) =>
    api.post('/v2/comptabilite/rapprochement/matcher', payload),
  demarcher: (id_ligne_releve: number) =>
    api.post(`/v2/comptabilite/rapprochement/lignes/${id_ligne_releve}/demarcher`),
  importReleve: (data: FormData) =>
    api.post('/v2/comptabilite/rapprochement/releves', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Caisse ─────────────────────────────────────────────────────────
export const caisseService = {
  getCaisses: () => api.get('/v2/comptabilite/caisse/caisses'),
  getMouvements: (id_caisse: number, params?: any) =>
    api.get(`/v2/comptabilite/caisse/caisses/${id_caisse}/mouvements`, { params }),
  addMouvement: (id_caisse: number, data: Partial<MouvementCaisse>) =>
    api.post(`/v2/comptabilite/caisse/caisses/${id_caisse}/mouvements`, data),
  cloturerJour: (id_caisse: number, solde_reel: number) =>
    api.post(`/v2/comptabilite/caisse/caisses/${id_caisse}/cloturer-jour`, { solde_reel }),
  comptabiliserBloc: (id_caisse: number, ids: number[]) =>
    api.post(`/v2/comptabilite/caisse/caisses/${id_caisse}/comptabiliser-bloc`, { ids }),
};

// ─── Immobilisations ────────────────────────────────────────────────
export const immobilisationsService = {
  getImmobilisations: (params?: any) =>
    api.get('/v2/comptabilite/immobilisations', { params }),
  getImmobilisation: (id: number) =>
    api.get(`/v2/comptabilite/immobilisations/${id}`),
  createImmobilisation: (data: Partial<Immobilisation>) =>
    api.post('/v2/comptabilite/immobilisations', data),
  updateImmobilisation: (id: number, data: Partial<Immobilisation>) =>
    api.put(`/v2/comptabilite/immobilisations/${id}`, data),
  deleteImmobilisation: (id: number) =>
    api.delete(`/v2/comptabilite/immobilisations/${id}`),
  genererDotationsAnnuelles: (annee: number) =>
    api.post('/v2/comptabilite/immobilisations/generer-dotations', { annee }),
};

// ─── TVA ────────────────────────────────────────────────────────────
export const tvaService = {
  getDeclarations: (params?: any) =>
    api.get('/v2/comptabilite/tva/declarations', { params }),
  getDeclaration: (periode: string) =>
    api.get(`/v2/comptabilite/tva/declarations/${periode}`),
  genererDeclaration: (periode: string) =>
    api.post(`/v2/comptabilite/tva/declarations/${periode}/generer`),
  marquerPayee: (periode: string, date_paiement: string) =>
    api.post(`/v2/comptabilite/tva/declarations/${periode}/payer`, { date_paiement }),
  telechargerPdf: (periode: string) =>
    api.get(`/v2/comptabilite/tva/declarations/${periode}/pdf`, { responseType: 'blob' }),
};

// ─── Rapports comptables ────────────────────────────────────────────
export const rapportsService = {
  compteResultat: (params: { exercice: number; comparaison?: boolean }) =>
    api.get('/v2/comptabilite/rapports/compte-resultat', { params }),
  bilan: (params: { exercice: number; comparaison?: boolean }) =>
    api.get('/v2/comptabilite/rapports/bilan', { params }),
  grandLivre: (params: { compte: string; periode?: string }) =>
    api.get('/v2/comptabilite/rapports/grand-livre', { params }),
  balance: (params: { periode: string }) =>
    api.get('/v2/comptabilite/rapports/balance', { params }),
  exportPdf: (rapport: string, params: any) =>
    api.get(`/v2/comptabilite/rapports/${rapport}/pdf`, { params, responseType: 'blob' }),
  exportExcel: (rapport: string, params: any) =>
    api.get(`/v2/comptabilite/rapports/${rapport}/excel`, { params, responseType: 'blob' }),
};

// ═══════════════════════════════════════════════════════════════════
// PHASE A — COMPTABILITÉ ÉTENDUE (§14quater)
// ═══════════════════════════════════════════════════════════════════

export type TypeCaisseEtendue =
  | 'principale' | 'cheques_clients' | 'compensation'
  | 'apport_gerant' | 'showroom' | 'custom';

export interface CaisseEtendue {
  id_caisse: number;
  code: string;
  libelle: string;
  type_caisse: TypeCaisseEtendue;
  ordre: number;
  solde_initial: number;
  solde_theorique: number;
  solde_calcule?: number;
  actif: boolean;
  compte_compta?: string;
  responsable?: number;
}

export interface MouvementCaisseEtendu {
  id_mouvement: number;
  id_caisse: number;
  date_mouvement: string;
  type_mvt: 'entree' | 'sortie' | 'transfert';
  montant: number;
  mode_paiement?: string;
  libelle?: string;
  id_piece_liee?: number;
  piece_type?: string;
  cree_par?: number;
  justificatif_url?: string;
}

export interface RoutageCaisse {
  id_routage: number;
  mode_paiement: string;
  id_caisse_default: number;
  caisse_code: string;
  caisse_libelle: string;
  libelle?: string;
  actif: boolean;
}

export const caissesService = {
  list:         ()                            => api.get('/v2/comptabilite/caisses'),
  getOne:       (id: number)                  => api.get(`/v2/comptabilite/caisses/${id}`),
  create:       (data: Partial<CaisseEtendue>) => api.post('/v2/comptabilite/caisses', data),
  update:       (id: number, data: Partial<CaisseEtendue>) => api.put(`/v2/comptabilite/caisses/${id}`, data),
  remove:       (id: number)                  => api.delete(`/v2/comptabilite/caisses/${id}`),
  mouvements:   (id: number, params?: { date_from?: string; date_to?: string; limit?: number }) =>
                  api.get(`/v2/comptabilite/caisses/${id}/mouvements`, { params }),
  transfert:    (payload: { id_caisse_source: number; id_caisse_dest: number; montant: number; libelle?: string }) =>
                  api.post('/v2/comptabilite/caisses/transfert', payload),
  routage:      () => api.get('/v2/comptabilite/caisses/routage'),
};

export type StatutDossierImport = 'ouvert' | 'en_douane' | 'arrive' | 'liquide' | 'ferme' | 'annule';

export interface DossierImport {
  id_dossier: number;
  numero_dossier: string;
  date_ouverture: string;
  pays_origine: string;
  fournisseur_etranger: string;
  nb_colis?: number;
  poids_total_kg?: number;
  incoterm?: string;
  devise_etrangere?: string;
  taux_change?: number;
  cout_total_dt?: number;
  statut: StatutDossierImport;
  numero_declaration_douane?: string;
  date_dedouanement?: string;
  notes?: string;
  nb_lignes?: number;
  nb_frais?: number;
  total_frais_dt?: number;
}

export interface DossierImportLigne {
  id_ligne: number;
  id_dossier: number;
  description_marchandise: string;
  quantite: number;
  unite?: string;
  poids_kg?: number;
  prix_unitaire_devise?: number;
  montant_devise?: number;
  cout_prorata_kg?: number;
  id_article?: number;
}

export type TypeFraisImport =
  | 'fret' | 'assurance' | 'douane' | 'taxe'
  | 'transport_local' | 'manutention' | 'commission' | 'autre';

export interface DossierImportFrais {
  id_frais: number;
  id_dossier: number;
  type_frais: TypeFraisImport;
  libelle?: string;
  montant_dt: number;
  repartition_prorata: boolean;
  date_frais?: string;
}

export const dossiersImportService = {
  list:        (params?: { statut?: string; pays?: string }) => api.get('/v2/comptabilite/dossiers-import', { params }),
  kpi:         ()                            => api.get('/v2/comptabilite/dossiers-import/kpi'),
  getOne:      (id: number)                  => api.get(`/v2/comptabilite/dossiers-import/${id}`),
  create:      (data: Partial<DossierImport>) => api.post('/v2/comptabilite/dossiers-import', data),
  update:      (id: number, data: Partial<DossierImport>) => api.put(`/v2/comptabilite/dossiers-import/${id}`, data),
  addLigne:    (id: number, data: Partial<DossierImportLigne>) => api.post(`/v2/comptabilite/dossiers-import/${id}/lignes`, data),
  addFrais:    (id: number, data: Partial<DossierImportFrais>) => api.post(`/v2/comptabilite/dossiers-import/${id}/frais`, data),
  recalculer:  (id: number, data?: { marge_pct?: number }) => api.post(`/v2/comptabilite/dossiers-import/${id}/recalculer-cessions`, data || {}),
};

export type StatutCession = 'calculee' | 'vendue' | 'facturee' | 'soldee' | 'annulee';

export interface Cession {
  id_cession: number;
  cle_unique: string;
  numero_cession?: string;
  id_dossier_import?: number;
  numero_dossier?: string;
  pays_origine?: string;
  poids_kg?: number;
  cout_cession_dt: number;
  marge_pct?: number;
  statut: StatutCession;
  date_calcul: string;
  notes?: string;
}

export const cessionsService = {
  list:    (params?: { statut?: string; id_dossier_import?: number }) => api.get('/v2/comptabilite/cessions', { params }),
  getOne:  (id: number)                  => api.get(`/v2/comptabilite/cessions/${id}`),
  annuler: (id: number, motif?: string)  => api.post(`/v2/comptabilite/cessions/${id}/annuler`, { motif }),
};

export interface DepenseEspece {
  id_depense: number;
  id_caisse?: number;
  date_depense: string;
  categorie: string;
  libelle?: string;
  montant: number;
  beneficiaire?: string;
  signature_svg?: string;
  comptabilisee?: boolean;
  id_ecriture_bloc?: number;
  notes?: string;
}

export const depensesEspecesService = {
  list:        (params?: { periode?: string; id_caisse?: number; comptabilisee?: boolean }) =>
                  api.get('/v2/comptabilite/depenses-especes', { params }),
  totaux:      (periode: string)             => api.get('/v2/comptabilite/depenses-especes/totaux', { params: { periode } }),
  create:      (data: Partial<DepenseEspece>) => api.post('/v2/comptabilite/depenses-especes', data),
  update:      (id: number, data: Partial<DepenseEspece>) => api.put(`/v2/comptabilite/depenses-especes/${id}`, data),
  remove:      (id: number)                  => api.delete(`/v2/comptabilite/depenses-especes/${id}`),
  cloturerMois:(periode: string)             => api.post(`/v2/comptabilite/depenses-especes/cloturer-mois/${periode}`),
};

export type StatutCompensation = 'brouillon' | 'validee' | 'annulee';

export interface CompensationLigne {
  id_ligne_comp?: number;
  id_compensation?: number;
  sens: 'debit' | 'credit';
  id_tiers?: number;
  type_tiers: 'client' | 'fournisseur' | 'employe' | 'autre';
  nom_tiers?: string;
  libelle?: string;
  montant: number;
  id_piece_liee?: number;
  piece_type?: string;
}

export interface Compensation {
  id_compensation: number;
  numero_compensation: string;
  date_compensation: string;
  libelle: string;
  montant_total: number;
  statut: StatutCompensation;
  cree_par?: number;
  valide_par?: number;
  notes?: string;
  nb_lignes?: number;
  lignes?: CompensationLigne[];
}

export const compensationsService = {
  list:    (params?: { statut?: StatutCompensation }) => api.get('/v2/comptabilite/compensations', { params }),
  getOne:  (id: number)                 => api.get(`/v2/comptabilite/compensations/${id}`),
  create:  (data: { libelle: string; date_compensation?: string; notes?: string; lignes: CompensationLigne[] }) =>
             api.post('/v2/comptabilite/compensations', data),
  valider: (id: number)                 => api.post(`/v2/comptabilite/compensations/${id}/valider`),
  annuler: (id: number, motif?: string) => api.post(`/v2/comptabilite/compensations/${id}/annuler`, { motif }),
};

export interface RapprochementImport {
  id_import_bq: number;
  id_compte_bancaire?: number;
  date_import: string;
  fichier_source: string;
  format: 'ofx' | 'csv' | 'xlsx' | 'pdf';
  nb_lignes_total: number;
  nb_lignes_rapprochees: number;
  nb_rapprochees?: number;
  nb_non_matchees?: number;
}

export interface RapprochementLigne {
  id_ligne_bq: number;
  id_import_bq: number;
  date_valeur: string;
  libelle_bq: string;
  montant_debit?: number;
  montant_credit?: number;
  reference_bq?: string;
  matching_statut: 'non_matche' | 'suggere' | 'rapproche' | 'ignore';
  id_mouvement_journal_matche?: number;
  score_matching?: number;
}

export const rapprochementV2Service = {
  listImports:  ()                                => api.get('/v2/comptabilite/rapprochement/imports'),
  listLignes:   (params?: { id_import_bq?: number; matching_statut?: string }) =>
                   api.get('/v2/comptabilite/rapprochement/lignes', { params }),
  createImport: (data: { id_compte_bancaire?: number; fichier_source: string; format: string; lignes: any[] }) =>
                   api.post('/v2/comptabilite/rapprochement/imports', data),
  matchingAuto: (id_import_bq: number) =>
                   api.post(`/v2/comptabilite/rapprochement/${id_import_bq}/matching-auto`),
  rapprocher:   (id_ligne: number, id_mouvement_journal_matche: number) =>
                   api.post(`/v2/comptabilite/rapprochement/${id_ligne}/rapprocher`, { id_mouvement_journal_matche }),
  ignorer:      (id_ligne: number) =>
                   api.post(`/v2/comptabilite/rapprochement/${id_ligne}/ignorer`),
};

// ─── Apport gérant (§14quater.6) · ADMIN only ───────────────────────
export type TypeApportGerant = 'apport' | 'retrait';
export type ModePaiementApport = 'espece' | 'cheque' | 'virement';

export interface ApportGerantMouvement {
  id_mvt_apport: number;
  id_cca: number;
  montant: number;
  type_mvt: TypeApportGerant;
  mode_paiement: ModePaiementApport;
  id_caisse_destination: number;
  caisse_code?: string;
  caisse_libelle?: string;
  id_mouvement_caisse?: number;
  id_document_archive?: number;
  reference?: string | null;
  date_mouvement: string;
  libelle?: string | null;
  notes?: string | null;
  saisi_par?: number | null;
  cca_libelle?: string | null;
}

export interface SoldeCCA {
  id_cca: number | null;
  id_user_gerant: number;
  id_societe?: number | null;
  libelle?: string | null;
  solde_calcule: number;
  solde_stocke: number;
  nb_mouvements: number;
  dernier_mouvement?: string | null;
}

export interface SaisieApportPayload {
  montant: number;
  type_mvt: TypeApportGerant;
  mode_paiement: ModePaiementApport;
  id_caisse_destination: number;
  id_document_archive?: number | null;
  reference?: string | null;
  libelle?: string | null;
  notes?: string | null;
  id_user_gerant?: number;      // ADMIN peut saisir pour un autre gérant
  id_societe?: number | null;
}

export const apportGerantService = {
  saisir:     (payload: SaisieApportPayload) =>
                api.post('/v2/comptabilite/apport-gerant/saisir', payload),
  historique: (params?: { id_user_gerant?: number; id_societe?: number; limit?: number; offset?: number }) =>
                api.get('/v2/comptabilite/apport-gerant/historique', { params }),
  solde:      (params?: { id_user_gerant?: number; id_societe?: number }) =>
                api.get('/v2/comptabilite/apport-gerant/solde-cca', { params }),
};

// ─── Clôture d'exercice ─────────────────────────────────────────────
export const clotureService = {
  getEtat: (annee: number) => api.get(`/v2/comptabilite/cloture/${annee}/etat`),
  runEtape: (annee: number, etape: string) =>
    api.post(`/v2/comptabilite/cloture/${annee}/etapes/${etape}`),
  valider: (annee: number) => api.post(`/v2/comptabilite/cloture/${annee}/valider`),
  rouvrir: (annee: number) => api.post(`/v2/comptabilite/cloture/${annee}/rouvrir`),
};

// ═══════════════════════════════════════════════════════════════════
// TYPES PARTAGÉS
// ═══════════════════════════════════════════════════════════════════

export type TypeCompte = 'actif' | 'passif' | 'charges' | 'produits';
export type SousTypeCompte =
  | 'capitaux_propres'
  | 'dettes_fournisseurs'
  | 'banque'
  | 'caisse'
  | 'ventes'
  | 'achats'
  | 'charges_externes'
  | 'immobilisations'
  | 'stocks'
  | 'personnel'
  | 'etat'
  | 'tva'
  | 'autres';

export interface CompteComptable {
  id_compte_comptable: number;
  numero_compte: string;
  libelle: string;
  type_compte: TypeCompte;
  classe: number;
  sous_type?: SousTypeCompte;
  est_analytique?: boolean;
  est_tva?: boolean;
  actif: boolean;
  solde_ouverture?: number;
  mouvement_debit?: number;
  mouvement_credit?: number;
  solde_actuel?: number;
}

export type CodeJournal = 'VE' | 'AC' | 'BQ1' | 'BQ2' | 'CA' | 'OD' | 'PA';

export type StatutEcriture = 'brouillon' | 'validee' | 'cloturee';

export type TypePieceSource =
  | 'facture'
  | 'avoir'
  | 'paiement'
  | 'facture_fournisseur'
  | 'paiement_fournisseur'
  | 'salaire'
  | 'manuel';

export interface LigneEcriture {
  id_ligne?: number;
  id_ecriture?: number;
  id_compte_comptable: number;
  numero_compte?: string;
  libelle_compte?: string;
  libelle: string;
  debit: number;
  credit: number;
  id_tiers?: number;
  type_tiers?: 'client' | 'fournisseur' | 'personnel';
  nom_tiers?: string;
}

export interface EcritureComptable {
  id_ecriture: number;
  numero_ecriture: string;
  date_ecriture: string;
  date_piece?: string;
  libelle: string;
  id_journal: number | string;
  code_journal?: CodeJournal;
  id_piece_source?: number;
  type_piece_source?: TypePieceSource;
  montant_total: number;
  statut: StatutEcriture;
  saisi_par?: number;
  valide_par?: number;
  lignes?: LigneEcriture[];
}

// Rapprochement bancaire
export type StatutLigneReleve = 'non_rapprochee' | 'rapprochee' | 'en_litige';

export interface LigneReleveBancaire {
  id_ligne_releve: number;
  id_releve: number;
  date_operation: string;
  libelle_bancaire: string;
  montant_debit?: number;
  montant_credit?: number;
  reference_operation?: string;
  id_ecriture_rapprochee?: number;
  statut: StatutLigneReleve;
  notes?: string;
}

export interface EcritureBanque {
  id_ligne: number;
  id_ecriture: number;
  date_ecriture: string;
  libelle: string;
  debit: number;
  credit: number;
  numero_compte: string;
  rapprochee: boolean;
  id_ligne_releve?: number;
}

export interface RapprochementLigne {
  ligne_releve: LigneReleveBancaire;
  ecriture: EcritureBanque | null;
}

// Caisse
export type TypeMouvementCaisse =
  | 'encaissement_client'
  | 'decaissement_fournisseur'
  | 'salaire_liquide'
  | 'frais'
  | 'versement_banque'
  | 'retrait_banque'
  | 'ajustement_+'
  | 'ajustement_-';

export interface Caisse {
  id_caisse: number;
  code: string;
  libelle: string;
  id_compte_comptable: number;
  numero_compte?: string;
  solde_theorique: number;
  responsable_id_utilisateur?: number;
  responsable_nom?: string;
  actif: boolean;
}

export interface MouvementCaisse {
  id_mouvement_caisse: number;
  id_caisse: number;
  date_mouvement: string;
  type_mouvement: TypeMouvementCaisse;
  montant: number;
  motif?: string;
  id_paiement?: number;
  id_paiement_fournisseur?: number;
  piece_jointe_url?: string;
  id_ecriture?: number;
  saisi_par?: number;
  saisi_par_nom?: string;
  comptabilise?: boolean;
}

// Immobilisations
export type CategorieImmo =
  | 'materiel_industriel'
  | 'mobilier'
  | 'informatique'
  | 'vehicule'
  | 'batiment'
  | 'incorporel';

export type MethodeAmortissement = 'lineaire' | 'degressif';

export interface Immobilisation {
  id_immobilisation: number;
  numero_immo: string;
  libelle: string;
  categorie?: CategorieImmo;
  id_compte_comptable_immo: number;
  numero_compte_immo?: string;
  id_compte_comptable_amort?: number;
  id_compte_comptable_dotation?: number;
  date_acquisition: string;
  valeur_acquisition_ht: number;
  taux_amortissement_pct: number;
  duree_amortissement_annees: number;
  methode: MethodeAmortissement;
  date_mise_en_service?: string;
  date_fin_amortissement?: string;
  valeur_residuelle?: number;
  amortissement_cumule?: number;
  valeur_nette?: number;
  id_machine?: number;
  id_entrepot?: number;
  numero_serie?: string;
  fournisseur_origine_id?: number;
  fournisseur_origine_nom?: string;
  id_facture_fournisseur?: number;
  actif: boolean;
}

// TVA
export type StatutDeclarationTva = 'en_preparation' | 'soumise' | 'payee';

export interface DeclarationTva {
  id_declaration: number;
  periode: string; // "2026-09"
  date_declaration?: string;
  tva_collectee: number;
  tva_deductible: number;
  tva_due: number;
  date_paiement?: string;
  statut: StatutDeclarationTva;
  pdf_url?: string;
  detail?: {
    collectee_19?: number;
    collectee_13?: number;
    collectee_7?: number;
    deductible_biens?: number;
    deductible_services?: number;
    deductible_immo?: number;
  };
}

// Rapports comptables
export interface LigneRapport {
  libelle: string;
  code?: string;
  montant_n: number;
  montant_n1?: number;
  ecart?: number;
  ecart_pct?: number;
  enfants?: LigneRapport[];
  bold?: boolean;
}

export interface RapportCompta {
  exercice: number;
  date_generation: string;
  lignes: LigneRapport[];
  total_actif?: number;
  total_passif?: number;
  resultat_net?: number;
}

// Clôture d'exercice
export type StatutEtapeCloture = 'a_faire' | 'en_cours' | 'termine' | 'erreur';

export interface ClotureEtape {
  code: string;
  libelle: string;
  description: string;
  statut: StatutEtapeCloture;
  date_execution?: string;
  execute_par?: string;
  resultat?: string;
  bloquant?: boolean;
}

export interface EtatCloture {
  annee: number;
  statut_global: 'en_cours' | 'cloturee' | 'reouverte';
  progression_pct: number;
  etapes: ClotureEtape[];
  date_cloture?: string;
  cloturee_par?: string;
}
