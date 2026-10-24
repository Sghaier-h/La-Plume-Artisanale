/**
 * rhRecrutementCandidatApi — service dédié Phase H
 * (recrutement candidat tablette, routes publiques)
 */
import api from './api';

export type QuestionType = 'texte' | 'multi' | 'test_logique' | 'note';

export interface QuestionRecrutement {
  id_question: number;
  poste_cible: string;
  question_type: QuestionType;
  question_text: string;
  choix_json?: string[] | null;
  bonne_reponse?: string | null;
  poids: number;
  actif: boolean;
  ordre: number;
}

export interface IdentiteCandidat {
  nom?: string;
  prenom?: string;
  cin?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  date_naissance?: string;
}

export interface ParcoursCandidat {
  experiences?: string;
  formations?: string;
  langues?: string;
}

export interface Reponse {
  id_question: number;
  reponse: string | number;
}

export interface PostulerPayload {
  identite: IdentiteCandidat;
  parcours: ParcoursCandidat;
  questionnaire_reponses: Reponse[];
  test_logique_reponses: Reponse[];
  attentes_salariales?: number;
  signature_svg?: string;
  photo_cv_url?: string;
  poste_cible?: string;
  duree_minutes?: number;
}

export interface CandidatureTabletteSummary {
  id_candidature: number;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  statut: string;
  score_matching?: number | null;
  score_tablette?: number | null;
  poste_cible_tablette?: string | null;
  date_passage?: string | null;
  duree_minutes?: number | null;
  identite_json?: IdentiteCandidat;
  parcours_json?: ParcoursCandidat;
  created_at: string;
}

const BASE = '/v2/rh/recrutement-tablette';

export const rhRecrutementCandidatApi = {
  async questionsActives(poste?: string): Promise<QuestionRecrutement[]> {
    const res = await api.get(`${BASE}/questions-actives`, {
      params: poste ? { poste } : {},
    });
    const rows = res.data?.data || [];
    return rows.map((r: any) => ({
      ...r,
      choix_json: typeof r.choix_json === 'string'
        ? JSON.parse(r.choix_json)
        : r.choix_json,
    }));
  },

  async postuler(payload: PostulerPayload): Promise<{
    id_candidature: number;
    score_total: number;
    detail: any;
  }> {
    const res = await api.post(`${BASE}/postuler`, payload);
    return res.data?.data;
  },

  async listCandidatures(filters: { limit?: number; offset?: number; statut?: string } = {}):
    Promise<CandidatureTabletteSummary[]> {
    const res = await api.get(`${BASE}/candidatures`, { params: filters });
    return res.data?.data || [];
  },

  async getCandidatureDetail(id: number): Promise<any> {
    const res = await api.get(`${BASE}/candidatures/${id}`);
    return res.data?.data;
  },
};

export default rhRecrutementCandidatApi;
