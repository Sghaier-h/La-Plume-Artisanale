import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TrendingUp, Target, ShoppingCart, FileText, Users, Phone,
  Calendar, Activity, Award, Plus, RefreshCw, X, Briefcase, Clock,
} from 'lucide-react';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BarChart, Bar, Cell, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, ComposedChart, Legend,
} from 'recharts';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

// ─── helpers ───────────────────────────────────────────────────────
const fmtMoney = (v: number | string | undefined): string => {
  const n = Number(v ?? 0);
  if (isNaN(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(0);
};
const fmtInt = (v: number | string | undefined) =>
  Number(v ?? 0).toLocaleString('fr-FR');
const fmtPct = (v: number | undefined) =>
  `${Math.round(Number(v ?? 0))}%`;

// ─── types ─────────────────────────────────────────────────────────
interface DashboardData {
  commercial: { id: number; nom: string; prenom: string; zone?: string };
  objectifs: { mensuel: number; trimestre: number; annuel: number };
  performance: {
    ca_mois: number; ca_trimestre: number; ca_annee: number;
    taux_atteinte_mensuel: number; taux_atteinte_trimestre: number;
    commissions_estimees: number;
  };
  pipeline: {
    opportunites_ouvertes: number;
    montant_pipeline: number;
    opportunites_par_stage: Array<{ stage: string; count: number; montant: number }>;
  };
  activite_recente: Array<{ type: string; date: string; description: string }>;
  top_clients: Array<{ id_client: number; raison_sociale: string; ca_mois: number; nb_commandes: number }>;
  objectifs_aujourdhui: Array<{ type: string; description: string; priorite: string }>;
  prochains_evenements: Array<{ date: string; type: string; description: string; client?: string }>;
}

interface LeaderRow {
  rang: number; id_commercial: number; nom: string;
  ca_mois: number; taux_atteinte: number; nb_commandes: number;
}

// ─── modal simple ──────────────────────────────────────────────────
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title, onClose, children,
}) => (
  <div
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-4)',
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)', padding: 'var(--s-5)', width: '100%', maxWidth: 480,
        color: 'var(--fg-primary)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

// ─── palette artisanale ────────────────────────────────────────────
const PALETTE = [
  'var(--accent-terracotta)',
  'var(--accent-gold)',
  'var(--accent-sage)',
  'var(--accent-indigo)',
  'var(--accent-rose)',
  'var(--accent-brown)',
];

const tooltipStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--fg-primary)',
  fontSize: 12,
};

const DashboardCommercial: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ id_commercial?: string }>();
  const { user } = useAuth();

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const targetId = params.id_commercial ?? user?.id;

  const [data, setData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<null | 'devis' | 'opportunite' | 'rdv'>(null);

  const fetchAll = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const [dash, lb] = await Promise.all([
        api.get(`/commercial/${targetId}/dashboard`).catch(() => null),
        api.get(`/commercial/leaderboard`).catch(() => null),
      ]);
      const payload = dash?.data?.data ?? dash?.data ?? null;
      const lbPayload = lb?.data?.data ?? lb?.data ?? [];
      setData(payload);
      setLeaderboard(Array.isArray(lbPayload) ? lbPayload : []);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Mock 12-month series (backend endpoint TBD): assemble from ca_annee + objectif
  const evolutionCA = useMemo(() => {
    const mois = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    const objectif = (data?.objectifs.mensuel ?? 0);
    const base = (data?.performance.ca_mois ?? 0);
    return mois.map((m, i) => ({
      mois: m,
      objectif,
      realise: i <= new Date().getMonth() ? Math.round(base * (0.6 + Math.random() * 0.6)) : null,
      prevision: i > new Date().getMonth() ? Math.round(objectif * (0.9 + Math.random() * 0.2)) : null,
    }));
  }, [data]);

  const progressionSemaines = useMemo(() => {
    const total = data?.performance.ca_mois ?? 0;
    const weeks = ['S1', 'S2', 'S3', 'S4'];
    return weeks.map((w, i) => ({ semaine: w, ca: Math.round((total * (i + 1)) / 4) }));
  }, [data]);

  const pipelineData = useMemo(() => {
    return (data?.pipeline.opportunites_par_stage ?? []).map((s, i) => ({
      stage: s.stage, count: s.count, montant: s.montant, fill: PALETTE[i % PALETTE.length],
    }));
  }, [data]);

  const tauxAtteinte = Number(data?.performance.taux_atteinte_mensuel ?? 0);
  const gaugeData = [{ name: 'Atteinte', value: Math.min(tauxAtteinte, 100), fill: 'var(--accent-terracotta)' }];

  const nomComplet = data?.commercial
    ? `${data.commercial.prenom ?? ''} ${data.commercial.nom ?? ''}`.trim()
    : `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim();

  return (
    <>
      <DashboardShell
        eyebrow="Vue personnelle"
        title={`Espace commercial — ${nomComplet || '…'}`}
        subtitle={data?.commercial.zone ? `Zone : ${data.commercial.zone}` : 'Suivi de vos performances, pipeline et agenda.'}
        headerRight={
          <>
            <button onClick={() => setActiveModal('devis')} style={btnGhost}><Plus size={14} /> Nouveau devis</button>
            <button onClick={() => setActiveModal('opportunite')} style={btnGhost}><Plus size={14} /> Opportunité</button>
            <button onClick={() => setActiveModal('rdv')} style={btnPrimary}><Plus size={14} /> Nouveau RDV</button>
            <button onClick={fetchAll} style={btnGhost} title="Actualiser">
              <RefreshCw size={14} />
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* ROW 1 — KPIs primaires */}
        <div className="lp-metric-grid">
          <KpiCard
            label="CA du mois"
            value={fmtMoney(data?.performance.ca_mois)}
            unit="DT"
            hint={`Objectif : ${fmtMoney(data?.objectifs.mensuel)} DT`}
            icon={<TrendingUp size={18} />}
            tone="terracotta"
            loading={loading}
          />
          <KpiCard
            label="Taux d'atteinte"
            value={fmtPct(data?.performance.taux_atteinte_mensuel)}
            hint="Objectif mensuel"
            icon={<Target size={18} />}
            tone="gold"
            loading={loading}
          />
          <KpiCard
            label="Commandes"
            value={fmtInt(data?.top_clients?.reduce((s, c) => s + Number(c.nb_commandes || 0), 0))}
            hint="Total mois en cours"
            icon={<ShoppingCart size={18} />}
            tone="sage"
            loading={loading}
            onClick={() => navigate('/commandes')}
          />
          <KpiCard
            label="Devis en cours"
            value={fmtInt(data?.objectifs_aujourdhui?.filter(o => o.type === 'devis').length)}
            hint="À envoyer / relancer"
            icon={<FileText size={18} />}
            tone="indigo"
            loading={loading}
            onClick={() => navigate('/devis')}
          />
        </div>

        {/* ROW 2 — KPIs secondaires */}
        <div className="lp-metric-grid">
          <KpiCard
            label="Pipeline"
            value={fmtMoney(data?.pipeline.montant_pipeline)}
            unit="DT"
            hint={`${data?.pipeline.opportunites_ouvertes ?? 0} opportunités`}
            icon={<Briefcase size={16} />}
            tone="rose"
            loading={loading}
          />
          <KpiCard
            label="Clients actifs"
            value={fmtInt(data?.top_clients?.length)}
            hint="Top clients mois"
            icon={<Users size={16} />}
            tone="brown"
            loading={loading}
            onClick={() => navigate('/clients')}
          />
          <KpiCard
            label="Relances à faire"
            value={fmtInt(data?.objectifs_aujourdhui?.filter(o => o.type === 'relance').length)}
            hint="Factures en retard"
            icon={<Phone size={16} />}
            tone="terracotta"
            loading={loading}
          />
          <KpiCard
            label="RDV aujourd'hui"
            value={fmtInt(
              data?.prochains_evenements?.filter(
                (e) => new Date(e.date).toDateString() === new Date().toDateString()
              ).length
            )}
            hint="Événements du jour"
            icon={<Calendar size={16} />}
            tone="sage"
            loading={loading}
          />
        </div>

        {/* ROW 3 — Progression + RDV */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--s-4)' }}>
          <div style={{ gridColumn: 'span 8' }}>
            <SectionCard
              title="Progression objectif mensuel"
              subtitle={`${fmtMoney(data?.performance.ca_mois)} / ${fmtMoney(data?.objectifs.mensuel)} DT`}
              icon={<Target size={16} />}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--s-4)', alignItems: 'center' }}>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'var(--bg-hover)' }} />
                      <text
                        x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: 24, fontWeight: 700, fill: 'var(--fg-primary)' }}
                      >
                        {fmtPct(tauxAtteinte)}
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressionSemaines} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="semaine" stroke="var(--fg-muted)" fontSize={11} />
                      <YAxis stroke="var(--fg-muted)" fontSize={11} tickFormatter={(v) => fmtMoney(v)} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${fmtMoney(v as number)} DT`} />
                      <Bar dataKey="ca" fill="var(--accent-terracotta)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>
          </div>

          <div style={{ gridColumn: 'span 4' }}>
            <SectionCard title="Mes prochains RDV" subtitle="J → J+7" icon={<Calendar size={16} />}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 240, overflowY: 'auto' }}>
                {(data?.prochains_evenements ?? []).slice(0, 8).map((e, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 'var(--s-2)',
                    padding: 'var(--s-2) 0', borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <Clock size={14} style={{ color: 'var(--accent-gold)', marginTop: 3 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                        {e.date ? new Date(e.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', fontWeight: 500 }}>
                        {e.description || e.type}
                      </div>
                      {e.client && <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{e.client}</div>}
                    </div>
                  </li>
                ))}
                {(!data?.prochains_evenements || data.prochains_evenements.length === 0) && (
                  <li style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)', padding: 'var(--s-3) 0' }}>
                    Aucun RDV planifié
                  </li>
                )}
              </ul>
            </SectionCard>
          </div>
        </div>

        {/* ROW 4 — Pipeline + Objectifs du jour */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--s-4)' }}>
          <div style={{ gridColumn: 'span 8' }}>
            <SectionCard
              title="Pipeline commercial"
              subtitle={`${fmtMoney(data?.pipeline.montant_pipeline)} DT en cours`}
              icon={<Briefcase size={16} />}
            >
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical" margin={{ top: 8, right: 12, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                    <XAxis type="number" stroke="var(--fg-muted)" fontSize={11} tickFormatter={(v) => fmtMoney(v)} />
                    <YAxis type="category" dataKey="stage" stroke="var(--fg-muted)" fontSize={11} width={80} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${fmtMoney(v as number)} DT`} />
                    <Bar dataKey="montant" radius={[0, 4, 4, 0]}>
                      {pipelineData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div style={{ gridColumn: 'span 4' }}>
            <SectionCard title="Objectifs du jour" subtitle="Tâches priorisées" icon={<Target size={16} />}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {(data?.objectifs_aujourdhui ?? []).map((o, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--s-2)',
                    padding: 'var(--s-3) 0', borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: o.priorite === 'haute' ? 'var(--accent-terracotta)' :
                                  o.priorite === 'moyenne' ? 'var(--accent-gold)' : 'var(--accent-sage)',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{o.description}</div>
                      <div style={{ fontSize: 11, color: 'var(--fg-muted)', textTransform: 'uppercase' }}>{o.type}</div>
                    </div>
                  </li>
                ))}
                {(!data?.objectifs_aujourdhui || data.objectifs_aujourdhui.length === 0) && (
                  <li style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)', padding: 'var(--s-3) 0' }}>
                    Aucune tâche prioritaire
                  </li>
                )}
              </ul>
            </SectionCard>
          </div>
        </div>

        {/* ROW 5 — Top clients + Activités + Leaderboard */}
        <div className="lp-grid-3">
          <SectionCard title="Top 5 clients du mois" subtitle="Chiffre d'affaires" icon={<Users size={16} />}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--fg-muted)', fontSize: 11 }}>
                  <th style={{ padding: 'var(--s-2) 0' }}>Client</th>
                  <th style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>CA</th>
                  <th style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>Cmd</th>
                </tr>
              </thead>
              <tbody>
                {(data?.top_clients ?? []).map((c) => (
                  <tr key={c.id_client} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--s-2) 0', color: 'var(--fg-primary)' }}>{c.raison_sociale}</td>
                    <td style={{ padding: 'var(--s-2) 0', textAlign: 'right', color: 'var(--fg-primary)', fontWeight: 600 }}>
                      {fmtMoney(c.ca_mois)}
                    </td>
                    <td style={{ padding: 'var(--s-2) 0', textAlign: 'right', color: 'var(--fg-secondary)' }}>
                      {c.nb_commandes}
                    </td>
                  </tr>
                ))}
                {(!data?.top_clients || data.top_clients.length === 0) && (
                  <tr><td colSpan={3} style={{ padding: 'var(--s-3) 0', color: 'var(--fg-muted)' }}>Aucun client</td></tr>
                )}
              </tbody>
            </table>
          </SectionCard>

          <SectionCard title="Activités récentes" subtitle="10 dernières actions" icon={<Activity size={16} />}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 260, overflowY: 'auto' }}>
              {(data?.activite_recente ?? []).map((a, i) => (
                <li key={i} style={{
                  display: 'flex', gap: 'var(--s-2)', padding: 'var(--s-2) 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--accent-indigo)', marginTop: 8, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{a.description}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                      {a.type} · {a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                </li>
              ))}
              {(!data?.activite_recente || data.activite_recente.length === 0) && (
                <li style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-sm)', padding: 'var(--s-3) 0' }}>
                  Aucune activité
                </li>
              )}
            </ul>
          </SectionCard>

          <SectionCard title="Leaderboard équipe" subtitle="Classement du mois" icon={<Award size={16} />}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--fg-muted)', fontSize: 11 }}>
                  <th style={{ padding: 'var(--s-2) 0', width: 30 }}>#</th>
                  <th style={{ padding: 'var(--s-2) 0' }}>Commercial</th>
                  <th style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>CA</th>
                  <th style={{ padding: 'var(--s-2) 0', textAlign: 'right' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 8).map((r) => (
                  <tr
                    key={r.id_commercial}
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      background: String(r.id_commercial) === String(targetId) ? 'var(--bg-hover)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: 'var(--s-2) 0', color: r.rang <= 3 ? 'var(--accent-gold)' : 'var(--fg-muted)', fontWeight: 700 }}>
                      {r.rang}
                    </td>
                    <td style={{ padding: 'var(--s-2) 0', color: 'var(--fg-primary)' }}>{r.nom}</td>
                    <td style={{ padding: 'var(--s-2) 0', textAlign: 'right', color: 'var(--fg-primary)' }}>
                      {fmtMoney(r.ca_mois)}
                    </td>
                    <td style={{ padding: 'var(--s-2) 0', textAlign: 'right', color: 'var(--fg-secondary)' }}>
                      {fmtPct(r.taux_atteinte)}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 'var(--s-3) 0', color: 'var(--fg-muted)' }}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </SectionCard>
        </div>

        {/* ROW 6 — Évolution CA 12 mois */}
        <SectionCard
          title="Évolution CA — 12 mois"
          subtitle="Réalisé (barres) · Objectif (ligne) · Prévisions (pointillé)"
          icon={<TrendingUp size={16} />}
        >
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evolutionCA} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="mois" stroke="var(--fg-muted)" fontSize={11} />
                <YAxis stroke="var(--fg-muted)" fontSize={11} tickFormatter={(v) => fmtMoney(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => v == null ? '—' : `${fmtMoney(v as number)} DT`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="realise" name="Réalisé" fill="var(--accent-terracotta)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="objectif" name="Objectif" stroke="var(--accent-gold)" strokeWidth={2} dot={false} />
                <Line
                  type="monotone" dataKey="prevision" name="Prévisions"
                  stroke="var(--accent-indigo)" strokeDasharray="5 5" strokeWidth={2} dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {isAdmin && targetId && String(targetId) !== String(user?.id) && (
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', textAlign: 'right' }}>
            Vue administrateur — commercial #{targetId}
          </div>
        )}
      </DashboardShell>

      {activeModal === 'devis' && (
        <Modal title="Nouveau devis" onClose={() => setActiveModal(null)}>
          <p style={{ color: 'var(--fg-secondary)', fontSize: 'var(--text-sm)' }}>
            Continuer la saisie complète dans la page dédiée.
          </p>
          <button
            style={{ ...btnPrimary, marginTop: 'var(--s-3)' }}
            onClick={() => { setActiveModal(null); navigate('/devis'); }}
          >
            Aller à la page Devis
          </button>
        </Modal>
      )}
      {activeModal === 'opportunite' && (
        <Modal title="Nouvelle opportunité" onClose={() => setActiveModal(null)}>
          <p style={{ color: 'var(--fg-secondary)', fontSize: 'var(--text-sm)' }}>
            Créer et suivre depuis le module CRM.
          </p>
          <button
            style={{ ...btnPrimary, marginTop: 'var(--s-3)' }}
            onClick={() => { setActiveModal(null); navigate('/crm/opportunites'); }}
          >
            Ouvrir le CRM
          </button>
        </Modal>
      )}
      {activeModal === 'rdv' && (
        <Modal title="Nouveau rendez-vous" onClose={() => setActiveModal(null)}>
          <p style={{ color: 'var(--fg-secondary)', fontSize: 'var(--text-sm)' }}>
            Planifier un RDV client dans votre agenda.
          </p>
          <button
            style={{ ...btnPrimary, marginTop: 'var(--s-3)' }}
            onClick={() => { setActiveModal(null); navigate('/crm/activites'); }}
          >
            Ouvrir l'agenda CRM
          </button>
        </Modal>
      )}
    </>
  );
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', background: 'var(--accent-terracotta)', color: '#fff',
  border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};

export default DashboardCommercial;
