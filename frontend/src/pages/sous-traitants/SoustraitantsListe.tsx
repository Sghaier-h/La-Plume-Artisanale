/**
 * SoustraitantsListe (Phase B §14quater.3)
 * Liste des sous-traitants avec filtre par type_activite + KPI.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, AlertTriangle, Activity, Coins, Package, ArrowRight, Scissors } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import {
  IconFrange, IconNouage, IconOurdissage, IconChaine, IconTrame, IconDecoupe, IconBobine, IconEtiquette,
} from '../../components/ui/IconsLaPlume';
import {
  soustraitantsApi, SousTraitant, StatsGlobalST, StatsParType,
  TypeActiviteST, TYPE_ACTIVITE_LABEL, TYPE_ACTIVITE_TONE, fmtInt, fmtMoney, fmtDate,
} from '../../services/soustraitanceApi';
import { SkeletonTable, EmptyState } from '../../components/ui';
import { DataTable, Column } from '../../components/ui/DataTable';

/** Phase F4 — icône par type d'activité sous-traitant */
const TYPE_ACTIVITE_ICON: Partial<Record<TypeActiviteST, React.ReactNode>> = {
  ourdissage: <IconOurdissage size={16} />,
  nouage: <IconNouage size={16} />,
  tissage: <IconChaine size={16} />,
  frange: <IconFrange size={16} />,
  couture: <IconTrame size={16} />,
  teinture: <IconBobine size={16} />,
  broderie: <IconEtiquette size={16} />,
  personnalisation: <IconEtiquette size={16} />,
  finition: <IconDecoupe size={16} />,
};

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
      titleBrush
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
            const icon = TYPE_ACTIVITE_ICON[row.type_activite];
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: accent }}>
                  {icon}
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--fg-primary)' }}>
                    {TYPE_ACTIVITE_LABEL[row.type_activite] || row.type_activite}
                  </span>
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
        <DataTable<SousTraitant>
          columns={[
            { key: 'code', label: 'Code', sortable: true, render: (st) => <span style={{ fontFamily: 'var(--font-mono)' }}>{st.code}</span> },
            { key: 'raison_sociale', label: 'Raison sociale', sortable: true, render: (st) => (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{st.raison_sociale}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{st.ville}</div>
              </div>
            ) },
            { key: 'type_activite', label: 'Activité', sortable: true, render: (st) => <TypeBadge type={st.type_activite} /> },
            { key: 'contact_telephone', label: 'Contact', sortable: true, render: (st) => (
              <div>
                <div style={{ fontSize: 'var(--text-sm)' }}>{st.contact_telephone || '—'}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{st.contact_nom || ''}</div>
              </div>
            ) },
            { key: 'tarif_unitaire', label: 'Tarif', sortable: true, align: 'right', value: (st) => Number(st.tarif_unitaire) || 0, render: (st) => (
              <span style={{ fontFamily: 'var(--font-mono)' }}>{st.tarif_unitaire != null ? `${Number(st.tarif_unitaire).toFixed(3)} / ${st.unite_facturation}` : '—'}</span>
            ) },
            { key: 'solde_courant', label: 'Solde', sortable: true, align: 'right', value: (st) => Number(st.solde_courant) || 0, render: (st) => (
              <span style={{ fontFamily: 'var(--font-mono)', color: Number(st.solde_courant) > 0 ? 'var(--accent-terracotta)' : 'var(--fg-secondary)' }}>
                {fmtMoney(Number(st.solde_courant))}
              </span>
            ) },
            { key: 'qualite_moyenne_pct', label: 'Qualité', sortable: true, align: 'right', value: (st) => Number(st.qualite_moyenne_pct) || 0, render: (st) => (
              <span style={{ fontFamily: 'var(--font-mono)' }}>{st.qualite_moyenne_pct != null ? `${Number(st.qualite_moyenne_pct).toFixed(1)}%` : '—'}</span>
            ) },
            { key: 'date_debut_relation', label: 'Depuis', sortable: true, value: (st) => st.date_debut_relation, render: (st) => <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtDate(st.date_debut_relation)}</span> },
            { key: '_actions', label: '', sortable: false, exportable: false, render: (st) => (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigate(`/sous-traitants/${st.id_soustraitant}`); }}
                style={linkBtn}
              >
                Ouvrir <ArrowRight size={10} />
              </button>
            ) },
          ] as Column<SousTraitant>[]}
          data={filtered}
          rowKey={(st) => st.id_soustraitant}
          onRowClick={(st) => navigate(`/sous-traitants/${st.id_soustraitant}`)}
          pageSize={25}
          exportable
          exportFilename="sous_traitants"
          loading={loading}
          emptyState={
            <EmptyState
              variant={search || filterType ? 'search-no-result' : 'default'}
              title={search || filterType ? 'Aucun sous-traitant ne correspond' : 'Aucun sous-traitant'}
              description={search || filterType ? 'Essayez de réinitialiser votre recherche ou votre filtre.' : 'Ajoutez votre premier partenaire sous-traitant.'}
              cta={search || filterType
                ? { label: 'Réinitialiser', onClick: () => { setSearch(''); setFilterType(''); } }
                : { label: 'Nouveau sous-traitant', onClick: () => navigate('/sous-traitants/nouveau') }}
            />
          }
        />
      </SectionCard>
    </DashboardShell>
  );
};

const TypeBadge: React.FC<{ type: TypeActiviteST }> = ({ type }) => {
  const tone = TYPE_ACTIVITE_TONE[type] || 'terracotta';
  const accent = `var(--accent-${tone})`;
  // Phase F4 — icône métier spécifique (ex: frange, nouage) sinon fallback ciseaux
  const metierIcon = (() => {
    switch (type) {
      case 'frange': return <IconFrange size={12} />;
      case 'nouage': return <IconNouage size={12} />;
      case 'ourdissage': return <IconOurdissage size={12} />;
      case 'tissage': return <IconChaine size={12} />;
      case 'couture': return <IconTrame size={12} />;
      case 'teinture': return <IconBobine size={12} />;
      case 'broderie':
      case 'personnalisation': return <IconEtiquette size={12} />;
      case 'finition': return <IconDecoupe size={12} />;
      default: return <Scissors size={10} />;
    }
  })();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 999,
      background: `${accent}18`, color: accent,
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
      textTransform: 'uppercase', fontWeight: 700,
    }}>
      {metierIcon} {TYPE_ACTIVITE_LABEL[type] || type}
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
