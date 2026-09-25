import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Search, PlusCircle, Filter, TrendingUp, Target, CheckCircle2, X,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../components/dashboard';
import { opportunitesApi, pickData } from '../services/crmApi';
import { fmtMoney, fmtDate } from '../utils/formatters';

interface OppRow {
  id_opportunite: number;
  numero_opportunite: string;
  libelle: string;
  id_client?: number;
  id_commercial?: number;
  etape: string;
  montant_estime: number | string;
  probabilite: number;
  date_cloture_prevue?: string | null;
  statut: 'ACTIVE' | 'GAGNEE' | 'PERDUE' | 'ANNULEE';
  motif_perte?: string;
  description?: string;
  created_at?: string;
}

type FilterKey = 'all' | 'ACTIVE' | 'GAGNEE' | 'PERDUE';

const STATUT_TONE: Record<string, string> = {
  ACTIVE: 'var(--accent-indigo)',
  GAGNEE: 'var(--accent-sage)',
  PERDUE: 'var(--color-danger)',
  ANNULEE: 'var(--fg-muted)',
};

const Opportunities: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<OppRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { limit: 200 };
        if (debounced) params.q = debounced;
        if (filter !== 'all') params.statut = filter;
        const [rowsRes, statsRes] = await Promise.all([
          opportunitesApi.list(params),
          opportunitesApi.stats().catch(() => null),
        ]);
        if (cancelled) return;
        setRows(pickData<OppRow>(rowsRes));
        setStats(statsRes?.data?.data || null);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.error?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, filter]);

  const kpis = useMemo(() => {
    if (stats) return {
      total: stats.total || 0,
      actives: stats.actives || 0,
      gagnees: stats.gagnees || 0,
      perdues: stats.perdues || 0,
      ca_previsionnel: Number(stats.ca_previsionnel || 0),
    };
    const total = rows.length;
    return {
      total,
      actives: rows.filter((r) => r.statut === 'ACTIVE').length,
      gagnees: rows.filter((r) => r.statut === 'GAGNEE').length,
      perdues: rows.filter((r) => r.statut === 'PERDUE').length,
      ca_previsionnel: rows.filter((r) => r.statut === 'ACTIVE').reduce((s, r) => s + Number(r.montant_estime || 0), 0),
    };
  }, [stats, rows]);

  const toggle = (f: FilterKey) => setFilter((p) => (p === f ? 'all' : f));

  return (
    <DashboardShell
      eyebrow="§8 · Pipeline"
      title="Opportunités"
      subtitle="Pipeline commercial · négociations en cours et closings."
      headerRight={
        <button type="button" style={btnPrimary}
                onClick={() => alert('Formulaire création à venir (route /opportunities/nouveau)')}>
          <PlusCircle size={14} style={{ marginRight: 6 }} /> Nouvelle opportunité
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <KpiCard label="Total"           value={kpis.total}   tone="terracotta" icon={<Briefcase size={18} />}    onClick={() => setFilter('all')} />
        <KpiCard label="Actives"         value={kpis.actives} tone="indigo"     icon={<Target size={18} />}        onClick={() => toggle('ACTIVE')} />
        <KpiCard label="Gagnées"         value={kpis.gagnees} tone="sage"       icon={<CheckCircle2 size={18} />}   onClick={() => toggle('GAGNEE')} />
        <KpiCard label="CA prévisionnel" value={fmtMoney(kpis.ca_previsionnel, 'TND')} tone="gold" icon={<TrendingUp size={18} />} />
      </div>

      <SectionCard
        title="Pipeline"
        subtitle={`${rows.length} opportunité(s)`}
        actions={
          <button style={btnGhost} onClick={() => navigate('/pipeline-vente')}>Vue kanban →</button>
        }
      >
        <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', marginBottom: 'var(--s-4)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--fg-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Libellé, numéro…" style={inputStyle(true)} />
            {search && <button onClick={() => setSearch('')} style={btnClear}><X size={14} /></button>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--fg-muted)' }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as FilterKey)} style={inputStyle(false)}>
              <option value="all">Tous statuts</option>
              <option value="ACTIVE">Actives</option>
              <option value="GAGNEE">Gagnées</option>
              <option value="PERDUE">Perdues</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: 'var(--s-4)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune opportunité.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['N°', 'Libellé', 'Étape', 'Statut', 'Montant', 'Probabilité', 'Clôture prévue'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={o.id_opportunite} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                      onClick={() => { /* drawer TODO */ }}>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{o.numero_opportunite}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{o.libelle}</td>
                    <td style={tdStyle}>{o.etape}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', padding: '2px 10px', borderRadius: 999,
                        fontSize: 'var(--text-xs)', fontWeight: 600,
                        background: `color-mix(in srgb, ${STATUT_TONE[o.statut] || 'var(--fg-muted)'} 15%, transparent)`,
                        color: STATUT_TONE[o.statut] || 'var(--fg-muted)',
                      }}>{o.statut}</span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
                      {fmtMoney(o.montant_estime, 'TND')}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{o.probabilite}%</td>
                    <td style={tdStyle}>{fmtDate(o.date_cloture_prevue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  padding: '6px 14px', background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', cursor: 'pointer',
};
const btnClear: React.CSSProperties = {
  position: 'absolute', right: 8, top: 8, background: 'transparent',
  border: 'none', cursor: 'pointer', color: 'var(--fg-muted)',
};
const inputStyle = (padLeft: boolean): React.CSSProperties => ({
  width: '100%',
  padding: padLeft ? '8px 12px 8px 36px' : '8px 12px',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-canvas)',
  color: 'var(--fg-primary)',
  fontSize: 'var(--text-sm)',
});
const thStyle: React.CSSProperties = {
  padding: 'var(--s-3)', textAlign: 'left',
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'var(--text-xs)', fontWeight: 600,
  color: 'var(--fg-primary)', background: 'var(--bg-canvas)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const tdStyle: React.CSSProperties = { padding: 'var(--s-3)', color: 'var(--fg-primary)' };

export default Opportunities;
