import api from './api';

/**
 * ecommerceApi.ts — services pour le module E-commerce B2B + B2C
 * Endpoints (§11quinquies domain.md v2.9) :
 *   /api/v2/ecommerce/{sites, comptes-b2b, commandes-web, sync, promo}
 */

// ─── Sites e-commerce ────────────────────────────────────────────────
export const sitesEcommerceService = {
  getSites: (params?: any) => api.get('/v2/ecommerce/sites', { params }),
  getSite: (id: number) => api.get(`/v2/ecommerce/sites/${id}`),
  createSite: (data: any) => api.post('/v2/ecommerce/sites', data),
  updateSite: (id: number, data: any) => api.put(`/v2/ecommerce/sites/${id}`, data),
  deleteSite: (id: number) => api.delete(`/v2/ecommerce/sites/${id}`),
  testConnexion: (id: number) => api.post(`/v2/ecommerce/sites/${id}/test-connexion`),
  toggleSync: (id: number, active: boolean) =>
    api.put(`/v2/ecommerce/sites/${id}/sync-active`, { sync_active: active }),
};

// ─── Comptes B2B web (KYC) ───────────────────────────────────────────
export const comptesB2BService = {
  getComptes: (params?: any) => api.get('/v2/ecommerce/comptes-b2b', { params }),
  getCompte: (id: number) => api.get(`/v2/ecommerce/comptes-b2b/${id}`),
  createCompte: (data: any) => api.post('/v2/ecommerce/comptes-b2b', data),
  updateCompte: (id: number, data: any) => api.put(`/v2/ecommerce/comptes-b2b/${id}`, data),
  deleteCompte: (id: number) => api.delete(`/v2/ecommerce/comptes-b2b/${id}`),
  // KYC
  getDocumentsKyc: (id: number) => api.get(`/v2/ecommerce/comptes-b2b/${id}/kyc`),
  validerKyc: (id: number, data?: { commentaire?: string }) =>
    api.post(`/v2/ecommerce/comptes-b2b/${id}/kyc/valider`, data || {}),
  refuserKyc: (id: number, motif: string) =>
    api.post(`/v2/ecommerce/comptes-b2b/${id}/kyc/refuser`, { motif }),
  suspendreCompte: (id: number, motif?: string) =>
    api.post(`/v2/ecommerce/comptes-b2b/${id}/suspendre`, { motif }),
  reactiverCompte: (id: number) =>
    api.post(`/v2/ecommerce/comptes-b2b/${id}/reactiver`),
};

// ─── Commandes web (imports webhook) ─────────────────────────────────
export const commandesWebService = {
  getCommandes: (params?: any) => api.get('/v2/ecommerce/commandes-web', { params }),
  getCommande: (id: number) => api.get(`/v2/ecommerce/commandes-web/${id}`),
  importerErp: (id: number, data?: any) =>
    api.post(`/v2/ecommerce/commandes-web/${id}/importer-erp`, data || {}),
  refuser: (id: number, motif: string) =>
    api.post(`/v2/ecommerce/commandes-web/${id}/refuser`, { motif }),
  rembourser: (id: number, montant?: number) =>
    api.post(`/v2/ecommerce/commandes-web/${id}/rembourser`, { montant }),
};

// ─── Synchronisation catalogue ERP ↔ site ────────────────────────────
export const syncEcommerceService = {
  getLogs: (params?: any) => api.get('/v2/ecommerce/sync', { params }),
  getLogsGroupJour: (id_site?: number) =>
    api.get('/v2/ecommerce/sync/par-jour', { params: { id_site } }),
  syncProduit: (id_site: number, id_article: number) =>
    api.post(`/v2/ecommerce/sync/produit/${id_site}/${id_article}`),
  syncCatalogueComplet: (id_site: number) =>
    api.post(`/v2/ecommerce/sync/catalogue/${id_site}`),
  syncStock: (id_site: number) =>
    api.post(`/v2/ecommerce/sync/stock/${id_site}`),
  retrySync: (id_log: number) => api.post(`/v2/ecommerce/sync/${id_log}/retry`),
};

// ─── Codes promo web ─────────────────────────────────────────────────
export const promoWebService = {
  getCodes: (params?: any) => api.get('/v2/ecommerce/promo', { params }),
  getCode: (id: number) => api.get(`/v2/ecommerce/promo/${id}`),
  createCode: (data: any) => api.post('/v2/ecommerce/promo', data),
  updateCode: (id: number, data: any) => api.put(`/v2/ecommerce/promo/${id}`, data),
  deleteCode: (id: number) => api.delete(`/v2/ecommerce/promo/${id}`),
  toggleActif: (id: number, actif: boolean) =>
    api.put(`/v2/ecommerce/promo/${id}/actif`, { actif }),
};

// ─── KPIs globaux dashboard e-commerce ───────────────────────────────
export const ecommerceKpiService = {
  getKpisGlobal: (params?: { periode?: string; id_site?: number }) =>
    api.get('/v2/ecommerce/kpis', { params }),
};

// ─── Types partagés ──────────────────────────────────────────────────
export interface SiteEcommerce {
  id_site: number;
  code_site: string;
  libelle: string;
  plateforme: 'shopify' | 'woocommerce' | 'custom_api' | 'prestashop';
  url_site: string;
  canal: 'B2B' | 'B2C' | 'MIXTE';
  devise_defaut: string;
  sync_active: boolean;
  derniere_sync_at?: string;
  statut_sante: 'ok' | 'erreur_auth' | 'erreur_api' | 'desactive';
  id_societe_emettrice?: number;
}

export type KycStatut = 'en_attente' | 'valide' | 'refuse' | 'suspendu';

export interface CompteB2BWeb {
  id_compte: number;
  raison_sociale: string;
  email_gerant: string;
  telephone?: string;
  ville?: string;
  pays?: string;
  kyc_statut: KycStatut;
  date_inscription: string;
  date_validation_kyc?: string;
  id_grille_tarif?: number;
  credit_max_b2b?: number;
  delai_paiement_b2b?: string;
  remise_permanente_pct?: number;
  documents_kyc_json?: any;
  nombre_commandes?: number;
  ca_total?: number;
}

export interface CommandeWeb {
  id_import: number;
  id_site: number;
  code_site?: string;
  numero_web: string;
  date_commande_web: string;
  client_email: string;
  client_nom: string;
  total_ttc: number;
  devise: string;
  statut_paiement_web: 'paye' | 'en_attente' | 'rembourse' | 'echec';
  statut_traitement_erp:
    | 'en_attente'
    | 'converti'
    | 'refus_stock'
    | 'refus_manuel'
    | 'annule_web';
  id_commande_erp?: number;
  payload_json?: any;
  canal?: 'B2B' | 'B2C';
}

export interface SyncLog {
  id_log: number;
  id_site: number;
  date_sync: string;
  type_sync: 'catalogue' | 'produit' | 'stock' | 'prix';
  statut: 'ok' | 'erreur' | 'partiel';
  nb_produits: number;
  nb_erreurs: number;
  duree_ms?: number;
  message_erreur?: string;
}

export interface CodePromoWeb {
  id_promo: number;
  code: string;
  libelle?: string;
  type_remise: 'pct' | 'montant' | 'port_offert';
  valeur: number;
  montant_min?: number;
  date_debut: string;
  date_fin: string;
  usage_max?: number;
  usage_courant: number;
  actif: boolean;
  id_site?: number;
}
