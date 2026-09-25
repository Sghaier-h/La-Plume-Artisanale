/**
 * rhApi.ts — client API pour les modules RH (§11bis domain.md)
 *
 * Endpoints backend `/api/v2/rh/*` :
 *  - contrats               (§11bis.2)
 *  - structure organisation (§11bis.3)
 *  - sanctions / primes     (§11bis.7)
 *  - bulletins de paie      (§11bis.8)
 *  - paie Tunisie / CNSS    (§11bis.9)
 *  - formations             (§11bis.10)
 *
 * BaseURL et intercepteurs (JWT + société active + 401/429) hérités du
 * singleton `api`.
 */

import api from './api';

// ═══════════════════════════════════════════════════════════════════════
// Types partagés
// ═══════════════════════════════════════════════════════════════════════

export type TypeContrat = 'CDI' | 'CDD' | 'STAGE' | 'APPRENTISSAGE' | 'INTERIM';
export type StatutContrat = 'actif' | 'expire' | 'rompu' | 'a_venir' | 'en_essai';

export interface ContratTravail {
  id_contrat: number;
  numero_contrat: string;                // format CT-{YY}-{NNNN}
  id_employe: number;
  employe_nom?: string;
  employe_prenom?: string;
  fonction?: string;
  type_contrat: TypeContrat;
  date_debut: string;                    // ISO YYYY-MM-DD
  date_fin?: string | null;              // null si CDI
  periode_essai_jours?: number;
  date_fin_essai?: string | null;
  salaire_base_dt: number;
  coefficient_convention?: string;       // ex. "III-2" JORT N°49
  categorie_convention?: string;         // ex. "Contremaître tissage"
  statut: StatutContrat;
  date_rupture?: string;
  motif_rupture?: string;
  pdf_url?: string;
  cree_par?: number;
  created_at?: string;
  updated_at?: string;
}

export type CategorieOrga = 'service' | 'fonction' | 'equipe';

export interface Service {
  id_service: number;
  code: string;                          // DIR / PROD / COM / ADM
  libelle: string;                       // "Direction générale"
  responsable?: string;
  effectif: number;
  parent_id?: number | null;
}

export interface Fonction {
  id_fonction: number;
  libelle: string;                       // "Ouvrier tissage"
  categorie: string;                     // "Ouvrier / Employé / Cadre"
  coefficient_convention: string;        // "II-1"
  salaire_min_dt: number;                // grille JORT N°49
  salaire_max_dt: number;
  smig_reference: boolean;               // true = niveau SMIG
}

export interface Equipe {
  id_equipe: number;
  libelle: string;                       // "Équipe Tissage matin"
  atelier?: string;
  id_chef?: number;
  chef_nom?: string;
  effectif: number;
}

export type CategorieSanction =
  | 'rappel_oral'
  | 'avertissement_ecrit'
  | 'blame'
  | 'mise_a_pied_1j'
  | 'mise_a_pied_3j'
  | 'derniere_mise_en_demeure'
  | 'licenciement';

export type CategoriePrime =
  | 'anciennete'
  | 'rendement'
  | '13e_mois'
  | 'panier'
  | 'transport'
  | 'mariage'
  | 'naissance'
  | 'deces'
  | 'exceptionnelle';

export type TypeSanctionPrime = 'sanction' | 'prime';

export interface SanctionPrime {
  id_ligne: number;
  type_ligne: TypeSanctionPrime;
  id_employe: number;
  employe_nom?: string;
  employe_prenom?: string;
  date_evenement: string;
  categorie: CategorieSanction | CategoriePrime;
  libelle: string;
  motif?: string;
  montant_dt?: number;                   // pour primes
  duree_jours?: number;                  // pour mise à pied
  applique_par?: number;
  pdf_url?: string;
  created_at?: string;
}

export interface LigneBulletin {
  code: string;                          // 1010, 1060, 2010, 4000...
  libelle: string;
  base?: number;
  taux?: number;
  gain?: number;
  retenue?: number;
}

export interface BulletinPaie {
  id_bulletin: number;
  numero_bulletin: string;               // BP-{YYYY}-{MM}-{XXX}
  id_employe: number;
  employe_nom?: string;
  employe_prenom?: string;
  fonction?: string;
  matricule?: string;
  cin?: string;
  cnss_num?: string;
  mois: number;                          // 1..12
  annee: number;
  jours_travailles: number;
  heures_travaillees: number;
  salaire_brut: number;
  cnss_9_18: number;                     // CNSS employé 9.18%
  imposable: number;
  irpp: number;
  css: number;                           // Contribution Sociale Solidarité
  avances: number;
  autres_retenues: number;
  net_a_payer: number;
  lignes: LigneBulletin[];
  date_generation?: string;
  date_paiement?: string;
  pdf_url?: string;
  statut: 'brouillon' | 'valide' | 'paye';
}

export interface PaieMensuelle {
  mois: number;
  annee: number;
  masse_brute: number;
  masse_nette: number;
  cnss_employeur: number;                // 16.57%
  cnss_employe: number;                  // 9.18%
  irpp_total: number;
  css_total: number;
  tfp: number;                           // 2% Taxe Formation Prof.
  foprolos: number;                      // 1% logement social
  nb_employes: number;
  nb_bulletins: number;
  statut: 'ouvert' | 'valide' | 'cloture';
}

export interface TrancheIRPP {
  min_dt: number;
  max_dt: number | null;
  taux_pct: number;
}

export type ObligationTFP = 'obligatoire' | 'volontaire';

export interface Formation {
  id_formation: number;
  intitule: string;
  organisme_nom: string;
  organisme_type: 'interne' | 'externe';
  cout_dt: number;
  nb_participants: number;
  date_debut: string;
  date_fin: string;
  obligation_tfp: ObligationTFP;
  duree_heures: number;
  certifiante: boolean;
  domaine?: string;                      // "Sécurité / Technique / Management"
  participants_ids?: number[];
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
  created_at?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// Endpoints
// ═══════════════════════════════════════════════════════════════════════

export const contratsService = {
  list: (params?: { statut?: StatutContrat; type?: TypeContrat; id_employe?: number }) =>
    api.get('/v2/rh/contrats', { params }),
  get: (id: number) => api.get(`/v2/rh/contrats/${id}`),
  create: (data: Partial<ContratTravail>) => api.post('/v2/rh/contrats', data),
  update: (id: number, data: Partial<ContratTravail>) =>
    api.put(`/v2/rh/contrats/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/contrats/${id}`),
  renouveler: (id: number, payload: { date_fin: string; salaire_base_dt?: number }) =>
    api.post(`/v2/rh/contrats/${id}/renouveler`, payload),
  genererAvenant: (id: number) => api.post(`/v2/rh/contrats/${id}/avenant`),
  pdfUrl: (id: number) => `/v2/rh/contrats/${id}/pdf`,
};

export const structureOrgaService = {
  services: () => api.get('/v2/rh/structure/services'),
  fonctions: () => api.get('/v2/rh/structure/fonctions'),
  equipes: () => api.get('/v2/rh/structure/equipes'),
  updateService: (id: number, data: Partial<Service>) =>
    api.put(`/v2/rh/structure/services/${id}`, data),
  updateFonction: (id: number, data: Partial<Fonction>) =>
    api.put(`/v2/rh/structure/fonctions/${id}`, data),
  updateEquipe: (id: number, data: Partial<Equipe>) =>
    api.put(`/v2/rh/structure/equipes/${id}`, data),
};

export const sanctionsPrimesService = {
  list: (params?: {
    type_ligne?: TypeSanctionPrime;
    categorie?: string;
    id_employe?: number;
    date_debut?: string;
    date_fin?: string;
  }) => api.get('/v2/rh/sanctions-primes', { params }),
  get: (id: number) => api.get(`/v2/rh/sanctions-primes/${id}`),
  create: (data: Partial<SanctionPrime>) =>
    api.post('/v2/rh/sanctions-primes', data),
  update: (id: number, data: Partial<SanctionPrime>) =>
    api.put(`/v2/rh/sanctions-primes/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/sanctions-primes/${id}`),
};

export const bulletinsService = {
  list: (params?: { mois?: number; annee?: number; id_employe?: number; statut?: string }) =>
    api.get('/v2/rh/bulletins', { params }),
  get: (id: number) => api.get(`/v2/rh/bulletins/${id}`),
  generer: (payload: { mois: number; annee: number; ids_employes?: number[] }) =>
    api.post('/v2/rh/bulletins/generer', payload),
  valider: (id: number) => api.post(`/v2/rh/bulletins/${id}/valider`),
  marquerPaye: (id: number) => api.post(`/v2/rh/bulletins/${id}/marquer-paye`),
  pdfUrl: (id: number) => `/v2/rh/bulletins/${id}/pdf`,
  downloadPdf: (id: number) =>
    api.get(`/v2/rh/bulletins/${id}/pdf`, { responseType: 'blob' }),
};

export const paieTunisieService = {
  dashboard: (params: { mois: number; annee: number }) =>
    api.get('/v2/rh/paie-tunisie/dashboard', { params }),
  bordereauCNSS: (params: { trimestre: number; annee: number }) =>
    api.get('/v2/rh/paie-tunisie/cnss/bordereau', { params }),
  declarationIRPP: (params: { annee: number }) =>
    api.get('/v2/rh/paie-tunisie/irpp/declaration', { params }),
  grilleSalaires: () => api.get('/v2/rh/paie-tunisie/grille-salaires'),
  tranchesIRPP: () => api.get('/v2/rh/paie-tunisie/tranches-irpp'),
  cloturerMois: (mois: number, annee: number) =>
    api.post('/v2/rh/paie-tunisie/cloturer', { mois, annee }),
};

export const formationsService = {
  list: (params?: { statut?: string; annee?: number; obligation_tfp?: ObligationTFP }) =>
    api.get('/v2/rh/formations', { params }),
  get: (id: number) => api.get(`/v2/rh/formations/${id}`),
  create: (data: Partial<Formation>) => api.post('/v2/rh/formations', data),
  update: (id: number, data: Partial<Formation>) =>
    api.put(`/v2/rh/formations/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/formations/${id}`),
  budgetTFP: (annee: number) =>
    api.get('/v2/rh/formations/budget-tfp', { params: { annee } }),
};

export const rhApi = {
  contrats: contratsService,
  structure: structureOrgaService,
  sanctionsPrimes: sanctionsPrimesService,
  bulletins: bulletinsService,
  paieTunisie: paieTunisieService,
  formations: formationsService,
};

export default rhApi;
