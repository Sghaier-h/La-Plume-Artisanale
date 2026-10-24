/**
 * Dashboard IA — agents & rapports (§14.15)
 * — Vue synthèse des agents intelligents La Plume Artisanale :
 *     • Agent Commercial (relances devis, priorisation leads)
 *     • Agent Achats (réappro fournisseurs, alertes)
 *     • Agent Fabrication (planification OF, anti-goulot)
 *     • Agent Qualité (analyse défauts, causes racines)
 *     • Agent RH (bilans, rapports masse salariale)
 *
 * Design system La Plume strict :
 *   • Titres : Fraunces italic (var(--font-serif))
 *   • Texte  : Inter        (var(--font-sans))
 *   • Chiffres : JetBrains Mono (var(--font-mono))
 *   • Palette : terracotta / sage / indigo / gold / cream
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  MessagesSquare,
  ShoppingBag,
  Factory,
  ShieldCheck,
  Users,
  Zap,
  FileText,
  Sparkles,
  ArrowRight,
  Activity,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../components/dashboard';
import { iaAgentsService } from '../services/api';

// ─── types ───────────────────────────────────────────────────────
type AgentStatut = 'actif' | 'en_pause' | 'apprentissage';

type Agent = {
  id: string;
  code: string;
  nom: string;
  role: string;
  statut: AgentStatut;
  tone: 'terracotta' | 'sage' | 'indigo' | 'gold' | 'rose';
  icon: React.ReactNode;
  actions_24h: number;
  taux_conf: number;
  derniere_action: string;
  route: string;
};

type Rapport = {
  id: string;
  titre: string;
  agent: string;
  date: string;
  type: 'PDF' | 'XLSX' | 'MD';
};

// Mapping code agent → tone / icon / route (static UI config)
const AGENT_UI: Record<string, { tone: Agent['tone']; icon: React.ReactNode; route: string }> = {
  'AGT-COM':  { tone: 'terracotta', icon: <MessagesSquare size={18} />, route: '/dashboard-commercial' },
  'AGT-ACH':  { tone: 'gold',       icon: <ShoppingBag size={18} />,    route: '/fournisseurs' },
  'AGT-FAB':  { tone: 'indigo',     icon: <Factory size={18} />,        route: '/planning' },
  'AGT-QLT':  { tone: 'sage',       icon: <ShieldCheck size={18} />,    route: '/qualite-avancee' },
  'AGT-RH':   { tone: 'rose',       icon: <Users size={18} />,          route: '/dashboard-rh-manager' },
};
const defaultAgentUi = { tone: 'indigo' as const, icon: <BrainCircuit size={18} />, route: '/ia' };

const badgeStatut: Record<AgentStatut, { label: string; bg: string; fg: string }> = {
  actif: { label: 'Actif', bg: 'var(--color-success-bg)', fg: 'var(--color-success)' },
  apprentissage: { label: 'Apprentissage', bg: 'color-mix(in srgb, var(--accent-indigo) 15%, transparent)', fg: 'var(--accent-indigo)' },
  en_pause: { label: 'En pause', bg: 'color-mix(in srgb, var(--fg-muted) 15%, transparent)', fg: 'var(--fg-muted)' },
};

const toneAccent = (t: Agent['tone']): string => ({
  terracotta: 'var(--accent-terracotta)',
  sage: 'var(--accent-sage)',
  indigo: 'var(--accent-indigo)',
  gold: 'var(--accent-gold)',
  rose: 'var(--accent-rose)',
}[t]);

const fmtInt = (n: number) => n.toLocaleString('fr-FR');

const DashboardIA: React.FC = () => {
  const navigate = useNavigate();

  // Phase F2 — Agents, runs & rapports chargés depuis /api/v2/ia-agents/*
  const [AGENTS, setAgents] = React.useState<Agent[]>([]);
  const [RAPPORTS, setRapports] = React.useState<Rapport[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    const unwrap = (r: any) => r?.data?.data ?? r?.data ?? [];

    const normStatut = (s: any): AgentStatut => {
      const v = String(s || 'actif').toLowerCase();
      if (v === 'en_pause' || v === 'pause' || v === 'inactif') return 'en_pause';
      if (v === 'apprentissage' || v === 'learning') return 'apprentissage';
      return 'actif';
    };
    const normType = (t: any): Rapport['type'] => {
      const v = String(t || 'PDF').toUpperCase();
      if (v === 'XLSX' || v === 'XLS' || v === 'CSV') return 'XLSX';
      if (v === 'MD' || v === 'MARKDOWN') return 'MD';
      return 'PDF';
    };

    const load = async () => {
      try {
        const [a, f, r] = await Promise.all([
          iaAgentsService.getAgents(),
          iaAgentsService.getFindings(20),
          iaAgentsService.getRuns(50),
        ]);
        if (cancelled) return;
        const agentsRaw: any[] = Array.isArray(unwrap(a)) ? unwrap(a) : [];
        const findingsRaw: any[] = Array.isArray(unwrap(f)) ? unwrap(f) : [];
        const runsRaw: any[] = Array.isArray(unwrap(r)) ? unwrap(r) : [];

        // Agrège runs par code agent → actions_24h & dernière action
        const dayAgo = Date.now() - 24 * 3600 * 1000;
        const runStats = new Map<string, { count24h: number; last?: string }>();
        for (const run of runsRaw) {
          const code = String(run.code_agent || run.id_agent || '').toUpperCase();
          const d = run.started_at || run.date_run || run.created_at;
          const t = d ? new Date(d).getTime() : 0;
          const s = runStats.get(code) || { count24h: 0, last: undefined };
          if (t >= dayAgo) s.count24h += 1;
          if (!s.last || (t && t > new Date(s.last).getTime())) s.last = d;
          runStats.set(code, s);
        }

        setAgents(agentsRaw.map((row: any): Agent => {
          const code = String(row.code || row.code_agent || row.id_agent || 'AGT').toUpperCase();
          const ui = AGENT_UI[code] || defaultAgentUi;
          const stat = runStats.get(code) || { count24h: 0, last: undefined };
          return {
            id: String(row.id_agent ?? row.id ?? code),
            code,
            nom: row.nom || row.libelle || code,
            role: row.role || row.description || '',
            statut: normStatut(row.statut),
            tone: ui.tone,
            icon: ui.icon,
            route: ui.route,
            actions_24h: Number(stat.count24h) || Number(row.actions_24h) || 0,
            taux_conf: Number(row.taux_confiance ?? row.taux_conf ?? 0),
            derniere_action: stat.last
              ? new Date(stat.last).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
              : '—',
          };
        }));

        setRapports(findingsRaw.map((row: any): Rapport => ({
          id: String(row.id_finding ?? row.id ?? Math.random()),
          titre: row.titre || row.libelle || row.message || 'Rapport',
          agent: String(row.code_agent || row.id_agent || '').toUpperCase() || '—',
          date: row.created_at ? new Date(row.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '',
          type: normType(row.type_rapport || row.format),
        })));
      } catch {
        // garde les tableaux vides
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const totalActions = AGENTS.reduce((s, a) => s + a.actions_24h, 0);
  const nbActifs = AGENTS.filter((a) => a.statut === 'actif').length;
  const confMoyenne = Math.round(
    AGENTS.filter((a) => a.taux_conf > 0).reduce((s, a) => s + a.taux_conf, 0) /
      Math.max(1, AGENTS.filter((a) => a.taux_conf > 0).length),
  );

  return (
    <DashboardShell
      eyebrow="§14.15 · Intelligence artificielle"
      title="Agents & rapports"
      subtitle="Supervision des agents intelligents, actions réalisées et rapports générés."
      headerRight={
        <>
          <button type="button" onClick={() => navigate('/ia')} style={btnPrimary}>
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Ouvrir la console IA
          </button>
        </>
      }
    >
      {/* ── KPI globaux ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Agents actifs"
          value={fmtInt(nbActifs)}
          unit={`/ ${AGENTS.length}`}
          hint="Statut opérationnel"
          icon={<BrainCircuit size={18} />}
          tone="indigo"
        />
        <KpiCard
          label="Actions dernières 24 h"
          value={fmtInt(totalActions)}
          hint="Toutes équipes confondues"
          delta={{ value: 12, label: 'vs 24 h -1' }}
          icon={<Zap size={18} />}
          tone="terracotta"
        />
        <KpiCard
          label="Confiance moyenne"
          value={fmtInt(confMoyenne)}
          unit="%"
          hint="Score des sorties validées"
          delta={{ value: 3, label: 'vs sem -1' }}
          icon={<TrendingUp size={18} />}
          tone="sage"
        />
        <KpiCard
          label="Rapports générés"
          value={fmtInt(RAPPORTS.length)}
          unit="cette semaine"
          hint="PDF · XLSX · Markdown"
          icon={<FileText size={18} />}
          tone="gold"
        />
      </div>

      {/* ── Grille agents ──────────────────────────────────────── */}
      <SectionCard
        title="Agents intelligents"
        subtitle="Un agent = une mission métier. Suivi individuel du taux de confiance et des actions."
        actions={
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              textTransform: 'uppercase',
            }}
          >
            {AGENTS.length} agents
          </span>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--s-4)',
          }}
        >
          {AGENTS.map((a) => {
            const accent = toneAccent(a.tone);
            const badge = badgeStatut[a.statut];
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => navigate(a.route)}
                style={{
                  textAlign: 'left',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--s-4)',
                  cursor: 'pointer',
                  transition: 'transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${accent}, ${accent}44)`,
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s-3)' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 'var(--radius-sm)',
                      background: `color-mix(in srgb, ${accent} 18%, transparent)`,
                      color: accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {a.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontWeight: 600,
                        fontSize: 'var(--text-lg)',
                        color: 'var(--fg-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      {a.nom}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        marginTop: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {a.code}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--fg-secondary)',
                        marginTop: 6,
                        lineHeight: 1.4,
                      }}
                    >
                      {a.role}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: badge.bg,
                      color: badge.fg,
                      flexShrink: 0,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--s-2)',
                    marginTop: 'var(--s-4)',
                    paddingTop: 'var(--s-3)',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Actions 24 h
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 700,
                        color: 'var(--fg-primary)',
                      }}
                    >
                      {fmtInt(a.actions_24h)}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Confiance
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-xl)',
                        fontWeight: 700,
                        color: a.taux_conf >= 85 ? 'var(--color-success)' : a.taux_conf > 0 ? 'var(--accent-gold)' : 'var(--fg-muted)',
                      }}
                    >
                      {a.taux_conf > 0 ? `${a.taux_conf}%` : '—'}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 'var(--s-3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--fg-muted)',
                    gap: 6,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Activity size={12} />
                    {a.derniere_action}
                  </span>
                  <ArrowRight size={12} style={{ color: accent }} />
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Rapports récents ───────────────────────────────────── */}
      <SectionCard
        title="Rapports récents"
        subtitle="Générés automatiquement par les agents"
        actions={
          <button type="button" onClick={() => navigate('/ia')} style={linkStyle}>
            Tout voir <ArrowRight size={12} />
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {RAPPORTS.map((r, idx) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--s-3)',
                padding: 'var(--s-3)',
                borderBottom: idx < RAPPORTS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)',
                  color: 'var(--accent-terracotta)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    color: 'var(--fg-primary)',
                    fontSize: 'var(--text-sm)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.titre}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 2,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--fg-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <span>{r.agent}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {r.date}
                  </span>
                </div>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: 'var(--bg-canvas)',
                  color: 'var(--fg-secondary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {r.type}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'transparent',
  border: 'none',
  color: 'var(--accent-terracotta)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  background: 'var(--accent-indigo)',
  color: '#FBF8F3',
  border: '1px solid var(--accent-indigo)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
};

export default DashboardIA;
