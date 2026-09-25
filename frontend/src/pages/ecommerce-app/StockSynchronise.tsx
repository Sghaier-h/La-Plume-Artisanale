import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  Store,
  Zap,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';

// ─── Types ────────────────────────────────────────────────────────────
interface StockLigne {
  id_article: number;
  ref: string;
  designation: string;
  stock_local: number;
  stock_shopify: number | null;
  stock_woocommerce: number | null;
  derniere_sync_at: string;
  etat: 'ok' | 'ecart' | 'jamais_syncrhonise';
}

// ─── Mock ─────────────────────────────────────────────────────────────
const nowMinus = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const MOCK_STOCK: StockLigne[] = [
  {
    id_article: 101,
    ref: 'FT-CLA-BLANC-95',
    designation: 'Fouta classique blanche 95×180',
    stock_local: 245,
    stock_shopify: 245,
    stock_woocommerce: 245,
    derniere_sync_at: nowMinus(12),
    etat: 'ok',
  },
  {
    id_article: 102,
    ref: 'FT-CLA-TERRA-95',
    designation: 'Fouta classique terracotta 95×180',
    stock_local: 62,
    stock_shopify: 58,
    stock_woocommerce: 62,
    derniere_sync_at: nowMinus(45),
    etat: 'ecart',
  },
  {
    id_article: 103,
    ref: 'FT-JET-INDIGO-200',
    designation: 'Jeté de canapé indigo 200×250',
    stock_local: 28,
    stock_shopify: 28,
    stock_woocommerce: null,
    derniere_sync_at: nowMinus(8),
    etat: 'ok',
  },
  {
    id_article: 104,
    ref: 'FT-SERV-KRAFT-70',
    designation: 'Serviette main kraft 70×140',
    stock_local: 380,
    stock_shopify: 380,
    stock_woocommerce: 375,
    derniere_sync_at: nowMinus(28),
    etat: 'ecart',
  },
  {
    id_article: 105,
    ref: 'FT-CUS-SAGE-45',
    designation: 'Coussin décoratif sage 45×45',
    stock_local: 96,
    stock_shopify: null,
    stock_woocommerce: null,
    derniere_sync_at: nowMinus(4320),
    etat: 'jamais_syncrhonise',
  },
  {
    id_article: 106,
    ref: 'FT-KIM-LIN-M',
    designation: 'Kimono lin naturel taille M',
    stock_local: 18,
    stock_shopify: 18,
    stock_woocommerce: 18,
    derniere_sync_at: nowMinus(3),
    etat: 'ok',
  },
  {
    id_article: 107,
    ref: 'FT-CLA-OR-95',
    designation: 'Fouta classique or 95×180',
    stock_local: 152,
    stock_shopify: 148,
    stock_woocommerce: 152,
    derniere_sync_at: nowMinus(90),
    etat: 'ecart',
  },
];

// ─── Fallback ─────────────────────────────────────────────────────────
const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const timeAgo = (iso: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 60_000;
  if (diff < 1) return "à l'instant";
  if (diff < 60) return `${Math.round(diff)} min`;
  if (diff < 1440) return `${Math.round(diff / 60)} h`;
  return `${Math.round(diff / 1440)} j`;
};

// ─── Composant ────────────────────────────────────────────────────────
const StockSynchronise: React.FC = () => {
  const [rows, setRows] = useState<StockLigne[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreEtat, setFiltreEtat] = useState<'tous' | 'ok' | 'ecart' | 'jamais_syncrhonise'>('tous');
  const [syncing, setSyncing] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        Promise.reject(new Error('service_stock_sync_v2')),
      ]);
      if (cancelled) return;
      setRows(pickArray<StockLigne>(res, 'stock', MOCK_STOCK));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filtreEtat !== 'tous' && r.etat !== filtreEtat) return false;
      if (!s) return true;
      return `${r.ref} ${r.designation}`.toLowerCase().includes(s);
    });
  }, [rows, search, filtreEtat]);

  const kpis = useMemo(() => {
    const total = rows.length;
    const ecarts = rows.filter((r) => r.etat === 'ecart').length;
    const jamais = rows.filter((r) => r.etat === 'jamais_syncrhonise').length;
    const stockLocal = rows.reduce((s, r) => s + r.stock_local, 0);
    return { total, ecarts, jamais, stockLocal };
  }, [rows]);

  const forceSync = async (id: number) => {
    setSyncing(id);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 700));
    setRows((prev) =>
      prev.map((r) =>
        r.id_article === id
          ? {
              ...r,
              stock_shopify: r.stock_local,
              stock_woocommerce: r.stock_woocommerce == null ? null : r.stock_local,
              derniere_sync_at: new Date().toISOString(),
              etat: 'ok',
            }
          : r,
      ),
    );
    setSyncing(null);
  };

  const ecart = (l: StockLigne, key: 'stock_shopify' | 'stock_woocommerce') => {
    const v = l[key];
    if (v == null) return null;
    return v - l.stock_local;
  };

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
            §11quinquies.3 · E-commerce
          </div>
          <h1
            className="text-3xl italic flex items-center gap-3"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 500,
              color: 'var(--fg-primary)',
            }}
          >
            <RefreshCw className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Stock synchronisé vers sites
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Comparaison stock ERP vs Shopify / WooCommerce et action de resynchronisation.
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Articles suivis"
            value={kpis.total}
            icon={<Package className="w-5 h-5" />}
            color="indigo"
          />
          <KpiCard
            label="Écarts en cours"
            value={kpis.ecarts}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="warning"
          />
          <KpiCard
            label="Jamais synchronisés"
            value={kpis.jamais}
            icon={<Store className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="Stock local total"
            value={kpis.stockLocal.toLocaleString('fr-FR')}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="sage"
          />
        </div>

        {/* Filtres */}
        <div
          className="rounded-xl shadow-sm border p-4 mb-4"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--fg-muted)' }}
              />
              <input
                type="text"
                placeholder="Rechercher (ref, désignation)"
                className="pl-9 pr-3 py-2 w-full border rounded-lg text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filtreEtat}
              onChange={(e) => setFiltreEtat(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            >
              <option value="tous">Tous états</option>
              <option value="ok">Synchronisés</option>
              <option value="ecart">Écart</option>
              <option value="jamais_syncrhonise">Jamais synchronisés</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wider"
                  style={{
                    background: 'var(--bg-canvas)',
                    color: 'var(--fg-secondary)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3 text-right">Stock local</th>
                  <th className="px-4 py-3 text-right">Shopify</th>
                  <th className="px-4 py-3 text-right">WooCommerce</th>
                  <th className="px-4 py-3 text-right">Écart max</th>
                  <th className="px-4 py-3">Dernière sync</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10" style={{ color: 'var(--fg-muted)' }}>
                      Aucun article
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const eS = ecart(r, 'stock_shopify');
                    const eW = ecart(r, 'stock_woocommerce');
                    const maxEcart = Math.max(Math.abs(eS ?? 0), Math.abs(eW ?? 0));
                    return (
                      <tr
                        key={r.id_article}
                        className="border-t hover:bg-[var(--bg-hover)]"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="font-mono text-xs font-semibold"
                            style={{ color: 'var(--accent-indigo)' }}
                          >
                            {r.ref}
                          </div>
                          <div className="font-medium mt-0.5" style={{ color: 'var(--fg-primary)' }}>
                            {r.designation}
                          </div>
                        </td>
                        <td
                          className="px-4 py-3 font-mono text-right font-bold"
                          style={{ color: 'var(--fg-primary)' }}
                        >
                          {r.stock_local}
                        </td>
                        <td
                          className="px-4 py-3 font-mono text-right"
                          style={
                            eS !== null && eS !== 0
                              ? { color: 'var(--color-danger)' }
                              : { color: 'var(--fg-primary)' }
                          }
                        >
                          {r.stock_shopify ?? '—'}
                        </td>
                        <td
                          className="px-4 py-3 font-mono text-right"
                          style={
                            eW !== null && eW !== 0
                              ? { color: 'var(--color-danger)' }
                              : { color: 'var(--fg-primary)' }
                          }
                        >
                          {r.stock_woocommerce ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {maxEcart > 0 ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border"
                              style={{
                                color: 'var(--color-danger)',
                                background: 'var(--color-danger-bg)',
                                borderColor: 'var(--color-danger)',
                              }}
                            >
                              <AlertTriangle className="w-3 h-3" />
                              {maxEcart}
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold"
                              style={{
                                color: 'var(--color-success)',
                                background: 'var(--color-success-bg)',
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted)' }}>
                          {r.etat === 'jamais_syncrhonise' ? (
                            <span
                              className="inline-flex items-center gap-1"
                              style={{ color: 'var(--color-warning)' }}
                            >
                              <AlertTriangle className="w-3 h-3" /> Jamais
                            </span>
                          ) : (
                            <>il y a {timeAgo(r.derniere_sync_at)}</>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => forceSync(r.id_article)}
                            disabled={syncing === r.id_article}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs text-white hover:opacity-90 disabled:opacity-50"
                            style={{ background: 'var(--accent-terracotta)' }}
                          >
                            {syncing === r.id_article ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            Force sync
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockSynchronise;
