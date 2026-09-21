import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  UserPlus, Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  RefreshCw, X, Clock, TrendingUp, Star, Filter, Calendar,
  FileText, Phone, Mail, Video, MessageSquare,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { hrRecruitmentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data?.items || x?.data?.data || x?.data || x?.items || []);
const asObj = (x: any): any =>
  (x?.data?.data && typeof x.data.data === 'object' && !Array.isArray(x.data.data)) ? x.data.data
  : (x?.data && typeof x.data === 'object' && !Array.isArray(x.data)) ? (x.data.data && !Array.isArray(x.data.data) ? x.data.data : x.data)
  : x || {};

const FUNNEL_COLORS = ['#B84A2F', '#C89B3C', '#7A8C6A', '#4A5D75', '#B57B7B'];
const PIE_COLORS = ['#B84A2F', '#C89B3C', '#7A8C6A', '#4A5D75', '#B57B7B', '#6B8E4E'];

const SOURCES = [
  { value: 'site_web',  label: 'Site web' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'referral',  label: 'Cooptation' },
  { value: 'jobboard',  label: 'Job board' },
  { value: 'walkin',    label: 'Spontanée' },
];

const eventTypeMeta: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  stage_change: { color: '#4A5D75', icon: <TrendingUp size={12} />,   label: 'Changement d\'étape' },
  note:         { color: '#C89B3C', icon: <MessageSquare size={12} />,label: 'Note' },
  interview:    { color: '#7A8C6A', icon: <Calendar size={12} />,     label: 'Entretien' },
  call:         { color: '#B57B7B', icon: <Phone size={12} />,        label: 'Appel' },
  email:        { color: '#B57B7B', icon: <Mail size={12} />,         label: 'Email' },
  hire:         { color: '#6B8E4E', icon: <CheckCircle2 size={12} />, label: 'Embauche' },
  reject:       { color: '#B84A2F', icon: <XCircle size={12} />,      label: 'Refus' },
};

const RhRecrutement: React.FC = () => {
  useAuth();
  const [tab, setTab] = useState<'kanban' | 'analytics'>('kanban');
  const [stages, setStages] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [funnel, setFunnel] = useState<any[]>([]);
  const [funnelDays, setFunnelDays] = useState(90);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [postes, setPostes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [detailApp, setDetailApp] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [noteText, setNoteText] = useState('');
  const [interview, setInterview] = useState({ date: '', type: 'phone', interviewer: '', notes: '' });

  const [form, setForm] = useState<any>({
    nom: '', prenom: '', email: '', telephone: '', poste_vise: '',
    cv_url: '', notes: '', source_candidature: '', niveau_etudes: '',
    experience_annees: '', pretention_salariale: '', disponibilite: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stagesRes, applicantsRes, statsRes, funnelRes, analyticsRes, postesRes] = await Promise.all([
        hrRecruitmentService.getStages(),
        hrRecruitmentService.getApplicants(),
        hrRecruitmentService.getStats().catch(() => ({ data: {} })),
        hrRecruitmentService.getFunnel(funnelDays).catch(() => ({ data: [] })),
        hrRecruitmentService.getAnalytics().catch(() => ({ data: [] })),
        hrRecruitmentService.getPostes().catch(() => ({ data: [] })),
      ]);
      const stagesData = asArray(stagesRes.data);
      setStages(stagesData.length ? stagesData : [
        { id_stage: 1, id: 1, libelle: 'Nouveau',   code: 'nouveau',   couleur: '#4A5D75' },
        { id_stage: 2, id: 2, libelle: 'Entretien', code: 'entretien', couleur: '#C89B3C' },
        { id_stage: 3, id: 3, libelle: 'Test',      code: 'test',      couleur: '#7A8C6A' },
        { id_stage: 4, id: 4, libelle: 'Offre',     code: 'offre',     couleur: '#B57B7B' },
        { id_stage: 5, id: 5, libelle: 'Accepté',   code: 'accepte',   couleur: '#6B8E4E' },
        { id_stage: 6, id: 6, libelle: 'Refusé',    code: 'refuse',    couleur: '#B84A2F' },
      ]);
      setApplicants(asArray(applicantsRes.data));
      setStats(asObj(statsRes) || {});
      setFunnel(asArray(funnelRes.data));
      setAnalytics(asArray(analyticsRes.data));
      setPostes(asArray(postesRes.data));
    } catch (e) {
      console.error('Erreur chargement RH:', e);
    } finally {
      setLoading(false);
    }
  }, [funnelDays]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const url = process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://fabrication.laplume-artisanale.tn' : 'http://localhost:5000');
    const socket: Socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('recruitment:created', load);
    socket.on('recruitment:updated', load);
    return () => { socket.close(); };
  }, [load]);

  const localStats = useMemo(() => ({
    total: stats.total_candidatures ?? applicants.length,
    encours: stats.en_cours ?? applicants.filter(a => !['accepte', 'refuse', 'embauche'].includes((a.statut || '').toLowerCase())).length,
    embauches: stats.embauches ?? applicants.filter(a => ['embauche', 'accepte'].includes((a.statut || '').toLowerCase())).length,
    refuses: stats.refuses ?? applicants.filter(a => (a.statut || '').toLowerCase().includes('refus')).length,
    taux: stats.taux_conversion ?? 0,
    temps: stats.temps_moyen_process ?? 0,
  }), [stats, applicants]);

  const stageIdOf = (o: any) => o?.id_stage ?? o?.id;
  const applicantId = (a: any) => a.id_applicant || a.id_candidature || a.id;

  const moveStage = async (app: any, direction: 1 | -1) => {
    const currentIdx = stages.findIndex(s => stageIdOf(s) === (app.id_stage ?? app.stage_id));
    const target = stages[currentIdx + direction];
    if (!target) return;
    try {
      await hrRecruitmentService.updateApplicant(applicantId(app), { id_stage: stageIdOf(target) });
      load();
    } catch (e) { console.error(e); }
  };

  const moveToStage = async (app: any, targetStageId: number) => {
    if ((app.id_stage ?? app.stage_id) === targetStageId) return;
    try {
      await hrRecruitmentService.updateApplicant(applicantId(app), { id_stage: targetStageId });
      load();
    } catch (e) { console.error(e); }
  };

  const doHire = async (app: any) => {
    if (!window.confirm(`Embaucher ${app.prenom || ''} ${app.nom || ''} ?`)) return;
    try { await hrRecruitmentService.hireApplicant(applicantId(app)); load(); if (detailApp) setDetailApp(null); }
    catch (e) { console.error(e); }
  };

  const doReject = async () => {
    if (!rejectModal) return;
    const id = applicantId(rejectModal);
    try {
      await hrRecruitmentService.rejectApplicant(id, { motif: rejectMotif });
    } catch {
      try { await hrRecruitmentService.refuseApplicant(id, { motif: rejectMotif }); } catch (e2) { console.error(e2); }
    }
    setRejectModal(null); setRejectMotif(''); if (detailApp) setDetailApp(null); load();
  };

  const openDetail = async (a: any) => {
    setDetailApp(a);
    setTimeline([]);
    try {
      const r = await hrRecruitmentService.getTimeline(applicantId(a));
      setTimeline(asArray(r.data));
    } catch {}
  };

  const addNote = async () => {
    if (!detailApp || !noteText.trim()) return;
    try {
      await hrRecruitmentService.addNote(applicantId(detailApp), noteText);
      setNoteText('');
      const r = await hrRecruitmentService.getTimeline(applicantId(detailApp));
      setTimeline(asArray(r.data));
    } catch (e) { console.error(e); }
  };

  const scheduleInterview = async () => {
    if (!detailApp || !interview.date) return;
    try {
      await hrRecruitmentService.scheduleInterview(applicantId(detailApp), interview);
      setInterview({ date: '', type: 'phone', interviewer: '', notes: '' });
      const r = await hrRecruitmentService.getTimeline(applicantId(detailApp));
      setTimeline(asArray(r.data));
    } catch (e) { console.error(e); }
  };

  const setEvaluation = async (score: number) => {
    if (!detailApp) return;
    try {
      await hrRecruitmentService.updateApplicant(applicantId(detailApp), { score_evaluation: score });
      setDetailApp({ ...detailApp, score_evaluation: score });
      load();
    } catch (e) { console.error(e); }
  };

  const submitCandidature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Email invalide'); return;
    }
    try {
      const payload = { ...form,
        experience_annees: form.experience_annees ? Number(form.experience_annees) : null,
        pretention_salariale: form.pretention_salariale ? Number(form.pretention_salariale) : null,
      };
      await hrRecruitmentService.createApplicant(payload);
      setShowModal(false);
      setForm({ nom: '', prenom: '', email: '', telephone: '', poste_vise: '',
        cv_url: '', notes: '', source_candidature: '', niveau_etudes: '',
        experience_annees: '', pretention_salariale: '', disponibilite: '' });
      load();
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  // Sources aggregation
  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    applicants.forEach(a => {
      const s = a.source_candidature || 'inconnu';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [applicants]);

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  };
  const btnPrimary: React.CSSProperties = { ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)' };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', width: '100%',
  };

  const StarRow: React.FC<{ score: number; onSet?: (n: number) => void; size?: number }> = ({ score, onSet, size = 12 }) => (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n} size={size}
          fill={n <= (score || 0) ? '#C89B3C' : 'transparent'}
          color={n <= (score || 0) ? '#C89B3C' : 'var(--fg-muted)'}
          style={{ cursor: onSet ? 'pointer' : 'default' }}
          onClick={() => onSet && onSet(n)}
        />
      ))}
    </div>
  );

  return (
    <DashboardLayout title="Recrutement RH" activeSection="rh-recrutement" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Ressources humaines"
        title="Recrutement RH"
        subtitle="Pipeline candidatures, entretiens, analytics."
        headerRight={
          <>
            <button onClick={load} style={btnGhost}><RefreshCw size={14} /> Actualiser</button>
            <button onClick={() => setShowModal(true)} style={btnPrimary}><UserPlus size={14} /> Nouvelle candidature</button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Total candidatures" value={String(localStats.total)} icon={<Users size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="En cours" value={String(localStats.encours)} icon={<UserPlus size={18} />} tone="gold" loading={loading} />
          <KpiCard label="Embauchés" value={String(localStats.embauches)} icon={<CheckCircle2 size={18} />} tone="sage" loading={loading} />
          <KpiCard label="Taux conversion" value={`${localStats.taux}%`} icon={<TrendingUp size={18} />} tone="indigo" loading={loading} />
          <KpiCard label="Temps moyen (j)" value={String(localStats.temps)} icon={<Clock size={18} />} tone="rose" loading={loading} />
        </div>

        {/* Funnel */}
        <SectionCard
          title="Funnel entretiens"
          subtitle="Progression des candidats par étape"
          icon={<TrendingUp size={16} />}
          headerRight={
            <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <Filter size={12} style={{ color: 'var(--fg-muted)' }} />
              {[30, 90, 365].map(d => (
                <button key={d} onClick={() => setFunnelDays(d)}
                  style={{ ...btnGhost, padding: '4px 10px', fontSize: 11,
                    background: funnelDays === d ? 'var(--accent-terracotta)' : 'var(--bg-hover)',
                    color: funnelDays === d ? '#fff' : 'var(--fg-secondary)',
                    borderColor: funnelDays === d ? 'var(--accent-terracotta)' : 'var(--border-subtle)' }}>
                  {d === 30 ? '30j' : d === 90 ? '90j' : '12 mois'}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" stroke="var(--fg-muted)" fontSize={11} />
                <YAxis dataKey="stage_libelle" type="category" stroke="var(--fg-muted)" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: 12 }}
                  formatter={(v: any, _n: any, o: any) => [`${v} candidats (drop ${o.payload.dropoff_pct}%)`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {funnel.map((_, i) => (
                    <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 8 }}>
          {(['kanban', 'analytics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...btnGhost,
                background: tab === t ? 'var(--accent-terracotta)' : 'var(--bg-hover)',
                color: tab === t ? '#fff' : 'var(--fg-secondary)',
                borderColor: tab === t ? 'var(--accent-terracotta)' : 'var(--border-subtle)' }}>
              {t === 'kanban' ? 'Pipeline Kanban' : 'Analytics'}
            </button>
          ))}
        </div>

        {tab === 'kanban' && (
          <SectionCard title="Pipeline Kanban" subtitle="Drag & drop entre étapes" icon={<Users size={16} />}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(stages.length, 1)}, minmax(220px, 1fr))`, gap: 12, overflowX: 'auto' }}>
              {stages.map((stage) => {
                const stageId = stageIdOf(stage);
                const inStage = applicants.filter(a => (a.id_stage ?? a.stage_id) === stageId);
                const color = stage.couleur || '#4A5D75';
                return (
                  <div
                    key={stageId}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData('applicant-id');
                      const app = applicants.find(a => String(applicantId(a)) === id);
                      if (app) moveToStage(app, stageId);
                    }}
                    style={{ background: 'var(--bg-hover)', border: `1px solid var(--border-subtle)`, borderTop: `3px solid ${color}`, borderRadius: 'var(--radius-sm)', padding: 10, minHeight: 320 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <strong style={{ color, fontSize: 'var(--text-sm)' }}>{stage.libelle || stage.nom || stage.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--fg-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 12 }}>{inStage.length}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {inStage.map((a: any) => (
                        <div
                          key={applicantId(a)}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('applicant-id', String(applicantId(a)))}
                          onClick={() => openDetail(a)}
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 10, cursor: 'pointer' }}
                        >
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', fontWeight: 600 }}>
                            {a.prenom || ''} {a.nom || ''}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 4 }}>{a.poste_vise || '—'}</div>
                          {a.score_evaluation ? <div style={{ marginBottom: 4 }}><StarRow score={a.score_evaluation} /></div> : null}
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                            {a.source_candidature && (
                              <span style={{ fontSize: 9, background: 'var(--bg-hover)', color: 'var(--fg-secondary)', padding: '1px 6px', borderRadius: 10 }}>
                                {SOURCES.find(s => s.value === a.source_candidature)?.label || a.source_candidature}
                              </span>
                            )}
                            {a.disponibilite && (
                              <span style={{ fontSize: 9, background: 'var(--bg-hover)', color: 'var(--fg-secondary)', padding: '1px 6px', borderRadius: 10 }}>
                                {a.disponibilite}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginBottom: 6 }}>
                            {a.date_candidature ? new Date(a.date_candidature).toLocaleDateString('fr-FR') : ''}
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => moveStage(a, -1)} style={{ ...btnGhost, padding: '3px 6px', fontSize: 10 }} title="Précédent"><ChevronLeft size={12} /></button>
                            <button onClick={() => moveStage(a, 1)} style={{ ...btnGhost, padding: '3px 6px', fontSize: 10 }} title="Suivant"><ChevronRight size={12} /></button>
                            <button onClick={() => doHire(a)} style={{ ...btnGhost, padding: '3px 8px', fontSize: 10, color: 'var(--accent-sage)' }}>Embaucher</button>
                            <button onClick={() => setRejectModal(a)} style={{ ...btnGhost, padding: '3px 8px', fontSize: 10, color: 'var(--accent-rose, tomato)' }}>Refuser</button>
                          </div>
                        </div>
                      ))}
                      {inStage.length === 0 && (
                        <div style={{ padding: 12, textAlign: 'center', fontSize: 11, color: 'var(--fg-muted)' }}>Vide</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {tab === 'analytics' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <SectionCard title="Candidatures par mois (12m)" icon={<TrendingUp size={16} />}>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="mois" stroke="var(--fg-muted)" fontSize={11} />
                      <YAxis stroke="var(--fg-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="candidatures" stroke="#B84A2F" strokeWidth={2} />
                      <Line type="monotone" dataKey="embauches" stroke="#6B8E4E" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Sources" icon={<Filter size={16} />}>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={sourceData} dataKey="value" nameKey="name" outerRadius={90} label>
                        {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Taux de conversion par étape" icon={<TrendingUp size={16} />}>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={funnel}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis dataKey="stage_libelle" stroke="var(--fg-muted)" fontSize={11} />
                      <YAxis stroke="var(--fg-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#4A5D75" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard title="Top 5 postes recherchés" icon={<Users size={16} />}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--fg-muted)', textAlign: 'left' }}>
                      <th style={{ padding: 8 }}>Poste</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>Candidatures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postes.slice(0, 5).map((p, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: 8, color: 'var(--fg-primary)' }}>{p.poste_vise}</td>
                        <td style={{ padding: 8, textAlign: 'right', color: 'var(--fg-secondary)' }}>{p.count}</td>
                      </tr>
                    ))}
                    {postes.length === 0 && (
                      <tr><td colSpan={2} style={{ padding: 12, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune donnée</td></tr>
                    )}
                  </tbody>
                </table>
              </SectionCard>
            </div>
          </>
        )}

        {/* Detail Drawer */}
        {detailApp && (
          <div onClick={() => setDetailApp(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: 480, maxWidth: '100vw', height: '100vh', overflow: 'auto', background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-default)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>{detailApp.prenom} {detailApp.nom}</h3>
                  <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{detailApp.poste_vise}</div>
                  <span style={{ display: 'inline-block', marginTop: 4, fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-hover)', color: 'var(--fg-secondary)' }}>{detailApp.statut || 'nouveau'}</span>
                </div>
                <button onClick={() => setDetailApp(null)} style={btnGhost}><X size={14} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16, fontSize: 12 }}>
                <div><Mail size={11} /> {detailApp.email || '—'}</div>
                <div><Phone size={11} /> {detailApp.telephone || '—'}</div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 4 }}>Évaluation</div>
                <StarRow score={detailApp.score_evaluation || 0} onSet={setEvaluation} size={20} />
              </div>

              {/* Timeline */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 8 }}>Historique</div>
                <div style={{ borderLeft: '2px solid var(--border-subtle)', paddingLeft: 12 }}>
                  {timeline.length === 0 && <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>Aucun événement</div>}
                  {timeline.map((ev: any) => {
                    const meta = eventTypeMeta[ev.event_type] || { color: '#888', icon: <FileText size={12} />, label: ev.event_type };
                    return (
                      <div key={ev.id_event} style={{ position: 'relative', marginBottom: 12 }}>
                        <div style={{ position: 'absolute', left: -18, top: 2, width: 12, height: 12, borderRadius: '50%', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          {meta.icon}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-primary)', fontWeight: 600 }}>{meta.label}</div>
                        {ev.event_type === 'stage_change' && (
                          <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>{ev.from_stage_libelle || ev.from_stage} → {ev.to_stage_libelle || ev.to_stage}</div>
                        )}
                        {ev.event_type === 'interview' && (
                          <div style={{ fontSize: 11, color: 'var(--fg-secondary)' }}>
                            {ev.interview_type === 'video' ? <Video size={11} /> : ev.interview_type === 'phone' ? <Phone size={11} /> : <Calendar size={11} />}{' '}
                            {ev.interview_date ? new Date(ev.interview_date).toLocaleString('fr-FR') : ''} {ev.interviewer ? `— ${ev.interviewer}` : ''}
                          </div>
                        )}
                        {ev.notes && <div style={{ fontSize: 11, color: 'var(--fg-secondary)', marginTop: 2 }}>{ev.notes}</div>}
                        <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>{ev.created_at ? new Date(ev.created_at).toLocaleString('fr-FR') : ''}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add note */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 6 }}>Ajouter une note</div>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Écrire une note..." />
                <button onClick={addNote} style={{ ...btnPrimary, marginTop: 6 }}>Ajouter</button>
              </div>

              {/* Schedule interview */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 6 }}>Planifier un entretien</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="datetime-local" value={interview.date} onChange={(e) => setInterview({ ...interview, date: e.target.value })} style={inputStyle} />
                  <select value={interview.type} onChange={(e) => setInterview({ ...interview, type: e.target.value })} style={inputStyle}>
                    <option value="phone">Téléphone</option>
                    <option value="onsite">Sur site</option>
                    <option value="video">Visio</option>
                  </select>
                  <input placeholder="Interviewer" value={interview.interviewer} onChange={(e) => setInterview({ ...interview, interviewer: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                  <textarea placeholder="Notes" value={interview.notes} onChange={(e) => setInterview({ ...interview, notes: e.target.value })} rows={2} style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' }} />
                </div>
                <button onClick={scheduleInterview} style={{ ...btnPrimary, marginTop: 6 }}>Planifier</button>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                <button onClick={() => moveStage(detailApp, -1)} style={btnGhost}><ChevronLeft size={12} /> Précédent</button>
                <button onClick={() => moveStage(detailApp, 1)} style={btnGhost}>Suivant <ChevronRight size={12} /></button>
                <button onClick={() => doHire(detailApp)} style={{ ...btnGhost, color: 'var(--accent-sage)' }}>Embaucher</button>
                <button onClick={() => setRejectModal(detailApp)} style={{ ...btnGhost, color: 'var(--accent-rose, tomato)' }}>Refuser</button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitCandidature}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxWidth: 640, width: '100%', padding: 24, maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Nouvelle candidature</h3>
                <button type="button" onClick={() => setShowModal(false)} style={btnGhost}><X size={14} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input placeholder="Prénom *" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} style={inputStyle} required />
                <input placeholder="Nom *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={inputStyle} required />
                <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} required />
                <input placeholder="Téléphone *" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} style={inputStyle} required />
                <input placeholder="Poste visé *" value={form.poste_vise} onChange={(e) => setForm({ ...form, poste_vise: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} required />
                <select value={form.source_candidature} onChange={(e) => setForm({ ...form, source_candidature: e.target.value })} style={inputStyle}>
                  <option value="">Source…</option>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <input placeholder="Niveau d'études" value={form.niveau_etudes} onChange={(e) => setForm({ ...form, niveau_etudes: e.target.value })} style={inputStyle} />
                <input type="number" placeholder="Expérience (années)" value={form.experience_annees} onChange={(e) => setForm({ ...form, experience_annees: e.target.value })} style={inputStyle} />
                <input type="number" step="0.001" placeholder="Prétention salariale" value={form.pretention_salariale} onChange={(e) => setForm({ ...form, pretention_salariale: e.target.value })} style={inputStyle} />
                <input placeholder="Disponibilité (ex: immédiate)" value={form.disponibilite} onChange={(e) => setForm({ ...form, disponibilite: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                <input placeholder="URL CV" value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, gridColumn: 'span 2', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={() => setShowModal(false)} style={btnGhost}>Annuler</button>
                <button type="submit" style={btnPrimary}>Enregistrer</button>
              </div>
            </form>
          </div>
        )}

        {rejectModal && (
          <div onClick={() => setRejectModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 20 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxWidth: 420, width: '100%', padding: 24 }}>
              <h3 style={{ margin: 0, color: 'var(--fg-primary)', marginBottom: 12 }}>Refuser la candidature</h3>
              <textarea placeholder="Motif du refus" value={rejectMotif} onChange={(e) => setRejectMotif(e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button onClick={() => setRejectModal(null)} style={btnGhost}>Annuler</button>
                <button onClick={doReject} style={{ ...btnPrimary, background: 'var(--accent-rose, tomato)', borderColor: 'var(--accent-rose, tomato)' }}>Confirmer refus</button>
              </div>
            </div>
          </div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
};

export default RhRecrutement;
