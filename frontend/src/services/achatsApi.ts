import api from './api';

/**
 * achatsApi.ts — Services & types pour le module Achats & Fournisseurs.
 * Aligné sur §9 domain.md v2.9.
 *
 * Endpoints backend (peuvent être partiellement stubbés — chaque page utilise
 * un fallback mock côté frontend via Promise.allSettled).
 */

// ═══════════════════════════════════════════════════════════════════════
// TYPES PARTAGES
// ═══════════════════════════════════════════════════════════════════════

export type StatutDemandeAchat =
  | 'en_attente'
  | 'approuvee'
  | 'transformee_bc'
  | 'refusee'
  | 'annulee';

export interface DemandeAchat {
  id_demande_achat: number;
  numero_demande: string;
  demandee_par: number;
  demandee_par_nom?: string;
  service?: string;
  date_demande: string;
  motif: string;
  id_article?: number;
  designation?: string;
  quantite_demandee: number;
  unite?: string;
  urgence?: 'basse' | 'normale' | 'haute' | 'critique';
  date_besoin?: string;
  id_fournisseur_suggere?: number;
  fournisseur_suggere_nom?: string;
  statut: StatutDemandeAchat;
  id_bc?: number | null;
  approuvee_par?: number | null;
  approuvee_par_nom?: string;
}

export type StatutBc =
  | 'brouillon'
  | 'envoye'
  | 'confirme'
  | 'partiel'
  | 'livre'
  | 'annule';

export interface LigneBc {
  id_ligne_bc: number;
  id_bc: number;
  id_article?: number;
  designation_snapshot: string;
  quantite_commandee: number;
  quantite_recue: number;
  prix_unitaire_ht: number;
  remise_pct: number;
  taux_tva: number;
  montant_ht: number;
}

export interface BonCommande {
  id_bc: number;
  numero_bc: string;
  id_fournisseur: number;
  fournisseur_nom?: string;
  id_adresse_livraison?: number;
  date_commande: string;
  date_livraison_prevue?: string;
  mode_transport?: string;
  frais_port_ht?: number;
  conditions_paiement?: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  statut: StatutBc;
  cree_par?: number;
  notes?: string;
  lignes?: LigneBc[];
}

export type StatutReception = 'en_cours' | 'valide' | 'litige';

export interface LigneReception {
  id_ligne_reception: number;
  id_reception: number;
  id_ligne_bc?: number;
  id_article?: number;
  designation?: string;
  quantite_recue: number;
  quantite_conforme: number;
  quantite_rebut: number;
  numero_lot_fournisseur?: string;
  date_peremption?: string;
  notes_qualite?: string;
}

export interface ReceptionFf {
  id_reception: number;
  numero_reception: string;
  id_bc?: number | null;
  numero_bc?: string;
  id_fournisseur: number;
  fournisseur_nom?: string;
  id_entrepot_reception?: number;
  entrepot_nom?: string;
  date_reception: string;
  numero_bl_fournisseur?: string;
  receptionne_par?: number;
  receptionne_par_nom?: string;
  statut: StatutReception;
  ecart_detecte?: boolean;
  notes?: string;
  lignes?: LigneReception[];
}

export type StatutFactureFournisseur =
  | 'en_attente_paiement'
  | 'payee_partiel'
  | 'payee'
  | 'en_litige'
  | 'annulee';

export interface FactureFournisseur {
  id_facture_fournisseur: number;
  numero_ff_interne: string;
  numero_facture_fournisseur: string;
  id_fournisseur: number;
  fournisseur_nom?: string;
  bc_lies?: number[];
  bc_numeros?: string[];
  date_facture: string;
  date_reception_facture?: string;
  date_echeance: string;
  montant_ht: number;
  montant_tva: number;
  montant_ttc: number;
  devise?: string;
  taux_change?: number;
  montant_ht_tnd?: number;
  statut: StatutFactureFournisseur;
  pdf_facture_url?: string;
  notes?: string;
}

export type PeriodiciteContrat =
  | 'mensuelle'
  | 'trimestrielle'
  | 'annuelle'
  | 'a_la_demande';

export type CategorieContratService =
  | 'loyer'
  | 'maintenance'
  | 'telecoms'
  | 'honoraires'
  | 'assurance'
  | 'internet'
  | 'electricite'
  | 'eau'
  | 'autre';

export type StatutContratService = 'actif' | 'a_renouveler' | 'resilie';

export interface ContratService {
  id_contrat_service: number;
  numero_contrat?: string;
  libelle: string;
  id_fournisseur: number;
  fournisseur_nom?: string;
  categorie: CategorieContratService;
  date_debut: string;
  date_fin?: string;
  montant_annuel_ht: number;
  montant_mensuel_ht?: number;
  periodicite_facturation: PeriodiciteContrat;
  renouvellement_auto: boolean;
  date_prochaine_facturation_prevue?: string;
  statut: StatutContratService;
  pdf_contrat_url?: string;
  notes?: string;
}

export type CategorieDepenseEspeces =
  | 'pourboire'
  | 'transport_local'
  | 'petite_fourniture'
  | 'restauration_atelier'
  | 'cafe_ouvriers'
  | 'depannage'
  | 'divers';

export type ModeDepense = 'petite_caisse' | 'perso_rembourse';

export type StatutComptaDepense =
  | 'non_comptabilise'
  | 'comptabilise_bloc'
  | 'comptabilise_individuel';

export interface DepenseEspeces {
  id_depense: number;
  date_depense: string;
  libelle: string;
  montant: number;
  categorie: CategorieDepenseEspeces;
  mode: ModeDepense;
  description?: string;
  photo_ticket_url?: string;
  saisi_par?: number;
  saisi_par_nom?: string;
  valide_par?: number | null;
  statut_compta: StatutComptaDepense;
}

export type ModePaiementFf =
  | 'virement'
  | 'cheque'
  | 'especes'
  | 'lettre_change'
  | 'traite';

export interface PaiementFournisseur {
  id_paiement_fournisseur: number;
  numero_paiement?: string;
  id_fournisseur: number;
  fournisseur_nom?: string;
  factures_soldees?: string[];
  ids_factures?: number[];
  date_paiement: string;
  montant: number;
  mode_paiement: ModePaiementFf;
  reference_paiement?: string;
  compte_source?: string;
  valide_par?: number;
  notes?: string;
}

export type Match3wayStatut = 'conforme' | 'ecart' | 'manquant';

export interface Match3wayLigne {
  id_ligne: string;
  id_bc: number;
  numero_bc: string;
  fournisseur_nom: string;
  id_fournisseur: number;
  date_bc: string;
  designation: string;
  qte_bc: number;
  qte_recue?: number;
  qte_facturee?: number;
  montant_bc?: number;
  montant_ff?: number;
  statut_bc: Match3wayStatut;
  statut_reception: Match3wayStatut;
  statut_facture: Match3wayStatut;
  ecart_pct?: number;
  numero_reception?: string;
  numero_ff?: string;
  justification?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICES
// ═══════════════════════════════════════════════════════════════════════

export const demandesAchatService = {
  getDemandes: (params?: any) => api.get('/demandes-achat', { params }),
  getDemande: (id: number) => api.get(`/demandes-achat/${id}`),
  createDemande: (data: any) => api.post('/demandes-achat', data),
  updateDemande: (id: number, data: any) => api.put(`/demandes-achat/${id}`, data),
  deleteDemande: (id: number) => api.delete(`/demandes-achat/${id}`),
  approuver: (id: number, data?: any) =>
    api.post(`/demandes-achat/${id}/approuver`, data || {}),
  refuser: (id: number, motif?: string) =>
    api.post(`/demandes-achat/${id}/refuser`, { motif }),
  transformerEnBc: (id: number, data?: any) =>
    api.post(`/demandes-achat/${id}/transformer-bc`, data || {}),
};

export const bcService = {
  getBcs: (params?: any) => api.get('/bc', { params }),
  getBc: (id: number) => api.get(`/bc/${id}`),
  createBc: (data: any) => api.post('/bc', data),
  updateBc: (id: number, data: any) => api.put(`/bc/${id}`, data),
  deleteBc: (id: number) => api.delete(`/bc/${id}`),
  envoyer: (id: number, data?: any) => api.post(`/bc/${id}/envoyer`, data || {}),
  confirmer: (id: number) => api.post(`/bc/${id}/confirmer`),
  downloadPdf: (id: number) =>
    api.get(`/bc/${id}/pdf`, { responseType: 'blob' }),
};

export const receptionsService = {
  getReceptions: (params?: any) => api.get('/receptions', { params }),
  getReception: (id: number) => api.get(`/receptions/${id}`),
  createReception: (data: any) => api.post('/receptions', data),
  updateReception: (id: number, data: any) =>
    api.put(`/receptions/${id}`, data),
  valider: (id: number, data?: any) =>
    api.post(`/receptions/${id}/valider`, data || {}),
  signalerEcart: (id: number, data: { motif: string }) =>
    api.post(`/receptions/${id}/litige`, data),
};

export const facturesFournisseurService = {
  getFactures: (params?: any) => api.get('/factures-fournisseur', { params }),
  getFacture: (id: number) => api.get(`/factures-fournisseur/${id}`),
  createFacture: (data: any) => api.post('/factures-fournisseur', data),
  updateFacture: (id: number, data: any) =>
    api.put(`/factures-fournisseur/${id}`, data),
  deleteFacture: (id: number) => api.delete(`/factures-fournisseur/${id}`),
  comptabiliser: (id: number) =>
    api.post(`/factures-fournisseur/${id}/comptabiliser`),
  payer: (id: number, data: any) =>
    api.post(`/factures-fournisseur/${id}/payer`, data),
};

export const contratsServicesService = {
  getContrats: (params?: any) => api.get('/contrats-services', { params }),
  getContrat: (id: number) => api.get(`/contrats-services/${id}`),
  createContrat: (data: any) => api.post('/contrats-services', data),
  updateContrat: (id: number, data: any) =>
    api.put(`/contrats-services/${id}`, data),
  deleteContrat: (id: number) => api.delete(`/contrats-services/${id}`),
  getEcheancesProches: (jours = 30) =>
    api.get('/contrats-services/echeances-proches', { params: { jours } }),
};

export const depensesEspecesService = {
  getDepenses: (params?: any) => api.get('/depenses-espece', { params }),
  getDepense: (id: number) => api.get(`/depenses-espece/${id}`),
  createDepense: (data: any) => api.post('/depenses-espece', data),
  updateDepense: (id: number, data: any) =>
    api.put(`/depenses-espece/${id}`, data),
  deleteDepense: (id: number) => api.delete(`/depenses-espece/${id}`),
  comptabiliserBloc: (ids: number[]) =>
    api.post('/depenses-espece/comptabiliser-bloc', { ids }),
  getRapport: (params?: { periode?: string; categorie?: string }) =>
    api.get('/depenses-espece/rapport', { params }),
};

export const paiementsFournisseursService = {
  getPaiements: (params?: any) => api.get('/paiements-fournisseurs', { params }),
  getPaiement: (id: number) => api.get(`/paiements-fournisseurs/${id}`),
  createPaiement: (data: any) => api.post('/paiements-fournisseurs', data),
  updatePaiement: (id: number, data: any) =>
    api.put(`/paiements-fournisseurs/${id}`, data),
  genererVirement: (id: number) =>
    api.post(`/paiements-fournisseurs/${id}/generer-virement`),
};

export const rapprochementService = {
  getRapprochement: (params?: {
    id_fournisseur?: number;
    date_debut?: string;
    date_fin?: string;
  }) => api.get('/rapprochement/bc-rec-ff', { params }),
  getRapprochementParBc: (id_bc: number) =>
    api.get(`/rapprochement/bc-rec-ff/${id_bc}`),
  justifierEcart: (id_ligne: string, data: { justification: string }) =>
    api.post(`/rapprochement/${id_ligne}/justifier`, data),
  validerMatch: (id_ligne: string) =>
    api.post(`/rapprochement/${id_ligne}/valider`),
};
