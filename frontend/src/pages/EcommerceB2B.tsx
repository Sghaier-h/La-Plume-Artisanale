import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Users2,
  ShoppingCart,
  RefreshCw,
  Ticket,
  Search,
  PlusCircle,
  X,
  FileText,
  Download,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Pencil,
  Trash2,
  TrendingUp,
  Store,
} from 'lucide-react';
import KpiCard from '../components/ecommerce/KpiCard';
import KycBadge from '../components/ecommerce/KycBadge';
import SiteCard from '../components/ecommerce/SiteCard';
import {
  sitesEcommerceService,
  comptesB2BService,
  commandesWebService,
  syncEcommerceService,
  promoWebService,
  ecommerceKpiService,
  SiteEcommerce,
  CompteB2BWeb,
  CommandeWeb,
  SyncLog,
  CodePromoWeb,
  KycStatut,
} from '../services/ecommerceApi';

type TabKey = 'sites' | 'comptes' | 'commandes' | 'sync' | 'promo';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA (utilisée en fallback si l'API n'est pas encore branchée)
// ═══════════════════════════════════════════════════════════════════════

const MOCK_SITES: SiteEcommerce[] = [
  {
    id_site: 1,
    code_site: 'LP_VITRINE',
    libelle: 'La Plume Artisanale (vitrine officielle)',
    plateforme: 'custom_api',
    url_site: 'https://laplume-artisanale.tn',
    canal: 'MIXTE',
    devise_defaut: 'TND',
    sync_active: true,
    derniere_sync_at: new Date(Date.now() - 3600_000).toISOString(),
    statut_sante: 'ok',
  },
  {
    id_site: 2,
    code_site: 'AF_SHOPIFY',
    libelle: 'All by Fouta',
    plateforme: 'shopify',
    url_site: 'https://allbyfouta.com',
    canal: 'B2C',
    devise_defaut: 'EUR',
    sync_active: true,
    derniere_sync_at: new Date(Date.now() - 1800_000).toISOString(),
    statut_sante: 'ok',
  },
  {
    id_site: 3,
    code_site: 'FT_WOO',
    libelle: 'Flying Tex (B2B export)',
    plateforme: 'woocommerce',
    url_site: 'https://flyingtex.com',
    canal: 'B2B',
    devise_defaut: 'EUR',
    sync_active: false,
    derniere_sync_at: new Date(Date.now() - 86400_000 * 2).toISOString(),
    statut_sante: 'erreur_auth',
  },
];

const MOCK_COMPTES_B2B: CompteB2BWeb[] = [
  {
    id_compte: 101,
    raison_sociale: 'Boutique El Menzah SARL',
    email_gerant: 'contact@elmenzah.tn',
    telephone: '+216 71 234 567',
    ville: 'Tunis',
    pays: 'Tunisie',
    kyc_statut: 'en_attente',
    date_inscription: new Date(Date.now() - 86400_000 * 2).toISOString(),
    documents_kyc_json: { rc: 'ok', mf: 'ok', cin: 'ok' },
    nombre_commandes: 0,
    ca_total: 0,
  },
  {
    id_compte: 102,
    raison_sociale: 'Hammam Boutique Paris',
    email_gerant: 'achat@hammam-paris.fr',
    telephone: '+33 1 45 67 89 01',
    ville: 'Paris',
    pays: 'France',
    kyc_statut: 'valide',
    date_inscription: new Date(Date.now() - 86400_000 * 60).toISOString(),
    date_validation_kyc: new Date(Date.now() - 86400_000 * 58).toISOString(),
    id_grille_tarif: 3,
    credit_max_b2b: 15000,
    delai_paiement_b2b: '30j_fin_mois',
    remise_permanente_pct: 5,
    documents_kyc_json: { rc: 'ok', mf: 'ok', cin: 'ok' },
    nombre_commandes: 12,
    ca_total: 34500,
  },
  {
    id_compte: 103,
    raison_sociale: 'Hotel Marina Djerba',
    email_gerant: 'purchasing@marina-djerba.tn',
    ville: 'Djerba',
    pays: 'Tunisie',
    kyc_statut: 'valide',
    date_inscription: new Date(Date.now() - 86400_000 * 180).toISOString(),
    date_validation_kyc: new Date(Date.now() - 86400_000 * 178).toISOString(),
    id_grille_tarif: 2,
    credit_max_b2b: 25000,
    delai_paiement_b2b: '60j_fin_mois',
    remise_permanente_pct: 8,
    nombre_commandes: 24,
    ca_total: 87200,
  },
  {
    id_compte: 104,
    raison_sociale: 'Importex Lyon',
    email_gerant: 'admin@importex-lyon.fr',
    ville: 'Lyon',
    pays: 'France',
    kyc_statut: 'refuse',
    date_inscription: new Date(Date.now() - 86400_000 * 5).toISOString(),
    documents_kyc_json: { rc: 'manquant', mf: 'ok', cin: 'ok' },
  },
  {
    id_compte: 105,
    raison_sociale: 'Ancien Client Suspendu',
    email_gerant: 'contact@ancien.com',
    ville: 'Sfax',
    pays: 'Tunisie',
    kyc_statut: 'suspendu',
    date_inscription: new Date(Date.now() - 86400_000 * 400).toISOString(),
    date_validation_kyc: new Date(Date.now() - 86400_000 * 398).toISOString(),
    nombre_commandes: 3,
    ca_total: 2400,
  },
];

const MOCK_COMMANDES_WEB: CommandeWeb[] = [
  {
    id_import: 5001,
    id_site: 2,
    code_site: 'AF_SHOPIFY',
    numero_web: '#AF-2418',
    date_commande_web: new Date(Date.now() - 3600_000 * 2).toISOString(),
    client_email: 'marie.dupont@gmail.com',
    client_nom: 'Marie Dupont',
    total_ttc: 189.5,
    devise: 'EUR',
    statut_paiement_web: 'paye',
    statut_traitement_erp: 'en_attente',
    canal: 'B2C',
    payload_json: { source: 'shopify_webhook', reference: 'AF-2418' },
  },
  {
    id_import: 5002,
    id_site: 1,
    code_site: 'LP_VITRINE',
    numero_web: '#LP-1042',
    date_commande_web: new Date(Date.now() - 3600_000 * 5).toISOString(),
    client_email: 'contact@elmenzah.tn',
    client_nom: 'Boutique El Menzah',
    total_ttc: 1240.0,
    devise: 'TND',
    statut_paiement_web: 'paye',
    statut_traitement_erp: 'converti',
    id_commande_erp: 8734,
    canal: 'B2B',
  },
  {
    id_import: 5003,
    id_site: 3,
    code_site: 'FT_WOO',
    numero_web: '#FT-0089',
    date_commande_web: new Date(Date.now() - 3600_000 * 12).toISOString(),
    client_email: 'purchasing@marina-djerba.tn',
    client_nom: 'Hotel Marina Djerba',
    total_ttc: 8420.0,
    devise: 'EUR',
    statut_paiement_web: 'en_attente',
    statut_traitement_erp: 'refus_stock',
    canal: 'B2B',
  },
  {
    id_import: 5004,
    id_site: 2,
    code_site: 'AF_SHOPIFY',
    numero_web: '#AF-2419',
    date_commande_web: new Date(Date.now() - 3600_000 * 20).toISOString(),
    client_email: 'j.martin@gmail.com',
    client_nom: 'Julie Martin',
    total_ttc: 92.0,
    devise: 'EUR',
    statut_paiement_web: 'paye',
    statut_traitement_erp: 'converti',
    id_commande_erp: 8730,
    canal: 'B2C',
  },
];

const MOCK_SYNC_LOGS: SyncLog[] = Array.from({ length: 24 }).map((_, i) => {
  const errFactor = i % 7 === 0 ? 3 : i % 4 === 0 ? 1 : 0;
  return {
    id_log: 9000 - i,
    id_site: (i % 3) + 1,
    date_sync: new Date(Date.now() - i * 3600_000 * 2).toISOString(),
    type_sync: (['catalogue', 'produit', 'stock', 'prix'] as const)[i % 4],
    statut: errFactor > 1 ? 'erreur' : errFactor === 1 ? 'partiel' : 'ok',
    nb_produits: 120 + i * 3,
    nb_erreurs: errFactor,
    duree_ms: 800 + i * 20,
    message_erreur: errFactor ? 'Timeout API plateforme' : undefined,
  };
});

const MOCK_CODES_PROMO: CodePromoWeb[] = [
  {
    id_promo: 201,
    code: 'ETE2026',
    libelle: 'Promotion été indien -15%',
    type_remise: 'pct',
    valeur: 15,
    montant_min: 80,
    date_debut: '2026-06-01',
    date_fin: '2026-09-30',
    usage_max: 500,
    usage_courant: 128,
    actif: true,
  },
  {
    id_promo: 202,
    code: 'PORT-OFFERT',
    libelle: 'Port offert dès 150 EUR',
    type_remise: 'port_offert',
    valeur: 0,
    montant_min: 150,
    date_debut: '2026-01-01',
    date_fin: '2026-12-31',
    usage_courant: 342,
    actif: true,
  },
  {
    id_promo: 203,
    code: 'B2B-INAUG',
    libelle: 'Inauguration revendeur -10%',
    type_remise: 'pct',
    valeur: 10,
    date_debut: '2026-01-01',
    date_fin: '2026-06-30',
    usage_max: 50,
    usage_courant: 47,
    actif: true,
    id_site: 3,
  },
  {
    id_promo: 204,
    code: 'BLACKFRIDAY',
    libelle: 'Black Friday -20 DT',
    type_remise: 'montant',
    valeur: 20,
    montant_min: 200,
    date_debut: '2025-11-25',
    date_fin: '2025-11-30',
    usage_max: 1000,
    usage_courant: 987,
    actif: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

const EcommerceB2B: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('sites');
  const [loading, setLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Données
  const [sites, setSites] = useState<SiteEcommerce[]>([]);
  const [comptes, setComptes] = useState<CompteB2BWeb[]>([]);
  const [commandes, setCommandes] = useState<CommandeWeb[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [codes, setCodes] = useState<CodePromoWeb[]>([]);

  // ─── Chargement global (une seule fois — mock fallback si API absente)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [sRes, cRes, cwRes, sLogRes, pRes] = await Promise.allSettled([
        sitesEcommerceService.getSites(),
        comptesB2BService.getComptes(),
        commandesWebService.getCommandes(),
        syncEcommerceService.getLogs({ limit: 30 }),
        promoWebService.getCodes(),
      ]);
      if (cancelled) return;

      const pick = <T,>(res: PromiseSettledResult<any>, path: string, fallback: T[]): T[] => {
        if (res.status !== 'fulfilled') return fallback;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d[path])) return d[path];
        return fallback;
      };

      setSites(pick<SiteEcommerce>(sRes, 'sites', MOCK_SITES));
      setComptes(pick<CompteB2BWeb>(cRes, 'comptes', MOCK_COMPTES_B2B));
      setCommandes(pick<CommandeWeb>(cwRes, 'commandes', MOCK_COMMANDES_WEB));
      setSyncLogs(pick<SyncLog>(sLogRes, 'logs', MOCK_SYNC_LOGS));
      setCodes(pick<CodePromoWeb>(pRes, 'codes', MOCK_CODES_PROMO));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── KPIs bannière ──────────────────────────────────────────────────
  const bannerKpis = useMemo(() => {
    const commandesJour = commandes.filter(
      (c) =>
        new Date(c.date_commande_web).toDateString() ===
        new Date().toDateString()
    ).length;
    const caTotal = commandes
      .filter((c) => c.statut_paiement_web === 'paye')
      .reduce((s, c) => s + Number(c.total_ttc || 0), 0);
    const b2bAttente = comptes.filter((c) => c.kyc_statut === 'en_attente').length;
    const syncActifs = sites.filter((s) => s.sync_active && s.statut_sante === 'ok').length;
    return {
      commandesJour,
      caTotal,
      b2bAttente,
      syncActifs,
      totalSites: sites.length,
    };
  }, [commandes, comptes, sites]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════════════════════════════
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
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Store className="w-8 h-8 text-[#C8663D]" />
                E-commerce B2B + B2C
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Sites vitrines &middot; comptes revendeurs &middot; commandes web &middot;
                synchronisation catalogue &middot; codes promo
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Commandes du jour"
              value={bannerKpis.commandesJour}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="terracotta"
              evolutionPct={12.4}
            />
            <KpiCard
              label="CA e-commerce (payé)"
              value={bannerKpis.caTotal.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT eq."
              icon={<TrendingUp className="w-5 h-5" />}
              color="sage"
              evolutionPct={8.7}
              subtitle="Tous canaux confondus"
            />
            <KpiCard
              label="Comptes B2B en attente KYC"
              value={bannerKpis.b2bAttente}
              icon={<Users2 className="w-5 h-5" />}
              color={bannerKpis.b2bAttente > 0 ? 'warning' : 'neutral'}
              subtitle="À valider par commercial"
            />
            <KpiCard
              label="Sites synchronisés"
              value={`${bannerKpis.syncActifs}/${bannerKpis.totalSites}`}
              icon={<RefreshCw className="w-5 h-5" />}
              color="indigo"
            />
          </div>

          {/* Onglets */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
            {(
              [
                { k: 'sites', l: 'Sites', i: <Globe className="w-4 h-4" /> },
                { k: 'comptes', l: 'Comptes B2B', i: <Users2 className="w-4 h-4" /> },
                { k: 'commandes', l: 'Commandes web', i: <ShoppingCart className="w-4 h-4" /> },
                { k: 'sync', l: 'Sync log', i: <RefreshCw className="w-4 h-4" /> },
                { k: 'promo', l: 'Codes promo', i: <Ticket className="w-4 h-4" /> },
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

          {activeTab === 'sites' && (
            <SitesTab
              sites={sites}
              setSites={setSites}
              onError={setGlobalError}
            />
          )}
          {activeTab === 'comptes' && (
            <ComptesTab comptes={comptes} setComptes={setComptes} />
          )}
          {activeTab === 'commandes' && (
            <CommandesTab commandes={commandes} sites={sites} setCommandes={setCommandes} />
          )}
          {activeTab === 'sync' && <SyncTab logs={syncLogs} sites={sites} />}
          {activeTab === 'promo' && (
            <PromoTab codes={codes} setCodes={setCodes} sites={sites} />
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 1 · SITES
// ═══════════════════════════════════════════════════════════════════════
const SitesTab: React.FC<{
  sites: SiteEcommerce[];
  setSites: React.Dispatch<React.SetStateAction<SiteEcommerce[]>>;
  onError: (msg: string | null) => void;
}> = ({ sites, setSites, onError }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SiteEcommerce | null>(null);
  const [form, setForm] = useState<Partial<SiteEcommerce>>({
    code_site: '',
    libelle: '',
    plateforme: 'shopify',
    url_site: '',
    canal: 'B2C',
    devise_defaut: 'TND',
    sync_active: true,
    statut_sante: 'ok',
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      code_site: '',
      libelle: '',
      plateforme: 'shopify',
      url_site: '',
      canal: 'B2C',
      devise_defaut: 'TND',
      sync_active: true,
      statut_sante: 'ok',
    });
    setShowForm(true);
  };

  const openEdit = (s: SiteEcommerce) => {
    setEditing(s);
    setForm(s);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    try {
      if (editing) {
        await sitesEcommerceService.updateSite(editing.id_site, form);
        setSites((prev) =>
          prev.map((s) => (s.id_site === editing.id_site ? ({ ...s, ...form } as SiteEcommerce) : s))
        );
      } else {
        const res = await sitesEcommerceService.createSite(form);
        const created =
          (res?.data?.data as SiteEcommerce) ||
          ({ ...form, id_site: Date.now() } as SiteEcommerce);
        setSites((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch (err: any) {
      // Fallback local
      if (editing) {
        setSites((prev) =>
          prev.map((s) => (s.id_site === editing.id_site ? ({ ...s, ...form } as SiteEcommerce) : s))
        );
      } else {
        setSites((prev) => [{ ...(form as SiteEcommerce), id_site: Date.now() }, ...prev]);
      }
      setShowForm(false);
    }
  };

  const handleDelete = async (s: SiteEcommerce) => {
    if (!window.confirm(`Supprimer le site « ${s.libelle} » ?`)) return;
    try {
      await sitesEcommerceService.deleteSite(s.id_site);
    } catch {
      /* fallback local */
    }
    setSites((prev) => prev.filter((x) => x.id_site !== s.id_site));
  };

  const handleSync = async (s: SiteEcommerce) => {
    try {
      await syncEcommerceService.syncCatalogueComplet(s.id_site);
    } catch {
      /* mock */
    }
    setSites((prev) =>
      prev.map((x) =>
        x.id_site === s.id_site
          ? { ...x, derniere_sync_at: new Date().toISOString(), statut_sante: 'ok' }
          : x
      )
    );
  };

  const handleToggleSync = async (s: SiteEcommerce) => {
    const next = !s.sync_active;
    try {
      await sitesEcommerceService.toggleSync(s.id_site, next);
    } catch {
      /* mock */
    }
    setSites((prev) =>
      prev.map((x) => (x.id_site === s.id_site ? { ...x, sync_active: next } : x))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{sites.length}</span> site(s) enregistré(s)
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Nouveau site
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map((s) => (
          <SiteCard
            key={s.id_site}
            site={s}
            onEdit={openEdit}
            onDelete={handleDelete}
            onSync={handleSync}
            onToggleSync={handleToggleSync}
          />
        ))}
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)} title={editing ? 'Modifier le site' : 'Nouveau site e-commerce'}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Code site *">
                <input
                  required
                  value={form.code_site || ''}
                  onChange={(e) => setForm({ ...form, code_site: e.target.value })}
                  placeholder="LP_VITRINE"
                  className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                />
              </Field>
              <Field label="Libellé *">
                <input
                  required
                  value={form.libelle || ''}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="URL site *">
                <input
                  required
                  type="url"
                  value={form.url_site || ''}
                  onChange={(e) => setForm({ ...form, url_site: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Plateforme">
                <select
                  value={form.plateforme}
                  onChange={(e) => setForm({ ...form, plateforme: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                  <option value="custom_api">Custom API (Next.js)</option>
                  <option value="prestashop">PrestaShop</option>
                </select>
              </Field>
              <Field label="Canal">
                <select
                  value={form.canal}
                  onChange={(e) => setForm({ ...form, canal: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="B2C">B2C — Grand public</option>
                  <option value="B2B">B2B — Revendeurs</option>
                  <option value="MIXTE">MIXTE — les deux</option>
                </select>
              </Field>
              <Field label="Devise">
                <select
                  value={form.devise_defaut}
                  onChange={(e) => setForm({ ...form, devise_defaut: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="TND">TND — Dinar tunisien</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar US</option>
                </select>
              </Field>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.sync_active}
                onChange={(e) => setForm({ ...form, sync_active: e.target.checked })}
              />
              Synchronisation active
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
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 2 · COMPTES B2B (KYC)
// ═══════════════════════════════════════════════════════════════════════
const ComptesTab: React.FC<{
  comptes: CompteB2BWeb[];
  setComptes: React.Dispatch<React.SetStateAction<CompteB2BWeb[]>>;
}> = ({ comptes, setComptes }) => {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<KycStatut | 'all'>('all');
  const [detail, setDetail] = useState<CompteB2BWeb | null>(null);

  const filtered = useMemo(() => {
    return comptes.filter((c) => {
      if (filterStatut !== 'all' && c.kyc_statut !== filterStatut) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.raison_sociale.toLowerCase().includes(q) ||
          (c.email_gerant || '').toLowerCase().includes(q) ||
          (c.ville || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comptes, search, filterStatut]);

  const stats = useMemo(() => {
    const acc = { en_attente: 0, valide: 0, refuse: 0, suspendu: 0 };
    comptes.forEach((c) => acc[c.kyc_statut]++);
    return acc;
  }, [comptes]);

  const handleValider = async (c: CompteB2BWeb) => {
    try {
      await comptesB2BService.validerKyc(c.id_compte);
    } catch {
      /* mock */
    }
    setComptes((prev) =>
      prev.map((x) =>
        x.id_compte === c.id_compte
          ? { ...x, kyc_statut: 'valide', date_validation_kyc: new Date().toISOString() }
          : x
      )
    );
    setDetail(null);
  };

  const handleRefuser = async (c: CompteB2BWeb) => {
    const motif = window.prompt('Motif du refus KYC :');
    if (!motif) return;
    try {
      await comptesB2BService.refuserKyc(c.id_compte, motif);
    } catch {
      /* mock */
    }
    setComptes((prev) =>
      prev.map((x) => (x.id_compte === c.id_compte ? { ...x, kyc_statut: 'refuse' } : x))
    );
    setDetail(null);
  };

  return (
    <div>
      {/* Stats KYC */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => setFilterStatut('en_attente')}
          className={`text-left rounded-lg p-3 border-2 transition-all ${
            filterStatut === 'en_attente'
              ? 'border-orange-400 bg-orange-50'
              : 'border-transparent bg-white hover:border-orange-200'
          }`}
        >
          <div className="text-xs text-gray-600 font-medium">En attente</div>
          <div className="text-2xl font-bold text-orange-600">{stats.en_attente}</div>
        </button>
        <button
          onClick={() => setFilterStatut('valide')}
          className={`text-left rounded-lg p-3 border-2 transition-all ${
            filterStatut === 'valide'
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-transparent bg-white hover:border-emerald-200'
          }`}
        >
          <div className="text-xs text-gray-600 font-medium">Validés</div>
          <div className="text-2xl font-bold text-emerald-600">{stats.valide}</div>
        </button>
        <button
          onClick={() => setFilterStatut('refuse')}
          className={`text-left rounded-lg p-3 border-2 transition-all ${
            filterStatut === 'refuse' ? 'border-red-400 bg-red-50' : 'border-transparent bg-white hover:border-red-200'
          }`}
        >
          <div className="text-xs text-gray-600 font-medium">Refusés</div>
          <div className="text-2xl font-bold text-red-600">{stats.refuse}</div>
        </button>
        <button
          onClick={() => setFilterStatut('suspendu')}
          className={`text-left rounded-lg p-3 border-2 transition-all ${
            filterStatut === 'suspendu'
              ? 'border-gray-400 bg-gray-100'
              : 'border-transparent bg-white hover:border-gray-300'
          }`}
        >
          <div className="text-xs text-gray-600 font-medium">Suspendus</div>
          <div className="text-2xl font-bold text-gray-600">{stats.suspendu}</div>
        </button>
      </div>

      {/* Recherche / filtre */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher raison sociale, email, ville…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        {filterStatut !== 'all' && (
          <button
            onClick={() => setFilterStatut('all')}
            className="text-xs text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Retirer filtre statut
          </button>
        )}
        <div className="text-sm text-gray-500 ml-auto">
          {filtered.length} / {comptes.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Compte
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                KYC
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Grille · Crédit
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Historique
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id_compte} onClick={() => setDetail(c)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-900">{c.raison_sociale}</div>
                  <div className="text-xs text-gray-500">
                    {c.ville} · {c.pays}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <div>{c.email_gerant}</div>
                  {c.telephone && <div className="text-xs text-gray-500">{c.telephone}</div>}
                </td>
                <td className="px-4 py-3">
                  <KycBadge statut={c.kyc_statut} />
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {c.id_grille_tarif ? (
                    <>
                      <div>
                        Grille <span className="font-mono">#{c.id_grille_tarif}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Crédit max{' '}
                        <span className="font-semibold">
                          {c.credit_max_b2b?.toLocaleString('fr-FR')} DT
                        </span>{' '}
                        · {c.delai_paiement_b2b}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-400 italic">Non attribuée</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {c.nombre_commandes || 0} cmd ·{' '}
                  {(c.ca_total || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} DT
                </td>
                <td className="px-4 py-3 text-right"></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Aucun compte pour ces critères.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <Modal onClose={() => setDetail(null)} title={`Compte B2B · ${detail.raison_sociale}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Raison sociale">{detail.raison_sociale}</InfoRow>
              <InfoRow label="Email gérant">{detail.email_gerant}</InfoRow>
              <InfoRow label="Téléphone">{detail.telephone || '—'}</InfoRow>
              <InfoRow label="Ville / Pays">
                {detail.ville} · {detail.pays}
              </InfoRow>
              <InfoRow label="Statut KYC">
                <KycBadge statut={detail.kyc_statut} />
              </InfoRow>
              <InfoRow label="Date inscription">
                {new Date(detail.date_inscription).toLocaleDateString('fr-FR')}
              </InfoRow>
            </div>

            {/* Documents KYC */}
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2 inline-flex items-center gap-2">
                <FileText className="w-4 h-4" /> Documents KYC
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {['rc', 'mf', 'cin'].map((doc) => {
                  const status = detail.documents_kyc_json?.[doc] || 'manquant';
                  const ok = status === 'ok';
                  return (
                    <div
                      key={doc}
                      className={`border rounded-lg p-3 flex items-center justify-between ${
                        ok ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-gray-500 uppercase">{doc}</div>
                        <div
                          className={`text-sm font-semibold ${
                            ok ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {ok ? 'Fourni' : 'Manquant'}
                        </div>
                      </div>
                      {ok && (
                        <button className="text-xs inline-flex items-center gap-1 text-emerald-700 hover:underline">
                          <Download className="w-3.5 h-3.5" /> Voir
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {detail.kyc_statut === 'en_attente' && (
              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleValider(detail)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4" /> Valider KYC
                </button>
                <button
                  onClick={() => handleRefuser(detail)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" /> Refuser
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 3 · COMMANDES WEB
// ═══════════════════════════════════════════════════════════════════════
const CommandesTab: React.FC<{
  commandes: CommandeWeb[];
  sites: SiteEcommerce[];
  setCommandes: React.Dispatch<React.SetStateAction<CommandeWeb[]>>;
}> = ({ commandes, sites, setCommandes }) => {
  const [filterSite, setFilterSite] = useState<number | 'all'>('all');
  const [filterCanal, setFilterCanal] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [payloadCmd, setPayloadCmd] = useState<CommandeWeb | null>(null);

  const filtered = useMemo(() => {
    return commandes.filter((c) => {
      if (filterSite !== 'all' && c.id_site !== filterSite) return false;
      if (filterCanal !== 'all' && c.canal !== filterCanal) return false;
      if (filterStatut !== 'all' && c.statut_traitement_erp !== filterStatut) return false;
      return true;
    });
  }, [commandes, filterSite, filterCanal, filterStatut]);

  const importerErp = async (c: CommandeWeb) => {
    try {
      await commandesWebService.importerErp(c.id_import);
    } catch {
      /* mock */
    }
    setCommandes((prev) =>
      prev.map((x) =>
        x.id_import === c.id_import
          ? { ...x, statut_traitement_erp: 'converti', id_commande_erp: Math.floor(Math.random() * 9999) + 8000 }
          : x
      )
    );
  };

  const statutBadge = (statut: CommandeWeb['statut_traitement_erp']) => {
    const map: Record<string, string> = {
      en_attente: 'bg-orange-100 text-orange-700',
      converti: 'bg-emerald-100 text-emerald-700',
      refus_stock: 'bg-red-100 text-red-700',
      refus_manuel: 'bg-red-100 text-red-700',
      annule_web: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${map[statut] || map.en_attente}`}>
        {statut.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div>
      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={filterSite}
          onChange={(e) =>
            setFilterSite(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
          }
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Tous les sites</option>
          {sites.map((s) => (
            <option key={s.id_site} value={s.id_site}>
              {s.libelle}
            </option>
          ))}
        </select>
        <select
          value={filterCanal}
          onChange={(e) => setFilterCanal(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Tous canaux</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="all">Tous statuts ERP</option>
          <option value="en_attente">En attente</option>
          <option value="converti">Convertie</option>
          <option value="refus_stock">Refus stock</option>
          <option value="refus_manuel">Refus manuel</option>
          <option value="annule_web">Annulée site</option>
        </select>
        <div className="text-sm text-gray-500 ml-auto">
          {filtered.length} / {commandes.length}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N° web</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Site · Canal</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <tr key={c.id_import} onClick={() => setPayloadCmd(c)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3 font-mono text-xs">
                  <div className="font-semibold text-gray-900">{c.numero_web}</div>
                  {c.id_commande_erp && (
                    <div className="text-[10px] text-emerald-600">
                      → ERP #{c.id_commande_erp}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-700">{c.code_site}</div>
                  {c.canal && (
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.canal === 'B2B'
                          ? 'bg-[#3B4E68] text-white'
                          : 'bg-[#C8663D] text-white'
                      }`}
                    >
                      {c.canal}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-gray-900 font-medium">{c.client_nom}</div>
                  <div className="text-xs text-gray-500">{c.client_email}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {c.total_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {c.devise}
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  {new Date(c.date_commande_web).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500">
                      Paiement :{' '}
                      <span
                        className={`font-medium ${
                          c.statut_paiement_web === 'paye'
                            ? 'text-emerald-700'
                            : c.statut_paiement_web === 'echec'
                            ? 'text-red-700'
                            : 'text-orange-700'
                        }`}
                      >
                        {c.statut_paiement_web}
                      </span>
                    </div>
                    {statutBadge(c.statut_traitement_erp)}
                  </div>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {c.statut_traitement_erp === 'en_attente' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); importerErp(c); }}
                      className="text-xs bg-[#4A6C5B] text-white px-2 py-1 rounded hover:bg-[#385444] inline-flex items-center gap-1"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> Importer ERP
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Aucune commande pour ces filtres.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {payloadCmd && (
        <Modal
          onClose={() => setPayloadCmd(null)}
          title={`Payload webhook · ${payloadCmd.numero_web}`}
        >
          <pre className="bg-gray-900 text-emerald-300 text-xs p-4 rounded-lg overflow-auto max-h-[60vh]">
{JSON.stringify(
  payloadCmd.payload_json || {
    id: payloadCmd.id_import,
    numero_web: payloadCmd.numero_web,
    client: {
      nom: payloadCmd.client_nom,
      email: payloadCmd.client_email,
    },
    montants: {
      total_ttc: payloadCmd.total_ttc,
      devise: payloadCmd.devise,
    },
    statut_paiement: payloadCmd.statut_paiement_web,
  },
  null,
  2
)}
          </pre>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 4 · SYNC LOG
// ═══════════════════════════════════════════════════════════════════════
const SyncTab: React.FC<{ logs: SyncLog[]; sites: SiteEcommerce[] }> = ({ logs, sites }) => {
  const grouped = useMemo(() => {
    const map = new Map<string, SyncLog[]>();
    logs.forEach((l) => {
      const day = new Date(l.date_sync).toISOString().slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(l);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, items]) => {
        const nbErreurs = items.reduce((s, x) => s + x.nb_erreurs, 0);
        const nbTotal = items.reduce((s, x) => s + x.nb_produits, 0);
        const tauxErr = nbTotal ? (nbErreurs / nbTotal) * 100 : 0;
        return { day, items, nbErreurs, nbTotal, tauxErr };
      });
  }, [logs]);

  const retry = async (l: SyncLog) => {
    try {
      await syncEcommerceService.retrySync(l.id_log);
      alert('Retry lancé');
    } catch {
      alert('Retry (mock) : le job serait relancé.');
    }
  };

  return (
    <div className="space-y-4">
      {grouped.map(({ day, items, nbErreurs, nbTotal, tauxErr }) => (
        <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-3 border-b flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">
                {new Date(day).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {items.length} synchronisation(s) · {nbTotal} produits traités
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-lg font-bold ${
                  tauxErr === 0
                    ? 'text-emerald-600'
                    : tauxErr < 5
                    ? 'text-orange-600'
                    : 'text-red-600'
                }`}
              >
                {tauxErr.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">taux erreur</div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((l) => {
              const site = sites.find((s) => s.id_site === l.id_site);
              return (
                <div key={l.id_log} className="px-5 py-3 flex items-center gap-4 text-sm hover:bg-gray-50">
                  <div className="w-20 text-xs text-gray-500">
                    {new Date(l.date_sync).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="w-40 truncate text-gray-700">
                    {site?.libelle || `Site #${l.id_site}`}
                  </div>
                  <div className="w-24 text-gray-600 font-mono text-xs">{l.type_sync}</div>
                  <div className="flex-1 text-gray-600">
                    <span className="font-semibold text-gray-900">{l.nb_produits}</span> prod ·{' '}
                    <span
                      className={l.nb_erreurs === 0 ? 'text-emerald-600' : 'text-red-600 font-semibold'}
                    >
                      {l.nb_erreurs} err
                    </span>
                    {l.duree_ms && (
                      <span className="text-gray-400 ml-2">({l.duree_ms}ms)</span>
                    )}
                    {l.message_erreur && (
                      <div className="text-xs text-red-600 italic mt-0.5">
                        {l.message_erreur}
                      </div>
                    )}
                  </div>
                  <div className="w-24 text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        l.statut === 'ok'
                          ? 'bg-emerald-100 text-emerald-700'
                          : l.statut === 'partiel'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {l.statut}
                    </span>
                  </div>
                  {l.nb_erreurs > 0 && (
                    <button
                      onClick={() => retry(l)}
                      className="text-xs text-[#3B4E68] hover:text-[#C8663D] inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {grouped.length === 0 && (
        <div className="text-center text-gray-400 py-12">Aucun log de synchronisation.</div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ONGLET 5 · CODES PROMO
// ═══════════════════════════════════════════════════════════════════════
const PromoTab: React.FC<{
  codes: CodePromoWeb[];
  setCodes: React.Dispatch<React.SetStateAction<CodePromoWeb[]>>;
  sites: SiteEcommerce[];
}> = ({ codes, setCodes, sites }) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CodePromoWeb | null>(null);
  const [form, setForm] = useState<Partial<CodePromoWeb>>({
    code: '',
    libelle: '',
    type_remise: 'pct',
    valeur: 10,
    date_debut: new Date().toISOString().slice(0, 10),
    date_fin: new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10),
    usage_courant: 0,
    actif: true,
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      code: '',
      libelle: '',
      type_remise: 'pct',
      valeur: 10,
      date_debut: new Date().toISOString().slice(0, 10),
      date_fin: new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10),
      usage_courant: 0,
      actif: true,
    });
    setShowForm(true);
  };

  const openEdit = (c: CodePromoWeb) => {
    setEditing(c);
    setForm(c);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await promoWebService.updateCode(editing.id_promo, form);
      else await promoWebService.createCode(form);
    } catch {
      /* mock */
    }
    if (editing) {
      setCodes((prev) =>
        prev.map((x) => (x.id_promo === editing.id_promo ? ({ ...x, ...form } as CodePromoWeb) : x))
      );
    } else {
      setCodes((prev) => [{ ...(form as CodePromoWeb), id_promo: Date.now() }, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = async (c: CodePromoWeb) => {
    if (!window.confirm(`Supprimer le code « ${c.code} » ?`)) return;
    try {
      await promoWebService.deleteCode(c.id_promo);
    } catch {
      /* mock */
    }
    setCodes((prev) => prev.filter((x) => x.id_promo !== c.id_promo));
  };

  const toggleActif = async (c: CodePromoWeb) => {
    try {
      await promoWebService.toggleActif(c.id_promo, !c.actif);
    } catch {
      /* mock */
    }
    setCodes((prev) =>
      prev.map((x) => (x.id_promo === c.id_promo ? { ...x, actif: !x.actif } : x))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{codes.length}</span> code(s) promo · dont{' '}
          <span className="font-semibold text-emerald-700">
            {codes.filter((c) => c.actif).length}
          </span>{' '}
          actif(s)
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231]"
        >
          <PlusCircle className="w-4 h-4" /> Nouveau code
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {codes.map((c) => {
          const usageRatio = c.usage_max ? (c.usage_courant / c.usage_max) * 100 : 0;
          const site = sites.find((s) => s.id_site === c.id_site);
          const now = new Date();
          const fin = new Date(c.date_fin);
          const expire = fin < now;
          return (
            <div
              key={c.id_promo}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                !c.actif ? 'opacity-60' : ''
              }`}
            >
              <div className="p-4 border-b bg-gradient-to-r from-[#FDF2ED] to-white">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-bold font-mono text-[#C8663D]">{c.code}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{c.libelle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#3B4E68]">
                      {c.type_remise === 'pct'
                        ? `${c.valeur}%`
                        : c.type_remise === 'montant'
                        ? `${c.valeur} DT`
                        : 'Port'}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      {c.type_remise === 'port_offert' ? 'offert' : 'de remise'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>
                    Du{' '}
                    <span className="font-medium text-gray-800">
                      {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                    </span>
                  </span>
                  <span>
                    au{' '}
                    <span
                      className={`font-medium ${
                        expire ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  </span>
                </div>
                {c.montant_min && (
                  <div className="text-xs text-gray-500">
                    Montant minimum : {c.montant_min} {site?.devise_defaut || 'DT'}
                  </div>
                )}
                {site && (
                  <div className="text-xs text-gray-500">
                    Site : <span className="font-medium">{site.libelle}</span>
                  </div>
                )}
                {c.usage_max ? (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Utilisations</span>
                      <span className="font-medium text-gray-800">
                        {c.usage_courant} / {c.usage_max}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          usageRatio >= 90
                            ? 'bg-red-500'
                            : usageRatio >= 70
                            ? 'bg-orange-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(usageRatio, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    {c.usage_courant} utilisation(s) · pas de limite
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-2 border-t flex items-center gap-2">
                <button
                  onClick={() => toggleActif(c)}
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    c.actif
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {c.actif ? 'Actif' : 'Désactivé'}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 text-gray-500 hover:text-[#3B4E68] rounded"
                  title="Modifier"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1.5 text-gray-500 hover:text-red-600 rounded"
                  title="Supprimer"
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
          title={editing ? 'Modifier code promo' : 'Nouveau code promo'}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Code *">
                <input
                  required
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                />
              </Field>
              <Field label="Libellé">
                <input
                  value={form.libelle || ''}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Type de remise">
                <select
                  value={form.type_remise}
                  onChange={(e) =>
                    setForm({ ...form, type_remise: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pct">Pourcentage</option>
                  <option value="montant">Montant fixe</option>
                  <option value="port_offert">Port offert</option>
                </select>
              </Field>
              <Field label="Valeur">
                <input
                  type="number"
                  value={form.valeur || 0}
                  onChange={(e) =>
                    setForm({ ...form, valeur: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Date début *">
                <input
                  required
                  type="date"
                  value={form.date_debut || ''}
                  onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Date fin *">
                <input
                  required
                  type="date"
                  value={form.date_fin || ''}
                  onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Montant minimum">
                <input
                  type="number"
                  value={form.montant_min || ''}
                  onChange={(e) =>
                    setForm({ ...form, montant_min: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Usage max">
                <input
                  type="number"
                  value={form.usage_max || ''}
                  onChange={(e) =>
                    setForm({ ...form, usage_max: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="Site (optionnel)">
                <select
                  value={form.id_site || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      id_site: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Tous les sites</option>
                  {sites.map((s) => (
                    <option key={s.id_site} value={s.id_site}>
                      {s.libelle}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
              />
              Code actif
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
                {editing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PRIMITIVES UI PARTAGÉES
// ═══════════════════════════════════════════════════════════════════════

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
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
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <div className="text-[11px] uppercase text-gray-500 font-medium">{label}</div>
    <div className="text-sm text-gray-900 mt-0.5">{children}</div>
  </div>
);

export default EcommerceB2B;
