import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Target,
  Image as ImageIcon,
  Activity,
  Filter,
  Search,
  PlusCircle,
  RefreshCw,
  X,
  Eye,
  Pencil,
  Trash2,
  Pause,
  Play,
  Sparkles,
  AlertTriangle,
  MousePointerClick,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  Facebook,
  Youtube,
  Music2,
} from 'lucide-react';
import KpiCard from '../components/ecommerce/KpiCard';
import CampagnePerfChart from '../components/ecommerce/CampagnePerfChart';
import {
  comptesPubService,
  campagnesPubService,
  metriquesPubService,
  creatifsPubService,
  conversionsPubService,
  ComptePubExterne,
  CampagnePub,
  CreatifPub,
  ConversionPub,
  MetriqueJournaliere,
  PlateformePub,
  StatutCampagne,
} from '../services/publiciteApi';

type TabKey = 'comptes' | 'campagnes' | 'creatifs' | 'conversions';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════

const MOCK_COMPTES: ComptePubExterne[] = [
  {
    id_compte: 1,
    plateforme: 'meta',
    libelle: 'Meta Business — La Plume TN',
    identifiant_externe: 'act_1234567890',
    token_valide: true,
    token_expire_at: new Date(Date.now() + 86400_000 * 45).toISOString(),
    date_connexion: new Date(Date.now() - 86400_000 * 120).toISOString(),
    actif: true,
    budget_mensuel: 3500,
    compte_manager: 'F. Sghaier',
  },
  {
    id_compte: 2,
    plateforme: 'google',
    libelle: 'Google Ads — Fouta FR',
    identifiant_externe: '123-456-7890',
    token_valide: true,
    token_expire_at: new Date(Date.now() + 86400_000 * 22).toISOString(),
    date_connexion: new Date(Date.now() - 86400_000 * 300).toISOString(),
    actif: true,
    budget_mensuel: 2200,
    compte_manager: 'M. Trabelsi',
  },
  {
    id_compte: 3,
    plateforme: 'tiktok',
    libelle: 'TikTok Ads — Discovery FR',
    identifiant_externe: 'TT-987654321',
    token_valide: false,
    token_expire_at: new Date(Date.now() - 86400_000 * 3).toISOString(),
    date_connexion: new Date(Date.now() - 86400_000 * 90).toISOString(),
    actif: true,
    budget_mensuel: 1500,
  },
  {
    id_compte: 4,
    plateforme: 'linkedin',
    libelle: 'LinkedIn Ads — B2B Export',
    identifiant_externe: 'lnkd-000012',
    token_valide: true,
    token_expire_at: new Date(Date.now() + 86400_000 * 90).toISOString(),
    date_connexion: new Date(Date.now() - 86400_000 * 40).toISOString(),
    actif: false,
    budget_mensuel: 800,
  },
];

const genSpark = (base: number, spread = 0.3, len = 14) =>
  Array.from({ length: len }).map(
    () => Math.max(0, Math.round(base * (1 + (Math.random() - 0.5) * spread)))
  );

const MOCK_CAMPAGNES: CampagnePub[] = [
  {
    id_campagne: 501,
    plateforme: 'meta',
    id_externe: 'meta_c_9812',
    objectif: 'ventes',
    libelle: 'Été indien · Marinière écru',
    budget_total: 1200,
    budget_quotidien: 40,
    date_debut: '2026-06-01',
    date_fin: '2026-09-15',
    statut: 'en_cours',
    id_site_destination: 2,
    id_produit_promu: 3401,
    impressions: 128_450,
    clics: 4_320,
    ctr: 3.36,
    cpc_moyen: 0.29,
    depense: 1252,
    conversions: 187,
    revenu_attribue: 8420,
    roas: 6.73,
  },
  {
    id_campagne: 502,
    plateforme: 'google',
    objectif: 'trafic',
    libelle: 'Shopping · Foutas premium',
    budget_total: 900,
    budget_quotidien: 30,
    date_debut: '2026-05-15',
    date_fin: '2026-08-30',
    statut: 'en_cours',
    id_site_destination: 2,
    impressions: 89_120,
    clics: 2_180,
    ctr: 2.44,
    cpc_moyen: 0.41,
    depense: 894,
    conversions: 95,
    revenu_attribue: 4270,
    roas: 4.78,
  },
  {
    id_campagne: 503,
    plateforme: 'tiktok',
    objectif: 'awareness',
    libelle: 'UGC · Made in Tunisia',
    budget_total: 600,
    budget_quotidien: 20,
    date_debut: '2026-07-01',
    date_fin: '2026-07-31',
    statut: 'pause',
    id_site_destination: 1,
    impressions: 240_120,
    clics: 6_420,
    ctr: 2.67,
    cpc_moyen: 0.09,
    depense: 578,
    conversions: 42,
    revenu_attribue: 1090,
    roas: 1.89,
  },
  {
    id_campagne: 504,
    plateforme: 'meta',
    objectif: 'leads',
    libelle: 'Formulaire B2B revendeurs',
    budget_total: 400,
    budget_quotidien: 15,
    date_debut: '2026-01-10',
    date_fin: '2026-12-31',
    statut: 'en_cours',
    id_site_destination: 3,
    impressions: 32_100,
    clics: 890,
    ctr: 2.77,
    cpc_moyen: 0.44,
    depense: 391,
    conversions: 27,
    revenu_attribue: 0,
    roas: 0,
  },
];

const MOCK_CREATIFS: CreatifPub[] = [
  {
    id_creatif: 701,
    id_campagne: 501,
    format: '1_1_feed',
    type_creatif: 'image_statique',
    angle: 'lifestyle',
    slogan: 'La fouta qui suit l\'été · fabriquée en Tunisie',
    cta_libelle: 'Acheter maintenant',
    cta_url: 'https://allbyfouta.com/marinier-ecru?utm=meta_ete26',
    url_media: 'https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=400',
    genere_par_ia: true,
    variante_test_ab: 'A',
    statut_moderation: 'approuve',
    impressions: 68_120,
    clics: 2_310,
    ctr: 3.39,
  },
  {
    id_creatif: 702,
    id_campagne: 501,
    format: '9_16_story_reels',
    type_creatif: 'video',
    angle: 'detail_matiere',
    slogan: '100% coton égyptien · toucher moelleux',
    cta_libelle: 'Découvrir',
    cta_url: 'https://allbyfouta.com/marinier-ecru?utm=meta_ete26_v',
    url_media: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
    genere_par_ia: false,
    variante_test_ab: 'B',
    statut_moderation: 'approuve',
    impressions: 60_330,
    clics: 2_010,
    ctr: 3.33,
  },
  {
    id_creatif: 703,
    id_campagne: 502,
    format: '4_5_portrait',
    type_creatif: 'carousel',
    angle: 'prix_promo',
    slogan: '5 couleurs · dès 24€',
    cta_libelle: 'En savoir plus',
    cta_url: 'https://allbyfouta.com/foutas-premium?utm=google_5col',
    url_media: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400',
    genere_par_ia: false,
    statut_moderation: 'approuve',
    impressions: 89_120,
    clics: 2_180,
    ctr: 2.44,
  },
  {
    id_creatif: 704,
    id_campagne: 503,
    format: '9_16_story_reels',
    type_creatif: 'ugc_creator',
    angle: 'temoignage',
    slogan: '"C\'est ma fouta préférée cet été" — Léa',
    cta_libelle: 'Voir la fouta',
    url_media: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    genere_par_ia: false,
    statut_moderation: 'refuse_plateforme',
    impressions: 5_100,
    clics: 120,
    ctr: 2.35,
  },
  {
    id_creatif: 705,
    id_campagne: 504,
    format: '16_9_landscape',
    type_creatif: 'image_statique',
    angle: 'made_in_tunisia',
    slogan: 'Devenez revendeur · MOQ 24 pièces',
    cta_libelle: 'Contactez-nous',
    url_media: 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=400',
    genere_par_ia: true,
    statut_moderation: 'soumis',
    impressions: 32_100,
    clics: 890,
    ctr: 2.77,
  },
];

const MOCK_CONVERSIONS: ConversionPub[] = [
  {
    id_conversion: 801,
    id_campagne: 501,
    id_creatif: 701,
    date_conversion: new Date(Date.now() - 3600_000 * 3).toISOString(),
    type_evenement: 'purchase',
    valeur_conversion: 44.9,
    devise: 'EUR',
    utm_source: 'meta',
    utm_medium: 'cpc',
    utm_campaign: 'ete26_marinier',
    utm_content: 'A_1_1',
    attribution: 'last_click',
    id_commande_erp: 8801,
  },
  {
    id_conversion: 802,
    id_campagne: 501,
    id_creatif: 702,
    date_conversion: new Date(Date.now() - 3600_000 * 6).toISOString(),
    type_evenement: 'add_to_cart',
    utm_source: 'meta',
    utm_medium: 'cpc',
    utm_campaign: 'ete26_marinier',
    utm_content: 'B_9_16',
    attribution: 'last_click',
  },
  {
    id_conversion: 803,
    id_campagne: 502,
    id_creatif: 703,
    date_conversion: new Date(Date.now() - 3600_000 * 8).toISOString(),
    type_evenement: 'purchase',
    valeur_conversion: 89.7,
    devise: 'EUR',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'shopping_foutas',
    attribution: 'last_click',
    id_commande_erp: 8802,
  },
  {
    id_conversion: 804,
    id_campagne: 502,
    date_conversion: new Date(Date.now() - 3600_000 * 12).toISOString(),
    type_evenement: 'begin_checkout',
    valeur_conversion: 65.0,
    devise: 'EUR',
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: 'shopping_foutas',
    attribution: 'first_click',
  },
  {
    id_conversion: 805,
    id_campagne: 503,
    date_conversion: new Date(Date.now() - 3600_000 * 22).toISOString(),
    type_evenement: 'view_item',
    utm_source: 'tiktok',
    utm_medium: 'cpc',
    utm_campaign: 'ugc_made_in_tn',
    attribution: 'linear',
  },
  {
    id_conversion: 806,
    id_campagne: 501,
    date_conversion: new Date(Date.now() - 3600_000 * 30).toISOString(),
    type_evenement: 'purchase',
    valeur_conversion: 128.5,
    devise: 'EUR',
    utm_source: 'meta',
    utm_medium: 'cpc',
    utm_campaign: 'ete26_marinier',
    attribution: 'last_click',
    id_commande_erp: 8798,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════════════

const PLATFORM_META: Record<
  PlateformePub,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  meta: {
    label: 'Meta',
    color: '#1877F2',
    bg: 'bg-[#1877F2]/10 text-[#1877F2]',
    icon: <Facebook className="w-3.5 h-3.5" />,
  },
  google: {
    label: 'Google',
    color: '#EA4335',
    bg: 'bg-[#EA4335]/10 text-[#EA4335]',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  tiktok: {
    label: 'TikTok',
    color: '#000000',
    bg: 'bg-gray-800/10 text-gray-900',
    icon: <Music2 className="w-3.5 h-3.5" />,
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    bg: 'bg-[#0A66C2]/10 text-[#0A66C2]',
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  instagram: {
    label: 'Instagram',
    color: '#E1306C',
    bg: 'bg-[#E1306C]/10 text-[#E1306C]',
    icon: <Youtube className="w-3.5 h-3.5" />,
  },
};

const STATUT_STYLES: Record<StatutCampagne, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  en_cours: 'bg-emerald-100 text-emerald-700',
  pause: 'bg-orange-100 text-orange-700',
  terminee: 'bg-blue-100 text-blue-700',
  refusee_plateforme: 'bg-red-100 text-red-700',
};

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

const PubliciteDigitale: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('campagnes');
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [comptes, setComptes] = useState<ComptePubExterne[]>([]);
  const [campagnes, setCampagnes] = useState<CampagnePub[]>([]);
  const [creatifs, setCreatifs] = useState<CreatifPub[]>([]);
  const [conversions, setConversions] = useState<ConversionPub[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [cRes, camRes, crRes, cvRes] = await Promise.allSettled([
        comptesPubService.getComptes(),
        campagnesPubService.getCampagnes(),
        creatifsPubService.getCreatifs(),
        conversionsPubService.getConversions(),
      ]);
      if (cancelled) return;

      const pick = <T,>(res: PromiseSettledResult<any>, key: string, fallback: T[]): T[] => {
        if (res.status !== 'fulfilled') return fallback;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d[key])) return d[key];
        return fallback;
      };

      setComptes(pick<ComptePubExterne>(cRes, 'comptes', MOCK_COMPTES));
      setCampagnes(pick<CampagnePub>(camRes, 'campagnes', MOCK_CAMPAGNES));
      setCreatifs(pick<CreatifPub>(crRes, 'creatifs', MOCK_CREATIFS));
      setConversions(pick<ConversionPub>(cvRes, 'conversions', MOCK_CONVERSIONS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bannerKpis = useMemo(() => {
    const depense = campagnes.reduce((s, c) => s + Number(c.depense || 0), 0);
    const revenu = campagnes.reduce((s, c) => s + Number(c.revenu_attribue || 0), 0);
    const conv = conversions.filter((c) => c.type_evenement === 'purchase').length;
    const clics = campagnes.reduce((s, c) => s + Number(c.clics || 0), 0);
    const impressions = campagnes.reduce((s, c) => s + Number(c.impressions || 0), 0);
    return {
      depense,
      revenu,
      roas: depense > 0 ? revenu / depense : 0,
      cpa: conv > 0 ? depense / conv : 0,
      ctr: impressions > 0 ? (clics / impressions) * 100 : 0,
      cpc: clics > 0 ? depense / clics : 0,
      nbCampagnesActives: campagnes.filter((c) => c.statut === 'en_cours').length,
    };
  }, [campagnes, conversions]);

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Megaphone className="w-8 h-8 text-[#C8663D]" />
                Publicité digitale
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Meta &middot; Google &middot; TikTok &middot; LinkedIn — campagnes,
                créatifs, ROAS et attribution
              </p>
            </div>
          </div>

          {globalError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {globalError}
            </div>
          )}

          {/* Bannière KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <KpiCard
              label="Dépense (période)"
              value={bannerKpis.depense.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              icon={<Wallet className="w-5 h-5" />}
              color="terracotta"
            />
            <KpiCard
              label="Revenu attribué"
              value={bannerKpis.revenu.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              icon={<TrendingUp className="w-5 h-5" />}
              color="sage"
              evolutionPct={14.2}
            />
            <KpiCard
              label="ROAS global"
              value={bannerKpis.roas.toFixed(2)}
              suffix="x"
              icon={<BarChart3 className="w-5 h-5" />}
              color={
                bannerKpis.roas >= 4 ? 'sage' : bannerKpis.roas >= 2 ? 'warning' : 'terracotta'
              }
            />
            <KpiCard
              label="CTR moyen"
              value={bannerKpis.ctr.toFixed(2)}
              suffix="%"
              icon={<MousePointerClick className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="CPC moyen"
              value={bannerKpis.cpc.toFixed(2)}
              suffix="DT"
              icon={<MousePointerClick className="w-5 h-5" />}
              color="neutral"
            />
            <KpiCard
              label="Campagnes actives"
              value={bannerKpis.nbCampagnesActives}
              icon={<Activity className="w-5 h-5" />}
              color="warning"
              subtitle={`${campagnes.length} au total`}
            />
          </div>

          {/* Onglets */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
            {(
              [
                { k: 'comptes', l: 'Comptes pub', i: <Activity className="w-4 h-4" /> },
                { k: 'campagnes', l: 'Campagnes', i: <Target className="w-4 h-4" /> },
                { k: 'creatifs', l: 'Créatives', i: <ImageIcon className="w-4 h-4" /> },
                { k: 'conversions', l: 'Conversions', i: <MousePointerClick className="w-4 h-4" /> },
              ] as { k: TabKey; l: string; i: React.ReactNode }[]
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                className={`px-4 py-2.5 font-medium text-sm inline-flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === t.k
                    ? 'border-[#C8663D] text-[#C8663D]'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {t.i}
                {t.l}
              </button>
            ))}
          </div>

          {activeTab === 'comptes' && <ComptesTab comptes={comptes} setComptes={setComptes} />}
          {activeTab === 'campagnes' && (
            <CampagnesTab campagnes={campagnes} setCampagnes={setCampagnes} />
          )}
          {activeTab === 'creatifs' && (
            <CreatifsTab creatifs={creatifs} campagnes={campagnes} />
          )}
          {activeTab === 'conversions' && (
            <ConversionsTab conversions={conversions} campagnes={campagnes} />
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 1 · COMPTES PUB
// ═══════════════════════════════════════════════════════════════════════
const ComptesTab: React.FC<{
  comptes: ComptePubExterne[];
  setComptes: React.Dispatch<React.SetStateAction<ComptePubExterne[]>>;
}> = ({ comptes, setComptes }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ComptePubExterne | null>(null);
  const [form, setForm] = useState<Partial<ComptePubExterne>>({
    plateforme: 'meta',
    libelle: '',
    identifiant_externe: '',
    token_valide: true,
    actif: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      plateforme: 'meta',
      libelle: '',
      identifiant_externe: '',
      token_valide: true,
      actif: true,
    });
    setShowForm(true);
  };

  const openEdit = (c: ComptePubExterne) => {
    setEditing(c);
    setForm(c);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await comptesPubService.updateCompte(editing.id_compte, form);
      else await comptesPubService.createCompte(form);
    } catch {
      /* mock */
    }
    if (editing) {
      setComptes((prev) =>
        prev.map((x) =>
          x.id_compte === editing.id_compte ? ({ ...x, ...form } as ComptePubExterne) : x
        )
      );
    } else {
      setComptes((prev) => [
        {
          ...(form as ComptePubExterne),
          id_compte: Date.now(),
          date_connexion: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setShowForm(false);
  };

  const handleDelete = async (c: ComptePubExterne) => {
    if (!window.confirm(`Déconnecter le compte « ${c.libelle} » ?`)) return;
    try {
      await comptesPubService.deleteCompte(c.id_compte);
    } catch {
      /* mock */
    }
    setComptes((prev) => prev.filter((x) => x.id_compte !== c.id_compte));
  };

  const handleRefresh = async (c: ComptePubExterne) => {
    try {
      await comptesPubService.refreshToken(c.id_compte);
    } catch {
      /* mock */
    }
    setComptes((prev) =>
      prev.map((x) =>
        x.id_compte === c.id_compte
          ? {
              ...x,
              token_valide: true,
              token_expire_at: new Date(Date.now() + 86400_000 * 60).toISOString(),
            }
          : x
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{comptes.length}</span> compte(s) publicitaire(s)
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231]"
        >
          <PlusCircle className="w-4 h-4" /> Connecter un compte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comptes.map((c) => {
          const meta = PLATFORM_META[c.plateforme];
          const expiration = c.token_expire_at ? new Date(c.token_expire_at) : null;
          const joursRestants = expiration
            ? Math.ceil((expiration.getTime() - Date.now()) / 86400_000)
            : null;
          const tokenExpired = !c.token_valide || (joursRestants !== null && joursRestants < 0);
          const tokenSoon = !tokenExpired && joursRestants !== null && joursRestants < 15;

          return (
            <div
              key={c.id_compte}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                !c.actif ? 'opacity-60' : ''
              }`}
            >
              <div className={`px-5 py-4 border-b flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg}`}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{meta.label}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {c.identifiant_externe}
                    </div>
                  </div>
                </div>
                {c.actif ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded">
                    ACTIF
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-200 text-gray-600 font-bold px-2 py-1 rounded">
                    INACTIF
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="font-semibold text-gray-900">{c.libelle}</div>
                <div className="text-xs text-gray-500">
                  Connecté depuis{' '}
                  <span className="font-medium text-gray-700">
                    {new Date(c.date_connexion).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div
                  className={`rounded-lg px-3 py-2 border ${
                    tokenExpired
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : tokenSoon
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {tokenExpired ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <Activity className="w-3.5 h-3.5" />
                    )}
                    {tokenExpired
                      ? 'Token expiré'
                      : tokenSoon
                      ? `Token expire dans ${joursRestants}j`
                      : `Token valide (${joursRestants}j restants)`}
                  </div>
                </div>

                {c.budget_mensuel && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span>Budget mensuel</span>
                    <span className="font-semibold text-gray-900">
                      {c.budget_mensuel.toLocaleString('fr-FR')} DT
                    </span>
                  </div>
                )}
                {c.compte_manager && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Manager</span>
                    <span className="font-medium text-gray-700">{c.compte_manager}</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-5 py-2 border-t flex items-center gap-2">
                <button
                  onClick={() => handleRefresh(c)}
                  className="text-xs inline-flex items-center gap-1 text-[#3B4E68] hover:text-[#C8663D] font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Rafraîchir token
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 text-gray-500 hover:text-[#3B4E68] rounded"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          title={editing ? 'Modifier le compte' : 'Connecter un compte publicitaire'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Plateforme *">
                <select
                  value={form.plateforme}
                  onChange={(e) =>
                    setForm({ ...form, plateforme: e.target.value as PlateformePub })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="meta">Meta (Facebook + Instagram)</option>
                  <option value="google">Google Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                  <option value="linkedin">LinkedIn Ads</option>
                </select>
              </Field>
              <Field label="Libellé *">
                <input
                  required
                  value={form.libelle || ''}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Identifiant externe *">
                <input
                  required
                  value={form.identifiant_externe || ''}
                  onChange={(e) => setForm({ ...form, identifiant_externe: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
              </Field>
              <Field label="Budget mensuel (DT)">
                <input
                  type="number"
                  value={form.budget_mensuel || ''}
                  onChange={(e) =>
                    setForm({ ...form, budget_mensuel: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Compte manager">
                <input
                  value={form.compte_manager || ''}
                  onChange={(e) => setForm({ ...form, compte_manager: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              />
              Compte actif
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#a55231]"
              >
                {editing ? 'Enregistrer' : 'Connecter'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 2 · CAMPAGNES
// ═══════════════════════════════════════════════════════════════════════
const CampagnesTab: React.FC<{
  campagnes: CampagnePub[];
  setCampagnes: React.Dispatch<React.SetStateAction<CampagnePub[]>>;
}> = ({ campagnes, setCampagnes }) => {
  const [filterCanal, setFilterCanal] = useState<PlateformePub | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<StatutCampagne | 'all'>('all');
  const [filterPeriode, setFilterPeriode] = useState<'7j' | '30j' | 'all'>('30j');
  const [search, setSearch] = useState('');
  const [metriquesModal, setMetriquesModal] = useState<CampagnePub | null>(null);
  const [modalSeries, setModalSeries] = useState<MetriqueJournaliere[] | null>(null);
  const [loadingMetriques, setLoadingMetriques] = useState(false);

  const filtered = useMemo(() => {
    const nowLimit =
      filterPeriode === '7j'
        ? Date.now() - 7 * 86400_000
        : filterPeriode === '30j'
        ? Date.now() - 30 * 86400_000
        : 0;
    return campagnes.filter((c) => {
      if (filterCanal !== 'all' && c.plateforme !== filterCanal) return false;
      if (filterStatut !== 'all' && c.statut !== filterStatut) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.libelle.toLowerCase().includes(q)) return false;
      }
      if (nowLimit) {
        const debut = new Date(c.date_debut).getTime();
        const fin = c.date_fin ? new Date(c.date_fin).getTime() : Date.now();
        if (fin < nowLimit) return false;
      }
      return true;
    });
  }, [campagnes, filterCanal, filterStatut, filterPeriode, search]);

  const togglePause = async (c: CampagnePub) => {
    try {
      if (c.statut === 'pause') await campagnesPubService.reprendreCampagne(c.id_campagne);
      else await campagnesPubService.pauserCampagne(c.id_campagne);
    } catch {
      /* mock */
    }
    setCampagnes((prev) =>
      prev.map((x) =>
        x.id_campagne === c.id_campagne
          ? { ...x, statut: x.statut === 'pause' ? 'en_cours' : 'pause' }
          : x
      )
    );
  };

  const openMetriques = async (c: CampagnePub) => {
    setMetriquesModal(c);
    setLoadingMetriques(true);
    try {
      const res = await metriquesPubService.getMetriquesCampagne(c.id_campagne);
      const d = res?.data?.data ?? res?.data;
      const arr = Array.isArray(d) ? d : d?.metriques;
      setModalSeries(Array.isArray(arr) ? arr : []);
    } catch {
      // Mock: génère 14 jours de valeurs autour des KPIs actuels
      const base = c.impressions ? c.impressions / 14 : 5000;
      const cpc = c.cpc_moyen || 0.3;
      const roas = c.roas || 3;
      const now = Date.now();
      const mock: MetriqueJournaliere[] = Array.from({ length: 14 }).map((_, i) => {
        const imp = Math.max(0, Math.round(base * (0.7 + Math.random() * 0.6)));
        const clic = Math.round(imp * (0.02 + Math.random() * 0.03));
        return {
          id_metrique: i + 1,
          id_campagne: c.id_campagne,
          date_jour: new Date(now - (13 - i) * 86400_000).toISOString().slice(0, 10),
          impressions: imp,
          clics: clic,
          ctr: imp > 0 ? (clic / imp) * 100 : 0,
          cpc_moyen: cpc * (0.8 + Math.random() * 0.4),
          depense: clic * cpc,
          conversions: Math.round(clic * (0.03 + Math.random() * 0.02)),
          ventes_attribuees: Math.round(clic * 0.02),
          revenu_attribue: clic * cpc * roas * (0.8 + Math.random() * 0.4),
          roas: roas * (0.8 + Math.random() * 0.4),
          taux_conversion: 3 + Math.random() * 2,
        };
      });
      setModalSeries(mock);
    } finally {
      setLoadingMetriques(false);
    }
  };

  return (
    <div>
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une campagne…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterCanal}
          onChange={(e) => setFilterCanal(e.target.value as any)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Toutes plateformes</option>
          <option value="meta">Meta</option>
          <option value="google">Google</option>
          <option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as any)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Tous statuts</option>
          <option value="en_cours">En cours</option>
          <option value="pause">Pause</option>
          <option value="brouillon">Brouillon</option>
          <option value="terminee">Terminée</option>
        </select>
        <select
          value={filterPeriode}
          onChange={(e) => setFilterPeriode(e.target.value as any)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
          <option value="all">Toutes périodes</option>
        </select>
        <div className="text-sm text-gray-500 ml-auto">
          {filtered.length} / {campagnes.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Campagne</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Impressions</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Clics · CTR</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">CPC</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Dépense</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Conv · ROAS</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Tendance</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => {
              const meta = PLATFORM_META[c.plateforme];
              const spark = genSpark(c.depense ? c.depense / 14 : 5, 0.4);
              return (
                <tr key={c.id_campagne} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{c.libelle}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.bg}`}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase">
                        {c.objectif}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        STATUT_STYLES[c.statut]
                      }`}
                    >
                      {c.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {(c.impressions || 0).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono text-sm">
                      {(c.clics || 0).toLocaleString('fr-FR')}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        (c.ctr || 0) >= 3
                          ? 'text-emerald-600'
                          : (c.ctr || 0) >= 1.5
                          ? 'text-orange-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {(c.ctr || 0).toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium">
                    {(c.cpc_moyen || 0).toFixed(2)} DT
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {(c.depense || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} DT
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="text-sm">{c.conversions || 0} conv</div>
                    <div
                      className={`text-xs font-bold ${
                        (c.roas || 0) >= 4
                          ? 'text-emerald-600'
                          : (c.roas || 0) >= 2
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}
                    >
                      ROAS {(c.roas || 0).toFixed(2)}x
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <CampagnePerfChart
                      data={spark}
                      color={meta.color}
                      width={80}
                      height={32}
                    />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openMetriques(c)}
                      className="text-xs text-[#3B4E68] hover:text-[#C8663D] inline-flex items-center gap-1 mr-2"
                    >
                      <Eye className="w-3.5 h-3.5" /> KPI
                    </button>
                    <button
                      onClick={() => togglePause(c)}
                      className={`text-xs inline-flex items-center gap-1 font-medium px-2 py-1 rounded ${
                        c.statut === 'pause'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {c.statut === 'pause' ? (
                        <>
                          <Play className="w-3.5 h-3.5" /> Reprendre
                        </>
                      ) : (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Pause
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  Aucune campagne pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {metriquesModal && (
        <Modal
          onClose={() => {
            setMetriquesModal(null);
            setModalSeries(null);
          }}
          title={`Métriques journalières · ${metriquesModal.libelle}`}
        >
          {loadingMetriques ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C8663D]" />
            </div>
          ) : modalSeries && modalSeries.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat
                  label="Impressions"
                  value={modalSeries.map((m) => m.impressions)}
                  color="#3B4E68"
                />
                <MiniStat
                  label="Clics"
                  value={modalSeries.map((m) => m.clics)}
                  color="#C8663D"
                />
                <MiniStat
                  label="Dépense (DT)"
                  value={modalSeries.map((m) => m.depense)}
                  color="#D6A756"
                  format={(v) => v.toFixed(0)}
                />
                <MiniStat
                  label="ROAS"
                  value={modalSeries.map((m) => m.roas)}
                  color="#4A6C5B"
                  format={(v) => v.toFixed(2)}
                />
              </div>
              <div className="overflow-auto max-h-[40vh] border rounded-lg">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-right">Impr.</th>
                      <th className="px-3 py-2 text-right">Clics</th>
                      <th className="px-3 py-2 text-right">CTR</th>
                      <th className="px-3 py-2 text-right">CPC</th>
                      <th className="px-3 py-2 text-right">Dépense</th>
                      <th className="px-3 py-2 text-right">Conv.</th>
                      <th className="px-3 py-2 text-right">Revenu</th>
                      <th className="px-3 py-2 text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalSeries.map((m) => (
                      <tr key={m.id_metrique} className="border-t">
                        <td className="px-3 py-1.5">{m.date_jour}</td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {m.impressions.toLocaleString('fr-FR')}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">{m.clics}</td>
                        <td className="px-3 py-1.5 text-right">{m.ctr.toFixed(2)}%</td>
                        <td className="px-3 py-1.5 text-right">{m.cpc_moyen.toFixed(2)}</td>
                        <td className="px-3 py-1.5 text-right font-semibold">
                          {m.depense.toFixed(0)}
                        </td>
                        <td className="px-3 py-1.5 text-right">{m.conversions}</td>
                        <td className="px-3 py-1.5 text-right">
                          {m.revenu_attribue.toFixed(0)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-bold">
                          {m.roas.toFixed(2)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Aucune donnée de métriques disponible.
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 3 · CRÉATIFS
// ═══════════════════════════════════════════════════════════════════════
const CreatifsTab: React.FC<{
  creatifs: CreatifPub[];
  campagnes: CampagnePub[];
}> = ({ creatifs, campagnes }) => {
  const [filterCampagne, setFilterCampagne] = useState<number | 'all'>('all');
  const [filterModeration, setFilterModeration] = useState<string>('all');

  const filtered = useMemo(() => {
    return creatifs.filter((cr) => {
      if (filterCampagne !== 'all' && cr.id_campagne !== filterCampagne) return false;
      if (filterModeration !== 'all' && cr.statut_moderation !== filterModeration) return false;
      return true;
    });
  }, [creatifs, filterCampagne, filterModeration]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterCampagne}
          onChange={(e) =>
            setFilterCampagne(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
          }
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Toutes campagnes</option>
          {campagnes.map((c) => (
            <option key={c.id_campagne} value={c.id_campagne}>
              {c.libelle}
            </option>
          ))}
        </select>
        <select
          value={filterModeration}
          onChange={(e) => setFilterModeration(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Toutes modérations</option>
          <option value="approuve">Approuvés</option>
          <option value="soumis">En attente</option>
          <option value="refuse_plateforme">Refusés</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filtered.length} / {creatifs.length}
          </span>
          <button className="inline-flex items-center gap-1 bg-gradient-to-r from-[#C8663D] to-[#D6A756] text-white px-3 py-1.5 rounded-lg text-sm hover:opacity-90">
            <Sparkles className="w-3.5 h-3.5" /> Générer IA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cr) => {
          const c = campagnes.find((x) => x.id_campagne === cr.id_campagne);
          const meta = c ? PLATFORM_META[c.plateforme] : null;
          const moderStyle =
            cr.statut_moderation === 'approuve'
              ? 'bg-emerald-100 text-emerald-700'
              : cr.statut_moderation === 'soumis'
              ? 'bg-orange-100 text-orange-700'
              : 'bg-red-100 text-red-700';
          return (
            <div
              key={cr.id_creatif}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:border-[#C8663D]/40 transition-all"
            >
              <div className="relative bg-gray-100 aspect-square overflow-hidden">
                {cr.url_media ? (
                  <img
                    src={cr.url_media}
                    alt={cr.slogan}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {meta && (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-1 rounded ${meta.bg}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  )}
                  <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-gray-800">
                    {cr.format}
                  </span>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {cr.genere_par_ia && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-[#C8663D] to-[#D6A756] text-white">
                      <Sparkles className="w-2.5 h-2.5" /> IA
                    </span>
                  )}
                  {cr.variante_test_ab && (
                    <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">
                      Test {cr.variante_test_ab}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="text-white text-xs font-medium line-clamp-2">
                    {cr.slogan}
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-gray-500 font-semibold">
                    {cr.type_creatif.replace('_', ' ')} · {cr.angle.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${moderStyle}`}>
                    {cr.statut_moderation.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                  <div>
                    <div className="text-[10px] text-gray-500">Impr.</div>
                    <div className="text-sm font-bold text-gray-900">
                      {((cr.impressions || 0) / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">Clics</div>
                    <div className="text-sm font-bold text-gray-900">
                      {cr.clics || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-500">CTR</div>
                    <div
                      className={`text-sm font-bold ${
                        (cr.ctr || 0) >= 3
                          ? 'text-emerald-600'
                          : (cr.ctr || 0) >= 1.5
                          ? 'text-orange-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {(cr.ctr || 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-12">
            Aucun créatif pour ces filtres.
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 4 · CONVERSIONS
// ═══════════════════════════════════════════════════════════════════════
const ConversionsTab: React.FC<{
  conversions: ConversionPub[];
  campagnes: CampagnePub[];
}> = ({ conversions, campagnes }) => {
  const [filterCampagne, setFilterCampagne] = useState<number | 'all'>('all');
  const [filterEvenement, setFilterEvenement] = useState<string>('all');

  const filtered = useMemo(() => {
    return conversions.filter((c) => {
      if (filterCampagne !== 'all' && c.id_campagne !== filterCampagne) return false;
      if (filterEvenement !== 'all' && c.type_evenement !== filterEvenement) return false;
      return true;
    });
  }, [conversions, filterCampagne, filterEvenement]);

  // Entonnoir
  const funnel = useMemo(() => {
    const events: ConversionPub['type_evenement'][] = [
      'page_view',
      'view_item',
      'add_to_cart',
      'begin_checkout',
      'purchase',
    ];
    // On enrichit avec des chiffres cumulatifs plausibles
    // Depuis les conversions réelles + une base simulée si trop peu de datapoints
    const countBy: Record<string, number> = {};
    conversions.forEach((c) => {
      countBy[c.type_evenement] = (countBy[c.type_evenement] || 0) + 1;
    });
    // Base simulée pour compléter (les pixels envoient normalement bien plus d'événements)
    const base = { page_view: 24000, view_item: 12800, add_to_cart: 2600, begin_checkout: 780, purchase: 320 };
    const merged: Record<string, number> = {};
    events.forEach((e) => {
      merged[e] = base[e as keyof typeof base] + (countBy[e] || 0);
    });
    const maxVal = merged.page_view;
    return events.map((e) => {
      const label = e.replace('_', ' ');
      const val = merged[e];
      return {
        step: e,
        label,
        value: val,
        pct: (val / maxVal) * 100,
      };
    });
  }, [conversions]);

  const evenementBadge = (e: ConversionPub['type_evenement']) => {
    const map: Record<string, string> = {
      page_view: 'bg-gray-100 text-gray-700',
      view_item: 'bg-blue-100 text-blue-700',
      add_to_cart: 'bg-orange-100 text-orange-700',
      begin_checkout: 'bg-yellow-100 text-yellow-700',
      purchase: 'bg-emerald-100 text-emerald-700',
    };
    return (
      <span
        className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${map[e]}`}
      >
        {e.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Entonnoir de conversion */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 mb-4 inline-flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Entonnoir de conversion
        </h3>
        <div className="space-y-2">
          {funnel.map((step, idx) => {
            const nextStep = funnel[idx + 1];
            const dropoff = nextStep ? ((step.value - nextStep.value) / step.value) * 100 : 0;
            const stepColor =
              idx === funnel.length - 1
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : idx === 0
                ? 'bg-gradient-to-r from-[#3B4E68] to-[#3B4E68]/80'
                : 'bg-gradient-to-r from-[#C8663D] to-[#D6A756]';
            return (
              <div key={step.step}>
                <div className="flex items-center gap-3">
                  <div className="w-32 text-sm font-medium text-gray-700 uppercase text-xs">
                    {step.label}
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-100 rounded overflow-hidden">
                    <div
                      className={`h-full ${stepColor} rounded transition-all flex items-center px-3`}
                      style={{ width: `${step.pct}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {step.value.toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-gray-800">
                    {step.pct.toFixed(1)}%
                  </div>
                </div>
                {nextStep && (
                  <div className="ml-32 pl-3 text-[10px] text-gray-400 italic mb-1">
                    ↓ -{dropoff.toFixed(1)}% drop-off
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-3 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterCampagne}
          onChange={(e) =>
            setFilterCampagne(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
          }
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Toutes campagnes</option>
          {campagnes.map((c) => (
            <option key={c.id_campagne} value={c.id_campagne}>
              {c.libelle}
            </option>
          ))}
        </select>
        <select
          value={filterEvenement}
          onChange={(e) => setFilterEvenement(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Tous événements</option>
          <option value="page_view">Page view</option>
          <option value="view_item">View item</option>
          <option value="add_to_cart">Add to cart</option>
          <option value="begin_checkout">Begin checkout</option>
          <option value="purchase">Purchase</option>
        </select>
        <div className="text-sm text-gray-500 ml-auto">
          {filtered.length} / {conversions.length}
        </div>
      </div>

      {/* Table conversions */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Campagne</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Événement</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attribution UTM</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Modèle</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valeur</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Commande ERP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => {
              const cam = campagnes.find((x) => x.id_campagne === c.id_campagne);
              return (
                <tr key={c.id_conversion} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(c.date_conversion).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 font-medium">
                      {cam?.libelle || `Camp #${c.id_campagne}`}
                    </div>
                    {cam && (
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                          PLATFORM_META[cam.plateforme].bg
                        }`}
                      >
                        {PLATFORM_META[cam.plateforme].label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{evenementBadge(c.type_evenement)}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="text-gray-700 font-mono">
                      {c.utm_source && `${c.utm_source} · `}
                      {c.utm_medium && `${c.utm_medium}`}
                    </div>
                    {c.utm_campaign && (
                      <div className="text-gray-500 text-[11px] font-mono">
                        {c.utm_campaign}
                        {c.utm_content ? ` / ${c.utm_content}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                      {c.attribution.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {c.valeur_conversion
                      ? `${c.valeur_conversion.toFixed(2)} ${c.devise || 'EUR'}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.id_commande_erp ? (
                      <span className="text-xs font-mono text-emerald-700">
                        #{c.id_commande_erp}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Aucune conversion pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PRIMITIVES PARTAGÉES
// ═══════════════════════════════════════════════════════════════════════

const MiniStat: React.FC<{
  label: string;
  value: number[];
  color: string;
  format?: (v: number) => string;
}> = ({ label, value, color, format = (v) => v.toLocaleString('fr-FR') }) => {
  const total = value.reduce((s, v) => s + v, 0);
  return (
    <div className="bg-gray-50 rounded-lg p-3 border">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900 mb-1">{format(total)}</div>
      <CampagnePerfChart data={value} color={color} width={120} height={30} />
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-5 overflow-auto">{children}</div>
    </div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

export default PubliciteDigitale;
