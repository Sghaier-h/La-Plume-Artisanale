import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Boxes,
  Layers,
  Paintbrush,
  Briefcase,
  Package2,
  Wrench,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types (§6.1 catégories stock)
// ═══════════════════════════════════════════════════════════════════
type CodeCategorie = 'PF' | 'SF' | 'MP' | 'FabFournitures' | 'Bureau' | 'Emballage' | 'Rechange';

interface CategorieStock {
  code: CodeCategorie;
  libelle: string;
  description: string;
  nb_references: number;
  valeur_stock: number; // TND
  alertes: number;
  couverture_j: number;
  route: string;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const MOCK_CATEGORIES: CategorieStock[] = [
  { code: 'PF', libelle: 'Produits finis', description: 'Foutas, draps, peignoirs, nappes prêts à expédier', nb_references: 342, valeur_stock: 178_450, alertes: 3, couverture_j: 42, route: '/stock/pf' },
  { code: 'SF', libelle: 'Semi-finis', description: 'Bobines tissées avant coupe et confection', nb_references: 88, valeur_stock: 62_300, alertes: 2, couverture_j: 18, route: '/stock/sf' },
  { code: 'MP', libelle: 'Matières premières', description: 'Fils coton, lin, teintures, matières brutes', nb_references: 124, valeur_stock: 210_800, alertes: 4, couverture_j: 28, route: '/stock/mp' },
  { code: 'FabFournitures', libelle: 'Fournitures de fabrication', description: 'Bobines, canettes, aiguilles, lubrifiants machines', nb_references: 210, valeur_stock: 18_400, alertes: 5, couverture_j: 65, route: '/stock/fournitures' },
  { code: 'Bureau', libelle: 'Fournitures de bureau', description: 'Papier, cartouches, consommables administratifs', nb_references: 62, valeur_stock: 2_140, alertes: 1, couverture_j: 90, route: '/stock/bureau' },
  { code: 'Emballage', libelle: 'Emballage', description: 'Cartons, sachets, étiquettes, ruban logo', nb_references: 48, valeur_stock: 8_720, alertes: 2, couverture_j: 22, route: '/stock/emballage' },
  { code: 'Rechange', libelle: 'Pièces de rechange', description: 'Navettes, cames, pièces critiques machines Dornier', nb_references: 156, valeur_stock: 34_950, alertes: 3, couverture_j: 120, route: '/stock/rechange' },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  return fallback;
};

const fmtTND = (n: number): string =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });

const CATEGORY_META: Record<CodeCategorie, { icon: React.ReactNode; accent: string; bg: string }> = {
  PF: { icon: <Package className="w-6 h-6" />, accent: '#C8663D', bg: '#FDF2ED' },
  SF: { icon: <Boxes className="w-6 h-6" />, accent: '#4A6C5B', bg: '#EEF4F0' },
  MP: { icon: <Layers className="w-6 h-6" />, accent: '#3B4E68', bg: '#EDF0F5' },
  FabFournitures: { icon: <Paintbrush className="w-6 h-6" />, accent: '#D6A756', bg: '#FBF3E0' },
  Bureau: { icon: <Briefcase className="w-6 h-6" />, accent: '#7A6E63', bg: '#F5EEE2' },
  Emballage: { icon: <Package2 className="w-6 h-6" />, accent: '#C8663D', bg: '#FDF2ED' },
  Rechange: { icon: <Wrench className="w-6 h-6" />, accent: '#3B4E68', bg: '#EDF0F5' },
};

// ═══════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════
const VueParCategorie: React.FC = () => {
  const [cats, setCats] = useState<CategorieStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/stock/categories/synthese')]);
      if (cancelled) return;
      setCats(pickArray<CategorieStock>(results[0], MOCK_CATEGORIES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const valeur = cats.reduce((s, c) => s + c.valeur_stock, 0);
    const refs = cats.reduce((s, c) => s + c.nb_references, 0);
    const alertes = cats.reduce((s, c) => s + c.alertes, 0);
    return { valeur, refs, alertes };
  }, [cats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="ml-72 animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
            >
              STOCK · SYNTHÈSE
            </div>
            <h1
              className="text-3xl italic font-medium flex items-center gap-3"
              style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
            >
              <Layers className="w-7 h-7" style={{ color: '#C8663D' }} />
              Vue par catégorie
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              §6.1 &middot; 7 catégories de stock — PF, SF, MP, Fournitures Fab., Bureau, Emballage, Pièces Rechange
            </p>
          </div>

          {/* Totaux */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl p-5 shadow-sm bg-white" style={{ borderLeft: '4px solid #C8663D' }}>
              <div
                className="text-[11px] uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
              >
                Valeur stock totale
              </div>
              <div
                className="text-3xl italic font-medium"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: '#C8663D' }}
              >
                {fmtTND(totals.valeur)} <span className="text-lg">TND</span>
              </div>
            </div>
            <div className="rounded-xl p-5 shadow-sm bg-white" style={{ borderLeft: '4px solid #4A6C5B' }}>
              <div
                className="text-[11px] uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
              >
                Références totales
              </div>
              <div
                className="text-3xl italic font-medium"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: '#4A6C5B' }}
              >
                {totals.refs}
              </div>
            </div>
            <div className="rounded-xl p-5 shadow-sm bg-white" style={{ borderLeft: '4px solid #D6A756' }}>
              <div
                className="text-[11px] uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
              >
                Alertes cumulées
              </div>
              <div
                className="text-3xl italic font-medium"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: '#D6A756' }}
              >
                {totals.alertes}
              </div>
            </div>
          </div>

          {/* Grid catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((c) => {
              const meta = CATEGORY_META[c.code];
              return (
                <div
                  key={c.code}
                  className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  style={{ borderLeft: `4px solid ${meta.accent}` }}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="rounded-lg p-3 shrink-0"
                        style={{ background: meta.bg, color: meta.accent }}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[10px] uppercase tracking-widest mb-0.5"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: meta.accent,
                          }}
                        >
                          {c.code}
                        </div>
                        <h3
                          className="text-lg italic font-medium leading-tight"
                          style={{
                            fontFamily: 'var(--font-serif, Fraunces, serif)',
                            color: 'var(--fg-primary, #2F2A26)',
                          }}
                        >
                          {c.libelle}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs mb-4 min-h-[2.2rem]" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                      {c.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wide mb-0.5"
                          style={{ color: 'var(--fg-muted, #7A6E63)' }}
                        >
                          Références
                        </div>
                        <div
                          className="text-lg font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: 'var(--fg-primary, #2F2A26)',
                          }}
                        >
                          {c.nb_references}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wide mb-0.5"
                          style={{ color: 'var(--fg-muted, #7A6E63)' }}
                        >
                          Valeur
                        </div>
                        <div
                          className="text-lg font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: meta.accent,
                          }}
                        >
                          {fmtTND(c.valeur_stock)}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wide mb-0.5"
                          style={{ color: 'var(--fg-muted, #7A6E63)' }}
                        >
                          Alertes
                        </div>
                        <div
                          className="text-lg font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: c.alertes > 0 ? '#D6A756' : '#4A6C5B',
                          }}
                        >
                          {c.alertes}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wide mb-0.5"
                          style={{ color: 'var(--fg-muted, #7A6E63)' }}
                        >
                          Couverture
                        </div>
                        <div
                          className="text-lg font-semibold inline-flex items-center gap-1"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: 'var(--fg-primary, #2F2A26)',
                          }}
                        >
                          {c.couverture_j} j
                          {c.couverture_j >= 60 && <TrendingUp className="w-3 h-3" style={{ color: '#4A6C5B' }} />}
                        </div>
                      </div>
                    </div>

                    <a
                      href={c.route}
                      className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                      style={{ color: meta.accent }}
                    >
                      Voir la liste filtrée <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VueParCategorie;
