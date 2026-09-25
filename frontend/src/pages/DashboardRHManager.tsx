/**
 * Dashboard RH Manager (§14.14)
 * — Vue synthétique pour le/la responsable des Ressources Humaines
 *   La Plume Artisanale. Reprend l'index §14 du contrat métier :
 *     • effectifs actifs / arrivées / départs
 *     • absentéisme + soldes congés
 *     • coût masse salariale mensuel (bulletins §11bis + primes §11bis.7bis)
 *     • funnel recrutement §11bis.9
 *     • formations & entretiens à venir
 *
 * Le design suit strictement le design system La Plume :
 * palette terracotta / sage / indigo / gold / cream, typographie
 * Fraunces italic titres + Inter texte + JetBrains Mono chiffres,
 * via les composants <DashboardShell> / <KpiCard> / <SectionCard>.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarClock,
  CircleDollarSign,
  Briefcase,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  GraduationCap,
  FileCheck2,
} from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../components/dashboard';

// ─── mock data (à brancher sur backend/modules-v2/rh) ─────────────
type FunnelStage = { code: string; label: string; count: number; tone: 'terracotta' | 'sage' | 'indigo' | 'gold' };
type Formation = { id: string; titre: string; date: string; nb: number; formateur: string };
type Entretien = { id: string; collab: string; poste: string; date: string; type: string };
type Prime = { id: string; collab: string; motif: string; montant: number; statut: 'a_payer' | 'validee' };

const FUNNEL: FunnelStage[] = [
  { code: 'CV_RECUS', label: 'CV reçus', count: 42, tone: 'terracotta' },
  { code: 'PRESELECT', label: 'Présélectionnés', count: 18, tone: 'sage' },
  { code: 'ENTRETIEN', label: 'Entretiens planifiés', count: 9, tone: 'indigo' },
  { code: 'OFFRE', label: 'Offres émises', count: 3, tone: 'gold' },
];

const FORMATIONS: Formation[] = [
  { id: 'F1', titre: 'Sécurité machines tissage', date: '02/10/2026', nb: 12, formateur: 'ISST Tunis' },
  { id: 'F2', titre: 'Contrôle qualité §7 – niveau 2', date: '09/10/2026', nb: 6, formateur: 'Interne' },
  { id: 'F3', titre: 'Excel avancé RH', date: '17/10/2026', nb: 4, formateur: 'Cegos' },
];

const ENTRETIENS: Entretien[] = [
  { id: 'E1', collab: 'Amira B.', poste: 'Chef atelier', date: '28/09/2026', type: 'Annuel' },
  { id: 'E2', collab: 'Karim S.', poste: 'Tisseur senior', date: '30/09/2026', type: 'Fin de période essai' },
  { id: 'E3', collab: 'Sonia H.', poste: 'Contrôleuse qualité', date: '02/10/2026', type: 'Annuel' },
];

const PRIMES: Prime[] = [
  { id: 'P1', collab: 'Ines T.', motif: 'Rendement +20%', montant: 180, statut: 'a_payer' },
  { id: 'P2', collab: 'Ahmed K.', motif: 'Taux 1er choix > 95%', montant: 220, statut: 'validee' },
  { id: 'P3', collab: 'Fatma L.', motif: 'Zéro absence', montant: 90, statut: 'a_payer' },
];

const fmtInt = (n: number) => n.toLocaleString('fr-FR');
const fmtMoney = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 });

const DashboardRHManager: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardShell
      eyebrow="§14.14 · Dashboard RH"
      title="Ressources Humaines"
      subtitle="Vue synthétique effectifs, masse salariale, recrutement et développement des compétences."
      headerRight={
        <>
          <button
            type="button"
            onClick={() => navigate('/rh-recrutement')}
            style={btnPrimary}
          >
            <Briefcase size={14} style={{ marginRight: 6 }} />
            Voir le recrutement
          </button>
          <button
            type="button"
            onClick={() => navigate('/pointage')}
            style={btnGhost}
          >
            <Clock size={14} style={{ marginRight: 6 }} />
            Pointage
          </button>
        </>
      }
    >
      {/* ── KPI ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Effectif actif"
          value={fmtInt(87)}
          unit="collaborateurs"
          hint="LP · AF · FT confondus"
          delta={{ value: 4, label: 'vs mois -1' }}
          icon={<Users size={18} />}
          tone="terracotta"
          onClick={() => navigate('/equipe')}
        />
        <KpiCard
          label="Absentéisme"
          value={'3,2'}
          unit="%"
          hint="Objectif < 4 %"
          delta={{ value: -0.4, label: 'vs mois -1' }}
          icon={<CalendarClock size={18} />}
          tone="sage"
          onClick={() => navigate('/pointage')}
        />
        <KpiCard
          label="Masse salariale"
          value={fmtMoney(146200)}
          hint="Bulletins + primes rendement"
          delta={{ value: 2.1, label: 'vs mois -1' }}
          icon={<CircleDollarSign size={18} />}
          tone="gold"
          onClick={() => navigate('/comptabilite')}
        />
        <KpiCard
          label="Recrutements ouverts"
          value={fmtInt(6)}
          unit="postes"
          hint="§11bis.9 pipeline"
          icon={<Briefcase size={18} />}
          tone="indigo"
          onClick={() => navigate('/rh-recrutement')}
        />
      </div>

      {/* ── Funnel recrutement + Primes à payer ─────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 'var(--s-6)',
        }}
      >
        <SectionCard
          title="Funnel de recrutement"
          subtitle="§11bis.9 · progression des candidatures"
          actions={
            <button
              type="button"
              onClick={() => navigate('/rh-recrutement')}
              style={linkStyle}
            >
              Piloter <ArrowRight size={12} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {FUNNEL.map((s, idx) => {
              const previous = idx === 0 ? s.count : FUNNEL[idx - 1].count;
              const ratio = previous > 0 ? Math.round((s.count / FUNNEL[0].count) * 100) : 0;
              const accent = toneAccent(s.tone);
              return (
                <div key={s.code}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 600,
                        fontSize: 'var(--text-sm)',
                        color: 'var(--fg-primary)',
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--fg-secondary)',
                      }}
                    >
                      {fmtInt(s.count)}{' '}
                      <span style={{ color: 'var(--fg-muted)' }}>· {ratio}%</span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: 'var(--bg-canvas)',
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${ratio}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${accent}, ${accent}77)`,
                        transition: 'width 400ms ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Primes rendement à valider"
          subtitle="§11bis.7bis · hors bulletin"
          actions={
            <button
              type="button"
              onClick={() => navigate('/rh-primes-rendement')}
              style={linkStyle}
            >
              Tout voir <ArrowRight size={12} />
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {PRIMES.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--s-3)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 600,
                      color: 'var(--fg-primary)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    {p.collab}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                    {p.motif}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--accent-gold)',
                    }}
                  >
                    {fmtMoney(p.montant)}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      background: p.statut === 'validee' ? 'var(--color-success-bg)' : 'var(--color-warning-bg, #FDF3E0)',
                      color: p.statut === 'validee' ? 'var(--color-success)' : 'var(--accent-terracotta)',
                      fontWeight: 700,
                    }}
                  >
                    {p.statut === 'validee' ? 'Validée' : 'À valider'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Formations + entretiens ────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--s-6)',
        }}
      >
        <SectionCard
          title="Formations à venir"
          subtitle="Plan de développement des compétences"
          actions={
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
              }}
            >
              {FORMATIONS.length} sessions
            </span>
          }
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {FORMATIONS.map((f) => (
              <li
                key={f.id}
                style={{
                  display: 'flex',
                  gap: 'var(--s-3)',
                  padding: 'var(--s-3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    background: 'color-mix(in srgb, var(--accent-sage) 15%, transparent)',
                    color: 'var(--accent-sage)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>
                    {f.titre}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--fg-muted)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{f.date}</span>
                    <span>
                      {fmtInt(f.nb)} pers. · {f.formateur}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Entretiens à réaliser"
          subtitle="Annuels · fin de période d'essai"
          actions={
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--fg-muted)',
                textTransform: 'uppercase',
              }}
            >
              {ENTRETIENS.length} planifiés
            </span>
          }
        >
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {ENTRETIENS.map((e) => (
              <li
                key={e.id}
                style={{
                  display: 'flex',
                  gap: 'var(--s-3)',
                  padding: 'var(--s-3)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    background: 'color-mix(in srgb, var(--accent-indigo) 15%, transparent)',
                    color: 'var(--accent-indigo)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileCheck2 size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>
                    {e.collab}{' '}
                    <span style={{ fontWeight: 400, color: 'var(--fg-secondary)' }}>· {e.poste}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--fg-muted)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{e.date}</span>
                    <span>{e.type}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* ── Repères mensuels ───────────────────────────────────── */}
      <SectionCard
        title="Repères du mois"
        subtitle="Mouvements et récompenses"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--s-4)',
          }}
        >
          <MiniStat icon={<TrendingUp size={16} />} label="Arrivées" value={3} tone="var(--accent-sage)" />
          <MiniStat icon={<TrendingDown size={16} />} label="Départs" value={1} tone="var(--color-danger)" />
          <MiniStat icon={<Award size={16} />} label="Primes versées" value={fmtMoney(4180)} tone="var(--accent-gold)" mono />
          <MiniStat icon={<GraduationCap size={16} />} label="Heures formation" value="42 h" tone="var(--accent-indigo)" />
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

// ─── petites utilités locales ────────────────────────────────────
const toneAccent = (t: 'terracotta' | 'sage' | 'indigo' | 'gold'): string => ({
  terracotta: 'var(--accent-terracotta)',
  sage: 'var(--accent-sage)',
  indigo: 'var(--accent-indigo)',
  gold: 'var(--accent-gold)',
}[t]);

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
  background: 'var(--accent-terracotta)',
  color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  background: 'var(--bg-canvas)',
  color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  cursor: 'pointer',
};

const MiniStat: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone: string;
  mono?: boolean;
}> = ({ icon, label, value, tone, mono }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--s-3)',
      padding: 'var(--s-3)',
      background: 'var(--bg-canvas)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 'var(--radius-sm)',
        background: `color-mix(in srgb, ${tone} 15%, transparent)`,
        color: tone,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
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
        {label}
      </div>
      <div
        style={{
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-serif)',
          fontSize: 'var(--text-lg)',
          fontWeight: 700,
          color: 'var(--fg-primary)',
          fontStyle: mono ? 'normal' : 'italic',
        }}
      >
        {value}
      </div>
    </div>
  </div>
);

export default DashboardRHManager;
