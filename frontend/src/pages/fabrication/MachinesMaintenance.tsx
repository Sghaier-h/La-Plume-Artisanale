import React, { useEffect, useMemo, useState } from 'react';
import {
  Wrench,
  Cog,
  CalendarClock,
  AlertOctagon,
  Package,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════
type StatutMachine = 'marche' | 'pause' | 'panne' | 'maintenance';

interface Machine {
  id_machine: number;
  code: string;
  modele: string;
  atelier: string;
  annee: number;
  statut: StatutMachine;
  heures_service: number;
  prochaine_maintenance_j: number;
}

interface EntretienPlanifie {
  id_entretien: number;
  code_machine: string;
  type: 'preventif' | 'curatif' | 'reglementaire';
  date_prevue: string;
  duree_h: number;
  responsable: string;
  fait: boolean;
}

interface Intervention {
  id_intervention: number;
  code_machine: string;
  probleme: string;
  gravite: 'haute' | 'moyenne' | 'basse';
  debut: string;
  duree_estimee_h: number;
  technicien: string;
}

interface PieceRechange {
  id_piece: number;
  code: string;
  designation: string;
  stock: number;
  seuil_min: number;
  machines_compatibles: string[];
  fournisseur: string;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 86400_000).toISOString();

const MOCK_MACHINES: Machine[] = [
  { id_machine: 1, code: 'DOR-P1-01', modele: 'Dornier P1 Airjet', atelier: 'Tissage A', annee: 2019, statut: 'marche', heures_service: 32450, prochaine_maintenance_j: 12 },
  { id_machine: 2, code: 'DOR-P1-02', modele: 'Dornier P1 Airjet', atelier: 'Tissage A', annee: 2019, statut: 'marche', heures_service: 31890, prochaine_maintenance_j: 18 },
  { id_machine: 3, code: 'DOR-P1-03', modele: 'Dornier P1 Airjet', atelier: 'Tissage A', annee: 2020, statut: 'pause', heures_service: 28200, prochaine_maintenance_j: 5 },
  { id_machine: 4, code: 'DOR-P2-01', modele: 'Dornier P2 Rapier', atelier: 'Tissage B', annee: 2021, statut: 'marche', heures_service: 22100, prochaine_maintenance_j: 28 },
  { id_machine: 5, code: 'DOR-P2-02', modele: 'Dornier P2 Rapier', atelier: 'Tissage B', annee: 2021, statut: 'panne', heures_service: 21980, prochaine_maintenance_j: 0 },
  { id_machine: 6, code: 'OURD-102', modele: 'Karl Mayer Multi-Section', atelier: 'Ourdissage', annee: 2018, statut: 'marche', heures_service: 41200, prochaine_maintenance_j: 2 },
  { id_machine: 7, code: 'JUKI-DDL-01', modele: 'Juki DDL-9000C', atelier: 'Confection', annee: 2022, statut: 'maintenance', heures_service: 8420, prochaine_maintenance_j: 0 },
];

const MOCK_ENTRETIENS: EntretienPlanifie[] = [
  { id_entretien: 1, code_machine: 'OURD-102', type: 'preventif', date_prevue: daysAhead(2), duree_h: 4, responsable: 'Hedi Manai', fait: false },
  { id_entretien: 2, code_machine: 'DOR-P1-03', type: 'preventif', date_prevue: daysAhead(5), duree_h: 6, responsable: 'Karim Sfar', fait: false },
  { id_entretien: 3, code_machine: 'DOR-P1-01', type: 'reglementaire', date_prevue: daysAhead(12), duree_h: 8, responsable: 'Dornier Service TN', fait: false },
  { id_entretien: 4, code_machine: 'DOR-P2-01', type: 'preventif', date_prevue: daysAhead(28), duree_h: 5, responsable: 'Sami Karoui', fait: false },
  { id_entretien: 5, code_machine: 'JUKI-DDL-01', type: 'curatif', date_prevue: daysAgo(-1), duree_h: 3, responsable: 'Fatma Amri', fait: true },
];

const MOCK_INTERVENTIONS: Intervention[] = [
  { id_intervention: 1, code_machine: 'DOR-P2-02', probleme: 'Casse chaîne trame — arrêt total', gravite: 'haute', debut: daysAgo(0), duree_estimee_h: 6, technicien: 'Slim Bouazizi' },
  { id_intervention: 2, code_machine: 'JUKI-DDL-01', probleme: 'Vibration excessive, réglage timing crochet', gravite: 'moyenne', debut: daysAgo(0), duree_estimee_h: 2, technicien: 'Nabil Guesmi' },
];

const MOCK_PIECES: PieceRechange[] = [
  { id_piece: 1, code: 'RCH-NAV-108', designation: 'Navette Dornier P2 réf. 108', stock: 1, seuil_min: 4, machines_compatibles: ['DOR-P2-01', 'DOR-P2-02'], fournisseur: 'Dornier France SAS' },
  { id_piece: 2, code: 'RCH-CAM-402', designation: 'Came ourdissoir Karl Mayer 402', stock: 6, seuil_min: 3, machines_compatibles: ['OURD-102'], fournisseur: 'Karl Mayer DE' },
  { id_piece: 3, code: 'RCH-CRO-018', designation: 'Crochet Juki DDL-9000 réf. 018', stock: 12, seuil_min: 6, machines_compatibles: ['JUKI-DDL-01', 'JUKI-DDL-02'], fournisseur: 'Juki Tunisie' },
  { id_piece: 4, code: 'RCH-COU-055', designation: 'Courroie transmission P1 réf. 055', stock: 2, seuil_min: 4, machines_compatibles: ['DOR-P1-01', 'DOR-P1-02', 'DOR-P1-03'], fournisseur: 'Dornier France SAS' },
  { id_piece: 5, code: 'RCH-CAP-207', designation: 'Capteur trame optique 207', stock: 8, seuil_min: 4, machines_compatibles: ['DOR-P1-01', 'DOR-P1-02', 'DOR-P1-03', 'DOR-P2-01', 'DOR-P2-02'], fournisseur: 'Sensor Tech DE' },
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

const STATUT_META: Record<StatutMachine, { label: string; color: string; bg: string }> = {
  marche: { label: 'En marche', color: '#4A6C5B', bg: '#EEF4F0' },
  pause: { label: 'En pause', color: '#D6A756', bg: '#FBF3E0' },
  panne: { label: 'En panne', color: '#C4574C', bg: '#FDEDEA' },
  maintenance: { label: 'Maintenance', color: '#3B4E68', bg: '#EDF0F5' },
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
type Tab = 'machines' | 'planning' | 'interventions' | 'pieces';

const MachinesMaintenance: React.FC = () => {
  const [tab, setTab] = useState<Tab>('machines');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [entretiens, setEntretiens] = useState<EntretienPlanifie[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [pieces, setPieces] = useState<PieceRechange[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/machines'),
        api.get('/maintenance/planification'),
        api.get('/maintenance/interventions'),
        api.get('/maintenance/pieces'),
      ]);
      if (cancelled) return;
      setMachines(pickArray<Machine>(results[0], MOCK_MACHINES));
      setEntretiens(pickArray<EntretienPlanifie>(results[1], MOCK_ENTRETIENS));
      setInterventions(pickArray<Intervention>(results[2], MOCK_INTERVENTIONS));
      setPieces(pickArray<PieceRechange>(results[3], MOCK_PIECES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const enMarche = machines.filter((m) => m.statut === 'marche').length;
    const enPanne = machines.filter((m) => m.statut === 'panne').length;
    const planifies = entretiens.filter((e) => !e.fait).length;
    const piecesRupture = pieces.filter((p) => p.stock < p.seuil_min).length;
    return { enMarche, enPanne, planifies, piecesRupture };
  }, [machines, entretiens, pieces]);

  const filteredMachines = useMemo(
    () =>
      machines.filter((m) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return m.code.toLowerCase().includes(q) || m.modele.toLowerCase().includes(q);
      }),
    [machines, search]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="ml-72 animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'machines', label: 'Machines Dornier', icon: <Cog className="w-4 h-4" /> },
    { key: 'planning', label: "Planning d'entretien", icon: <CalendarClock className="w-4 h-4" /> },
    { key: 'interventions', label: 'Interventions en cours', icon: <AlertOctagon className="w-4 h-4" /> },
    { key: 'pieces', label: 'Pièces de rechange', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
            >
              FABRICATION · MAINTENANCE
            </div>
            <h1
              className="text-3xl italic font-medium flex items-center gap-3"
              style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
            >
              <Wrench className="w-7 h-7" style={{ color: '#C8663D' }} />
              Machines &amp; maintenance
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              Parc machines Dornier &middot; planning préventif &middot; interventions curatives &middot; pièces critiques
            </p>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="En marche" value={kpis.enMarche} hint={`sur ${machines.length} machines`} color="sage" icon={<CheckCircle2 className="w-5 h-5" />} />
            <KpiCard label="En panne" value={kpis.enPanne} hint="Arrêt production" color="terracotta" icon={<AlertOctagon className="w-5 h-5" />} />
            <KpiCard label="Entretiens planifiés" value={kpis.planifies} hint="À exécuter" color="indigo" icon={<CalendarClock className="w-5 h-5" />} />
            <KpiCard label="Pièces sous seuil" value={kpis.piecesRupture} hint="Rechange critique" color="gold" icon={<Package className="w-5 h-5" />} />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
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

            {tab === 'machines' && (
              <div>
                <div className="p-3 flex items-center gap-3 border-b" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted, #7A6E63)' }} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Code ou modèle…"
                      className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-sm outline-none focus:border-[#C8663D]"
                      style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}
                    />
                  </div>
                </div>
                <table className="min-w-full text-sm">
                  <thead style={{ background: '#F5EEE2' }}>
                    <tr>
                      {['Code', 'Modèle', 'Atelier', 'Année', 'Statut', 'Heures', 'Prochaine mtn.'].map((h) => (
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
                    {filteredMachines.map((m) => {
                      const meta = STATUT_META[m.statut];
                      return (
                        <tr key={m.id_machine} className="hover:bg-[#FDF2ED]/50">
                          <td
                            className="px-4 py-3 text-xs font-semibold"
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                              color: '#3B4E68',
                            }}
                          >
                            {m.code}
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{m.modele}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted, #7A6E63)' }}>{m.atelier}</td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                          >
                            {m.annee}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: meta.bg, color: meta.color }}
                            >
                              {meta.label}
                            </span>
                          </td>
                          <td
                            className="px-4 py-3"
                            style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-primary, #2F2A26)' }}
                          >
                            {m.heures_service.toLocaleString('fr-FR')} h
                          </td>
                          <td
                            className="px-4 py-3 text-xs"
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                              color: m.prochaine_maintenance_j <= 5 ? '#C4574C' : 'var(--fg-muted, #7A6E63)',
                            }}
                          >
                            {m.prochaine_maintenance_j === 0 ? 'immédiat' : `dans ${m.prochaine_maintenance_j} j`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'planning' && (
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F5EEE2' }}>
                  <tr>
                    {['Date prévue', 'Machine', 'Type', 'Durée', 'Responsable', 'Statut'].map((h) => (
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
                  {entretiens.map((e) => (
                    <tr key={e.id_entretien} className="hover:bg-[#FDF2ED]/50">
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-primary, #2F2A26)' }}
                      >
                        {fmtDate(e.date_prevue)}
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: '#3B4E68',
                        }}
                      >
                        {e.code_machine}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: e.type === 'preventif' ? '#EEF4F0' : e.type === 'curatif' ? '#FDEDEA' : '#EDF0F5',
                            color: e.type === 'preventif' ? '#4A6C5B' : e.type === 'curatif' ? '#C4574C' : '#3B4E68',
                          }}
                        >
                          {e.type}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                      >
                        {e.duree_h} h
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{e.responsable}</td>
                      <td className="px-4 py-3">
                        {e.fait ? (
                          <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#4A6C5B' }}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Effectué
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs" style={{ color: '#D6A756' }}>
                            <Clock className="w-3.5 h-3.5" /> Planifié
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'interventions' && (
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F5EEE2' }}>
                  <tr>
                    {['Début', 'Machine', 'Problème', 'Gravité', 'Durée est.', 'Technicien'].map((h) => (
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
                  {interventions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center" style={{ color: '#4A6C5B' }}>
                        Aucune intervention en cours &middot; parc en bon état.
                      </td>
                    </tr>
                  )}
                  {interventions.map((i) => (
                    <tr key={i.id_intervention} className="hover:bg-[#FDF2ED]/50">
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-primary, #2F2A26)' }}
                      >
                        {fmtDate(i.debut)}
                      </td>
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: '#3B4E68',
                        }}
                      >
                        {i.code_machine}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{i.probleme}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: i.gravite === 'haute' ? '#FDEDEA' : i.gravite === 'moyenne' ? '#FBF3E0' : '#EEF4F0',
                            color: i.gravite === 'haute' ? '#C4574C' : i.gravite === 'moyenne' ? '#D6A756' : '#4A6C5B',
                          }}
                        >
                          {i.gravite}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                      >
                        {i.duree_estimee_h} h
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{i.technicien}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'pieces' && (
              <table className="min-w-full text-sm">
                <thead style={{ background: '#F5EEE2' }}>
                  <tr>
                    {['Code', 'Désignation', 'Stock', 'Seuil min', 'Machines compat.', 'Fournisseur'].map((h) => (
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
                  {pieces.map((p) => {
                    const alerte = p.stock < p.seuil_min;
                    return (
                      <tr key={p.id_piece} className="hover:bg-[#FDF2ED]/50">
                        <td
                          className="px-4 py-3 text-xs font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: '#3B4E68',
                          }}
                        >
                          {p.code}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{p.designation}</td>
                        <td
                          className="px-4 py-3 font-semibold"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: alerte ? '#C4574C' : 'var(--fg-primary, #2F2A26)',
                          }}
                        >
                          {p.stock}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
                        >
                          {p.seuil_min}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.machines_compatibles.slice(0, 3).map((m) => (
                              <span
                                key={m}
                                className="text-[10px] px-1.5 py-0.5 rounded-full"
                                style={{
                                  fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                                  background: '#EDF0F5',
                                  color: '#3B4E68',
                                }}
                              >
                                {m}
                              </span>
                            ))}
                            {p.machines_compatibles.length > 3 && (
                              <span className="text-[10px]" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
                                +{p.machines_compatibles.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{p.fournisseur}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachinesMaintenance;
