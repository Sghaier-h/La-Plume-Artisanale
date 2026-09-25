import React, { useEffect, useMemo, useState } from 'react';
import {
  Layers3,
  Boxes,
  Ruler,
  AlertTriangle,
  Gauge,
  History,
  Bell,
  Play,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types (§14.11 dashboard ourdisseur)
// ═══════════════════════════════════════════════════════════════════
type StatutEnsouple = 'en_preparation' | 'termine' | 'controle';

interface Ensouple {
  id_ensouple: number;
  code: string;
  of_lie: string;
  chaine: string;
  longueur_prevue: number; // m
  longueur_faite: number; // m
  nb_fils: number;
  statut: StatutEnsouple;
  debut: string;
}

interface HistoriqueEnsouple {
  id: number;
  code: string;
  of: string;
  longueur: number;
  duree_h: number;
  operateur: string;
  date_fin: string;
}

interface AlerteOurdissage {
  id: number;
  code_ensouple: string;
  message: string;
  gravite: 'haute' | 'moyenne';
  date: string;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

const MOCK_ENSOUPLES: Ensouple[] = [
  { id_ensouple: 1, code: 'ENS-2026-0102', of_lie: 'OF-2026-0429', chaine: 'Coton 40/2 écru', longueur_prevue: 2400, longueur_faite: 1820, nb_fils: 5040, statut: 'en_preparation', debut: daysAgo(0) },
  { id_ensouple: 2, code: 'ENS-2026-0101', of_lie: 'OF-2026-0428', chaine: 'Coton 40/2 indigo', longueur_prevue: 1800, longueur_faite: 1800, nb_fils: 4200, statut: 'controle', debut: daysAgo(1) },
  { id_ensouple: 3, code: 'ENS-2026-0100', of_lie: 'OF-2026-0426', chaine: 'Lin 30/1 naturel', longueur_prevue: 1600, longueur_faite: 480, nb_fils: 3600, statut: 'en_preparation', debut: daysAgo(0) },
];

const MOCK_HISTO: HistoriqueEnsouple[] = [
  { id: 1, code: 'ENS-2026-0099', of: 'OF-2026-0422', longueur: 2200, duree_h: 6.5, operateur: 'Mohamed Trabelsi', date_fin: daysAgo(1) },
  { id: 2, code: 'ENS-2026-0098', of: 'OF-2026-0420', longueur: 1800, duree_h: 5.2, operateur: 'Anis Belkadi', date_fin: daysAgo(2) },
  { id: 3, code: 'ENS-2026-0097', of: 'OF-2026-0418', longueur: 2400, duree_h: 7.1, operateur: 'Mohamed Trabelsi', date_fin: daysAgo(3) },
  { id: 4, code: 'ENS-2026-0096', of: 'OF-2026-0415', longueur: 1600, duree_h: 4.8, operateur: 'Anis Belkadi', date_fin: daysAgo(4) },
  { id: 5, code: 'ENS-2026-0095', of: 'OF-2026-0412', longueur: 2000, duree_h: 5.9, operateur: 'Mohamed Trabelsi', date_fin: daysAgo(6) },
];

const MOCK_ALERTES: AlerteOurdissage[] = [
  { id: 1, code_ensouple: 'ENS-2026-0100', message: 'Écart 500 m atteint — vérifier tension chaîne', gravite: 'haute', date: daysAgo(0) },
  { id: 2, code_ensouple: 'ENS-2026-0101', message: 'Contrôle qualité en attente avant livraison tissage', gravite: 'moyenne', date: daysAgo(1) },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  return fallback;
};

const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
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
type Tab = 'ourdissage' | 'historique' | 'alertes';

const DashboardOurdisseur: React.FC = () => {
  const [tab, setTab] = useState<Tab>('ourdissage');
  const [ensouples, setEnsouples] = useState<Ensouple[]>([]);
  const [histo, setHisto] = useState<HistoriqueEnsouple[]>([]);
  const [alertes, setAlertes] = useState<AlerteOurdissage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/ourdissage/ensouples-courants'),
        api.get('/ourdissage/historique'),
        api.get('/ourdissage/alertes'),
      ]);
      if (cancelled) return;
      setEnsouples(pickArray<Ensouple>(results[0], MOCK_ENSOUPLES));
      setHisto(pickArray<HistoriqueEnsouple>(results[1], MOCK_HISTO));
      setAlertes(pickArray<AlerteOurdissage>(results[2], MOCK_ALERTES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const enCours = ensouples.filter((e) => e.statut === 'en_preparation').length;
    const totalM = ensouples.reduce((s, e) => s + e.longueur_faite, 0);
    const alertes500 = alertes.filter((a) => a.gravite === 'haute').length;
    const totalPrevu = ensouples.reduce((s, e) => s + e.longueur_prevue, 0);
    const rendement = totalPrevu > 0 ? Math.round((totalM / totalPrevu) * 100) : 0;
    return { enCours, totalM, alertes500, rendement };
  }, [ensouples, alertes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'ourdissage', label: 'Ourdissage courant', icon: <Boxes className="w-4 h-4" /> },
    { key: 'historique', label: 'Historique', icon: <History className="w-4 h-4" /> },
    { key: 'alertes', label: 'Alertes', icon: <Bell className="w-4 h-4" /> },
  ];

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
              DASHBOARD · OURDISSEUR
            </div>
            <h1
              className="text-3xl italic font-medium flex items-center gap-3"
              style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
            >
              <Layers3 className="w-7 h-7" style={{ color: '#C8663D' }} />
              Dashboard Ourdisseur
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              §14.11 &middot; préparation des ensouples de chaîne — pilotage temps réel du poste
            </p>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Ensouples en cours" value={kpis.enCours} hint="Préparation active" color="terracotta" icon={<Boxes className="w-5 h-5" />} />
            <KpiCard label="Longueurs préparées" value={`${kpis.totalM.toLocaleString('fr-FR')} m`} hint="Cumul du jour" color="sage" icon={<Ruler className="w-5 h-5" />} />
            <KpiCard label="Alertes 500 m" value={kpis.alertes500} hint="Écarts tension" color="gold" icon={<AlertTriangle className="w-5 h-5" />} />
            <KpiCard label="Rendement" value={`${kpis.rendement}%`} hint="Réalisé / prévu" color="indigo" icon={<Gauge className="w-5 h-5" />} />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    color: tab === t.key ? '#C8663D' : 'var(--fg-muted, #7A6E63)',
                    borderBottom: tab === t.key ? '2px solid #C8663D' : '2px solid transparent',
                    background: tab === t.key ? '#FDF2ED' : 'transparent',
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'ourdissage' && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {ensouples.map((e) => {
                  const pct = Math.min(100, Math.round((e.longueur_faite / Math.max(e.longueur_prevue, 1)) * 100));
                  return (
                    <div
                      key={e.id_ensouple}
                      className="rounded-lg p-4 border"
                      style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div
                            className="text-xs font-semibold"
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                              color: '#C8663D',
                            }}
                          >
                            {e.code}
                          </div>
                          <div
                            className="text-xs mt-1"
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                              color: 'var(--fg-muted, #7A6E63)',
                            }}
                          >
                            ↳ {e.of_lie}
                          </div>
                        </div>
                        <span
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: e.statut === 'controle' ? '#EEF4F0' : '#FDF2ED',
                            color: e.statut === 'controle' ? '#4A6C5B' : '#C8663D',
                          }}
                        >
                          {e.statut === 'controle' ? <CheckCircle2 className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {e.statut.replace('_', ' ')}
                        </span>
                      </div>

                      <div
                        className="text-sm italic mb-3"
                        style={{
                          fontFamily: 'var(--font-serif, Fraunces, serif)',
                          color: 'var(--fg-primary, #2F2A26)',
                        }}
                      >
                        {e.chaine}
                      </div>

                      <div className="flex items-center justify-between text-xs mb-1">
                        <span style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                          {e.longueur_faite.toLocaleString('fr-FR')} / {e.longueur_prevue.toLocaleString('fr-FR')} m
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: '#C8663D',
                            fontWeight: 600,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#F5EEE2' }}>
                        <div className="h-full" style={{ width: `${pct}%`, background: '#C8663D' }} />
                      </div>
                      <div
                        className="text-[11px] mt-2"
                        style={{ color: 'var(--fg-muted, #7A6E63)', fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                      >
                        {e.nb_fils.toLocaleString('fr-FR')} fils &middot; démarré le {fmtDate(e.debut)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'historique' && (
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F5EEE2' }}>
                  <tr>
                    {['Ensouple', 'OF', 'Longueur', 'Durée', 'Opérateur', 'Date fin'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                  {histo.map((h) => (
                    <tr key={h.id} className="hover:bg-[#FDF2ED]/50 group">
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: '#C8663D',
                        }}
                      >
                        {h.code}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: '#3B4E68' }}
                      >
                        {h.of}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-primary, #2F2A26)' }}
                      >
                        {h.longueur.toLocaleString('fr-FR')} m
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                      >
                        {h.duree_h.toFixed(1)} h
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{h.operateur}</td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                      >
                        {fmtDate(h.date_fin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'alertes' && (
              <div className="p-4 space-y-3">
                {alertes.length === 0 && (
                  <div className="text-center py-8" style={{ color: '#4A6C5B' }}>
                    Aucune alerte &middot; production fluide.
                  </div>
                )}
                {alertes.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg p-4 flex items-start gap-3"
                    style={{
                      background: a.gravite === 'haute' ? '#FDEDEA' : '#FBF3E0',
                      borderLeft: `4px solid ${a.gravite === 'haute' ? '#C4574C' : '#D6A756'}`,
                    }}
                  >
                    <AlertTriangle
                      className="w-5 h-5 shrink-0"
                      style={{ color: a.gravite === 'haute' ? '#C4574C' : '#D6A756' }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-xs font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: '#C8663D',
                          }}
                        >
                          {a.code_ensouple}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: 'var(--fg-muted, #7A6E63)',
                          }}
                        >
                          {fmtDate(a.date)}
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {a.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOurdisseur;
