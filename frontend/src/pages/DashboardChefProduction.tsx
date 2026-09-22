import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle, CheckCircle, Clock, TrendingUp, Package, Wrench, Activity,
  Calendar, Plus, Filter, Download, Move, AlertTriangle, Factory, Scissors,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';

const DashboardChefProduction: React.FC = () => {
  const navigate = useNavigate();

  // ─────────── State (preserved from original) ───────────
  const [draggedOF, setDraggedOF] = useState<any>(null);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOF, setSelectedOF] = useState<any>(null);

  // Données de démonstration
  const commandesData = { actives: 45, terminees: 123, enRetard: 8 };

  const statusData = [
    { name: 'En fabrication', value: 15, color: 'var(--accent-sage)' },
    { name: 'Sous-traitance', value: 12, color: 'var(--accent-indigo)' },
    { name: 'Atelier', value: 8, color: 'var(--accent-gold)' },
    { name: 'Attente matière', value: 5, color: 'var(--accent-rose)' },
    { name: 'Retard', value: 5, color: 'var(--accent-terracotta)' },
  ];

  const trsData = [
    { jour: 'Lun', trs: 88, objectif: 85 },
    { jour: 'Mar', trs: 82, objectif: 85 },
    { jour: 'Mer', trs: 91, objectif: 85 },
    { jour: 'Jeu', trs: 87, objectif: 85 },
    { jour: 'Ven', trs: 84, objectif: 85 },
    { jour: 'Sam', trs: 89, objectif: 85 },
  ];

  const machinesData = [
    { machine: 'M2301', rendement: 92, etat: 'En service', of: 'OF249780' },
    { machine: 'M2302', rendement: 88, etat: 'En service', of: 'OF249781' },
    { machine: 'M2303', rendement: 95, etat: 'En service', of: 'OF249782' },
    { machine: 'M2304', rendement: 0, etat: 'Panne mécanique', of: '-' },
    { machine: 'M2305', rendement: 91, etat: 'En service', of: 'OF249784' },
  ];

  const [ofsEnAttente, setOfsEnAttente] = useState([
    { id: 'OF249850', client: 'CL00884', modele: 'ARTHUR',  ref: 'AR1020-B02-04',  qte: 320, couleurs: 2, urgent: true,  temps: '18h', dateCommande: '2025-10-20' },
    { id: 'OF249851', client: 'CL00837', modele: 'IBIZA',   ref: 'IB1020-B29-01',  qte: 250, couleurs: 2, urgent: false, temps: '14h', dateCommande: '2025-10-22' },
    { id: 'OF249852', client: 'CL00901', modele: 'UNI',     ref: 'UNS1020-02',     qte: 180, couleurs: 1, urgent: false, temps: '10h', dateCommande: '2025-10-23' },
    { id: 'OF249853', client: 'CL00765', modele: 'ND LILI', ref: 'NDL1020-B12-01', qte: 400, couleurs: 2, urgent: true,  temps: '22h', dateCommande: '2025-10-21' },
  ]);

  const [machinesPlanification, setMachinesPlanification] = useState([
    { id: 'M2301', nom: 'M2301', laize: 100, vitesse: 280, selecteurs: 6, etat: 'En service',
      planning: [{ of: 'OF249780', client: 'CL00884', modele: 'IBIZA', ref: 'IB1020-B29-01', qte: 320, debut: '2025-10-18 08:00', fin: '2025-10-20 16:00', etat: 'En cours',   progression: 65, qrmp: ['C29_NM05_S2023', 'C01_NM05_S2024'] }] },
    { id: 'M2302', nom: 'M2302', laize: 100, vitesse: 260, selecteurs: 6, etat: 'En service',
      planning: [{ of: 'OF249781', client: 'CL00837', modele: 'ARTHUR', ref: 'AR1020-B02-04', qte: 200, debut: '2025-10-17 08:00', fin: '2025-10-19 14:00', etat: 'En cours',   progression: 85, qrmp: ['C02_NM05_S2023', 'C04_NM05_S2024'] }] },
    { id: 'M2303', nom: 'M2303', laize: 100, vitesse: 290, selecteurs: 6, etat: 'En service', planning: [] },
    { id: 'M2304', nom: 'M2304', laize: 100, vitesse: 0,   selecteurs: 6, etat: 'Panne mécanique', planning: [] },
    { id: 'M2305', nom: 'M2305', laize: 100, vitesse: 275, selecteurs: 8, etat: 'En service',
      planning: [{ of: 'OF249784', client: 'CL00765', modele: 'UNI', ref: 'UNS1020-02', qte: 150, debut: '2025-10-18 14:00', fin: '2025-10-19 22:00', etat: 'Planifié', progression: 0,  qrmp: ['C02_NM05_S2023'] }] },
  ]);

  const [stockMP] = useState([
    { qr: 'C01_NM05_S2023', code: 'C01', couleur: 'BLANC', poids: 85,  entrepot: 'Usine' },
    { qr: 'C02_NM05_S2023', code: 'C02', couleur: 'ECRU',  poids: 120, entrepot: 'Usine' },
    { qr: 'C04_NM05_S2024', code: 'C04', couleur: 'BEIGE', poids: 95,  entrepot: 'Usine' },
    { qr: 'C09_NM05_S2023', code: 'C09', couleur: 'GRIS',  poids: 15,  entrepot: 'Usine', alerte: true },
    { qr: 'C12_NM10_S2024', code: 'C12', couleur: 'BLEU',  poids: 0,   entrepot: 'E1',    rupture: true },
    { qr: 'C29_NM05_S2023', code: 'C29', couleur: 'ROUGE', poids: 68,  entrepot: 'Usine' },
    { qr: 'C01_NM05_S2024', code: 'C01', couleur: 'BLANC', poids: 145, entrepot: 'E1' },
  ]);

  const sousTraitanceData = [
    { nom: 'ST Frange A',   sortis: 450, retour: 380, restant: 70, conformite: 98 },
    { nom: 'ST Couture B',  sortis: 320, retour: 320, restant: 0,  conformite: 95 },
    { nom: 'ST Broderie C', sortis: 180, retour: 120, restant: 60, conformite: 92 },
  ];

  // ─────────── Drag & Drop handlers (preserved) ───────────
  const handleDragStart = (e: React.DragEvent, of: any) => {
    setDraggedOF(of);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, machineId: string) => {
    e.preventDefault();
    if (!draggedOF) return;
    setSelectedMachine(machineId);
    setSelectedOF(draggedOF);
    setShowQRModal(true);
  };
  const handleAttributeOF = (qrmpList: string[]) => {
    if (!selectedOF || !selectedMachine) return;
    setMachinesPlanification((prev) =>
      prev.map((m) =>
        m.id === selectedMachine
          ? {
              ...m,
              planning: [
                ...m.planning,
                {
                  of: selectedOF.id,
                  client: selectedOF.client,
                  modele: selectedOF.modele,
                  ref: selectedOF.ref,
                  qte: selectedOF.qte,
                  debut: new Date().toISOString(),
                  fin: new Date(Date.now() + parseInt(selectedOF.temps) * 3600000).toISOString(),
                  etat: 'Planifié',
                  progression: 0,
                  qrmp: qrmpList,
                },
              ],
            }
          : m
      )
    );
    setOfsEnAttente((prev) => prev.filter((of) => of.id !== selectedOF.id));
    setShowQRModal(false);
    setSelectedOF(null);
    setSelectedMachine(null);
    setDraggedOF(null);
  };

  const refresh = () => {
    // Placeholder for future API refresh
  };

  const machinesEnService = machinesPlanification.filter((m) => m.etat === 'En service').length;

  const tooltipStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)',
    fontSize: 12,
  } as React.CSSProperties;

  return (
    <>
      <DashboardShell
        eyebrow="Poste — Chef de production"
        title="Tableau de bord — Chef de production"
        subtitle="Suivi des ordres de fabrication, planning et cadence de production."
        headerRight={
          <>
            <button onClick={refresh} style={btnGhost} title="Actualiser les données">
              <Activity size={14} /> Actualiser
            </button>
            <button onClick={() => navigate('/of')} style={btnPrimary}>
              <Plus size={14} /> Nouvel OF
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* PRIMARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard
            label="OF en cours"
            value={commandesData.actives}
            hint={`${commandesData.terminees} terminées ce mois`}
            icon={<Package size={18} />}
            tone="indigo"
            onClick={() => navigate('/of')}
          />
          <KpiCard
            label="TRS moyen"
            value="87.2"
            unit="%"
            hint="Objectif ≥ 85%"
            icon={<TrendingUp size={18} />}
            tone="sage"
          />
          <KpiCard
            label="OF en retard"
            value={commandesData.enRetard}
            hint="Nécessitent attention"
            icon={<AlertCircle size={18} />}
            tone="terracotta"
          />
          <KpiCard
            label="Machines actives"
            value={machinesEnService}
            hint={`sur ${machinesPlanification.length} au total`}
            icon={<Wrench size={18} />}
            tone="gold"
          />
        </div>

        {/* SECONDARY KPIs */}
        <div className="lp-metric-grid">
          <KpiCard label="Rendement"       value="91"  unit="%" hint="Objectif ≥ 90%" icon={<Activity size={16} />} tone="sage" />
          <KpiCard label="Taux de panne"   value="4.2" unit="%" hint="Objectif < 5%"  icon={<AlertTriangle size={16} />} tone="rose" />
          <KpiCard label="Taux de rebut"   value="2.8" unit="%" hint="Objectif < 3%"  icon={<Scissors size={16} />} tone="gold" />
          <KpiCard label="Respect planning" value="94" unit="%" hint="Objectif 100%"  icon={<Calendar size={16} />} tone="indigo" />
        </div>

        {/* CHARTS ROW */}
        <div className="lp-grid-2">
          <SectionCard title="Répartition par statut" subtitle="Vue globale des OF actifs" icon={<Factory size={16} />}>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="var(--bg-elevated)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
              {statusData.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />
                  {s.name} <strong style={{ color: 'var(--fg-primary)' }}>{s.value}</strong>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Évolution TRS hebdomadaire" subtitle="TRS réel vs objectif" icon={<TrendingUp size={16} />}>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trsData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="jour" stroke="var(--fg-muted)" fontSize={11} />
                  <YAxis domain={[70, 100]} stroke="var(--fg-muted)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-secondary)' }} />
                  <Line type="monotone" dataKey="trs"      stroke="var(--accent-indigo)" strokeWidth={2.5} dot={{ fill: 'var(--accent-indigo)', r: 4 }} name="TRS réel" />
                  <Line type="monotone" dataKey="objectif" stroke="var(--accent-sage)"   strokeWidth={2} strokeDasharray="5 5" name="Objectif" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* PLANNING WITH DRAG & DROP */}
        <SectionCard
          title="Planning des machines"
          subtitle="Glissez un OF depuis la file d'attente vers une machine"
          icon={<Calendar size={16} />}
          actions={
            <>
              <button style={btnGhostSm}><Filter size={12} /> Filtrer</button>
              <button style={btnGhostSm}><Download size={12} /> Exporter</button>
            </>
          }
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            padding: 'var(--s-3) var(--s-4)',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--s-4)',
            fontSize: 'var(--text-xs)',
            color: 'var(--fg-secondary)',
          }}>
            <Move size={14} style={{ color: 'var(--accent-indigo)', flexShrink: 0, marginTop: 2 }} />
            <span>Glissez-déposez un OF depuis la liste "En attente" vers une machine. Vous devrez ensuite attribuer les QR codes de matière première disponibles.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--s-4)' }}>
            {/* File d'attente */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--s-3)', color: 'var(--fg-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <Clock size={14} /> OF en attente ({ofsEnAttente.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', maxHeight: 480, overflowY: 'auto' }}>
                {ofsEnAttente.map((of) => (
                  <div
                    key={of.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, of)}
                    style={{
                      padding: 'var(--s-3)',
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${of.urgent ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'move',
                    }}
                  >
                    {of.urgent && (
                      <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <AlertTriangle size={11} /> URGENT
                      </span>
                    )}
                    <div style={{ fontWeight: 700, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{of.id}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                      <div>Client : {of.client}</div>
                      <div>Modèle : {of.modele}</div>
                      <div>Réf : {of.ref}</div>
                      <div style={{ color: 'var(--accent-indigo)', fontWeight: 600, marginTop: 2 }}>Qté : {of.qte}</div>
                      <div>{of.couleurs} couleur{of.couleurs > 1 ? 's' : ''}</div>
                      <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Temps : {of.temps}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 120, padding: 'var(--s-3)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>Machine</div>
                <div style={{ flex: 1, display: 'flex' }}>
                  {["Aujourd'hui", 'Demain', 'J+2', 'J+3', 'J+4'].map((d, i) => (
                    <div key={i} style={{ flex: 1, padding: 'var(--s-3)', textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--fg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>{d}</div>
                  ))}
                </div>
              </div>
              {machinesPlanification.map((machine) => (
                <div
                  key={machine.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, machine.id)}
                  style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div style={{ width: 120, padding: 'var(--s-3)', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{machine.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      <div>V : {machine.vitesse} t/min</div>
                      <div>S : {machine.selecteurs} coul.</div>
                    </div>
                    <span style={{ ...badgeBase, marginTop: 6, display: 'inline-block',
                      background: machine.etat === 'En service' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                      color: machine.etat === 'En service' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {machine.etat === 'En service' ? 'OK' : 'Panne'}
                    </span>
                  </div>
                  <div style={{ flex: 1, padding: 'var(--s-3)', minHeight: 110, background: 'var(--bg-elevated)' }}>
                    {machine.planning.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg-muted)', fontSize: 'var(--text-xs)', fontStyle: 'italic' }}>
                        {machine.etat === 'Panne mécanique' ? (
                          <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontStyle: 'normal' }}>Machine en panne</span>
                        ) : 'Glissez un OF ici'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {machine.planning.map((of: any, idx: number) => (
                          <div key={idx} style={{
                            padding: 'var(--s-2) var(--s-3)',
                            background: 'var(--bg-hover)',
                            borderLeft: `3px solid ${of.etat === 'En cours' ? 'var(--accent-indigo)' : 'var(--accent-sage)'}`,
                            borderRadius: 'var(--radius-sm)',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{of.of}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 2 }}>{of.modele} — {of.qte} pcs</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Client : {of.client}</div>
                                {of.qrmp?.length > 0 && (
                                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>MP : {of.qrmp.length} bobine{of.qrmp.length > 1 ? 's' : ''}</div>
                                )}
                              </div>
                              <span style={{ ...badgeBase,
                                background: of.etat === 'En cours' ? 'var(--color-info-bg)' : 'var(--color-success-bg)',
                                color:      of.etat === 'En cours' ? 'var(--color-info)'    : 'var(--color-success)' }}>
                                {of.etat}
                              </span>
                            </div>
                            {of.progression > 0 && (
                              <div style={{ marginTop: 6 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-muted)', marginBottom: 2 }}>
                                  <span>Progression</span>
                                  <span style={{ fontWeight: 600, color: 'var(--fg-secondary)' }}>{of.progression}%</span>
                                </div>
                                <div style={{ width: '100%', height: 5, background: 'var(--border-subtle)', borderRadius: 999 }}>
                                  <div style={{ width: `${of.progression}%`, height: '100%', background: 'var(--accent-indigo)', borderRadius: 999 }} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* MACHINES + SOUS-TRAITANCE */}
        <div className="lp-grid-2">
          <SectionCard title="État des machines" subtitle="Rendement en temps réel" icon={<Wrench size={16} />}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)' }}>
                    {['Machine', 'État', 'OF en cours', 'Rendement'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {machinesData.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={tdStyle}><strong style={{ color: 'var(--fg-primary)' }}>{m.machine}</strong></td>
                      <td style={tdStyle}>
                        <span style={{ ...badgeBase,
                          background: m.etat === 'En service' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                          color:      m.etat === 'En service' ? 'var(--color-success)'    : 'var(--color-danger)' }}>
                          {m.etat}
                        </span>
                      </td>
                      <td style={tdStyle}>{m.of}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 6, background: 'var(--border-subtle)', borderRadius: 999 }}>
                            <div style={{ width: `${m.rendement}%`, height: '100%', background: 'var(--accent-indigo)', borderRadius: 999 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{m.rendement}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Suivi sous-traitance" subtitle="Sortis vs retournés" icon={<Package size={16} />}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)' }}>
                    {['Sous-traitant', 'Sortis', 'Retour', 'Restant', 'Conformité', ''].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sousTraitanceData.map((st, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={tdStyle}><strong style={{ color: 'var(--fg-primary)' }}>{st.nom}</strong></td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{st.sortis}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>{st.retour}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', color: st.restant > 0 ? 'var(--color-warning)' : 'var(--fg-secondary)', fontWeight: 600 }}>{st.restant}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <span style={{ fontWeight: 600, color: st.conformite >= 95 ? 'var(--color-success)' : 'var(--color-warning)' }}>{st.conformite}%</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        {st.restant === 0
                          ? <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                          : <Clock size={16} style={{ color: 'var(--color-warning)' }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* ALERTES */}
        <SectionCard title="Alertes urgentes" subtitle="Situations nécessitant intervention" icon={<AlertCircle size={16} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {[
              { severity: 'danger',  msg: 'OF249780 — Retard de 2 jours — Client CL00884' },
              { severity: 'danger',  msg: 'Machine M2304 — Panne mécanique depuis 4h' },
              { severity: 'warning', msg: 'Matière C09 — Stock critique (15 kg restants)' },
            ].map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: 'var(--s-3) var(--s-4)',
                background: a.severity === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)',
                border: `1px solid ${a.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
                color: a.severity === 'danger' ? 'var(--color-danger)' : 'var(--color-warning)',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{a.msg}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </DashboardShell>

      {/* Modal Attribution QR MP (préservé) */}
      {showQRModal && selectedOF && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            maxWidth: 640, width: '90%', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ padding: 'var(--s-5)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--fg-primary)' }}>
                Attribution matière première
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                OF : {selectedOF.id} — Machine : {selectedMachine}
              </p>
            </div>
            <div style={{ padding: 'var(--s-5)' }}>
              <div style={{ padding: 'var(--s-3) var(--s-4)', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--s-4)' }}>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-info)', marginBottom: 6 }}>Détails de l'OF</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  <div>Modèle : {selectedOF.modele}</div>
                  <div>Réf : {selectedOF.ref}</div>
                  <div>Quantité : {selectedOF.qte} pièces</div>
                  <div>Couleurs : {selectedOF.couleurs}</div>
                  <div>Temps estimé : {selectedOF.temps}</div>
                  <div>Client : {selectedOF.client}</div>
                </div>
              </div>
              <h4 style={{ margin: '0 0 var(--s-2)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-primary)' }}>
                Sélectionnez les matières premières disponibles :
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {stockMP.filter((mp) => mp.poids > 0).map((mp) => (
                  <label key={mp.qr} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 'var(--s-3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" style={{ width: 14, height: 14 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{mp.code} — {mp.couleur}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>QR : {mp.qr}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Stock : {mp.poids} kg — {mp.entrepot}</div>
                    </div>
                    {mp.alerte && (
                      <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Stock bas</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding: 'var(--s-4) var(--s-5)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)' }}>
              <button onClick={() => { setShowQRModal(false); setSelectedOF(null); setSelectedMachine(null); }} style={btnGhost}>
                Annuler
              </button>
              <button onClick={() => handleAttributeOF(['C01_NM05_S2023', 'C02_NM05_S2023'])} style={btnPrimary}>
                Confirmer l'attribution
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Styles helpers
const badgeBase: React.CSSProperties = { padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3) var(--s-4)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', color: 'var(--fg-primary)' };

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-indigo)', color: '#fff', border: '1px solid var(--accent-indigo)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhostSm: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-hover)', color: 'var(--fg-muted)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 500, cursor: 'pointer' };

export default DashboardChefProduction;
