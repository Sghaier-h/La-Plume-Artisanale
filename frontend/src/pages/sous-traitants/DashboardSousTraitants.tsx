/**
 * DashboardSousTraitants (Phase B §14quater.3 — hub + alertes §14ter.17c)
 * Dashboard central pour pilotage sous-traitants :
 *  · Alertes top (bons retards, anomalies, paiements)
 *  · Grille d'icônes (actions principales)
 *  · KPI par type d'activité + mini-graphique mensuel
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Users, Package, Coins, FileText, ArrowRight,
  Scissors, PlusCircle, Clock, Receipt, Activity, UserPlus,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import {
  soustraitantsApi, travauxApi, bonsSTApi,
  AnomalieST, SousTraitant, TravailST, BonST, StatsGlobalST, StatsParType,
  TYPE_ACTIVITE_LABEL, TYPE_ACTIVITE_TONE,
  fmtInt, fmtMoney, fmtDate,
} from '../../services/soustraitanceApi';

const DashboardSousTraitants: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ global: StatsGlobalST; par_type: StatsParType[] } | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalieST[]>([]);
  const [bonsRetard, setBonsRetard] = useState<BonST[]>([]);
  const [travauxEnCours, setTravauxEnCours] = useState<TravailST[]>([]);
  const [parMois, setParMois] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, a, bons, trav, mois] = await Promise.all([
          soustraitantsApi.stats().catch(() => null),
          soustraitantsApi.anomalies({ resolu: false }).catch(() => []),
          bonsSTApi.list().catch(() => []),
          travauxApi.list({ statut: 'en_cours' }).catch(() => []),
          travauxApi.parMois(6).catch(() => []),
        ]);
        setStats(s);
        setAnomalies(a || []);
        const bonsAll = Array.isArray(bons) ? bons : [];
        setBonsRetard(bonsAll.filter(b =>
          b.date_retour_prevue && new Date(b.date_retour_prevue) < new Date()
            && ['expedie', 'chez_st', 'en_retour_partiel'].includes(b.statut)
        ).slice(0, 10));
        setTravauxEnCours(trav || []);
        setParMois(mois || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const anomaliesCritiques = anomalies.filter(a => a.gravite === 'critique' || a.gravite === 'a_corriger').slice(0, 5);

  // regroupe parMois en {mois: {type: nb}}
  const moisAgg = useMemo(() => {
    const map = new Map<string, { mois: string; total: number }>();
    for (const row of parMois) {
      const key = String(row.mois).slice(0, 7);
      map.set(key, { mois: key, total: (map.get(key)?.total ?? 0) + Number(row.nb ?? 0) });
    }
    return Array.from(map.values()).sort((a, b) => a.mois.localeCompare(b.mois));
  }, [parMois]);
  const maxMois = Math.max(1, ...moisAgg.map(m => m.total));

  const HUB: Array<{ icon: React.ReactNode; label: string; tone: string; onClick: () => void }> = [
    { icon: <Users size={22} />,         label: 'Mes sous-traitants', tone: 'terracotta', onClick: () => navigate('/sous-traitants') },
    { icon: <UserPlus size={22} />,      label: 'Nouveau ST',         tone: 'sage',       onClick: () => navigate('/sous-traitants/nouveau') },
    { icon: <Package size={22} />,       label: 'Travaux ST',         tone: 'indigo',     onClick: () => navigate('/travaux-sous-traitants') },
    { icon: <FileText size={22} />,      label: 'Bons de sortie',     tone: 'gold',       onClick: () => navigate('/sous-traitants?tab=bons') },
    { icon: <Coins size={22} />,         label: 'Comptes & paiements',tone: 'rose',       onClick: () => navigate('/sous-traitants?tab=comptes') },
    { icon: <Scissors size={22} />,      label: 'Tablette atelier',   tone: 'terracotta', onClick: () => navigate('/tablette/sous-traitant') },
  ];

  return (
    <DashboardShell
      eyebrow="§14quater.3 · Dashboard sous-traitants"
      title="Pilotage sous-traitants"
      subtitle="Hub d'actions, alertes et performance par type d'activité."
      headerRight={
        <button type="button" onClick={() => navigate('/sous-traitants')} style={btnPrimary}>
          <Activity size={14} style={{ marginRight: 6 }} /> Voir la liste
        </button>
      }
    >
      {/* ── ALERTES TOP ───────────────────────────────────────── */}
      <SectionCard
        title="Alertes"
        subtitle={`${anomaliesCritiques.length + bonsRetard.length} éléments à traiter`}
      >
        <div style={{
          display: 'grid',
          gap: 'var(--s-3)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}>
          <AlerteCard
            icon={<AlertTriangle size={14} />}
            title="Anomalies critiques"
            count={anomaliesCritiques.length}
            tone="var(--color-danger)"
            onClick={() => navigate('/sous-traitants?tab=anomalies')}
            items={anomaliesCritiques.map(a => `${a.type_anomalie} · ${a.numero_suivi || '—'}`).slice(0, 3)}
          />
          <AlerteCard
            icon={<Clock size={14} />}
            title="Bons retour en retard"
            count={bonsRetard.length}
            tone="var(--accent-gold)"
            onClick={() => navigate('/sous-traitants?tab=bons')}
            items={bonsRetard.slice(0, 3).map(b => `${b.numero_bon} · ${b.sous_traitant_nom ?? ''}`)}
          />
          <AlerteCard
            icon={<Receipt size={14} />}
            title="Créances > 5 000 TND"
            count={0 /* calcul client sur stats.par_type */}
            tone="var(--accent-terracotta)"
            onClick={() => navigate('/sous-traitants')}
            items={[]}
            emptyLabel="Détails dans Comptes"
          />
        </div>
      </SectionCard>

      {/* ── HUB ICÔNES ────────────────────────────────────────── */}
      <SectionCard title="Actions rapides" subtitle="Grille d'icônes · chaque icône ouvre une sous-page dédiée">
        <div style={{
          display: 'grid',
          gap: 'var(--s-3)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}>
          {HUB.map(h => (
            <button key={h.label} type="button" onClick={h.onClick} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 'var(--s-5)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer', minHeight: 120,
              transition: 'transform 160ms ease, border-color 160ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-subtle)';
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: `color-mix(in srgb, var(--accent-${h.tone}) 15%, transparent)`,
                color: `var(--accent-${h.tone})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {h.icon}
              </div>
              <span style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 'var(--text-md)', color: 'var(--fg-primary)', textAlign: 'center',
              }}>{h.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── KPI SYNTHÉTIQUES ──────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gap: 'var(--s-4)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      }}>
        <KpiCard label="Sous-traitants actifs" value={fmtInt(stats?.global.nb_actifs ?? 0)}
                 icon={<Users size={18} />} tone="terracotta" loading={loading} />
        <KpiCard label="Créances totales" value={fmtMoney(Number(stats?.global.creances_total ?? 0))}
                 icon={<Coins size={18} />} tone="gold" loading={loading} />
        <KpiCard label="Travaux en cours" value={fmtInt(travauxEnCours.length)}
                 icon={<Package size={18} />} tone="sage" loading={loading} />
        <KpiCard label="Anomalies ouvertes" value={fmtInt(anomalies.length)}
                 icon={<AlertTriangle size={18} />} tone="rose" loading={loading} />
      </div>

      {/* ── PERFORMANCE PAR TYPE ─────────────────────────────── */}
      <SectionCard title="Performance par type d'activité" subtitle="Qualité moyenne, créances, effectifs">
        <div style={{
          display: 'grid',
          gap: 'var(--s-3)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          {(stats?.par_type ?? []).map(row => {
            const tone = TYPE_ACTIVITE_TONE[row.type_activite] || 'terracotta';
            const accent = `var(--accent-${tone})`;
            return (
              <div key={row.type_activite} style={{
                padding: 'var(--s-4)',
                background: 'var(--bg-elevated)',
                border: `1px solid var(--border-subtle)`,
                borderRadius: 'var(--radius-md)',
                borderLeft: `3px solid ${accent}`,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: 'var(--text-md)', color: 'var(--fg-primary)',
                }}>{TYPE_ACTIVITE_LABEL[row.type_activite] || row.type_activite}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                  {fmtInt(row.nb_actifs)} actifs · {fmtInt(row.nb_inactifs)} inactifs
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: accent, fontWeight: 700 }}>
                  {fmtMoney(Number(row.creances_total))}
                </div>
                {row.qualite_moyenne != null && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                    Qualité : {Number(row.qualite_moyenne).toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── TRAVAUX PAR MOIS ─────────────────────────────────── */}
      <SectionCard title="Activité des 6 derniers mois" subtitle="Nombre de travaux lancés / mois">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--s-3)', height: 160 }}>
          {moisAgg.map(m => (
            <div key={m.mois} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, minWidth: 50 }}>
              <div style={{
                width: '70%', maxWidth: 60,
                background: 'linear-gradient(180deg, var(--accent-terracotta), var(--accent-terracotta)44)',
                height: `${(m.total / maxMois) * 120}px`,
                borderRadius: '4px 4px 0 0',
                transition: 'height 400ms ease',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                {m.mois.slice(5)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-primary)', fontWeight: 700 }}>
                {fmtInt(m.total)}
              </span>
            </div>
          ))}
          {!moisAgg.length && (
            <div style={{ margin: 'auto', color: 'var(--fg-muted)' }}>Aucune donnée mensuelle.</div>
          )}
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

const AlerteCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  count: number;
  tone: string;
  onClick?: () => void;
  items?: string[];
  emptyLabel?: string;
}> = ({ icon, title, count, tone, onClick, items = [], emptyLabel }) => (
  <button type="button" onClick={onClick} style={{
    display: 'flex', flexDirection: 'column', gap: 'var(--s-2)',
    padding: 'var(--s-4)',
    background: 'var(--bg-elevated)',
    border: `1px solid ${count > 0 ? tone : 'var(--border-subtle)'}`,
    borderLeft: `3px solid ${tone}`,
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer', textAlign: 'left', minHeight: 120,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tone }}>
      {icon}
      <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
        {title}
      </span>
    </div>
    <div style={{
      fontFamily: 'var(--font-serif)', fontStyle: 'italic',
      fontSize: 'var(--text-2xl)', color: tone, fontWeight: 700,
    }}>{fmtInt(count)}</div>
    {items.length ? (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
        {items.map((it, i) => <li key={i} style={{ padding: '2px 0' }}>{it}</li>)}
      </ul>
    ) : (
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>{emptyLabel || 'Rien à signaler'}</span>
    )}
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      marginTop: 'auto',
      fontSize: 'var(--text-xs)', color: tone, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>Ouvrir <ArrowRight size={10} /></span>
  </button>
);

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer', minHeight: 44,
};

export default DashboardSousTraitants;
