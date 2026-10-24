import React, { useEffect, useMemo, useState } from 'react';
import {
  Cog,
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Building,
  Users,
  Wrench,
  Gauge,
  Filter,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types (§7.4 postes_travail)
// ═══════════════════════════════════════════════════════════════════
interface PosteTravail {
  id_poste: number;
  code: string;
  libelle: string;
  atelier: string;
  capacite_horaire: number; // unités/h
  unite: string;
  machines_liees: string[];
  operateurs_typiques: string[];
  actif: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const MOCK_POSTES: PosteTravail[] = [
  { id_poste: 1, code: 'PST-OURD-01', libelle: 'Ourdissage principal', atelier: 'Atelier Tissage A', capacite_horaire: 800, unite: 'm fil', machines_liees: ['OURD-102'], operateurs_typiques: ['Mohamed Trabelsi', 'Anis Belkadi'], actif: true },
  { id_poste: 2, code: 'PST-TISS-01', libelle: 'Tissage Dornier P1', atelier: 'Atelier Tissage A', capacite_horaire: 12, unite: 'm tissu', machines_liees: ['DOR-P1-01', 'DOR-P1-02', 'DOR-P1-03'], operateurs_typiques: ['Karim Sfar', 'Riadh Zouari'], actif: true },
  { id_poste: 3, code: 'PST-TISS-02', libelle: 'Tissage Dornier P2', atelier: 'Atelier Tissage B', capacite_horaire: 18, unite: 'm tissu', machines_liees: ['DOR-P2-01', 'DOR-P2-02'], operateurs_typiques: ['Hedi Manai', 'Sami Karoui'], actif: true },
  { id_poste: 4, code: 'PST-COUP-01', libelle: 'Coupe manuelle', atelier: 'Atelier Coupe', capacite_horaire: 45, unite: 'pcs', machines_liees: ['COUP-TAB-01', 'COUP-TAB-02'], operateurs_typiques: ['Salah Meddeb', 'Nabil Guesmi', 'Aicha Bouzid'], actif: true },
  { id_poste: 5, code: 'PST-COUD-01', libelle: 'Couture confection', atelier: 'Atelier Confection', capacite_horaire: 22, unite: 'pcs', machines_liees: ['JUKI-DDL-01', 'JUKI-DDL-02', 'JUKI-DDL-03', 'JUKI-DDL-04'], operateurs_typiques: ['Fatma Amri', 'Mounira Ben Salah'], actif: true },
  { id_poste: 6, code: 'PST-BROD-01', libelle: 'Broderie main', atelier: 'Atelier Finition', capacite_horaire: 3, unite: 'pcs', machines_liees: [], operateurs_typiques: ['Rania Khalil', 'Leila Amara'], actif: true },
  { id_poste: 7, code: 'PST-FRAN-01', libelle: 'Frange & finition', atelier: 'Atelier Finition', capacite_horaire: 30, unite: 'pcs', machines_liees: ['SUR-JET-01'], operateurs_typiques: ['Amel Douiri'], actif: true },
  { id_poste: 8, code: 'PST-EMB-01', libelle: 'Emballage & étiquetage', atelier: 'Magasin PF', capacite_horaire: 60, unite: 'pcs', machines_liees: [], operateurs_typiques: ['Youssef Chatti', 'Nawel Selmi'], actif: true },
  { id_poste: 9, code: 'PST-QUAL-01', libelle: 'Contrôle qualité final', atelier: 'Atelier Contrôle', capacite_horaire: 50, unite: 'pcs', machines_liees: ['MIR-CTRL-01'], operateurs_typiques: ['Slim Bouazizi'], actif: true },
  { id_poste: 10, code: 'PST-LAV-01', libelle: 'Lavage & séchage', atelier: 'Atelier Finition', capacite_horaire: 25, unite: 'pcs', machines_liees: ['LAV-IND-01', 'SEC-IND-01'], operateurs_typiques: ['Habib Ben Ali'], actif: false },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  if (d && Array.isArray(d.postes)) return d.postes as T[];
  return fallback;
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
const PostesTravail: React.FC = () => {
  const [rows, setRows] = useState<PosteTravail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAtelier, setFilterAtelier] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/fabrication/postes-travail')]);
      if (cancelled) return;
      setRows(pickArray<PosteTravail>(results[0], MOCK_POSTES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const total = rows.length;
    const actifs = rows.filter((r) => r.actif).length;
    const ateliers = new Set(rows.map((r) => r.atelier)).size;
    const machines = new Set(rows.flatMap((r) => r.machines_liees)).size;
    return { total, actifs, ateliers, machines };
  }, [rows]);

  const ateliers = useMemo(() => {
    const set = new Set(rows.map((r) => r.atelier));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterAtelier !== 'all' && r.atelier !== filterAtelier) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.libelle.toLowerCase().includes(q) ||
        r.atelier.toLowerCase().includes(q)
      );
    });
  }, [rows, search, filterAtelier]);

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
              FABRICATION · ATELIER
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl italic font-medium flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                >
                  <Cog className="w-7 h-7" style={{ color: '#C8663D' }} />
                  Postes de travail
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                  §7.4 &middot; définition des postes atelier — capacité, machines rattachées, opérateurs typiques
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: '#C8663D', borderRadius: '9999px' }}
              >
                <PlusCircle className="w-4 h-4" />
                Nouveau poste
              </button>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Total postes" value={kpis.total} hint="Configurés" color="terracotta" icon={<Cog className="w-5 h-5" />} />
            <KpiCard label="Actifs" value={kpis.actifs} hint="En service" color="sage" icon={<Gauge className="w-5 h-5" />} />
            <KpiCard label="Ateliers" value={kpis.ateliers} hint="Distincts" color="indigo" icon={<Building className="w-5 h-5" />} />
            <KpiCard label="Machines liées" value={kpis.machines} hint="Rattachées" color="gold" icon={<Wrench className="w-5 h-5" />} />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Code, libellé, atelier…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-[#C8663D]"
                style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
              />
            </div>
            <Filter className="w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
            <select
              value={filterAtelier}
              onChange={(e) => setFilterAtelier(e.target.value)}
              className="text-sm border rounded-lg px-2 py-1.5 bg-white"
              style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
            >
              <option value="all">Tous ateliers</option>
              {ateliers.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
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
                  {['Code', 'Libellé', 'Atelier', 'Capacité/h', 'Machines liées', 'Opérateurs typiques', ''].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                      style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                {filtered.map((r) => (
                  <tr key={r.id_poste} className="hover:bg-[#FDF2ED]/50 transition-colors group">
                    <td
                      className="px-4 py-3 text-xs font-semibold"
                      style={{
                        fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                        color: '#3B4E68',
                      }}
                    >
                      {r.code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {r.libelle}
                      </div>
                      {!r.actif && (
                        <div className="text-[11px] italic" style={{ color: '#C4574C' }}>inactif</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        <Building className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
                        {r.atelier}
                      </div>
                    </td>
                    <td
                      className="px-4 py-3 font-semibold"
                      style={{
                        fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                        color: '#C8663D',
                      }}
                    >
                      {r.capacite_horaire} <span className="text-xs" style={{ color: 'var(--fg-muted, #7A6E63)' }}>{r.unite}</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.machines_liees.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {r.machines_liees.map((m) => (
                            <span
                              key={m}
                              className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{
                                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                                background: '#EDF0F5',
                                color: '#3B4E68',
                              }}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs italic" style={{ color: 'var(--fg-muted, #7A6E63)' }}>manuel</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        <Users className="w-3.5 h-3.5" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
                        {r.operateurs_typiques.slice(0, 2).join(', ')}
                        {r.operateurs_typiques.length > 2 && (
                          <span style={{ color: 'var(--fg-muted, #7A6E63)' }}>+{r.operateurs_typiques.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button className="p-1.5 hover:bg-[#FDF2ED] rounded" style={{ color: '#3B4E68' }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-[#FDEDEA] rounded ml-1" style={{ color: '#C4574C' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                      Aucun poste pour ces critères.
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

export default PostesTravail;
