/**
 * EntretiensAnnuels — Phase G2 (§11bis.11)
 *
 * Campagne d'entretiens RH (annuel · probatoire · recadrage · départ).
 * KPIs réels via /api/v2/rh/entretiens/kpi + liste live + à venir + en retard.
 *
 * Design system La Plume strict : DashboardShell + KpiCard + SectionCard,
 * typographie Fraunces italic titres, palette CSS vars.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2, CalendarClock, ClipboardCheck, AlertTriangle,
  ArrowRight, Plus, RefreshCw, Star, Users,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { rhEntretiensService } from '../../services/api';

// ─── types ──────────────────────────────────────────────────────────
type StatutEntretien = 'planifie' | 'realise' | 'valide';
type TypeEntretien   = 'annuel' | 'probatoire' | 'recadrage' | 'depart';

interface Entretien {
  id_entretien: number;
  id_employe: number;
  id_evaluateur?: number | null;
  date_entretien: string;
  type: TypeEntretien;
  statut: StatutEntretien;
  score_global?: number | null;
  besoins_formation?: string | null;
  employe_nom?: string;
  employe_prenom?: string;
  matricule?: string;
  evaluateur_nom?: string;
  evaluateur_prenom?: string;
  jours_retard?: number;
}

interface EntretienKpi {
  total: number;
  planifies: number;
  realises: number;
  valides: number;
  en_retard: number;
  a_venir_30j: number;
  score_moyen: number | null;
}

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return iso; }
};
const fmtInt = (n: number | null | undefined) => (n ?? 0).toLocaleString('fr-FR');

const unwrap = <T,>(r: any, fb: T): T => {
  const d = r?.data?.data ?? r?.data;
  return (d ?? fb) as T;
};

const TYPE_LABELS: Record<TypeEntretien, string> = {
  annuel:     'Annuel',
  probatoire: 'Probatoire',
  recadrage:  'Recadrage',
  depart:     'Départ',
};

const toneStatut = (s: StatutEntretien): 'terracotta' | 'sage' | 'indigo' | 'gold' => {
  if (s === 'realise') return 'indigo';
  if (s === 'valide')  return 'sage';
  return 'gold';
};

// ────────────────────────────────────────────────────────────────────
const EntretiensAnnuels: React.FC = () => {
  const navigate = useNavigate();

  const [kpi, setKpi]           = React.useState<EntretienKpi | null>(null);
  const [list, setList]         = React.useState<Entretien[]>([]);
  const [upcoming, setUpcoming] = React.useState<Entretien[]>([]);
  const [enRetard, setEnRetard] = React.useState<Entretien[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [statutFilter, setStatutFilter] = React.useState<StatutEntretien | ''>('');

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [kpiR, listR, upR, retR] = await Promise.allSettled([
        rhEntretiensService.getKpi(),
        rhEntretiensService.list({ limit: 50 }),
        rhEntretiensService.getUpcoming(10),
        rhEntretiensService.getEnRetard(10),
      ]);
      setKpi(kpiR.status === 'fulfilled' ? unwrap<EntretienKpi>(kpiR.value, {
        total: 0, planifies: 0, realises: 0, valides: 0, en_retard: 0, a_venir_30j: 0, score_moyen: null,
      }) : null);
      setList(listR.status === 'fulfilled' ? unwrap<Entretien[]>(listR.value, []) : []);
      setUpcoming(upR.status === 'fulfilled' ? unwrap<Entretien[]>(upR.value, []) : []);
      setEnRetard(retR.status === 'fulfilled' ? unwrap<Entretien[]>(retR.value, []) : []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchAll(); }, [fetchAll]);

  const scoreMoyenAffiche = kpi?.score_moyen != null
    ? `${kpi.score_moyen.toFixed(1)} / 10`
    : '—';

  return (
    <DashboardShell
      eyebrow="§11bis.11 · Entretiens annuels"
      title="Entretiens annuels"
      subtitle="Campagne annuelle d'évaluation : objectifs, score global, besoins de formation."
      headerRight={
        <>
          <button type="button" onClick={() => navigate('/rh/formations')} style={btnGhost}>
            <ClipboardCheck size={14} style={{ marginRight: 6 }} />
            Formations
          </button>
          <button type="button" onClick={fetchAll} style={btnGhost} title="Actualiser">
            <RefreshCw size={14} />
          </button>
          <button type="button" onClick={() => navigate('/equipe')} style={btnPrimary}>
            <Plus size={14} style={{ marginRight: 6 }} />
            Planifier un entretien
          </button>
        </>
      }
    >
      {/* KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Entretiens planifiés"
          value={fmtInt(kpi?.planifies)}
          unit="à venir"
          hint="Statut planifié"
          icon={<CalendarClock size={18} />}
          tone="gold"
          loading={loading}
          active={statutFilter === 'planifie'}
          onClick={() => setStatutFilter((p) => p === 'planifie' ? '' : 'planifie')}
        />
        <KpiCard
          label="Réalisés"
          value={fmtInt(kpi?.realises)}
          hint="En attente de validation"
          icon={<FileCheck2 size={18} />}
          tone="indigo"
          loading={loading}
          active={statutFilter === 'realise'}
          onClick={() => setStatutFilter((p) => p === 'realise' ? '' : 'realise')}
        />
        <KpiCard
          label="Validés"
          value={fmtInt(kpi?.valides)}
          hint="Clôturés sur l'année"
          icon={<ClipboardCheck size={18} />}
          tone="sage"
          loading={loading}
          active={statutFilter === 'valide'}
          onClick={() => setStatutFilter((p) => p === 'valide' ? '' : 'valide')}
        />
        <KpiCard
          label="En retard"
          value={fmtInt(kpi?.en_retard)}
          hint="À reprogrammer"
          icon={<AlertTriangle size={18} />}
          tone="terracotta"
          loading={loading}
          active={statutFilter === ''}
          onClick={() => setStatutFilter('')}
        />
      </div>

      {/* Score moyen + À venir 30j */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Score moyen global"
          value={scoreMoyenAffiche}
          hint="Moyenne des entretiens réalisés / validés"
          icon={<Star size={18} />}
          tone="gold"
          loading={loading}
        />
        <KpiCard
          label="À venir sous 30 j"
          value={fmtInt(kpi?.a_venir_30j)}
          unit="entretiens"
          hint="Fenêtre glissante"
          icon={<Users size={18} />}
          tone="indigo"
          loading={loading}
        />
      </div>

      {/* Upcoming + En retard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--s-6)',
        }}
      >
        <SectionCard
          title="Prochains entretiens"
          subtitle="Les 10 plus proches, triés par date"
          actions={
            <span style={legendStyle}>
              {upcoming.length} planifiés
            </span>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyRow label="Aucun entretien planifié dans les prochains jours." />
          ) : (
            <ul style={listReset}>
              {upcoming.map((e) => (
                <li key={e.id_entretien} style={rowStyle}>
                  <div style={{ ...iconBubble('var(--accent-indigo)') }}>
                    <FileCheck2 size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={rowTitle}>
                      {e.employe_prenom} {e.employe_nom}
                      <span style={rowSubtle}>· {TYPE_LABELS[e.type]}</span>
                    </div>
                    <div style={rowMeta}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtDate(e.date_entretien)}</span>
                      <span>{e.evaluateur_prenom || e.evaluateur_nom ? `Éval. : ${e.evaluateur_prenom ?? ''} ${e.evaluateur_nom ?? ''}` : ''}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="En retard — à reprogrammer"
          subtitle="Statut planifié avec date passée"
          actions={
            <span style={{ ...legendStyle, color: 'var(--accent-terracotta)' }}>
              {enRetard.length} alertes
            </span>
          }
        >
          {enRetard.length === 0 ? (
            <EmptyRow label="Aucun entretien en retard. Bravo." />
          ) : (
            <ul style={listReset}>
              {enRetard.map((e) => (
                <li key={e.id_entretien} style={rowStyle}>
                  <div style={{ ...iconBubble('var(--accent-terracotta)') }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={rowTitle}>
                      {e.employe_prenom} {e.employe_nom}
                      <span style={rowSubtle}>· {TYPE_LABELS[e.type]}</span>
                    </div>
                    <div style={rowMeta}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtDate(e.date_entretien)}</span>
                      <span style={{ color: 'var(--accent-terracotta)' }}>
                        + {e.jours_retard ?? 0} j
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Liste complète */}
      <SectionCard
        title="Historique"
        subtitle="Derniers entretiens, tous statuts confondus"
        actions={
          <button type="button" onClick={() => navigate('/equipe')} style={linkStyle}>
            Voir équipe <ArrowRight size={12} />
          </button>
        }
      >
        {loading ? (
          <EmptyRow label="Chargement…" />
        ) : list.length === 0 ? (
          <EmptyRow label="Aucun entretien enregistré." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Employé</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Statut</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Score</th>
                  <th style={thStyle}>Évaluateur</th>
                </tr>
              </thead>
              <tbody>
                {list.filter((e) => !statutFilter || e.statut === statutFilter).map((e) => (
                  <tr key={e.id_entretien} style={trStyle}>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)' }}>
                      {fmtDate(e.date_entretien)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>
                        {e.employe_prenom} {e.employe_nom}
                      </div>
                      {e.matricule && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                          {e.matricule}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{TYPE_LABELS[e.type]}</td>
                    <td style={tdStyle}>
                      <StatutPill statut={e.statut} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      {e.score_global != null ? Number(e.score_global).toFixed(1) : '—'}
                    </td>
                    <td style={tdStyle}>
                      {e.evaluateur_prenom || e.evaluateur_nom
                        ? `${e.evaluateur_prenom ?? ''} ${e.evaluateur_nom ?? ''}`.trim()
                        : '—'}
                    </td>
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

// ─── sub-components ────────────────────────────────────────────────
const EmptyRow: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 'var(--text-sm)' }}>
    {label}
  </div>
);

const StatutPill: React.FC<{ statut: StatutEntretien }> = ({ statut }) => {
  const tone = toneStatut(statut);
  const map: Record<string, { bg: string; color: string; label: string }> = {
    gold:       { bg: 'var(--color-warning-bg, #FDF3E0)', color: 'var(--accent-gold)',       label: 'Planifié' },
    indigo:     { bg: 'color-mix(in srgb, var(--accent-indigo) 15%, transparent)', color: 'var(--accent-indigo)', label: 'Réalisé' },
    sage:       { bg: 'var(--color-success-bg, #EEF4F0)', color: 'var(--color-success, var(--accent-sage))', label: 'Validé' },
    terracotta: { bg: 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)', color: 'var(--accent-terracotta)', label: statut },
  };
  const style = map[tone] || map.indigo;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
        borderRadius: 999, fontSize: 'var(--text-xs)',
        fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
        background: style.bg, color: style.color, fontWeight: 700,
      }}
    >
      {style.label}
    </span>
  );
};

// ─── styles ────────────────────────────────────────────────────────
const legendStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  color: 'var(--fg-muted)',
  textTransform: 'uppercase',
};

const listReset: React.CSSProperties = {
  listStyle: 'none', margin: 0, padding: 0,
  display: 'flex', flexDirection: 'column', gap: 'var(--s-2)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex', gap: 'var(--s-3)', padding: 'var(--s-3)',
  border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-canvas)',
};

const iconBubble = (tone: string): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: 'var(--radius-sm)',
  background: `color-mix(in srgb, ${tone} 15%, transparent)`,
  color: tone, display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
});

const rowTitle: React.CSSProperties = {
  fontWeight: 600, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)',
};

const rowSubtle: React.CSSProperties = {
  fontWeight: 400, color: 'var(--fg-secondary)', marginLeft: 6,
};

const rowMeta: React.CSSProperties = {
  fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
  display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 2,
};

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--s-2)',
  borderBottom: '1px solid var(--border-subtle)',
  color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase', fontSize: 'var(--text-xs)',
  fontWeight: 700, letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--s-2)',
  borderTop: '1px solid var(--border-subtle)',
  color: 'var(--fg-primary)',
  verticalAlign: 'top',
};

const trStyle: React.CSSProperties = { background: 'transparent' };

const linkStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'transparent', border: 'none',
  color: 'var(--accent-terracotta)', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 500, cursor: 'pointer',
};

export default EntretiensAnnuels;
