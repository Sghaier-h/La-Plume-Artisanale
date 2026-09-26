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

// ─── types & mock (à brancher sur backend/modules-v2/ia) ─────────
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

const AGENTS: Agent[] = [
  {
    id: 'commercial',
    code: 'AGT-COM',
    nom: 'Agent Commercial',
    role: 'Relances devis · scoring leads · CRM',
    statut: 'actif',
    tone: 'terracotta',
    icon: <MessagesSquare size={18} />,
    actions_24h: 42,
    taux_conf: 87,
    derniere_action: 'Il y a 4 min · relance Hotel Marina',
    route: '/dashboard-commercial',
  },
  {
    id: 'achats',
    code: 'AGT-ACH',
    nom: 'Agent Achats',
    role: 'Réappro fournisseurs · alertes prix',
    statut: 'actif',
    tone: 'gold',
    icon: <ShoppingBag size={18} />,
    actions_24h: 17,
    taux_conf: 92,
    derniere_action: 'Il y a 22 min · devis SOTUFIL',
    route: '/fournisseurs',
  },
  {
    id: 'fabrication',
    code: 'AGT-FAB',
    nom: 'Agent Fabrication',
    role: 'Planification OF · anti-goulot machines',
    statut: 'actif',
    tone: 'indigo',
    icon: <Factory size={18} />,
    actions_24h: 63,
    taux_conf: 84,
    derniere_action: 'Il y a 12 min · OF-2609015 replanifié',
    route: '/planning',
  },
  {
    id: 'qualite',
    code: 'AGT-QLT',
    nom: 'Agent Qualité',
    role: 'Analyse défauts · causes racines · 5M',
    statut: 'apprentissage',
    tone: 'sage',
    icon: <ShieldCheck size={18} />,
    actions_24h: 9,
    taux_conf: 76,
    derniere_action: 'Il y a 1 h · lot LT-2609-008',
    route: '/qualite-avancee',
  },
  {
    id: 'rh',
    code: 'AGT-RH',
    nom: 'Agent RH',
    role: 'Bilans · rapports masse salariale',
    statut: 'en_pause',
    tone: 'rose',
    icon: <Users size={18} />,
    actions_24h: 0,
    taux_conf: 0,
    derniere_action: 'En pause depuis 3 j',
    route: '/dashboard-rh-manager',
  },
];

type Rapport = {
  id: string;
  titre: string;
  agent: string;
  date: string;
  type: 'PDF' | 'XLSX' | 'MD';
};

const RAPPORTS: Rapport[] = [
  { id: 'R1', titre: 'Synthèse commerciale hebdo · S39', agent: 'AGT-COM', date: '24/09/2026 08:15', type: 'PDF' },
  { id: 'R2', titre: 'Alertes stock MP · seuil critique', agent: 'AGT-ACH', date: '23/09/2026 17:42', type: 'XLSX' },
  { id: 'R3', titre: 'Analyse défauts trame · lot LT-2609-006', agent: 'AGT-QLT', date: '22/09/2026 11:03', type: 'MD' },
  { id: 'R4', titre: 'Charge atelier semaine 40', agent: 'AGT-FAB', date: '21/09/2026 09:28', type: 'PDF' },
];

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
