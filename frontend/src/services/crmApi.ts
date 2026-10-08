import api from './api';

/**
 * crmApi.ts — Services frontend pour les endpoints v2 CRM (§3).
 *
 * Convention API v2 : { success: true, data, pagination? } / { success: false, error }.
 * Pour rester compatible avec les listes actuelles, on renvoie directement `res.data`
 * — le composant lit `res.data.data` (rows) et `res.data.pagination`.
 */
const V2 = '/v2/crm';

// -----------------------------------------------------------------------------
// Comptes (§3.1)
// -----------------------------------------------------------------------------
export const comptesApi = {
  list:      (params?: any) => api.get(`${V2}/comptes`,       { params }),
  stats:     (params?: any) => api.get(`${V2}/comptes/stats`, { params }),
  get:       (id: number)   => api.get(`${V2}/comptes/${id}`),
  create:    (data: any)    => api.post(`${V2}/comptes`, data),
  update:    (id: number, patch: any) => api.put(`${V2}/comptes/${id}`, patch),
  archive:   (id: number)   => api.delete(`${V2}/comptes/${id}`),
};

// -----------------------------------------------------------------------------
// Contacts (§3.2)
// -----------------------------------------------------------------------------
export const contactsApi = {
  list:   (params?: any) => api.get(`${V2}/contacts`,       { params }),
  get:    (id: number)   => api.get(`${V2}/contacts/${id}`),
  create: (data: any)    => api.post(`${V2}/contacts`, data),
  update: (id: number, patch: any) => api.put(`${V2}/contacts/${id}`, patch),
  remove: (id: number)   => api.delete(`${V2}/contacts/${id}`),
};

// -----------------------------------------------------------------------------
// Adresses (§3.3)
// -----------------------------------------------------------------------------
export const adressesApi = {
  list:   (params?: any) => api.get(`${V2}/adresses`, { params }),
  get:    (id: number)   => api.get(`${V2}/adresses/${id}`),
  create: (data: any)    => api.post(`${V2}/adresses`, data),
  update: (id: number, patch: any) => api.put(`${V2}/adresses/${id}`, patch),
  remove: (id: number)   => api.delete(`${V2}/adresses/${id}`),
};

// -----------------------------------------------------------------------------
// Leads (§3.4)
// -----------------------------------------------------------------------------
export const leadsApi = {
  list:      (params?: any) => api.get(`${V2}/leads`, { params }),
  get:       (id: number)   => api.get(`${V2}/leads/${id}`),
  create:    (data: any)    => api.post(`${V2}/leads`, data),
  update:    (id: number, patch: any) => api.put(`${V2}/leads/${id}`, patch),
  remove:    (id: number)   => api.delete(`${V2}/leads/${id}`),
  convertir: (id: number, extras?: any) => api.post(`${V2}/leads/${id}/convertir`, extras || {}),
};

// -----------------------------------------------------------------------------
// Interactions (§3.5)
// -----------------------------------------------------------------------------
export const interactionsApi = {
  list:   (params?: any) => api.get(`${V2}/interactions`, { params }),
  get:    (id: number)   => api.get(`${V2}/interactions/${id}`),
  create: (data: any)    => api.post(`${V2}/interactions`, data),
  update: (id: number, patch: any) => api.put(`${V2}/interactions/${id}`, patch),
  remove: (id: number)   => api.delete(`${V2}/interactions/${id}`),
};

// -----------------------------------------------------------------------------
// Opportunités (pipeline §8)
// -----------------------------------------------------------------------------
export const opportunitesApi = {
  list:   (params?: any) => api.get(`${V2}/opportunites`,       { params }),
  stats:  ()             => api.get(`${V2}/opportunites/stats`),
  get:    (id: number)   => api.get(`${V2}/opportunites/${id}`),
  create: (data: any)    => api.post(`${V2}/opportunites`, data),
  update: (id: number, patch: any) => api.put(`${V2}/opportunites/${id}`, patch),
  remove: (id: number)   => api.delete(`${V2}/opportunites/${id}`),
};

// -----------------------------------------------------------------------------
// Paramètres CRM (§15) — sources / motifs / catégories / devises + numérotation
// -----------------------------------------------------------------------------
export const paramCrmApi = {
  list:     (kind: string)                    => api.get(`${V2}/parametres/${kind}`),
  upsert:   (kind: string, item: any)         => api.post(`${V2}/parametres/${kind}`, item),
  update:   (kind: string, id: any, patch: any) => api.put(`${V2}/parametres/${kind}/${id}`, patch),
  remove:   (kind: string, id: any)           => api.delete(`${V2}/parametres/${kind}/${id}`),
  // Numérotation
  numListe:   () => api.get(`${V2}/parametres/numerotation`),
  numGet:     (entite: string) => api.get(`${V2}/parametres/numerotation/${entite}`),
  numUpdate:  (entite: string, patch: any) => api.put(`${V2}/parametres/numerotation/${entite}`, patch),
  numPreview: (entite: string, ctx?: any)  => api.post(`${V2}/parametres/numerotation/${entite}/preview`, ctx || {}),
};

// -----------------------------------------------------------------------------
// Helpers universels
// -----------------------------------------------------------------------------
export const pickData = <T = any>(res: any): T[] => {
  const d = res?.data?.data ?? res?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.data)) return d.data as T[];
  return [];
};

export const pickPagination = (res: any) => res?.data?.pagination || null;
