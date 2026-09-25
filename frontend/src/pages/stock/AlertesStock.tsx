import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  PackageX,
  ShoppingCart,
  Bell,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types (§6.9 alertes_stock)
// ═══════════════════════════════════════════════════════════════════
type NiveauAlerte = 'rupture' | 'sous_seuil' | 'preventif';
type CategorieStock = 'PF' | 'SF' | 'MP' | 'Fournitures' | 'Bureau' | 'Emballage' | 'Rechange';

interface AlerteStock {
  id_alerte: number;
  code_article: string;
  libelle: string;
  categorie: CategorieStock;
  stock_actuel: number;
  seuil_min: number;
  seuil_reappro: number;
  unite: string;
  niveau: NiveauAlerte;
  urgence: number; // 0-100
  date_detection: string;
  fournisseur_prefere: string | null;
  delai_reappro_j: number;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

const MOCK_ALERTES: AlerteStock[] = [
  { id_alerte: 1, code_article: 'MP-FIL-CTN-402', libelle: 'Fil coton 40/2 écru', categorie: 'MP', stock_actuel: 0, seuil_min: 200, seuil_reappro: 500, unite: 'kg', niveau: 'rupture', urgence: 98, date_detection: daysAgo(0), fournisseur_prefere: 'Filature Tunisie SA', delai_reappro_j: 12 },
  { id_alerte: 2, code_article: 'MP-FIL-CTN-406', libelle: 'Fil coton 40/2 indigo teint', categorie: 'MP', stock_actuel: 12, seuil_min: 100, seuil_reappro: 300, unite: 'kg', niveau: 'rupture', urgence: 94, date_detection: daysAgo(1), fournisseur_prefere: 'Teinturerie El Mourouj', delai_reappro_j: 18 },
  { id_alerte: 3, code_article: 'EMB-CART-060', libelle: 'Carton expédition 60×40×30', categorie: 'Emballage', stock_actuel: 45, seuil_min: 200, seuil_reappro: 800, unite: 'pcs', niveau: 'sous_seuil', urgence: 82, date_detection: daysAgo(1), fournisseur_prefere: 'Cartonnerie Sfax', delai_reappro_j: 4 },
  { id_alerte: 4, code_article: 'FOU-BOB-124', libelle: 'Bobine fil 3000m indigo', categorie: 'Fournitures', stock_actuel: 8, seuil_min: 20, seuil_reappro: 60, unite: 'pcs', niveau: 'sous_seuil', urgence: 76, date_detection: daysAgo(2), fournisseur_prefere: 'Filature Tunisie SA', delai_reappro_j: 10 },
  { id_alerte: 5, code_article: 'RCH-NAV-108', libelle: 'Navette Dornier P2 réf. 108', categorie: 'Rechange', stock_actuel: 1, seuil_min: 4, seuil_reappro: 8, unite: 'pcs', niveau: 'sous_seuil', urgence: 88, date_detection: daysAgo(2), fournisseur_prefere: 'Dornier France SAS', delai_reappro_j: 21 },
  { id_alerte: 6, code_article: 'MP-FIL-LIN-201', libelle: 'Fil lin 30/1 naturel', categorie: 'MP', stock_actuel: 220, seuil_min: 150, seuil_reappro: 400, unite: 'kg', niveau: 'preventif', urgence: 42, date_detection: daysAgo(3), fournisseur_prefere: 'Groupe Textile Sfax', delai_reappro_j: 14 },
  { id_alerte: 7, code_article: 'BUR-ENC-042', libelle: 'Cartouche encre imprimante bureau', categorie: 'Bureau', stock_actuel: 2, seuil_min: 3, seuil_reappro: 6, unite: 'pcs', niveau: 'preventif', urgence: 32, date_detection: daysAgo(4), fournisseur_prefere: 'Office Dépôt Tunis', delai_reappro_j: 3 },
  { id_alerte: 8, code_article: 'SF-BOB-778', libelle: 'Bobine tissu écru semi-fini', categorie: 'SF', stock_actuel: 4, seuil_min: 10, seuil_reappro: 25, unite: 'bobines', niveau: 'sous_seuil', urgence: 68, date_detection: daysAgo(5), fournisseur_prefere: null, delai_reappro_j: 7 },
  { id_alerte: 9, code_article: 'PF-FOU-COT-002', libelle: 'Fouta lin naturel sable', categorie: 'PF', stock_actuel: 8, seuil_min: 30, seuil_reappro: 80, unite: 'pcs', niveau: 'sous_seuil', urgence: 72, date_detection: daysAgo(6), fournisseur_prefere: null, delai_reappro_j: 21 },
  { id_alerte: 10, code_article: 'EMB-SAC-088', libelle: 'Sachet coton logo brodé', categorie: 'Emballage', stock_actuel: 340, seuil_min: 200, seuil_reappro: 600, unite: 'pcs', niveau: 'preventif', urgence: 38, date_detection: daysAgo(7), fournisseur_prefere: 'Broderie El Menzah', delai_reappro_j: 15 },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.alertes)) return d.alertes as T[];
  return fallback;
};

const NIVEAU_META: Record<NiveauAlerte, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  rupture: { label: 'Rupture', color: '#C4574C', bg: '#FDEDEA', icon: <PackageX className="w-3.5 h-3.5" /> },
  sous_seuil: { label: 'Sous seuil', color: '#D6A756', bg: '#FBF3E0', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  preventif: { label: 'Préventif', color: '#3B4E68', bg: '#EDF0F5', icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const NIVEAU_ORDER: Record<NiveauAlerte, number> = { rupture: 0, sous_seuil: 1, preventif: 2 };

// ═══════════════════════════════════════════════════════════════════
// KpiCard local
// ═══════════════════════════════════════════════════════════════════
interface KpiProps {
  label: string;
  value: string | number;
  hint?: string;
  color: 'terracotta' | 'sage' | 'indigo' | 'gold';
  icon?: React.ReactNode;
}
const COLORS: Record<KpiProps['color'], string> = {
  terracotta: '#C8663D',
  sage: '#4A6C5B',
  indigo: '#3B4E68',
  gold: '#D6A756',
};
const KpiCard: React.FC<KpiProps> = ({ label, value, hint, color, icon }) => (
  <div className="rounded-xl p-5 shadow-sm bg-white" style={{ borderLeft: `4px solid ${COLORS[color]}` }}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div
          className="text-[11px] uppercase tracking-widest font-medium mb-2"
          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
        >
          {label}
        </div>
        <div
          className="text-3xl italic font-medium"
          style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: COLORS[color] }}
        >
          {value}
        </div>
        {hint && <div className="text-xs mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>{hint}</div>}
      </div>
      {icon && (
        <div className="rounded-lg p-2 shrink-0" style={{ background: `${COLORS[color]}18`, color: COLORS[color] }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════
const AlertesStock: React.FC = () => {
  const [rows, setRows] = useState<AlerteStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterNiveau, setFilterNiveau] = useState<'all' | NiveauAlerte>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/stock/alertes')]);
      if (cancelled) return;
      setRows(pickArray<AlerteStock>(results[0], MOCK_ALERTES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const ruptures = rows.filter((r) => r.niveau === 'rupture').length;
    const sousSeuil = rows.filter((r) => r.niveau === 'sous_seuil').length;
    const reappro = rows.filter((r) => r.urgence >= 80).length;
    return { ruptures, sousSeuil, reappro, total: rows.length };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        if (filterNiveau !== 'all' && r.niveau !== filterNiveau) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          r.libelle.toLowerCase().includes(q) ||
          r.code_article.toLowerCase().includes(q) ||
          (r.fournisseur_prefere || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const dn = NIVEAU_ORDER[a.niveau] - NIVEAU_ORDER[b.niveau];
        if (dn !== 0) return dn;
        return b.urgence - a.urgence;
      });
  }, [rows, search, filterNiveau]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
            >
              STOCK · ALERTES
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl italic font-medium flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                >
                  <Bell className="w-7 h-7" style={{ color: '#C8663D' }} />
                  Alertes stock
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                  §6.9 &middot; ruptures &rarr; sous-seuil &rarr; préventif, triées par urgence
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: '#C8663D', borderRadius: '9999px' }}
              >
                <ShoppingCart className="w-4 h-4" />
                Générer DA groupée
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Ruptures" value={kpis.ruptures} hint="Stock = 0" color="terracotta" icon={<PackageX className="w-5 h-5" />} />
            <KpiCard label="Sous seuil" value={kpis.sousSeuil} hint="< seuil min" color="gold" icon={<AlertTriangle className="w-5 h-5" />} />
            <KpiCard label="Réappro urgent" value={kpis.reappro} hint="Urgence ≥ 80" color="indigo" icon={<ShoppingCart className="w-5 h-5" />} />
            <KpiCard label="Total alertes" value={kpis.total} hint="Toutes catégories" color="sage" icon={<Bell className="w-5 h-5" />} />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Code, libellé, fournisseur…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-[#C8663D]"
                style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
              />
            </div>
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
            <select
              value={filterNiveau}
              onChange={(e) => setFilterNiveau(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
            >
              <option value="all">Tous niveaux</option>
              <option value="rupture">Rupture</option>
              <option value="sous_seuil">Sous seuil</option>
              <option value="preventif">Préventif</option>
            </select>
            <div className="text-sm ml-auto" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              {filtered.length} / {rows.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead style={{ background: '#F5EEE2' }}>
                <tr>
                  {['Niveau', 'Article', 'Cat.', 'Stock', 'Seuils', 'Fournisseur', 'Délai', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                {filtered.map((r) => {
                  const meta = NIVEAU_META[r.niveau];
                  return (
                    <tr key={r.id_alerte} className="hover:bg-[#FDF2ED]/50 transition-colors group">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                          {r.libelle}
                        </div>
                        <div
                          className="text-[11px] mt-0.5"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                        >
                          {r.code_article}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                        {r.categorie}
                      </td>
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: r.stock_actuel === 0 ? '#C4574C' : 'var(--fg-primary, #2F2A26)',
                        }}
                      >
                        {r.stock_actuel} {r.unite}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                      >
                        min {r.seuil_min} &middot; ré {r.seuil_reappro}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {r.fournisseur_prefere || <span className="italic" style={{ color: 'var(--fg-muted, #7A6E63)' }}>non défini</span>}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                      >
                        {r.delai_reappro_j} j
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                          style={{ color: '#C8663D' }}
                        >
                          Créer DA <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                      Aucune alerte stock.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertesStock;
