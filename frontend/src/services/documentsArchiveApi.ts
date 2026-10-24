import api from './api';

/**
 * documentsArchiveApi.ts — archive centrale de documents (§14quater Phase A)
 * Endpoint : /api/v2/documents/archive
 */

export type TypeDocument =
  | 'facture_recue' | 'facture_emise' | 'recu_caisse' | 'rib' | 'contrat'
  | 'bulletin_paie' | 'attestation' | 'bon_sortie_st' | 'bon_retour_st'
  | 'scan_cheque' | 'photo_piece' | 'releve_bancaire' | 'declaration_tva'
  | 'avoir' | 'bon_commande' | 'permit_douane' | 'declaration_import'
  | 'certificat_origine' | 'facture_fournisseur_etranger' | 'autre';

export type ConfidentialiteDoc = 'public' | 'interne' | 'confidentiel' | 'restreint';
export type StatutDoc = 'brouillon' | 'valide' | 'archive' | 'obsolete' | 'supprime';

export interface DocumentArchive {
  id_document: number;
  code_document?: string;
  titre: string;
  description?: string;
  type_document: TypeDocument;
  categorie?: string;
  tags?: string[];
  langue?: string;
  filename_original: string;
  filename_stored?: string;
  mimetype?: string;
  taille_octets?: number;
  checksum_sha256?: string;
  storage_backend?: 'local' | 's3' | 'onedrive' | 'sharepoint';
  path_relatif?: string;
  signature_tactile_svg?: string;
  ocr_text?: string;
  date_document?: string;
  periode_fiscale?: string;
  id_societe?: number;
  statut: StatutDoc;
  confidentialite: ConfidentialiteDoc;
  cree_par?: number;
  date_creation?: string;
  date_modification?: string;
}

export interface DocumentLiaison {
  id_liaison: number;
  id_document: number;
  entite_type: string;
  entite_id: number;
  role_liaison?: string;
  date_liaison: string;
}

export const documentsArchiveService = {
  search:     (params?: { q?: string; type?: TypeDocument; periode?: string; categorie?: string; tags?: string }) =>
                api.get('/v2/documents/archive', { params }),
  getOne:     (id: number) => api.get(`/v2/documents/archive/${id}`),
  create:     (data: Partial<DocumentArchive>) => api.post('/v2/documents/archive', data),
  attach:     (payload: { id_document: number; entite_type: string; entite_id: number; role_liaison?: string }) =>
                api.post('/v2/documents/archive/attach', payload),
  detach:     (payload: { id_document: number; entite_type: string; entite_id: number; role_liaison?: string }) =>
                api.post('/v2/documents/archive/detach', payload),
  forEntity:  (entite_type: string, entite_id: number) =>
                api.get('/v2/documents/archive/for-entity', { params: { entite_type, entite_id } }),
  remove:     (id: number) => api.delete(`/v2/documents/archive/${id}`),
};
