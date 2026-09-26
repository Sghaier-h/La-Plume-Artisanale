import React, { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  Globe,
  Activity,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import CampagnePerfChart from '../../components/ecommerce/CampagnePerfChart';

// ─── Types ────────────────────────────────────────────────────────────
interface KpiWebSnapshot {
  ca_jour_dt: number;
  ca_mois_dt: number;
  panier_moyen_dt: number;
  taux_conversion_pct: number;
  visites_jour: number;
  commandes_jour: number;
}

interface TopProduitWeb {
  id_article: number;
  ref: string;
  designation: string;
  ventes: number;
  ca_dt: number;
}

interface SourceTrafic {
  source: string;
  visites: number;
  pct: number;
  conversions: number;
}

// ─── Mock ─────────────────────────────────────────────────────────────
const MOCK_KPI: KpiWebSnapshot = {
  ca_jour_dt: 4820,
  ca_mois_dt: 128450,
  panier_moyen_dt: 245,
  taux_conversion_pct: 2.4,
  visites_jour: 812,
  commandes_jour: 19,
};

const MOCK_SERIE_VISITES = [640, 685, 700, 720, 690, 750, 780, 820, 810, 795, 830, 812, 845, 820];
const MOCK_SERIE_COMMANDES = [12, 14, 15, 16, 14, 17, 18, 20, 19, 18, 21, 19, 22, 20];

const MOCK_TOP_PRODUITS: TopProduitWeb[] = [
  { id_article: 101, ref: 'FT-CLA-BLANC-95', designation: 'Fouta classique blanche 95×180', ventes: 82, ca_dt: 4920 },
  { id_article: 102, ref: 'FT-CLA-TERRA-95', designation: 'Fouta classique terracotta 95×180', ventes: 68, ca_dt: 4080 },
  { id_article: 103, ref: 'FT-JET-INDIGO-200', designation: 'Jeté canapé indigo 200×250', ventes: 45, ca_dt: 5400 },
  { id_article: 104, ref: 'FT-SERV-KRAFT-70', designation: 'Serviette main kraft 70×140', ventes: 128, ca_dt: 3840 },
  { id_article: 105, ref: 'FT-CUS-SAGE-45', designation: 'Coussin décoratif sage 45×45', ventes: 34, ca_dt: 2380 },
];

const MOCK_SOURCES: SourceTrafic[] = [
  { source: 'Google Organic', visites: 3820, pct: 44.2, conversions: 92 },
  { source: 'Direct', visites: 2140, pct: 24.7, conversions: 68 },
  { source: 'Instagram Ads', visites: 1240, pct: 14.3, conversions: 24 },
  { source: 'Meta Ads', visites: 780, pct: 9.0, conversions: 18 },
  { source: 'Email', visites: 420, pct: 4.9, conversions: 26 },
  { source: 'Autres', visites: 250, pct: 2.9, conversions: 4 },
];

// ─── Fallback ─────────────────────────────────────────────────────────
const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const pickObj = <T,>(res: PromiseSettledResult<any>, fb: T): T => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as T) : fb;
};

// ─── Composant ────────────────────────────────────────────────────────
const StatsWeb: React.FC = () => {
  const [kpi, setKpi] = useState<KpiWebSnapshot>(MOCK_KPI);
  const [topProduits, setTopProduits] = useState<TopProduitWeb[]>([]);
  const [sources, setSources] = useState<SourceTrafic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [rKpi, rTop, rSrc] = await Promise.allSettled([
        Promise.reject(new Error('service_web_kpi')),
        Promise.reject(new Error('service_web_top')),
        Promise.reject(new Error('service_web_sources')),
      ]);
      if (cancelled) return;
      setKpi(pickObj<KpiWebSnapshot>(rKpi, MOCK_KPI));
      setTopProduits(pickArray<TopProduitWeb>(rTop, 'top_produits', MOCK_TOP_PRODUITS));
      setSources(pickArray<SourceTrafic>(rSrc, 'sources', MOCK_SOURCES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxTop = useMemo(
    () => (topProduits.length ? Math.max(...topProduits.map((t) => t.ca_dt)) : 1),
    [topProduits],
  );

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--accent-terracotta)' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-widest mb-2"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
          >
            §11quinquies · E-commerce
          </div>
          <h1
            className="text-3xl italic flex items-center gap-3"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 500,
              color: 'var(--fg-primary)',
            }}
          >
            <TrendingUp className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Statistiques ventes web
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Performance en temps réel des sites e-commerce (B2B &amp; B2C).
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="CA jour"
            value={kpi.ca_jour_dt.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            icon={<DollarSign className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="CA mois"
            value={kpi.ca_mois_dt.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            icon={<TrendingUp className="w-5 h-5" />}
            color="warning"
          />
          <KpiCard
            label="Panier moyen"
            value={kpi.panier_moyen_dt.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            icon={<ShoppingCart className="w-5 h-5" />}
            color="indigo"
          />
          <KpiCard
            label="Taux conversion"
            value={kpi.taux_conversion_pct.toFixed(1)}
            suffix="%"
            icon={<Activity className="w-5 h-5" />}
            color="sage"
            subtitle={`${kpi.commandes_jour} cmd / ${kpi.visites_jour} visites (24h)`}
          />
        </div>

        {/* Chart : trafic vs commandes */}
        <div
          className="rounded-xl shadow-sm border p-5 mb-6"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5" style={{ color: 'var(--accent-terracotta)' }} />
            <h3
              className="italic"
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              Trafic vs commandes — 14 derniers jours
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  Visites
                </span>
                <span
                  className="text-xl font-mono font-bold"
                  style={{ color: 'var(--accent-indigo)' }}
                >
                  {MOCK_SERIE_VISITES.reduce((s, v) => s + v, 0).toLocaleString('fr-FR')}
                </span>
              </div>
              <CampagnePerfChart
                data={MOCK_SERIE_VISITES}
                color="var(--accent-indigo)"
                width={480}
                height={80}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  Commandes
                </span>
                <span
                  className="text-xl font-mono font-bold"
                  style={{ color: 'var(--accent-terracotta)' }}
                >
                  {MOCK_SERIE_COMMANDES.reduce((s, v) => s + v, 0)}
                </span>
              </div>
              <CampagnePerfChart
                data={MOCK_SERIE_COMMANDES}
                color="var(--accent-terracotta)"
                width={480}
                height={80}
              />
            </div>
          </div>
        </div>

        {/* Top produits web + Sources trafic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top produits */}
          <div
            className="rounded-xl shadow-sm border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              className="p-4 flex items-center gap-2 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Package className="w-5 h-5" style={{ color: 'var(--accent-terracotta)' }} />
              <h3
                className="italic"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 500,
                  color: 'var(--fg-primary)',
                }}
              >
                Top produits web
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {topProduits.map((t) => {
                const pct = (t.ca_dt / maxTop) * 100;
                return (
                  <div key={t.id_article} className="p-3">
                    <div className="flex justify-between mb-1">
                      <div>
                        <div
                          className="text-xs font-mono font-semibold"
                          style={{ color: 'var(--accent-indigo)' }}
                        >
                          {t.ref}
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: 'var(--fg-primary)' }}
                        >
                          {t.designation}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-mono font-bold"
                          style={{ color: 'var(--accent-terracotta)' }}
                        >
                          {t.ca_dt.toLocaleString('fr-FR')} DT
                        </div>
                        <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                          {t.ventes} ventes
                        </div>
                      </div>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: 'var(--bg-sunken)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: 'var(--accent-terracotta)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sources trafic */}
          <div
            className="rounded-xl shadow-sm border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              className="p-4 flex items-center gap-2 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Globe className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
              <h3
                className="italic"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 500,
                  color: 'var(--fg-primary)',
                }}
              >
                Sources de trafic
              </h3>
            </div>
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-left text-[11px] uppercase tracking-wider"
                    style={{
                      color: 'var(--fg-secondary)',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    <th className="pb-2">Source</th>
                    <th className="pb-2 text-right">Visites</th>
                    <th className="pb-2 text-right">%</th>
                    <th className="pb-2 text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {sources.map((s) => (
                    <tr
                      key={s.source}
                      className="border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td className="py-2" style={{ color: 'var(--fg-primary)' }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: 'var(--accent-indigo)' }}
                          />
                          {s.source}
                        </div>
                      </td>
                      <td
                        className="py-2 text-right font-mono"
                        style={{ color: 'var(--fg-primary)' }}
                      >
                        {s.visites.toLocaleString('fr-FR')}
                      </td>
                      <td
                        className="py-2 text-right font-mono"
                        style={{ color: 'var(--fg-secondary)' }}
                      >
                        {s.pct.toFixed(1)}%
                      </td>
                      <td
                        className="py-2 text-right font-mono font-semibold"
                        style={{ color: 'var(--accent-terracotta)' }}
                      >
                        {s.conversions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsWeb;
