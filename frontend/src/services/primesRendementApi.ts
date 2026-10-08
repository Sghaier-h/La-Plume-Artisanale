/**
 * primesRendementApi.ts — client API pour le module « Primes de rendement
 * hors bulletin » et les écrans TV atelier (§11bis.7bis domain.md).
 *
 * Endpoints backend `/api/v2/rh/*` :
 *  - `primes-cagnottes`   : cagnottes hebdo par atelier + calcul + validation
 *  - `primes-scores`      : scores journaliers 5 critères
 *  - `primes-bordereaux`  : bordereaux hors bulletin (versement + compta 648)
 *  - `tv-atelier`         : configuration + endpoint public /tv/:url_token
 *
 * Le baseURL et les intercepteurs (JWT, société active, 401/429) sont hérités
 * du singleton `api` — on ne fait ici qu'ajouter le préfixe `/v2/rh`.
 */

import api from './api';

// ═══════════════════════════════════════════════════════════════════════
// Types partagés
// ═══════════════════════════════════════════════════════════════════════

export type AtelierPrime =
  | 'tissage'
  | 'finition'
  | 'preparation'
  | 'coupe'
  | 'ourdissage'
  | 'magasin';

export type StatutCagnotte =
  | 'brouillon'
  | 'calculee'
  | 'validee'
  | 'versee'
  | 'annulee';

export type StatutBordereau = 'a_verser' | 'verse' | 'annule';

export type ModeVersement = 'especes' | 'virement' | 'cheque';

/** Cagnotte hebdomadaire par atelier — `primes_cagnottes_hebdo`. */
export interface Cagnotte {
  id_cagnotte: number;
  atelier: AtelierPrime;
  annee: number;
  numero_semaine: number;               // 1..53
  date_debut_semaine: string;           // ISO date
  date_fin_semaine: string;             // ISO date
  montant_total_dt: number;
  montant_distribue_dt: number;
  nb_beneficiaires: number;
  nb_exclus: number;
  reste_report_dt: number;
  statut: StatutCagnotte;
  date_calcul?: string;
  date_validation?: string;
  date_versement_effectif?: string;
  cree_par?: number;
  valide_par?: number;
  commentaire?: string;
  created_at?: string;
}

/** Score journalier — `primes_scores_journaliers`. */
export interface ScoreJournalier {
  id_score: number;
  id_employe: number;
  employe_nom?: string;
  employe_prenom?: string;
  photo_url?: string;
  atelier: AtelierPrime;
  date_journee: string;                 // YYYY-MM-DD
  annee: number;
  numero_semaine: number;
  // 5 critères — pondération §11bis.7bis
  score_quantite: number;               // 0..100  · poids 0.30
  score_qualite: number;                // 0..100  · poids 0.25
  score_presence: number;               // 0..100  · poids 0.15
  score_absences: number;               // 0..100  · poids 0.15
  score_discipline: number;             // 0..10   · poids 0.15 (×10 pour normaliser)
  score_global: number;                 // 0..100 (moyenne pondérée finale)
  exclu: boolean;                       // seuil de rendement / qualité franchi
  motif_exclusion?: string;
  // Détails production
  quantite_realisee?: number;           // pcs ou duites
  quantite_objectif?: number;
  pct_1er_choix?: number;
  pct_2eme_choix?: number;
  heures_pointees?: number;
  heures_prevues?: number;
  nb_absences_injustifiees?: number;
  nb_retards?: number;
  created_at?: string;
}

/** Bordereau hors bulletin — `primes_bordereaux_hors_bulletin`. */
export interface Bordereau {
  id_bordereau: number;
  numero_bordereau: string;             // PRIME-{YYYY}-S{NN}-{ATELIER}-{NNN}
  id_cagnotte: number;
  id_employe: number;
  employe_nom?: string;
  employe_prenom?: string;
  photo_url?: string;
  atelier: AtelierPrime;
  annee: number;
  numero_semaine: number;
  score_global: number;
  montant_prime_dt: number;
  mode_versement: ModeVersement;
  statut: StatutBordereau;
  date_versement_prevu?: string;
  date_versement_effectif?: string;
  verse_par?: number;
  // Reçu signé
  recu_photo_url?: string;              // photo du reçu papier signé
  recu_signature_url?: string;          // signature numérique (canvas)
  recu_signe_at?: string;
  // Comptabilité (compte 648 — autres charges de personnel)
  id_ecriture_comptable?: number;
  numero_ecriture?: string;
  ecriture_generee_at?: string;
  pdf_url?: string;
  commentaire?: string;
  created_at?: string;
}

/** Configuration d'un écran TV atelier. */
export interface TvConfig {
  id_tv: number;
  atelier: AtelierPrime;
  libelle: string;                      // ex. "Écran mural Tissage — hall B"
  url_token: string;                    // token public pour /tv/:atelier/:token
  refresh_interval_sec: number;         // 30 par défaut
  actif: boolean;
  derniere_maj?: string;
  ip_ecran?: string;
  taille_pouces?: number;
  resolution?: string;                  // "1920x1080"
  created_at?: string;
}

/** Snapshot temps réel — payload renvoyé par `/tv/:url_token`. */
export interface TvSnapshot {
  atelier: AtelierPrime;
  libelle_atelier: string;              // "Atelier Tissage" / "Atelier Finition"
  annee: number;
  numero_semaine: number;
  date_debut_semaine: string;
  date_fin_semaine: string;
  serveur_time: string;                 // ISO — pour l'horloge en cas de dérive
  // KPI journée
  kpi_jour: {
    nb_1er_choix: number;
    nb_2eme_choix: number;
    perte_dechet_kg: number;
    perte_dt: number;
    rendement_pct: number;              // 0..100+
  };
  // Barre horaire — production réelle vs objectif idéal 100 %
  horaire: Array<{
    heure: string;                      // "08:00", "09:00"…
    objectif: number;                   // production idéale cumulée
    realise: number;                    // production réelle cumulée
  }>;
  // Top 5 employés de la semaine (avec photo)
  top_employes: Array<{
    id_employe: number;
    nom: string;
    prenom: string;
    photo_url?: string;
    machine?: string;
    poste?: string;
    quantite_semaine: number;
    rendement_pct: number;
    score_global: number;
    prime_prevue_dt: number;
  }>;
  // Cagnotte en cours
  cagnotte: {
    montant_total_dt: number;
    montant_distribue_dt: number;
    nb_beneficiaires: number;
  };
  // Panneaux latéraux
  presence: {
    presents: number;
    attendus: number;
    pct: number;
  };
  perte_totale_dt: number;
}

/** Reçu individuel signé pour un bordereau. */
export interface Recu {
  id_bordereau: number;
  numero_bordereau: string;
  employe_nom?: string;
  employe_prenom?: string;
  photo_url?: string;
  montant_prime_dt: number;
  atelier: AtelierPrime;
  numero_semaine: number;
  annee: number;
  recu_photo_url?: string;
  recu_signature_url?: string;
  recu_signe_at?: string;
  date_versement_effectif?: string;
}

// ═══════════════════════════════════════════════════════════════════════
// Endpoints
// ═══════════════════════════════════════════════════════════════════════

// ─── Cagnottes hebdo ────────────────────────────────────────────────────
export const cagnottesService = {
  list: (params?: {
    atelier?: AtelierPrime;
    annee?: number;
    numero_semaine?: number;
    statut?: StatutCagnotte;
  }) => api.get('/v2/rh/primes-cagnottes', { params }),
  get: (id: number) => api.get(`/v2/rh/primes-cagnottes/${id}`),
  create: (data: Partial<Cagnotte>) =>
    api.post('/v2/rh/primes-cagnottes', data),
  update: (id: number, data: Partial<Cagnotte>) =>
    api.put(`/v2/rh/primes-cagnottes/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/primes-cagnottes/${id}`),
  /** Lance le job de calcul des scores + attribution cagnotte. */
  calculer: (id: number) =>
    api.post(`/v2/rh/primes-cagnottes/${id}/calculer`),
  /** RH valide → génère les bordereaux + reçus PDF. */
  valider: (id: number) =>
    api.post(`/v2/rh/primes-cagnottes/${id}/valider`),
  /** Marque la cagnotte comme payée (espèces distribuées). */
  marquerPayee: (id: number, mode?: ModeVersement) =>
    api.post(`/v2/rh/primes-cagnottes/${id}/marquer-payee`, {
      mode_versement: mode,
    }),
};

// ─── Scores journaliers ─────────────────────────────────────────────────
export const scoresService = {
  list: (params?: {
    atelier?: AtelierPrime;
    annee?: number;
    numero_semaine?: number;
    id_employe?: number;
    date_journee?: string;
    exclu?: boolean;
    limit?: number;
    offset?: number;
  }) => api.get('/v2/rh/primes-scores', { params }),
  get: (id: number) => api.get(`/v2/rh/primes-scores/${id}`),
  create: (data: Partial<ScoreJournalier>) =>
    api.post('/v2/rh/primes-scores', data),
  update: (id: number, data: Partial<ScoreJournalier>) =>
    api.put(`/v2/rh/primes-scores/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/primes-scores/${id}`),
  /** Scores d'un employé sur une semaine donnée. */
  parEmployeSemaine: (id_employe: number, annee: number, num_semaine: number) =>
    api.get(
      `/v2/rh/primes-scores/employe/${id_employe}/semaine/${annee}/${num_semaine}`,
    ),
  /** Recalcul cron journalier (batch sur toute une journée). */
  bulkCalculJournalier: (payload: {
    date_journee: string;
    atelier?: AtelierPrime;
  }) => api.post('/v2/rh/primes-scores/bulk-calcul-journalier', payload),
};

// ─── Bordereaux hors bulletin ───────────────────────────────────────────
export const bordereauxService = {
  list: (params?: {
    atelier?: AtelierPrime;
    annee?: number;
    numero_semaine?: number;
    id_employe?: number;
    id_cagnotte?: number;
    statut?: StatutBordereau;
  }) => api.get('/v2/rh/primes-bordereaux', { params }),
  get: (id: number) => api.get(`/v2/rh/primes-bordereaux/${id}`),
  create: (data: Partial<Bordereau>) =>
    api.post('/v2/rh/primes-bordereaux', data),
  update: (id: number, data: Partial<Bordereau>) =>
    api.put(`/v2/rh/primes-bordereaux/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/primes-bordereaux/${id}`),
  /** Marque le bordereau comme versé (espèces sortent de caisse). */
  verser: (id: number, mode?: ModeVersement) =>
    api.post(`/v2/rh/primes-bordereaux/${id}/verser`, {
      mode_versement: mode,
    }),
  /** Génère l'écriture comptable classe 648 (autres charges de personnel). */
  genererEcritureComptable: (id: number) =>
    api.post(`/v2/rh/primes-bordereaux/${id}/generer-ecriture-comptable`),
  /** Upload la photo du reçu papier signé + signature canvas. */
  uploadRecuSigne: (
    id: number,
    payload: { photo?: File; signature_dataurl?: string },
  ) => {
    const formData = new FormData();
    if (payload.photo) formData.append('photo', payload.photo);
    if (payload.signature_dataurl)
      formData.append('signature_dataurl', payload.signature_dataurl);
    return api.post(
      `/v2/rh/primes-bordereaux/${id}/recu-signe`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
  /** URL du PDF prêt à imprimer (bordereau + reçu). */
  pdfUrl: (id: number) => `/v2/rh/primes-bordereaux/${id}/pdf`,
  downloadPdf: (id: number) =>
    api.get(`/v2/rh/primes-bordereaux/${id}/pdf`, {
      responseType: 'blob',
    }),
};

// ─── TV atelier (config admin + endpoint public) ────────────────────────
export const tvAtelierService = {
  list: (params?: { atelier?: AtelierPrime; actif?: boolean }) =>
    api.get('/v2/rh/tv-atelier', { params }),
  get: (id: number) => api.get(`/v2/rh/tv-atelier/${id}`),
  create: (data: Partial<TvConfig>) => api.post('/v2/rh/tv-atelier', data),
  update: (id: number, data: Partial<TvConfig>) =>
    api.put(`/v2/rh/tv-atelier/${id}`, data),
  remove: (id: number) => api.delete(`/v2/rh/tv-atelier/${id}`),
  /**
   * Endpoint public — pas d'authentification requise.
   * Renvoie le snapshot temps réel de l'atelier.
   * Rafraîchi toutes les 30 s côté front.
   */
  snapshotPublic: (url_token: string) =>
    api.get<TvSnapshot>(`/v2/rh/tv-atelier/tv/${url_token}`),
  /** Snapshot manuel côté admin (debug). */
  snapshotAdmin: (id: number) =>
    api.get<TvSnapshot>(`/v2/rh/tv-atelier/${id}/snapshot`),
};

export const primesRendementApi = {
  cagnottes: cagnottesService,
  scores: scoresService,
  bordereaux: bordereauxService,
  tv: tvAtelierService,
};

export default primesRendementApi;
