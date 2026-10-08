/**
 * ventesComplementsApi.ts — API pour compléments Ventes (§8 domain.md)
 *
 * Endpoints backend `/api/v2/ventes/*` :
 *  - colisage        (§8.6) — colis d'une commande
 *  - palettes        (§8.7) — palettes groupant colis
 *  - transporteurs   (§8.7) — transporteurs & expéditions
 *  - paiements       (§8.10) — paiements clients & échéances
 *  - relances        (§8.10) — système de relances niveau 1..N
 */

import api from './api';

// ═══════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════

export type StatutColis = 'brouillon' | 'valide' | 'expedie' | 'livre';

export interface Colis {
  id_colis: number;
  numero_colis: string;                  // C{XXX}-{YYY}-{NNN}
  id_commande?: number;
  numero_commande?: string;
  id_client?: number;
  nom_client?: string;
  poids_kg: number;
  longueur_cm?: number;
  largeur_cm?: number;
  hauteur_cm?: number;
  volume_m3?: number;
  nb_articles?: number;
  id_transporteur?: number;
  transporteur_nom?: string;
  statut: StatutColis;
  date_expedition?: string;
  numero_suivi?: string;
  id_palette?: number;
  numero_palette?: string;
  created_at?: string;
}

export interface Palette {
  id_palette: number;
  numero_palette: string;                // PAL{YY}-{seq}
  id_commande?: number;
  numero_commande?: string;
  nb_colis: number;
  poids_total_kg: number;
  hauteur_cm: number;
  destination?: string;
  id_transporteur?: number;
  transporteur_nom?: string;
  type_palette: 'EUR' | 'US' | 'perdue';
  statut: 'preparee' | 'expediee' | 'livree';
  date_expedition?: string;
  colis_ids?: number[];
  created_at?: string;
}

export interface Transporteur {
  id_transporteur: number;
  nom: string;
  code?: string;
  contact_nom?: string;
  contact_email?: string;
  contact_telephone?: string;
  tarif_base_dt: number;
  tarif_par_kg?: number;
  tarif_par_km?: number;
  zones_desservies?: string[];
  taux_ponctualite_pct?: number;
  nb_expeditions_en_cours?: number;
  nb_livraisons_30j?: number;
  actif: boolean;
  created_at?: string;
}

export type ModePaiement = 'virement' | 'cheque' | 'especes' | 'traite' | 'lettre_change';
export type StatutPaiement = 'a_echoir' | 'du' | 'solde' | 'en_retard';
export type TrancheAge = '0-30' | '30-60' | '60-90' | '90+';

export interface PaiementEcheance {
  id_paiement: number;
  id_facture: number;
  numero_facture: string;
  id_client: number;
  nom_client: string;
  date_facture: string;
  date_echeance: string;
  montant_du_dt: number;
  montant_regle_dt: number;
  solde_dt: number;
  mode_paiement_attendu: ModePaiement;
  statut: StatutPaiement;
  jours_retard: number;                  // négatif = à échoir, positif = retard
  tranche_age: TrancheAge;
  reference_bancaire?: string;
  date_reglement?: string;
  created_at?: string;
}

export type NiveauRelance = 0 | 1 | 2 | 3 | 4;
// 0 = rien, 1 = rappel amiable, 2 = 1ère relance, 3 = mise en demeure, 4 = précontentieux

export interface RelanceFacture {
  id_relance: number;
  id_facture: number;
  numero_facture: string;
  id_client: number;
  nom_client: string;
  email_client?: string;
  date_echeance: string;
  jours_retard: number;
  montant_du_dt: number;
  niveau_actuel: NiveauRelance;
  derniere_relance_at?: string;
  derniere_relance_niveau?: NiveauRelance;
  prochaine_relance_at?: string;
  email_envoye: boolean;
  historique?: Array<{
    date: string;
    niveau: NiveauRelance;
    canal: 'email' | 'telephone' | 'courrier' | 'manuel';
    auteur?: string;
    reponse?: string;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════
// Endpoints
// ═══════════════════════════════════════════════════════════════════════

export const colisageService = {
  list: (params?: { id_commande?: number; statut?: StatutColis; id_palette?: number }) =>
    api.get('/v2/ventes/colisage', { params }),
  get: (id: number) => api.get(`/v2/ventes/colisage/${id}`),
  create: (data: Partial<Colis>) => api.post('/v2/ventes/colisage', data),
  update: (id: number, data: Partial<Colis>) =>
    api.put(`/v2/ventes/colisage/${id}`, data),
  remove: (id: number) => api.delete(`/v2/ventes/colisage/${id}`),
  valider: (id: number) => api.post(`/v2/ventes/colisage/${id}/valider`),
  etiquettePdf: (id: number) =>
    api.get(`/v2/ventes/colisage/${id}/etiquette`, { responseType: 'blob' }),
};

export const palettesService = {
  list: (params?: { id_commande?: number; statut?: string; id_transporteur?: number }) =>
    api.get('/v2/ventes/palettes', { params }),
  get: (id: number) => api.get(`/v2/ventes/palettes/${id}`),
  create: (data: Partial<Palette>) => api.post('/v2/ventes/palettes', data),
  update: (id: number, data: Partial<Palette>) =>
    api.put(`/v2/ventes/palettes/${id}`, data),
  remove: (id: number) => api.delete(`/v2/ventes/palettes/${id}`),
  ajouterColis: (id_palette: number, id_colis: number) =>
    api.post(`/v2/ventes/palettes/${id_palette}/colis`, { id_colis }),
  retirerColis: (id_palette: number, id_colis: number) =>
    api.delete(`/v2/ventes/palettes/${id_palette}/colis/${id_colis}`),
};

export const transporteursService = {
  list: (params?: { actif?: boolean }) =>
    api.get('/v2/ventes/transporteurs', { params }),
  get: (id: number) => api.get(`/v2/ventes/transporteurs/${id}`),
  create: (data: Partial<Transporteur>) => api.post('/v2/ventes/transporteurs', data),
  update: (id: number, data: Partial<Transporteur>) =>
    api.put(`/v2/ventes/transporteurs/${id}`, data),
  remove: (id: number) => api.delete(`/v2/ventes/transporteurs/${id}`),
  expeditionsEnCours: (id: number) =>
    api.get(`/v2/ventes/transporteurs/${id}/expeditions-en-cours`),
};

export const paiementsService = {
  list: (params?: {
    statut?: StatutPaiement;
    id_client?: number;
    tranche_age?: TrancheAge;
    mode_paiement?: ModePaiement;
  }) => api.get('/v2/ventes/paiements-echeances', { params }),
  get: (id: number) => api.get(`/v2/ventes/paiements-echeances/${id}`),
  create: (data: Partial<PaiementEcheance>) =>
    api.post('/v2/ventes/paiements-echeances', data),
  update: (id: number, data: Partial<PaiementEcheance>) =>
    api.put(`/v2/ventes/paiements-echeances/${id}`, data),
  marquerRegle: (id: number, payload: { date_reglement: string; reference?: string }) =>
    api.post(`/v2/ventes/paiements-echeances/${id}/regler`, payload),
  balanceAgee: () => api.get('/v2/ventes/paiements-echeances/balance-agee'),
};

export const relancesFacturesService = {
  list: (params?: { niveau?: NiveauRelance; id_client?: number }) =>
    api.get('/v2/ventes/relances-factures', { params }),
  get: (id: number) => api.get(`/v2/ventes/relances-factures/${id}`),
  envoyerRelance: (id_facture: number, payload: { niveau: NiveauRelance; canal: string }) =>
    api.post(`/v2/ventes/relances-factures/${id_facture}/envoyer`, payload),
  suspendre: (id_facture: number) =>
    api.post(`/v2/ventes/relances-factures/${id_facture}/suspendre`),
  historique: (id_facture: number) =>
    api.get(`/v2/ventes/relances-factures/${id_facture}/historique`),
};

export const ventesComplementsApi = {
  colisage: colisageService,
  palettes: palettesService,
  transporteurs: transporteursService,
  paiements: paiementsService,
  relances: relancesFacturesService,
};

export default ventesComplementsApi;
