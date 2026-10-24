import api from './api';

/**
 * publiciteApi.ts — services pour le module Publicité digitale
 * Endpoints (§11quinquies.9 domain.md v2.9) :
 *   /api/v2/publicite/{comptes, campagnes, metriques, conversions, creatifs}
 */

// ─── Comptes publicitaires externes (Meta / Google / TikTok) ────────
export const comptesPubService = {
  getComptes: (params?: any) => api.get('/v2/publicite/comptes', { params }),
  getCompte: (id: number) => api.get(`/v2/publicite/comptes/${id}`),
  createCompte: (data: any) => api.post('/v2/publicite/comptes', data),
  updateCompte: (id: number, data: any) => api.put(`/v2/publicite/comptes/${id}`, data),
  deleteCompte: (id: number) => api.delete(`/v2/publicite/comptes/${id}`),
  refreshToken: (id: number) => api.post(`/v2/publicite/comptes/${id}/refresh-token`),
  testConnexion: (id: number) => api.post(`/v2/publicite/comptes/${id}/test-connexion`),
};

// ─── Campagnes pub ───────────────────────────────────────────────────
export const campagnesPubService = {
  getCampagnes: (params?: any) => api.get('/v2/publicite/campagnes', { params }),
  getCampagne: (id: number) => api.get(`/v2/publicite/campagnes/${id}`),
  createCampagne: (data: any) => api.post('/v2/publicite/campagnes', data),
  updateCampagne: (id: number, data: any) => api.put(`/v2/publicite/campagnes/${id}`, data),
  deleteCampagne: (id: number) => api.delete(`/v2/publicite/campagnes/${id}`),
  pauserCampagne: (id: number) => api.post(`/v2/publicite/campagnes/${id}/pause`),
  reprendreCampagne: (id: number) => api.post(`/v2/publicite/campagnes/${id}/reprendre`),
  publierPlateforme: (id: number) => api.post(`/v2/publicite/campagnes/${id}/publier`),
};

// ─── Métriques journalières ──────────────────────────────────────────
export const metriquesPubService = {
  getMetriques: (params?: any) => api.get('/v2/publicite/metriques', { params }),
  getMetriquesCampagne: (id_campagne: number, params?: any) =>
    api.get(`/v2/publicite/metriques/campagne/${id_campagne}`, { params }),
  syncMetriquesPlateforme: () => api.post('/v2/publicite/metriques/sync'),
  getKpisGlobaux: (params?: { periode?: string; canal?: string }) =>
    api.get('/v2/publicite/metriques/kpis', { params }),
};

// ─── Créatifs ────────────────────────────────────────────────────────
export const creatifsPubService = {
  getCreatifs: (params?: any) => api.get('/v2/publicite/creatifs', { params }),
  getCreatif: (id: number) => api.get(`/v2/publicite/creatifs/${id}`),
  createCreatif: (data: any) => api.post('/v2/publicite/creatifs', data),
  updateCreatif: (id: number, data: any) => api.put(`/v2/publicite/creatifs/${id}`, data),
  deleteCreatif: (id: number) => api.delete(`/v2/publicite/creatifs/${id}`),
  genererIA: (data: {
    id_produit: number;
    format: string;
    angle: string;
    nb_variantes?: number;
  }) => api.post('/v2/publicite/creatifs/generer-ia', data),
  publierPlateforme: (id: number) => api.post(`/v2/publicite/creatifs/${id}/publier`),
};

// ─── Conversions ─────────────────────────────────────────────────────
export const conversionsPubService = {
  getConversions: (params?: any) => api.get('/v2/publicite/conversions', { params }),
  getConversion: (id: number) => api.get(`/v2/publicite/conversions/${id}`),
  getEntonnoir: (params?: { id_campagne?: number; periode?: string }) =>
    api.get('/v2/publicite/conversions/entonnoir', { params }),
};

// ─── Types partagés ──────────────────────────────────────────────────
export type PlateformePub = 'meta' | 'google' | 'tiktok' | 'linkedin' | 'instagram';

export interface ComptePubExterne {
  id_compte: number;
  plateforme: PlateformePub;
  libelle: string;
  identifiant_externe: string;
  token_valide: boolean;
  token_expire_at?: string;
  date_connexion: string;
  actif: boolean;
  budget_mensuel?: number;
  compte_manager?: string;
}

export type StatutCampagne =
  | 'brouillon'
  | 'en_cours'
  | 'pause'
  | 'terminee'
  | 'refusee_plateforme';

export interface CampagnePub {
  id_campagne: number;
  plateforme: PlateformePub;
  id_externe?: string;
  objectif: 'awareness' | 'trafic' | 'ventes' | 'leads' | 'decouverte';
  libelle: string;
  budget_total?: number;
  budget_quotidien?: number;
  date_debut: string;
  date_fin?: string;
  statut: StatutCampagne;
  id_site_destination?: number;
  id_produit_promu?: number;
  // KPIs agrégés (peut venir d'une jointure avec metriques)
  impressions?: number;
  clics?: number;
  ctr?: number;
  cpc_moyen?: number;
  depense?: number;
  conversions?: number;
  revenu_attribue?: number;
  roas?: number;
}

export interface MetriqueJournaliere {
  id_metrique: number;
  id_campagne: number;
  date_jour: string;
  impressions: number;
  clics: number;
  ctr: number;
  cpc_moyen: number;
  depense: number;
  conversions: number;
  ventes_attribuees: number;
  revenu_attribue: number;
  roas: number;
  taux_conversion: number;
}

export interface CreatifPub {
  id_creatif: number;
  id_campagne: number;
  format:
    | '1_1_feed'
    | '9_16_story_reels'
    | '4_5_portrait'
    | '16_9_landscape';
  type_creatif: 'image_statique' | 'carousel' | 'video' | 'ugc_creator';
  angle: string;
  slogan?: string;
  cta_libelle?: string;
  cta_url?: string;
  url_media?: string;
  genere_par_ia: boolean;
  variante_test_ab?: string;
  statut_moderation: 'soumis' | 'approuve' | 'refuse_plateforme';
  // performance
  impressions?: number;
  clics?: number;
  ctr?: number;
}

export interface ConversionPub {
  id_conversion: number;
  id_campagne: number;
  id_creatif?: number;
  date_conversion: string;
  type_evenement:
    | 'page_view'
    | 'view_item'
    | 'add_to_cart'
    | 'begin_checkout'
    | 'purchase';
  valeur_conversion?: number;
  devise?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  attribution: 'last_click' | 'first_click' | 'linear';
  id_commande_erp?: number;
}
