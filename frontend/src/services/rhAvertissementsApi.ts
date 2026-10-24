/**
 * rhAvertissementsApi — service dédié Phase H (avertissements RH)
 *
 * Service séparé de `api.ts` / `rhApi.ts` pour éviter les conflits
 * d'édition parallèle avec les agents G1/G2/G3. Utilise l'instance
 * axios globale `api` en montage statique (import {...} from './api').
 */
import api from './api';

export interface Avertissement {
  id_avertissement: number;
  id_employe: number;
  matricule?: string;
  nom?: string;
  prenom?: string;
  type: 'retard_repete' | 'absence_non_just' | 'baisse_productivite'
      | 'refus_consigne' | 'autre';
  niveau: 'info' | 'attention' | 'grave' | 'sanction';
  message: string;
  periode_debut?: string | null;
  periode_fin?: string | null;
  auto_genere: boolean;
  genere_par?: string | null;
  statut: 'nouveau' | 'lu' | 'contestee' | 'traitee' | 'classee';
  date_envoi: string;
  date_lu?: string | null;
  date_accuse_reception?: string | null;
  signature_svg?: string | null;
  raison_contestation?: string | null;
  date_contestation?: string | null;
  id_societe?: number | null;
  id_document_archive?: number | null;
}

export interface AvertissementKpiRow {
  niveau: Avertissement['niveau'];
  total: number;
  non_lus: number;
  contestes: number;
}

export interface AvertissementFilters {
  statut?: Avertissement['statut'];
  niveau?: Avertissement['niveau'];
  type?: Avertissement['type'];
  id_employe?: number;
  date_debut?: string;
  date_fin?: string;
  limit?: number;
  offset?: number;
}

const BASE = '/v2/rh/avertissements';

export const rhAvertissementsApi = {
  async list(filters: AvertissementFilters = {}): Promise<Avertissement[]> {
    const res = await api.get(BASE, { params: filters });
    return res.data?.data || [];
  },

  async getOne(id: number): Promise<Avertissement | null> {
    const res = await api.get(`${BASE}/${id}`);
    return res.data?.data || null;
  },

  async kpi(params: { id_societe?: number } = {}): Promise<AvertissementKpiRow[]> {
    const res = await api.get(`${BASE}/kpi`, { params });
    return res.data?.data || [];
  },

  /** Self-service tablette — token passé via header x-tablette-token. */
  async mes(tabletteToken: string): Promise<Avertissement[]> {
    const res = await api.get(`${BASE}/mes`, {
      headers: { 'x-tablette-token': tabletteToken },
    });
    return res.data?.data || [];
  },

  async accuserReception(
    id: number,
    body: { signature_svg: string },
    tabletteToken?: string,
  ): Promise<Avertissement> {
    const res = await api.post(
      `${BASE}/${id}/accuser-reception`,
      body,
      tabletteToken
        ? { headers: { 'x-tablette-token': tabletteToken } }
        : undefined,
    );
    return res.data?.data;
  },

  async contester(
    id: number,
    body: { raison: string },
    tabletteToken?: string,
  ): Promise<Avertissement> {
    const res = await api.post(
      `${BASE}/${id}/contester`,
      body,
      tabletteToken
        ? { headers: { 'x-tablette-token': tabletteToken } }
        : undefined,
    );
    return res.data?.data;
  },

  async create(body: Partial<Avertissement>): Promise<Avertissement> {
    const res = await api.post(BASE, body);
    return res.data?.data;
  },

  async scan(): Promise<{ created_count: number; created: Avertissement[] }> {
    const res = await api.post(`${BASE}/scan`, {});
    return res.data?.data;
  },
};

export default rhAvertissementsApi;
