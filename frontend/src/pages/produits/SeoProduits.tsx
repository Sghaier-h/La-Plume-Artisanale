import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Globe,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types (§5.6 article_seo)
// ═══════════════════════════════════════════════════════════════════
type StatutIndex = 'indexe' | 'non_indexe' | 'a_optimiser' | 'erreur';

interface SeoArticle {
  id_article: number;
  code_article: string;
  libelle: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  og_image: string | null;
  statut: StatutIndex;
  score: number; // 0-100
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const MOCK_SEO: SeoArticle[] = [
  { id_article: 1, code_article: 'FOU-COT-001', libelle: 'Fouta coton égyptien terracotta', slug: 'fouta-coton-egyptien-terracotta', meta_title: 'Fouta artisanale coton — La Plume Artisanale', meta_description: 'Fouta tissée main en coton égyptien, coloris terracotta, 100×200 cm, made in Tunisia.', og_image: '/media/og/fou-001.jpg', statut: 'indexe', score: 92 },
  { id_article: 2, code_article: 'FOU-COT-002', libelle: 'Fouta lin naturel sable', slug: 'fouta-lin-naturel-sable', meta_title: 'Fouta lin naturel — Coloris sable', meta_description: 'Fouta lin premium tissée à Ksar Hellal, absorbante, 90×180 cm.', og_image: '/media/og/fou-002.jpg', statut: 'indexe', score: 88 },
  { id_article: 3, code_article: 'DRP-HOU-005', libelle: 'Drap housse 160×200 blanc', slug: 'drap-housse-160-200-blanc', meta_title: '', meta_description: '', og_image: null, statut: 'non_indexe', score: 12 },
  { id_article: 4, code_article: 'PEI-BAI-012', libelle: 'Peignoir éponge nid abeille écru', slug: 'peignoir-eponge-nid-abeille-ecru', meta_title: 'Peignoir éponge écru — coton bio', meta_description: 'Peignoir nid d\'abeille, coton biologique, unisexe, taille L.', og_image: '/media/og/pei-012.jpg', statut: 'a_optimiser', score: 58 },
  { id_article: 5, code_article: 'JET-CAN-008', libelle: 'Jeté de canapé sage 200×220', slug: 'jete-canape-sage-200-220', meta_title: 'Jeté canapé vert sage — motif berbère', meta_description: '', og_image: '/media/og/jet-008.jpg', statut: 'a_optimiser', score: 45 },
  { id_article: 6, code_article: 'NAP-LIN-003', libelle: 'Nappe lin brodée main', slug: 'nappe-lin-brodee', meta_title: 'Nappe lin artisanale brodée à la main', meta_description: 'Nappe lin 100% naturel, broderie traditionnelle tunisienne, 150×250 cm.', og_image: '/media/og/nap-003.jpg', statut: 'indexe', score: 95 },
  { id_article: 7, code_article: 'SER-BAI-011', libelle: 'Serviette bain XL indigo', slug: 'serviette-bain-xl-indigo', meta_title: 'Serviette bain XL indigo', meta_description: 'Serviette éponge coton 500g/m², coloris indigo profond, 90×180 cm.', og_image: null, statut: 'a_optimiser', score: 62 },
  { id_article: 8, code_article: 'COU-DOR-020', libelle: 'Coussin décoratif motif berbère', slug: 'coussin-berbere', meta_title: 'Coussin berbère 45×45', meta_description: 'Housse coussin tissée main, motif Kilim, 45×45 cm, coton et laine.', og_image: '/media/og/cou-020.jpg', statut: 'indexe', score: 85 },
  { id_article: 9, code_article: 'FOU-COT-015', libelle: 'Fouta rayée bleu marine', slug: 'fouta-rayee-bleu-marine', meta_title: '', meta_description: 'Fouta traditionnelle rayée', og_image: null, statut: 'erreur', score: 8 },
  { id_article: 10, code_article: 'DRA-PLA-007', libelle: 'Drap plat 240×300 ivoire', slug: 'drap-plat-240-300-ivoire', meta_title: 'Drap plat ivoire 240×300 cm', meta_description: 'Drap plat percale coton 200 fils, ivoire, finition ourlet plat.', og_image: '/media/og/dra-007.jpg', statut: 'indexe', score: 90 },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.articles)) return d.articles as T[];
  return fallback;
};

const STATUT_META: Record<StatutIndex, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  indexe: { label: 'Indexé', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: '#4A6C5B', bg: '#EEF4F0' },
  a_optimiser: { label: 'À optimiser', icon: <AlertTriangle className="w-3.5 h-3.5" />, color: '#D6A756', bg: 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))' },
  non_indexe: { label: 'Non indexé', icon: <XCircle className="w-3.5 h-3.5" />, color: '#7A6E63', bg: 'var(--bg-canvas)' },
  erreur: { label: 'Erreur', icon: <XCircle className="w-3.5 h-3.5" />, color: '#C4574C', bg: '#FDEDEA' },
};

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
const SeoProduits: React.FC = () => {
  const [rows, setRows] = useState<SeoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'all' | StatutIndex>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/articles/seo')]);
      if (cancelled) return;
      setRows(pickArray<SeoArticle>(results[0], MOCK_SEO));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const total = rows.length;
    const indexes = rows.filter((r) => r.statut === 'indexe').length;
    const manquants = rows.filter((r) => !r.meta_title || !r.meta_description || !r.og_image).length;
    const aOptimiser = rows.filter((r) => r.statut === 'a_optimiser' || r.statut === 'erreur').length;
    const scoreMoyen = total > 0 ? Math.round(rows.reduce((s, r) => s + r.score, 0) / total) : 0;
    return { indexes, manquants, scoreMoyen, aOptimiser };
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterStatut !== 'all' && r.statut !== filterStatut) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.libelle.toLowerCase().includes(q) ||
        r.code_article.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q)
      );
    });
  }, [rows, search, filterStatut]);

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
              PRODUITS · SEO WEB
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl italic font-medium flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                >
                  <Globe className="w-7 h-7" style={{ color: '#C8663D' }} />
                  SEO Produits
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                  Référencement e-commerce &middot; §5.6 <em>article_seo</em>
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: '#C8663D', borderRadius: '9999px' }}
              >
                <PlusCircle className="w-4 h-4" />
                Générer SEO manquant
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Indexés" value={kpis.indexes} hint={`sur ${rows.length} articles`} color="sage" icon={<CheckCircle2 className="w-5 h-5" />} />
            <KpiCard label="Manquants" value={kpis.manquants} hint="Meta ou OG absente" color="terracotta" icon={<XCircle className="w-5 h-5" />} />
            <KpiCard label="Score moyen" value={`${kpis.scoreMoyen}/100`} hint="Note SEO globale" color="indigo" icon={<Globe className="w-5 h-5" />} />
            <KpiCard label="À optimiser" value={kpis.aOptimiser} hint="Actions correctives" color="gold" icon={<AlertTriangle className="w-5 h-5" />} />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Code, libellé, slug…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-[#C8663D]"
                style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
              />
            </div>
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
            >
              <option value="all">Tous statuts</option>
              <option value="indexe">Indexé</option>
              <option value="a_optimiser">À optimiser</option>
              <option value="non_indexe">Non indexé</option>
              <option value="erreur">Erreur</option>
            </select>
            <div className="text-sm ml-auto" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              {filtered.length} / {rows.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead style={{ background: 'var(--bg-canvas)' }}>
                <tr>
                  {['Article', 'Slug', 'Meta title', 'Meta description', 'OG image', 'Statut', 'Score'].map((h) => (
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
                  const meta = STATUT_META[r.statut];
                  return (
                    <tr key={r.id_article} className="hover:bg-[#FDF2ED]/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                          {r.libelle}
                        </div>
                        <div
                          className="text-[11px] mt-0.5"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: 'var(--fg-muted, #7A6E63)',
                          }}
                        >
                          {r.code_article}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: '#3B4E68' }}
                        >
                          <ExternalLink className="w-3 h-3" />/{r.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {r.meta_title ? (
                          <div className="text-xs truncate" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                            {r.meta_title}
                          </div>
                        ) : (
                          <span className="text-xs italic" style={{ color: '#C4574C' }}>manquant</span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        {r.meta_description ? (
                          <div className="text-xs line-clamp-2" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                            {r.meta_description}
                          </div>
                        ) : (
                          <span className="text-xs italic" style={{ color: '#C4574C' }}>manquant</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.og_image ? (
                          <div
                            className="inline-flex items-center gap-1 text-xs"
                            style={{ color: '#4A6C5B' }}
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> OK
                          </div>
                        ) : (
                          <span className="text-xs italic" style={{ color: '#C4574C' }}>absente</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="text-sm font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color:
                              r.score >= 80 ? '#4A6C5B' : r.score >= 50 ? '#D6A756' : '#C4574C',
                          }}
                        >
                          {r.score}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                      Aucun article SEO pour ces critères.
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

export default SeoProduits;
