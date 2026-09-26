/**
 * Client API pour le configurateur de personnalisation (§5.8 domain.md).
 *
 * Endpoints backend `/api/v2/personnalisation/*` :
 *  - `config`        : GET config d'un article (types, MOQ, zones, couleurs, prix)
 *  - `commandes`     : POST création d'une ligne commande personnalisée
 *  - `referentiels`  : GET palette couleurs / polices / dimensions catalogues
 *  - `partages`      : POST partage design (retourne URL courte + mockup PNG)
 *
 * Le baseURL et les intercepteurs (JWT, société active, 401/429) sont hérités
 * du singleton `api` (`services/api.ts`), on ne fait ici qu'ajouter le préfixe
 * `/v2/personnalisation`.
 */

import api from './api';

// ─── Types partagés ───────────────────────────────────────────────────────────

export type TypePersonnalisation =
  | 'broderie'
  | 'serigraphie'
  | 'rayures_personnalisees'
  | 'couleurs_personnalisees'
  | 'dimensions_custom'
  | 'pack_compose';

export type ZoneImpression =
  | 'coin_haut_gauche'
  | 'coin_haut_droit'
  | 'centre'
  | 'coin_bas_gauche'
  | 'coin_bas_droit'
  | 'face_avant'
  | 'face_avant_centre';

export interface CouleurConfig {
  code: string;              // ex. "C08-marine"
  libelle: string;           // ex. "Marine profond"
  hex_fond: string;          // couleur de base fouta ex. "#FBF7EE"
  hex_rayure: string;        // couleur de la rayure ex. "#3B4E68"
  express_24h?: boolean;     // stock permanent, fabrication express
}

export interface PalierPrix {
  quantite_min: number;      // 12, 50, 200, 500…
  prix_ttc_unite: number;    // 12.5, 10.8, 8.9, 7.9
  prix_ht_unite?: number;
}

export interface FormatDimension {
  code: string;              // "90x160", "100x180", "custom"
  libelle: string;           // "90 × 160"
  largeur_cm?: number;
  hauteur_cm?: number;
  moq: number;               // MOQ propre au format
  cible_marche?: string;     // "Standard hôtel/spa B2B"
}

/** Config d'un article personnalisable renvoyée par le backend. */
export interface ArticlePersonnalisationConfig {
  id_article: number;
  ref_commercial: string;
  designation: string;
  produit: string;                       // "fouta", "serviette", "totebag"…
  prix_base_ttc: number;                 // prix affiché en tête de fiche
  prix_base_ht?: number;
  devise: 'EUR' | 'TND';
  types_autorises: TypePersonnalisation[];
  moq_par_type: Partial<Record<TypePersonnalisation, number>>;
  zones_impression: ZoneImpression[];
  couleurs_disponibles: CouleurConfig[];
  formats: FormatDimension[];
  paliers_prix: PalierPrix[];
  delai_supplementaire_jours: number;
  photo_url?: string;
  cross_sell?: Array<{
    id_article: number;
    produit: string;
    label: string;
    prix_ht_depart: number;
    moq: number;
    icone?: string;
  }>;
}

/** Paramètres saisis par l'utilisateur — envoyés au backend. */
export interface ChoixPersonnalisation {
  id_article: number;
  type_personnalisation: TypePersonnalisation;
  couleur_code: string;
  zone: ZoneImpression;
  quantites_par_format: Record<string, number>;   // { "100x180": 120, "100x200": 80 }
  quantite_totale: number;
  logo_source_url?: string;
  texte_broderie?: string;
  couleurs_fils?: string[];
  dimensions_broderie_cm?: { largeur: number; hauteur: number };
}

export interface CommandePersonnaliseeResponse {
  id_commande: number;
  id_ligne_document: number;
  numero_devis?: string;
  montant_ttc: number;
  url_suivi?: string;
}

export interface PartageDesignResponse {
  short_url: string;
  mockup_url: string;
  expires_at?: string;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const personnalisationApi = {
  /** GET /api/v2/personnalisation/config/:id_article */
  getConfig: (idArticle: number | string) =>
    api.get<ArticlePersonnalisationConfig>(
      `/v2/personnalisation/config/${idArticle}`,
    ),

  /** GET /api/v2/personnalisation/referentiels — palette globale + polices */
  getReferentiels: () =>
    api.get<{
      couleurs: CouleurConfig[];
      polices: Array<{ code: string; nom: string; preview_url?: string }>;
      formats_standards: FormatDimension[];
    }>('/v2/personnalisation/referentiels'),

  /** POST /api/v2/personnalisation/commandes — ajoute au panier / crée devis */
  createCommande: (payload: ChoixPersonnalisation) =>
    api.post<CommandePersonnaliseeResponse>(
      '/v2/personnalisation/commandes',
      payload,
    ),

  /** POST /api/v2/personnalisation/partages — génère URL courte + mockup PNG */
  partagerDesign: (payload: ChoixPersonnalisation) =>
    api.post<PartageDesignResponse>(
      '/v2/personnalisation/partages',
      payload,
    ),

  /** Upload d'un logo client (SVG/AI/PNG). Renvoie l'URL persistée. */
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string; format: string; taille_ko: number }>(
      '/v2/personnalisation/uploads/logo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },
};

export default personnalisationApi;
