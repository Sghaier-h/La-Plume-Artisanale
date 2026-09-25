import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Cog,
  Gauge,
  AlertOctagon,
  Pause,
  Play,
  Power,
  User,
  Zap,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════
type EtatMachine = 'marche' | 'pause' | 'panne' | 'arret';

interface MachineTempsReel {
  id_machine: number;
  code: string;
  modele: string;
  atelier: string;
  etat: EtatMachine;
  of_en_cours: string | null;
  operateur: string | null;
  cadence: number; // %
  trs: number; // %
  temps_run_h: number;
  temps_arret_h: number;
  alerte: string | null;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const MOCK_MACHINES: MachineTempsReel[] = [
  { id_machine: 1, code: 'DOR-P1-01', modele: 'Dornier P1', atelier: 'Tissage A', etat: 'marche', of_en_cours: 'OF-2026-0428', operateur: 'Karim Sfar', cadence: 92, trs: 84, temps_run_h: 7.2, temps_arret_h: 0.4, alerte: null },
  { id_machine: 2, code: 'DOR-P1-02', modele: 'Dornier P1', atelier: 'Tissage A', etat: 'marche', of_en_cours: 'OF-2026-0428', operateur: 'Riadh Zouari', cadence: 88, trs: 79, temps_run_h: 6.8, temps_arret_h: 0.9, alerte: null },
  { id_machine: 3, code: 'DOR-P1-03', modele: 'Dornier P1', atelier: 'Tissage A', etat: 'pause', of_en_cours: 'OF-2026-0431', operateur: 'Anis Belkadi', cadence: 0, trs: 68, temps_run_h: 5.1, temps_arret_h: 2.1, alerte: 'Pause casse-croûte' },
  { id_machine: 4, code: 'DOR-P2-01', modele: 'Dornier P2', atelier: 'Tissage B', etat: 'marche', of_en_cours: 'OF-2026-0429', operateur: 'Hedi Manai', cadence: 95, trs: 91, temps_run_h: 7.5, temps_arret_h: 0.2, alerte: null },
  { id_machine: 5, code: 'DOR-P2-02', modele: 'Dornier P2', atelier: 'Tissage B', etat: 'panne', of_en_cours: null, operateur: 'Sami Karoui', cadence: 0, trs: 42, temps_run_h: 3.1, temps_arret_h: 4.2, alerte: 'Casse chaîne trame — intervention en cours' },
  { id_machine: 6, code: 'OURD-102', modele: 'Karl Mayer', atelier: 'Ourdissage', etat: 'marche', of_en_cours: 'ENS-2026-0102', operateur: 'Mohamed Trabelsi', cadence: 78, trs: 82, temps_run_h: 6.9, temps_arret_h: 0.8, alerte: null },
  { id_machine: 7, code: 'JUKI-DDL-01', modele: 'Juki DDL-9000C', atelier: 'Confection', etat: 'arret', of_en_cours: null, operateur: null, cadence: 0, trs: 0, temps_run_h: 0, temps_arret_h: 8, alerte: 'Maintenance planifiée' },
  { id_machine: 8, code: 'JUKI-DDL-02', modele: 'Juki DDL-9000C', atelier: 'Confection', etat: 'marche', of_en_cours: 'OF-2026-0432', operateur: 'Fatma Amri', cadence: 90, trs: 87, temps_run_h: 6.4, temps_arret_h: 0.6, alerte: null },
  { id_machine: 9, code: 'JUKI-DDL-03', modele: 'Juki DDL-9000C', atelier: 'Confection', etat: 'marche', of_en_cours: 'OF-2026-0432', operateur: 'Mounira Ben Salah', cadence: 87, trs: 84, temps_run_h: 6.2, temps_arret_h: 0.7, alerte: null },
  { id_machine: 10, code: 'SUR-JET-01', modele: 'Surjeteuse Yamato', atelier: 'Finition', etat: 'pause', of_en_cours: 'OF-2026-0425', operateur: 'Amel Douiri', cadence: 0, trs: 71, temps_run_h: 4.8, temps_arret_h: 1.5, alerte: 'Changement bobine' },
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

const ETAT_META: Record<EtatMachine, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  marche: { label: 'En marche', color: '#4A6C5B', bg: '#EEF4F0', border: '#4A6C5B', icon: <Play className="w-3.5 h-3.5" /> },
  pause: { label: 'En pause', color: '#D6A756', bg: '#FBF3E0', border: '#D6A756', icon: <Pause className="w-3.5 h-3.5" /> },
  panne: { label: 'En panne', color: '#C4574C', bg: '#FDEDEA', border: '#C4574C', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
  arret: { label: 'Arrêt', color: '#7A6E63', bg: '#F5EEE2', border: '#7A6E63', icon: <Power className="w-3.5 h-3.5" /> },
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
const SuiviTempsReel: React.FC = () => {
  const [machines, setMachines] = useState<MachineTempsReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([api.get('/fabrication/temps-reel')]);
      if (cancelled) return;
      setMachines(pickArray<MachineTempsReel>(results[0], MOCK_MACHINES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const kpis = useMemo(() => {
    const actives = machines.filter((m) => m.etat === 'marche').length;
    const ofsUniques = new Set(machines.filter((m) => m.of_en_cours).map((m) => m.of_en_cours!)).size;
    const running = machines.filter((m) => m.etat === 'marche');
    const trsMoyen = running.length > 0 ? Math.round(running.reduce((s, m) => s + m.trs, 0) / running.length) : 0;
    const alertes = machines.filter((m) => m.alerte).length;
    return { actives, ofsUniques, trsMoyen, alertes };
  }, [machines]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

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
              FABRICATION · LIVE
            </div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-3xl italic font-medium flex items-center gap-3"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                >
                  <Activity className="w-7 h-7" style={{ color: '#C8663D' }} />
                  Suivi temps réel
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                  Parc atelier &middot; état des machines mis à jour toutes les 30 s
                </p>
              </div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{ background: '#EEF4F0', color: '#4A6C5B', fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4A6C5B' }} />
                LIVE · {now.toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Machines actives" value={kpis.actives} hint={`sur ${machines.length}`} color="sage" icon={<Play className="w-5 h-5" />} />
            <KpiCard label="OF en cours" value={kpis.ofsUniques} hint="Distincts" color="indigo" icon={<Zap className="w-5 h-5" />} />
            <KpiCard label="TRS global" value={`${kpis.trsMoyen}%`} hint="Moyenne machines actives" color="terracotta" icon={<Gauge className="w-5 h-5" />} />
            <KpiCard label="Alertes" value={kpis.alertes} hint="À surveiller" color="gold" icon={<AlertOctagon className="w-5 h-5" />} />
          </div>

          {/* Grid machines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {machines.map((m) => {
              const meta = ETAT_META[m.etat];
              return (
                <div
                  key={m.id_machine}
                  className="rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  style={{ borderTop: `3px solid ${meta.border}` }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div
                          className="text-xs font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: '#3B4E68',
                          }}
                        >
                          {m.code}
                        </div>
                        <div
                          className="text-sm italic font-medium mt-0.5"
                          style={{
                            fontFamily: 'var(--font-serif, Fraunces, serif)',
                            color: 'var(--fg-primary, #2F2A26)',
                          }}
                        >
                          {m.modele}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                          {m.atelier}
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--fg-muted, #7A6E63)' }}>OF</span>
                        {m.of_en_cours ? (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                              color: '#C8663D',
                              fontWeight: 600,
                            }}
                          >
                            {m.of_en_cours}
                          </span>
                        ) : (
                          <span className="italic" style={{ color: 'var(--fg-muted, #7A6E63)' }}>—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--fg-muted, #7A6E63)' }}>Opérateur</span>
                        {m.operateur ? (
                          <span className="inline-flex items-center gap-1" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                            <User className="w-3 h-3" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
                            {m.operateur}
                          </span>
                        ) : (
                          <span className="italic" style={{ color: 'var(--fg-muted, #7A6E63)' }}>—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ color: 'var(--fg-muted, #7A6E63)' }}>Cadence</span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: m.cadence >= 80 ? '#4A6C5B' : m.cadence >= 50 ? '#D6A756' : '#C4574C',
                            fontWeight: 600,
                          }}
                        >
                          {m.cadence}%
                        </span>
                      </div>
                    </div>

                    {/* TRS bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span style={{ color: 'var(--fg-muted, #7A6E63)' }}>TRS</span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: m.trs >= 80 ? '#4A6C5B' : m.trs >= 50 ? '#D6A756' : '#C4574C',
                            fontWeight: 600,
                          }}
                        >
                          {m.trs}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F5EEE2' }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${m.trs}%`,
                            background:
                              m.trs >= 80 ? '#4A6C5B' : m.trs >= 50 ? '#D6A756' : '#C4574C',
                          }}
                        />
                      </div>
                    </div>

                    {m.alerte && (
                      <div
                        className="mt-3 text-[11px] px-2 py-1.5 rounded-md inline-flex items-start gap-1"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        <AlertOctagon className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{m.alerte}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiviTempsReel;
