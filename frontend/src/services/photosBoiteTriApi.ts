import api from './api';

/**
 * photosBoiteTriApi.ts — Boîte à trier des photos justificatives (§14quater.4)
 * Endpoint : /api/v2/documents/photos-boite-tri
 */

export type PhotoSource = 'teams' | 'whatsapp' | 'email' | 'upload_direct';
export type PhotoStatut = 'non_traite' | 'en_cours' | 'rattache' | 'ignore';
export type PhotoRattacheType =
  | 'depense_espece'
  | 'facture_fournisseur'
  | 'apport_gerant'
  | 'paiement';

export interface PhotoBoiteTri {
  id_photo: number;
  id_document_archive: number;
  code_document?: string;
  document_titre?: string;
  filename_original?: string;
  mimetype?: string;
  taille_octets?: number;
  checksum_sha256?: string;
  path_relatif?: string;
  source: PhotoSource;
  expediteur_identifiant?: string;
  expediteur_nom?: string;
  expediteur_message?: string;
  date_reception: string;
  statut: PhotoStatut;
  rattache_a_type?: PhotoRattacheType | null;
  rattache_a_id?: number | null;
  rattache_par?: number | null;
  rattache_at?: string | null;
  notes_rattachement?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ListPhotosParams {
  statut?: PhotoStatut;
  source?: PhotoSource;
  expediteur?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface RattacherPayload {
  type: PhotoRattacheType;
  id: number;
  notes?: string;
}

export const photosBoiteTriService = {
  list:        (params?: ListPhotosParams) =>
                 api.get('/v2/documents/photos-boite-tri', { params }),
  count:       (params?: { statut?: PhotoStatut; source?: PhotoSource }) =>
                 api.get('/v2/documents/photos-boite-tri/count', { params }),
  getOne:      (id: number) =>
                 api.get(`/v2/documents/photos-boite-tri/${id}`),
  rattacher:   (id: number, payload: RattacherPayload) =>
                 api.post(`/v2/documents/photos-boite-tri/${id}/rattacher`, payload),
  ignorer:     (id: number, notes?: string) =>
                 api.post(`/v2/documents/photos-boite-tri/${id}/ignorer`, { notes }),
  marquerEnCours: (id: number) =>
                 api.post(`/v2/documents/photos-boite-tri/${id}/en-cours`, {}),
  uploadDirect: (payload: {
                 filename: string;
                 mimetype: string;
                 image_base64: string;
                 message?: string;
               }) =>
                 api.post('/v2/documents/photos-boite-tri/upload', payload),
};
