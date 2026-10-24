/**
 * SoustraitantsListe (Phase B §14quater.3)
 * Liste des sous-traitants avec filtre par type_activite + KPI.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, AlertTriangle, Activity, Coins, Package, ArrowRight, Scissors } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import {
  soustraitantsApi, SousTraitant, StatsGlobalST, StatsParType,
  TypeActiviteST, TYPE_ACTIVITE_LABEL, TYPE_ACTIVITE_TONE, fmtInt, fmtMoney, fmtDate,
} from '../../services/soustraitanceApi';

const TYPES: Array<{ value: TypeActiviteST | ''; label: string }> = [
  { value: '', label: 'Tous types' },
  ...Object.entries(TYPE_ACTIVITE_LABEL).map(([v, label]) => ({
    value: v as TypeActiviteST, label,
  })),
];

const SoustraitantsListe: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<SousTraitant[]>([]);
  const [stats, setStats] = useState<{ global: StatsGlobalST; par_type: StatsParType[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<TypeActiviteST | ''>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [listRes, statsRes] = await Promise.all([
          soustraitantsApi.list({ limit: 500 }),
          soustraitantsApi.stats().catch(() => null),
        ]);
        setItems(listRes.data || []);
        if (statsRes) setStats(statsRes);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((st) => {
      if (filterType && st.type_activite !== filterType) return false;
      if (q && !(
        st.raison_sociale.toLowerCase().includes(q)
        || (st.code ?? '').toLowerCase().includes(q)
        || (st.identification ?? '').toLowerCase().includes(q)
      )) return false;
      return true;
    });
  }, [items, search, filterType]);

  return (
    <DashboardShell
      eyebrow="§14quater.3 · Sous-traitance"
      title="Sous-traitants"
      subtitle="Pilotage des façonniers par type d'activité — ourdissage, nouage, teinture, frange, couture, broderie, personnalisation, finition."
      headerRight={
        <>
          <button type="button" onClick={() => navigate('/sous-traitants/nouveau')} style={btnPrimary}>
            <PlusCircle size={14} style={{ marginRight: 6 }} /> Nouveau sous-traitant
          </button>
          <button type="button" onClick={() => navigate('/dashboard-sous-traitants')} style={btnGhost}>
            <Activity size={14} style={{ marginRight: 6 }} /> Dashboard
          </button>
        </>
      }
    >
      <div style={{
        display: 'grid',
        gap: 'var(--s-4)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        <KpiCard
          label="Actifs"
          value={fmtInt(stats?.global?.nb_actifs ?? items.filter(i => i.actif).length)}
          unit="sous-traitants"
          hint={`${fmtInt(stats?.global?.nb_inactifs ?? 0)} inactifs`}
          icon={<Users size={18} />}
          tone="terracotta"
          loading={loading}
        />
        <KpiCard
          label="Créances totales"
          value={fmtMoney(Number(stats?.global?.creances_total ?? 0))}
          hint="Comptes courants ST"
          icon={<Coins size={18} />}
          tone="gold"
          loading={loading}
          onClick={() => navigate('/dashboard-sous-traitants')}
        />
        <KpiCard
          label="Travaux en cours"
          value={fmtInt(stats?.global?.travaux_en_cours ?? 0)}
          unit="dossiers"
          icon={<Package size={18} />}
          tone="sage"
          loading={loading}
          onClick={() => navigate('/travaux-sous-traitants')}
        />
        <KpiCard
          label="Anomalies ouvertes"
          value={fmtInt(stats?.global?.anomalies_ouvertes ?? 0)}
          hint="Filet de sécurité §14bis.4"
          icon={<AlertTriangle size={18} />}
          tone="rose"
          loading={loading}
          onClick={() => navigate('/dashboard-sous-traitants')}
        />
      </div>

      <SectionCard
        title="Répartition par type d'activité"
        subtitle={stats?.par_type.length ? `${stats.par_type.length} métiers tracés` : 'Chargement…'}
      >
        <div style={{
          display: 'grid',
          gap: 'var(--s-3)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}>
          {(stats?.par_type ?? []).map((row) => {
            const tone = TYPE_ACTIVITE_TONE[row.type_activite] || 'terracotta';
            const accent = `var(--accent-${tone})`;
            return (
              <button
                key={row.type_activite}
                type="button"
                onClick={() => setFilterType(row.type_activite)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 4,
                  padding: 'var(--s-4)',
                  background: filterType === row.type_activite ? `${accent}22` : 'var(--bg-canvas)',
                  border: `1px solid ${filterType === row.type_activite ? accent : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', textAlign: 'left', minHeight: 44,
                }}
              >
                <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--fg-primary)' }}>
                  {TYPE_ACTIVITE_LABEL[row.type_activite] || row.type_activite}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                  {fmtInt(row.nb_actifs)} actifs · {fmtMoney(Number(row.creances_total))}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Liste des sous-traitants"
        subtitle={`${filtered.length} / ${items.length}`}
        actions={
          <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
            <select value={filterType} onChange={e => setFilterType(e.target.value as any)} style={selectStyle}>
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Raison sociale</th>
                <th style={thStyle}>Activité</th>
                <th style={thStyle}>Contact</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tarif</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Solde</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Qualité</th>
                <th style={thStyle}>Depuis</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st) => (
                <tr key={st.id_soustraitant} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={tdMono}>{st.code}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{st.raison_sociale}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{st.ville}</div>
                  </td>
                  <td style={tdStyle}><TypeBadge type={st.type_activite} /></td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 'var(--text-sm)' }}>{st.contact_telephone || '—'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{st.contact_nom || ''}</div>
                  </td>
                  <td style={{ ...tdMono, textAlign: 'right' }}>
                    {st.tarif_unitaire != null ? `${Number(st.tarif_unitaire).toFixed(3)} / ${st.unite_facturation}` : '—'}
                  </td>
                  <td style={{ ...tdMono, textAlign: 'right', color: Number(st.solde_courant) > 0 ? 'var(--accent-terracotta)' : 'var(--fg-secondary)' }}>
                    {fmtMoney(Number(st.solde_courant))}
                  </td>
                  <td style={{ ...tdMono, textAlign: 'right' }}>
                    {st.qualite_moyenne_pct != null ? `${Number(st.qualite_moyenne_pct).toFixed(1)}%` : '—'}
                  </td>
                  <td style={tdMono}>{fmtDate(st.date_debut_relation)}</td>
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => navigate(`/sous-traitants/${st.id_soustraitant}`)}
                      style={linkBtn}
                    >
                      Ouvrir <ArrowRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && !loading && (
                <tr>
                  <td colSpan={9} style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)' }}>
                    Aucun sous-traitant ne correspond à ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

const TypeBadge: React.FC<{ type: TypeActiviteST }> = ({ type }) => {
  const tone = TYPE_ACTIVITE_TONE[type] || 'terracotta';
  const accent = `var(--accent-${tone})`;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 999,
      background: `${accent}18`, color: accent,
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
      textTransform: 'uppercase', fontWeight: 700,
    }}>
      <Scissors size={10} /> {TYPE_ACTIVITE_LABEL[type] || type}
    </span>
  );
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer', minHeight: 44,
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 500, cursor: 'pointer', minHeight: 44,
};
const linkBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'transparent', border: 'none',
  color: 'var(--accent-terracotta)', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.05em', minHeight: 32,
};
const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)', minHeight: 36,
};
const inputStyle: React.CSSProperties = {
  ...selectStyle, minWidth: 180,
};
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
};
const thStyle: React.CSSProperties = {
  padding: 'var(--s-2) var(--s-3)', textAlign: 'left',
  fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
  fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
  letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)',
};
const tdStyle: React.CSSProperties = {
  padding: 'var(--s-3)', color: 'var(--fg-primary)', verticalAlign: 'top',
};
const tdMono: React.CSSProperties = {
  ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
};

export default SoustraitantsListe;
