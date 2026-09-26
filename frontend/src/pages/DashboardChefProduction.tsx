import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle, CheckCircle, Clock, TrendingUp, Package, Wrench, Activity,
  Calendar, Plus, Filter, Download, Move, AlertTriangle, Factory, Scissors,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import {
  ofService,
  machinesService,
  matieresPremieresService,
  dashboardService,
  soustraitantsService,
} from '../services/api';

// ─────────── Types (loose — backend envelopes vary) ───────────
type OF = {
  id_of: number;
  numero_of?: string;
  statut?: string;
  priorite?: string;
  id_machine?: number | null;
  id_article?: number;
  code_article?: string;
  article_designation?: string;
  client_nom?: string;
  numero_commande?: string;
  quantite_a_produire?: number;
  date_debut_prevue?: string | null;
  date_fin_prevue?: string | null;
  date_creation_of?: string;
  date_fin_reelle?: string | null;
  observations?: string | null;
  avancement?: number;
};

type Machine = {
  id_machine: number;
  numero_machine?: string;
  statut?: string;
  vitesse_nominale?: number | null;
  type_machine_libelle?: string | null;
};

type MP = {
  id_mp: number;
  code_mp?: string;
  designation?: string;
  stock_actuel?: number | string;
  stock_alerte?: number | string;
  stock_minimum?: number | string;
  unite?: string;
};

type Soustraitant = {
  id_soustraitant?: number;
  nom?: string;
  raison_sociale?: string;
  sortis?: number;
  retour?: number;
  restant?: number;
  conformite?: number;
};

// Normalise l'enveloppe backend { success, data: X } / { data: {data:[...]} } / { data:{machines:[...]} } / etc.
function unwrapList<T = any>(resp: any, keys: string[] = []): T[] {
  const root = resp?.data?.data ?? resp?.data ?? resp;
  if (Array.isArray(root)) return root as T[];
  if (root && typeof root === 'object') {
    if (Array.isArray(root.data)) return root.data as T[];
    for (const k of keys) {
      if (Array.isArray(root[k])) return root[k] as T[];
    }
    if (Array.isArray(root.items)) return root.items as T[];
  }
  return [];
}

function unwrapObject<T = any>(resp: any): T | null {
  const root = resp?.data?.data ?? resp?.data ?? resp;
  if (root && typeof root === 'object' && !Array.isArray(root)) return root as T;
  return null;
}

// Libellés lisibles pour statut OF
const OF_STATUT_LABEL: Record<string, string> = {
  planifie: 'Planifié',
  en_attente: 'En attente',
  en_cours: 'En fabrication',
  en_pause: 'En pause',
  termine: 'Terminé',
  annule: 'Annulé',
  en_retard: 'En retard',
  sous_traitance: 'Sous-traitance',
};

const STATUT_COLORS: Record<string, string> = {
  en_cours: 'var(--accent-sage)',
  sous_traitance: 'var(--accent-indigo)',
  planifie: 'var(--accent-gold)',
  en_attente: 'var(--accent-gold)',
  en_pause: 'var(--accent-rose)',
  en_retard: 'var(--accent-terracotta)',
  termine: 'var(--accent-sage)',
};

const DashboardChefProduction: React.FC = () => {
  const navigate = useNavigate();

  // ─────────── UI state ───────────
  const [draggedOF, setDraggedOF] = useState<OF | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedOF, setSelectedOF] = useState<OF | null>(null);
  const [loading, setLoading] = useState(true);

  // ─────────── Données live ───────────
  const [ofs, setOfs] = useState<OF[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [mps, setMps] = useState<MP[]>([]);
  const [sousTraitants, setSousTraitants] = useState<Soustraitant[]>([]);
  const [kpisProd, setKpisProd] = useState<any | null>(null);
  const [kpisGeneral, setKpisGeneral] = useState<any | null>(null);
  const [alertesBackend, setAlertesBackend] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [ofsRes, machinesRes, mpsRes, kpisProdRes, kpisRes, stRes, alertesRes] = await Promise.all([
      ofService.getOFs({ limit: 200 }).catch(() => null),
      machinesService.getMachines({ limit: 200 }).catch(() => null),
      matieresPremieresService.getMatieresPremieres({ limit: 200 }).catch(() => null),
      dashboardService.getKpisProduction().catch(() => null),
      dashboardService.getKPIs().catch(() => null),
      soustraitantsService.getSoustraitants({ limit: 50 }).catch(() => null),
      dashboardService.getAlertes().catch(() => null),
    ]);

    setOfs(unwrapList<OF>(ofsRes, ['data']));
    setMachines(unwrapList<Machine>(machinesRes, ['machines']));
    setMps(unwrapList<MP>(mpsRes, ['matieres_premieres']));
    setKpisProd(unwrapObject<any>(kpisProdRes));
    setKpisGeneral(unwrapObject<any>(kpisRes));
    setSousTraitants(unwrapList<Soustraitant>(stRes, ['items', 'soustraitants']));
    setAlertesBackend(unwrapList<any>(alertesRes, ['items']));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─────────── KPI dérivés ───────────
  const now = new Date();
  const ofEnCours = ofs.filter((o) => o.statut === 'en_cours').length;
  const ofPlanifies = ofs.filter((o) => o.statut === 'planifie' || o.statut === 'en_attente').length;
  const ofTerminesMois = ofs.filter((o) => {
    if (o.statut !== 'termine') return false;
    const d = o.date_fin_reelle || o.date_fin_prevue;
    if (!d) return false;
    const dt = new Date(d);
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
  }).length;
  const ofEnRetard = ofs.filter((o) => {
    if (o.statut === 'termine' || o.statut === 'annule') return false;
    if (o.statut === 'en_retard') return true;
    if (!o.date_fin_prevue) return false;
    return new Date(o.date_fin_prevue).getTime() < now.getTime();
  }).length;

  const machinesActives = machines.filter((m) => m.statut === 'operationnelle').length;
  const machinesEnPanne = machines.filter((m) => m.statut === 'en_panne').length;
  const tauxPanne = machines.length
    ? Math.round((machinesEnPanne / machines.length) * 1000) / 10
    : 0;

  // KPIs dashboard/kpis-production surchargent les comptes locaux si présents
  const kpiOfEnCours = Number(kpisProd?.ordres_fabrication?.en_cours ?? ofEnCours);
  const kpiOfTerminesMois =
    Number(kpisProd?.ordres_fabrication?.termines_7j ?? kpisGeneral?.ordres_fabrication?.termines ?? ofTerminesMois);
  const kpiOfEnRetard = Number(kpisProd?.ordres_fabrication?.retards ?? ofEnRetard);
  const kpiMachinesTotal = Number(kpisProd?.machines?.total ?? machines.length);
  const kpiMachinesActives = Number(kpisProd?.machines?.operationnelles ?? machinesActives);

  // ─────────── Répartition par statut (donut) ───────────
  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    ofs.forEach((o) => {
      const k = (o.statut || 'inconnu') as string;
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return Array.from(counts.entries())
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: OF_STATUT_LABEL[k] || k,
        value: v,
        color: STATUT_COLORS[k] || 'var(--accent-indigo)',
      }));
  }, [ofs]);

  // ─────────── TRS hebdo (calculé depuis complétions OF sur 7 jours) ───────────
  // TODO(backend): exposer un endpoint TRS réel par jour (ex: /api/dashboard/trs?days=7) — pour l'instant
  // on approxime avec un ratio "OF terminés vs planifiés à cette date" plafonné à 100.
  const trsData = useMemo(() => {
    const days: { key: string; date: Date }[] = [];
    const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({ key: labels[d.getDay()], date: d });
    }
    return days.map(({ key, date }) => {
      const dayStart = date.getTime();
      const dayEnd = dayStart + 24 * 3600 * 1000;
      const finished = ofs.filter((o) => {
        const d = o.date_fin_reelle || (o.statut === 'termine' ? o.date_fin_prevue : null);
        if (!d) return false;
        const t = new Date(d).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      const planned = ofs.filter((o) => {
        const d = o.date_fin_prevue;
        if (!d) return false;
        const t = new Date(d).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;
      // TODO(backend): valeur TRS réelle. Fallback : ratio complété/planifié.
      const trs = planned > 0 ? Math.min(100, Math.round((finished / planned) * 100)) : 85;
      return { jour: key, trs, objectif: 85 };
    });
  }, [ofs]);

  // ─────────── OF en attente (planifié / en_attente + pas encore assigné) ───────────
  const ofsEnAttente = useMemo(
    () =>
      ofs
        .filter((o) => o.statut === 'planifie' || o.statut === 'en_attente')
        .sort((a, b) => {
          // Urgents d'abord, puis par date_debut_prevue
          const ua = a.priorite === 'urgente' || a.priorite === 'haute' ? 0 : 1;
          const ub = b.priorite === 'urgente' || b.priorite === 'haute' ? 0 : 1;
          if (ua !== ub) return ua - ub;
          const da = a.date_debut_prevue ? new Date(a.date_debut_prevue).getTime() : Infinity;
          const db = b.date_debut_prevue ? new Date(b.date_debut_prevue).getTime() : Infinity;
          return da - db;
        }),
    [ofs]
  );

  // ─────────── Machines + planning (OFs assignés) ───────────
  const machinesPlanification = useMemo(() => {
    return machines.map((m) => {
      const planning = ofs
        .filter((o) => o.id_machine === m.id_machine && o.statut !== 'termine' && o.statut !== 'annule')
        .map((o) => ({
          of: o.numero_of || `OF${o.id_of}`,
          id_of: o.id_of,
          client: o.client_nom || o.numero_commande || '-',
          modele: o.article_designation || o.code_article || '-',
          ref: o.code_article || '-',
          qte: o.quantite_a_produire || 0,
          debut: o.date_debut_prevue || '',
          fin: o.date_fin_prevue || '',
          etat: o.statut === 'en_cours' ? 'En cours' : OF_STATUT_LABEL[o.statut || 'planifie'] || 'Planifié',
          progression: Number(o.avancement) || 0,
        }));
      return {
        id: m.id_machine,
        nom: m.numero_machine || `M${m.id_machine}`,
        vitesse: m.vitesse_nominale || 0,
        selecteurs: 0,
        etat: m.statut === 'operationnelle' ? 'En service' : m.statut || 'Inconnu',
        rawStatut: m.statut,
        planning,
      };
    });
  }, [machines, ofs]);

  // ─────────── Stock MP en alerte ───────────
  const stockMPAlerte = useMemo(() => {
    return mps
      .map((mp) => ({
        ...mp,
        stockNum: Number(mp.stock_actuel) || 0,
        alerteNum: Number(mp.stock_alerte) || 0,
      }))
      .filter((mp) => mp.alerteNum > 0 && mp.stockNum < mp.alerteNum)
      .sort((a, b) => a.stockNum - b.stockNum);
  }, [mps]);

  // ─────────── Sous-traitance ───────────
  const sousTraitanceData = useMemo(() => {
    return sousTraitants.slice(0, 6).map((st) => ({
      nom: st.raison_sociale || st.nom || `ST ${st.id_soustraitant}`,
      sortis: Number(st.sortis) || 0,
      retour: Number(st.retour) || 0,
      restant: (Number(st.sortis) || 0) - (Number(st.retour) || 0),
      conformite: Number(st.conformite) || 0,
    }));
  }, [sousTraitants]);

  // ─────────── Alertes ───────────
  const alertes = useMemo(() => {
    const list: { severity: 'danger' | 'warning'; msg: string }[] = [];
    // Alertes du backend
    alertesBackend.forEach((a: any) => {
      list.push({
        severity: a.severite === 'critique' || a.type === 'danger' ? 'danger' : 'warning',
        msg: a.message || a.libelle || String(a),
      });
    });
    // OFs en retard
    ofs
      .filter((o) => o.statut !== 'termine' && o.statut !== 'annule' && o.date_fin_prevue &&
        new Date(o.date_fin_prevue).getTime() < now.getTime())
      .slice(0, 3)
      .forEach((o) => {
        const days = Math.floor((now.getTime() - new Date(o.date_fin_prevue!).getTime()) / (24 * 3600 * 1000));
        list.push({
          severity: 'danger',
          msg: `${o.numero_of || `OF${o.id_of}`} — Retard de ${days} jour${days > 1 ? 's' : ''}${o.client_nom ? ` — ${o.client_nom}` : ''}`,
        });
      });
    // Machines en panne
    machines
      .filter((m) => m.statut === 'en_panne')
      .slice(0, 3)
      .forEach((m) => {
        list.push({ severity: 'danger', msg: `Machine ${m.numero_machine || m.id_machine} — En panne` });
      });
    // Stock MP critique
    stockMPAlerte.slice(0, 3).forEach((mp) => {
      list.push({
        severity: mp.stockNum <= 0 ? 'danger' : 'warning',
        msg: `${mp.designation || mp.code_mp} — Stock ${mp.stockNum <= 0 ? 'en rupture' : 'critique'} (${mp.stockNum}${mp.unite ? ' ' + mp.unite : ''} restants)`,
      });
    });
    return list.slice(0, 8);
  }, [alertesBackend, ofs, machines, stockMPAlerte, now]);

  // ─────────── Drag & Drop ───────────
  const handleDragStart = (e: React.DragEvent, of: OF) => {
    setDraggedOF(of);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, machine: typeof machinesPlanification[number]) => {
    e.preventDefault();
    if (!draggedOF) return;
    const m = machines.find((mm) => mm.id_machine === machine.id) || null;
    setSelectedMachine(m);
    setSelectedOF(draggedOF);
    setShowQRModal(true);
  };
  const handleAttributeOF = async () => {
    if (!selectedOF || !selectedMachine) return;
    try {
      await ofService.updateOF(selectedOF.id_of, {
        id_machine: selectedMachine.id_machine,
        statut: 'en_cours',
      });
      await loadData();
    } catch (err) {
      console.error('Erreur assignation OF → machine', err);
    } finally {
      setShowQRModal(false);
      setSelectedOF(null);
      setSelectedMachine(null);
      setDraggedOF(null);
    }
  };

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
            <button onClick={loadData} style={btnGhost} title="Actualiser les données" disabled={loading}>
              <Activity size={14} /> {loading ? 'Chargement…' : 'Actualiser'}
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
            value={kpiOfEnCours}
            hint={`${kpiOfTerminesMois} terminés ce mois`}
            icon={<Package size={18} />}
            tone="indigo"
            onClick={() => navigate('/of')}
          />
          <KpiCard
            label="TRS moyen"
            // TODO(backend): exposer TRS moyen calculé (endpoint /api/dashboard/trs) — fallback objectif
            value={trsData.length ? Math.round(trsData.reduce((s, d) => s + d.trs, 0) / trsData.length) : 85}
            unit="%"
            hint="Objectif ≥ 85%"
            icon={<TrendingUp size={18} />}
            tone="sage"
          />
          <KpiCard
            label="OF en retard"
            value={kpiOfEnRetard}
            hint="Nécessitent attention"
            icon={<AlertCircle size={18} />}
            tone="terracotta"
          />
          <KpiCard
            label="Machines actives"
            value={kpiMachinesActives}
            hint={`sur ${kpiMachinesTotal} au total`}
            icon={<Wrench size={18} />}
            tone="gold"
          />
        </div>

        {/* SECONDARY KPIs */}
        <div className="lp-metric-grid">
          {/* TODO(backend): rendement machine, taux de rebut et respect planning ne sont pas exposés — fallback statique */}
          <KpiCard label="Rendement" value={kpiMachinesTotal ? Math.round((kpiMachinesActives / kpiMachinesTotal) * 100) : 0} unit="%" hint="Machines opérationnelles" icon={<Activity size={16} />} tone="sage" />
          <KpiCard label="Taux de panne" value={tauxPanne} unit="%" hint="Objectif < 5%" icon={<AlertTriangle size={16} />} tone="rose" />
          {/* TODO(backend): endpoint /api/dashboard/kpis-production ne renvoie pas rebut/planning — fallback */}
          <KpiCard label="Taux de rebut" value={0} unit="%" hint="Objectif < 3%" icon={<Scissors size={16} />} tone="gold" />
          <KpiCard label="Respect planning" value={kpiOfEnCours + kpiOfEnRetard > 0 ? Math.round((kpiOfEnCours / (kpiOfEnCours + kpiOfEnRetard)) * 100) : 100} unit="%" hint="OF à l'heure vs total actif" icon={<Calendar size={16} />} tone="indigo" />
        </div>

        {/* CHARTS ROW */}
        <div className="lp-grid-2">
          <SectionCard title="Répartition par statut" subtitle="Vue globale des OF actifs" icon={<Factory size={16} />}>
            <div style={{ height: 260 }}>
              {statusData.length === 0 ? (
                <div style={emptyStyle}>Aucun OF à afficher</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                      {statusData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="var(--bg-elevated)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
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

          <SectionCard title="Évolution TRS hebdomadaire" subtitle="TRS approximatif vs objectif" icon={<TrendingUp size={16} />}>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trsData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="jour" stroke="var(--fg-muted)" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="var(--fg-muted)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--fg-secondary)' }} />
                  <Line type="monotone" dataKey="trs" stroke="var(--accent-indigo)" strokeWidth={2.5} dot={{ fill: 'var(--accent-indigo)', r: 4 }} name="TRS calculé" />
                  <Line type="monotone" dataKey="objectif" stroke="var(--accent-sage)" strokeWidth={2} strokeDasharray="5 5" name="Objectif" />
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
            <span>Glissez-déposez un OF depuis la liste "En attente" vers une machine. L'OF sera assigné et passé en état "En cours".</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--s-4)' }}>
            {/* File d'attente */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--s-3)', color: 'var(--fg-secondary)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <Clock size={14} /> OF en attente ({ofsEnAttente.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', maxHeight: 480, overflowY: 'auto' }}>
                {ofsEnAttente.length === 0 && (
                  <div style={{ ...emptyStyle, padding: 'var(--s-4)' }}>Aucun OF en attente</div>
                )}
                {ofsEnAttente.map((of) => {
                  const urgent = of.priorite === 'urgente' || of.priorite === 'haute';
                  return (
                    <div
                      key={of.id_of}
                      draggable
                      onDragStart={(e) => handleDragStart(e, of)}
                      style={{
                        padding: 'var(--s-3)',
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${urgent ? 'var(--accent-terracotta)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'move',
                      }}
                    >
                      {urgent && (
                        <span style={{ ...badgeBase, background: 'var(--color-danger-bg)', color: 'var(--color-danger)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          <AlertTriangle size={11} /> URGENT
                        </span>
                      )}
                      <div style={{ fontWeight: 700, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{of.numero_of || `OF${of.id_of}`}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                        {of.client_nom && <div>Client : {of.client_nom}</div>}
                        {of.article_designation && <div>Article : {of.article_designation}</div>}
                        {of.code_article && <div>Réf : {of.code_article}</div>}
                        <div style={{ color: 'var(--accent-indigo)', fontWeight: 600, marginTop: 2 }}>Qté : {of.quantite_a_produire ?? 0}</div>
                        {of.date_fin_prevue && (
                          <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Échéance : {new Date(of.date_fin_prevue).toLocaleDateString('fr-FR')}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
              {machinesPlanification.length === 0 && (
                <div style={{ ...emptyStyle, padding: 'var(--s-5)' }}>Aucune machine configurée</div>
              )}
              {machinesPlanification.map((machine) => (
                <div
                  key={machine.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, machine)}
                  style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div style={{ width: 120, padding: 'var(--s-3)', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{machine.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      <div>V : {machine.vitesse || '—'} t/min</div>
                    </div>
                    <span style={{ ...badgeBase, marginTop: 6, display: 'inline-block',
                      background: machine.rawStatut === 'operationnelle' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                      color: machine.rawStatut === 'operationnelle' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {machine.rawStatut === 'operationnelle' ? 'OK' : machine.etat}
                    </span>
                  </div>
                  <div style={{ flex: 1, padding: 'var(--s-3)', minHeight: 110, background: 'var(--bg-elevated)' }}>
                    {machine.planning.length === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--fg-muted)', fontSize: 'var(--text-xs)', fontStyle: 'italic' }}>
                        {machine.rawStatut === 'en_panne' ? (
                          <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontStyle: 'normal' }}>Machine en panne</span>
                        ) : 'Glissez un OF ici'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {machine.planning.map((of, idx) => (
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
          <SectionCard title="État des machines" subtitle="Statut et OF en cours" icon={<Wrench size={16} />}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)' }}>
                    {['Machine', 'État', 'OF en cours', 'Charge'].map((h) => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {machinesPlanification.length === 0 && (
                    <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune machine</td></tr>
                  )}
                  {machinesPlanification.map((m) => {
                    // TODO(backend): rendement réel par machine non exposé — approx par charge planning
                    const charge = Math.min(100, m.planning.length * 25);
                    const currentOf = m.planning.find((p) => p.etat === 'En cours');
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={tdStyle}><strong style={{ color: 'var(--fg-primary)' }}>{m.nom}</strong></td>
                        <td style={tdStyle}>
                          <span style={{ ...badgeBase,
                            background: m.rawStatut === 'operationnelle' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                            color:      m.rawStatut === 'operationnelle' ? 'var(--color-success)'    : 'var(--color-danger)' }}>
                            {m.etat}
                          </span>
                        </td>
                        <td style={tdStyle}>{currentOf?.of || '—'}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 80, height: 6, background: 'var(--border-subtle)', borderRadius: 999 }}>
                              <div style={{ width: `${charge}%`, height: '100%', background: 'var(--accent-indigo)', borderRadius: 999 }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{charge}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                  {sousTraitanceData.length === 0 && (
                    <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun sous-traitant</td></tr>
                  )}
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
            {alertes.length === 0 && (
              <div style={emptyStyle}>Aucune alerte active</div>
            )}
            {alertes.map((a, i) => (
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

      {/* Modal Attribution (préservé — MP sélectionnable) */}
      {showQRModal && selectedOF && selectedMachine && (
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
                Assigner l'OF à la machine
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
                OF : {selectedOF.numero_of || selectedOF.id_of} — Machine : {selectedMachine.numero_machine}
              </p>
            </div>
            <div style={{ padding: 'var(--s-5)' }}>
              <div style={{ padding: 'var(--s-3) var(--s-4)', background: 'var(--color-info-bg)', border: '1px solid var(--color-info)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--s-4)' }}>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-info)', marginBottom: 6 }}>Détails de l'OF</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  <div>Article : {selectedOF.article_designation || '—'}</div>
                  <div>Réf : {selectedOF.code_article || '—'}</div>
                  <div>Quantité : {selectedOF.quantite_a_produire ?? 0} pièces</div>
                  <div>Priorité : {selectedOF.priorite || 'normale'}</div>
                  <div>Client : {selectedOF.client_nom || '—'}</div>
                  <div>Échéance : {selectedOF.date_fin_prevue ? new Date(selectedOF.date_fin_prevue).toLocaleDateString('fr-FR') : '—'}</div>
                </div>
              </div>
              <h4 style={{ margin: '0 0 var(--s-2)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--fg-primary)' }}>
                Matières premières disponibles :
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
                {mps.filter((mp) => (Number(mp.stock_actuel) || 0) > 0).slice(0, 20).map((mp) => (
                  <label key={mp.id_mp} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 'var(--s-3)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}>
                    <input type="checkbox" style={{ width: 14, height: 14 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>{mp.code_mp} — {mp.designation}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Stock : {mp.stock_actuel}{mp.unite ? ' ' + mp.unite : ''}</div>
                    </div>
                    {Number(mp.stock_actuel) < Number(mp.stock_alerte) && (
                      <span style={{ ...badgeBase, background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>Stock bas</span>
                    )}
                  </label>
                ))}
                {mps.filter((mp) => (Number(mp.stock_actuel) || 0) > 0).length === 0 && (
                  <div style={emptyStyle}>Aucune matière première en stock</div>
                )}
              </div>
            </div>
            <div style={{ padding: 'var(--s-4) var(--s-5)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-hover)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)' }}>
              <button onClick={() => { setShowQRModal(false); setSelectedOF(null); setSelectedMachine(null); }} style={btnGhost}>
                Annuler
              </button>
              <button onClick={handleAttributeOF} style={btnPrimary}>
                Confirmer l'assignation
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
const emptyStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 80, color: 'var(--fg-muted)', fontSize: 'var(--text-sm)', fontStyle: 'italic' };

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-indigo)', color: '#fff', border: '1px solid var(--accent-indigo)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhostSm: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-hover)', color: 'var(--fg-muted)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 500, cursor: 'pointer' };

export default DashboardChefProduction;
