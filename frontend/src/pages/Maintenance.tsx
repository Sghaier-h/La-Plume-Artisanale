import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Wrench, PlusCircle, Clock, CheckCircle, Activity, AlertTriangle, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api, { machinesService, utilisateursService } from '../services/api';
import { connectSocket } from '../services/socket';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data || x?.items || x?.interventions || []);

const fmtInt = (v: any) => {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString('fr-FR');
};

const STATUTS = ['EN_ATTENTE', 'ASSIGNEE', 'EN_COURS', 'TERMINEE', 'CLOTUREE', 'ANNULEE'];
const PRIORITES = ['BASSE', 'NORMALE', 'HAUTE', 'URGENTE'];
const TYPES_INTERVENTION = ['PREVENTIVE', 'CURATIVE', 'CORRECTIVE', 'INSPECTION'];

const Maintenance: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [machines, setMachines] = useState<any[]>([]);
  const [operateurs, setOperateurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [machineHistory, setMachineHistory] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState<any>({ statut: '', priorite: '', id_machine: '', type_intervention: '' });
  const [form, setForm] = useState<any>({
    id_machine: '',
    type_intervention: 'CURATIVE',
    priorite: 'NORMALE',
    description: '',
    assigne_a: '',
  });

  const loadList = useCallback(async () => {
    try {
      const params: any = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await api.get('/maintenance', { params });
      setInterventions(asArray(res.data));
    } catch (e) { console.error('Erreur chargement maintenance:', e); }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/maintenance/stats/global');
      setStats(res.data?.data || res.data || {});
    } catch (e) { console.error('Erreur stats:', e); }
  }, []);

  const loadRefs = useCallback(async () => {
    try {
      const [mach, users] = await Promise.all([
        machinesService.getMachines().catch(() => ({ data: [] })),
        utilisateursService.getUtilisateurs().catch(() => ({ data: [] })),
      ]);
      setMachines(asArray(mach.data));
      setOperateurs(asArray(users.data));
    } catch (e) { console.error('Erreur refs:', e); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadList(), loadStats(), loadRefs()]);
      setLoading(false);
    })();
  }, [loadList, loadStats, loadRefs]);

  // Socket.IO
  useEffect(() => {
    const socket = connectSocket();
    const refresh = () => { loadList(); loadStats(); };
    socket.on('maintenance:new', refresh);
    socket.on('maintenance:assigned', refresh);
    socket.on('maintenance:started', refresh);
    socket.on('maintenance:completed', refresh);
    return () => {
      socket.off('maintenance:new', refresh);
      socket.off('maintenance:assigned', refresh);
      socket.off('maintenance:started', refresh);
      socket.off('maintenance:completed', refresh);
    };
  }, [loadList, loadStats]);

  const loadMachineHistory = async (id: number) => {
    setSelectedMachineId(id);
    try {
      const res = await api.get(`/maintenance/machine/${id}`);
      setMachineHistory(asArray(res.data));
    } catch (e) { console.error(e); setMachineHistory([]); }
  };

  const doAction = async (id: number, action: 'assigner' | 'demarrer' | 'terminer' | 'cloturer' | 'annuler', body?: any) => {
    try {
      await api.put(`/maintenance/${id}/${action}`, body || {});
      await loadList();
      await loadStats();
    } catch (e: any) {
      alert(`Erreur: ${e?.response?.data?.error || e?.message}`);
    }
  };

  const submitCreate = async () => {
    try {
      await api.post('/maintenance', form);
      setShowCreate(false);
      setForm({ id_machine: '', type_intervention: 'CURATIVE', priorite: 'NORMALE', description: '', assigne_a: '' });
      await loadList();
      await loadStats();
    } catch (e: any) {
      alert(`Erreur création: ${e?.response?.data?.error || e?.message}`);
    }
  };

  const kpiEnAttente = fmtInt(stats?.en_attente ?? stats?.EN_ATTENTE);
  const kpiEnCours = fmtInt(stats?.en_cours ?? stats?.EN_COURS);
  const kpiTerminees = fmtInt(stats?.terminees ?? stats?.TERMINEE);
  const kpiCoutMois = fmtInt(stats?.cout_mois ?? stats?.cout_total_mois ?? 0);

  return (
    <DashboardLayout title="Maintenance" activeSection="maintenance" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Gestion des interventions"
        title="Maintenance atelier"
        subtitle="Suivi des interventions, planification et historique par machine."
        headerRight={
          <>
            <button onClick={() => setShowCreate(true)} style={btnPrimary}>
              <PlusCircle size={14} /> Nouvelle intervention
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* KPIs */}
        <div className="lp-metric-grid">
          <KpiCard label="En attente" value={kpiEnAttente} icon={<Clock size={18} />} tone="gold" loading={loading} />
          <KpiCard label="En cours" value={kpiEnCours} icon={<Activity size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="Terminées" value={kpiTerminees} icon={<CheckCircle size={18} />} tone="sage" loading={loading} />
          <KpiCard label="Coût mois" value={kpiCoutMois} unit="DT" icon={<Wrench size={18} />} tone="indigo" loading={loading} />
        </div>

        {/* Filter bar */}
        <SectionCard title="Filtres" icon={<Activity size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--s-3)' }}>
            <select style={inputStyle} value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })}>
              <option value="">Statut (tous)</option>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select style={inputStyle} value={filters.priorite} onChange={(e) => setFilters({ ...filters, priorite: e.target.value })}>
              <option value="">Priorité (toutes)</option>
              {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select style={inputStyle} value={filters.id_machine} onChange={(e) => setFilters({ ...filters, id_machine: e.target.value })}>
              <option value="">Machine (toutes)</option>
              {machines.map(m => <option key={m.id_machine || m.id} value={m.id_machine || m.id}>{m.nom || m.numero || m.reference}</option>)}
            </select>
            <select style={inputStyle} value={filters.type_intervention} onChange={(e) => setFilters({ ...filters, type_intervention: e.target.value })}>
              <option value="">Type (tous)</option>
              {TYPES_INTERVENTION.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </SectionCard>

        {/* Interventions table */}
        <SectionCard title="Interventions en cours" icon={<Wrench size={16} />} subtitle={`${interventions.length} intervention(s)`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {['Numéro', 'Machine', 'Type', 'Priorité', 'Assigné à', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interventions.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 'var(--s-5)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune intervention</td></tr>
                )}
                {interventions.map(iv => (
                  <tr key={iv.id_maintenance || iv.id} style={{ borderTop: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                      onClick={() => iv.id_machine && loadMachineHistory(iv.id_machine)}>
                    <td style={tdStyle}>{iv.numero || iv.numero_intervention || `#${iv.id_maintenance || iv.id}`}</td>
                    <td style={tdStyle}>{iv.machine_nom || iv.nom_machine || iv.id_machine}</td>
                    <td style={tdStyle}>{iv.type_intervention}</td>
                    <td style={tdStyle}><span style={badgeStyle(iv.priorite)}>{iv.priorite}</span></td>
                    <td style={tdStyle}>{iv.assigne_nom || iv.assigne_a || '—'}</td>
                    <td style={tdStyle}><span style={badgeStyle(iv.statut)}>{iv.statut}</span></td>
                    <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {iv.statut === 'EN_ATTENTE' && (
                          <button style={btnGhostSm} onClick={() => {
                            const u = prompt('ID utilisateur à assigner ?'); if (u) doAction(iv.id_maintenance || iv.id, 'assigner', { assigne_a: Number(u) });
                          }}>Assigner</button>
                        )}
                        {(iv.statut === 'ASSIGNEE' || iv.statut === 'EN_ATTENTE') && (
                          <button style={btnGhostSm} onClick={() => doAction(iv.id_maintenance || iv.id, 'demarrer')}>Démarrer</button>
                        )}
                        {iv.statut === 'EN_COURS' && (
                          <button style={btnGhostSm} onClick={() => doAction(iv.id_maintenance || iv.id, 'terminer')}>Terminer</button>
                        )}
                        {iv.statut === 'TERMINEE' && (
                          <button style={btnGhostSm} onClick={() => doAction(iv.id_maintenance || iv.id, 'cloturer')}>Clôturer</button>
                        )}
                        {iv.statut !== 'CLOTUREE' && iv.statut !== 'ANNULEE' && (
                          <button style={btnGhostSm} onClick={() => doAction(iv.id_maintenance || iv.id, 'annuler')}>Annuler</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Machine history */}
        {selectedMachineId && (
          <SectionCard
            title="Machine sélectionnée — historique"
            subtitle={`Machine #${selectedMachineId}`}
            icon={<AlertTriangle size={16} />}
            actions={<button style={btnGhostSm} onClick={() => { setSelectedMachineId(null); setMachineHistory([]); }}>Fermer</button>}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead><tr>{['Date', 'Type', 'Description', 'Statut'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {machineHistory.length === 0 && <tr><td colSpan={4} style={{ padding: 'var(--s-4)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun historique</td></tr>}
                  {machineHistory.map((h: any, i: number) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={tdStyle}>{h.date_intervention || h.created_at}</td>
                      <td style={tdStyle}>{h.type_intervention}</td>
                      <td style={tdStyle}>{h.description}</td>
                      <td style={tdStyle}><span style={badgeStyle(h.statut)}>{h.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Create modal */}
        {showCreate && (
          <div style={modalOverlay} onClick={() => setShowCreate(false)}>
            <div style={modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={modalHeader}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>Créer une intervention</h3>
                <button style={btnGhostSm} onClick={() => setShowCreate(false)}><X size={14} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                <select style={inputStyle} value={form.id_machine} onChange={(e) => setForm({ ...form, id_machine: e.target.value })}>
                  <option value="">Machine…</option>
                  {machines.map(m => <option key={m.id_machine || m.id} value={m.id_machine || m.id}>{m.nom || m.numero || m.reference}</option>)}
                </select>
                <select style={inputStyle} value={form.type_intervention} onChange={(e) => setForm({ ...form, type_intervention: e.target.value })}>
                  {TYPES_INTERVENTION.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select style={inputStyle} value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })}>
                  {PRIORITES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <select style={inputStyle} value={form.assigne_a} onChange={(e) => setForm({ ...form, assigne_a: e.target.value })}>
                  <option value="">Assigner à (facultatif)…</option>
                  {operateurs.map(u => <option key={u.id_utilisateur || u.id} value={u.id_utilisateur || u.id}>{u.prenom} {u.nom}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 'var(--s-2)', justifyContent: 'flex-end' }}>
                  <button style={btnGhostSm} onClick={() => setShowCreate(false)}>Annuler</button>
                  <button style={btnPrimary} onClick={submitCreate}>Créer</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
};

const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--accent-terracotta)', color: '#fff', border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer' };
const btnGhostSm: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--bg-hover)', color: 'var(--fg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' };
const inputStyle: React.CSSProperties = { padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3)', color: 'var(--fg-primary)' };
const modalOverlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox: React.CSSProperties = { background: 'var(--bg-elevated)', padding: 'var(--s-5)', borderRadius: 'var(--radius-md)', width: 'min(520px, 92vw)', border: '1px solid var(--border-default)', maxHeight: '90vh', overflowY: 'auto' };
const modalHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' };
const badgeStyle = (v: string): React.CSSProperties => {
  const map: Record<string, string> = {
    EN_ATTENTE: 'var(--accent-gold)', ASSIGNEE: 'var(--accent-indigo)', EN_COURS: 'var(--accent-terracotta)',
    TERMINEE: 'var(--accent-sage)', CLOTUREE: 'var(--fg-muted)', ANNULEE: 'var(--fg-muted)',
    URGENTE: 'var(--accent-terracotta)', HAUTE: 'var(--accent-gold)', NORMALE: 'var(--accent-indigo)', BASSE: 'var(--fg-muted)',
  };
  const c = map[v] || 'var(--fg-muted)';
  return { padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${c}22`, color: c, fontSize: '11px', fontWeight: 600 };
};

export default Maintenance;
