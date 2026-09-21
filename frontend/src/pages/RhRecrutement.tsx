import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserPlus, Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { hrRecruitmentService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data?.items || x?.data?.data || x?.data || x?.items || []);

const RhRecrutement: React.FC = () => {
  useAuth();
  const [stages, setStages] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectMotif, setRejectMotif] = useState('');
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', poste_vise: '', cv_url: '', notes: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [stagesRes, applicantsRes] = await Promise.all([
        hrRecruitmentService.getStages(),
        hrRecruitmentService.getApplicants(),
      ]);
      const stagesData = asArray(stagesRes.data);
      setStages(stagesData.length ? stagesData : [
        { id_stage: 1, nom: 'Nouveau' }, { id_stage: 2, nom: 'Entretien' },
        { id_stage: 3, nom: 'Test' }, { id_stage: 4, nom: 'Offre' },
        { id_stage: 5, nom: 'Accepté' }, { id_stage: 6, nom: 'Refusé' },
      ]);
      setApplicants(asArray(applicantsRes.data));
    } catch (e) {
      console.error('Erreur chargement RH:', e);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const stats = useMemo(() => ({
    total: applicants.length,
    encours: applicants.filter(a => !['accepte', 'refuse', 'embauche'].includes((a.statut || a.stage_nom || '').toLowerCase())).length,
    embauches: applicants.filter(a => ['embauche', 'accepte'].includes((a.statut || '').toLowerCase()) || (a.stage_nom || '').toLowerCase().includes('accept')).length,
    refuses: applicants.filter(a => (a.statut || '').toLowerCase().includes('refus') || (a.stage_nom || '').toLowerCase().includes('refus')).length,
  }), [applicants]);

  const moveStage = async (app: any, direction: 1 | -1) => {
    const currentIdx = stages.findIndex(s => (s.id_stage ?? s.id) === (app.id_stage ?? app.stage_id));
    const target = stages[currentIdx + direction];
    if (!target) return;
    try {
      await hrRecruitmentService.updateApplicant(app.id_candidature || app.id, { id_stage: target.id_stage ?? target.id });
      load();
    } catch (e) { console.error(e); }
  };

  const doHire = async (app: any) => {
    if (!window.confirm(`Embaucher ${app.prenom || ''} ${app.nom || ''} ?`)) return;
    try { await hrRecruitmentService.hireApplicant(app.id_candidature || app.id); load(); }
    catch (e) { console.error(e); }
  };

  const doReject = async () => {
    if (!rejectModal) return;
    try {
      await hrRecruitmentService.rejectApplicant(rejectModal.id_candidature || rejectModal.id, { motif: rejectMotif });
      setRejectModal(null);
      setRejectMotif('');
      load();
    } catch (e) {
      // fallback if backend uses /refuse
      try {
        await hrRecruitmentService.refuseApplicant(rejectModal.id_candidature || rejectModal.id, { motif: rejectMotif });
        setRejectModal(null); setRejectMotif(''); load();
      } catch (e2) { console.error(e2); }
    }
  };

  const submitCandidature = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await hrRecruitmentService.createApplicant(form);
      setShowModal(false);
      setForm({ nom: '', prenom: '', email: '', telephone: '', poste_vise: '', cv_url: '', notes: '' });
      load();
    } catch (err: any) {
      alert('Erreur: ' + (err.response?.data?.message || err.message));
    }
  };

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  };
  const btnPrimary: React.CSSProperties = {
    ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)',
  };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', width: '100%',
  };

  return (
    <DashboardLayout title="Recrutement RH" activeSection="rh-recrutement" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Ressources humaines"
        title="Recrutement RH"
        subtitle="Pipeline de candidatures — vue Kanban par étape."
        headerRight={
          <>
            <button onClick={load} style={btnGhost}><RefreshCw size={14} /> Actualiser</button>
            <button onClick={() => setShowModal(true)} style={btnPrimary}><UserPlus size={14} /> Nouvelle candidature</button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Total candidatures" value={String(stats.total)} icon={<Users size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="En cours" value={String(stats.encours)} icon={<UserPlus size={18} />} tone="gold" loading={loading} />
          <KpiCard label="Embauchés" value={String(stats.embauches)} icon={<CheckCircle2 size={18} />} tone="sage" loading={loading} />
          <KpiCard label="Refusés" value={String(stats.refuses)} icon={<XCircle size={18} />} tone="rose" loading={loading} />
        </div>

        <SectionCard title="Pipeline Kanban" subtitle="Déplacez les candidats entre étapes" icon={<Users size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(stages.length, 1)}, minmax(220px, 1fr))`, gap: 12, overflowX: 'auto' }}>
            {stages.map((stage) => {
              const stageId = stage.id_stage ?? stage.id;
              const inStage = applicants.filter(a => (a.id_stage ?? a.stage_id) === stageId);
              return (
                <div key={stageId} style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 10, minHeight: 320 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong style={{ color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{stage.nom || stage.name}</strong>
                    <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{inStage.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {inStage.map((a: any) => (
                      <div key={a.id_candidature || a.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', fontWeight: 600 }}>
                          {a.prenom || ''} {a.nom || ''}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 6 }}>
                          {a.poste_vise || '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--fg-muted)', marginBottom: 8 }}>
                          {a.date_candidature ? new Date(a.date_candidature).toLocaleDateString('fr-FR') : ''}
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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

        {showModal && (
          <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <form onClick={(e) => e.stopPropagation()} onSubmit={submitCandidature}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxWidth: 520, width: '100%', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Nouvelle candidature</h3>
                <button type="button" onClick={() => setShowModal(false)} style={btnGhost}><X size={14} /></button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input placeholder="Prénom" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} style={inputStyle} required />
                <input placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={inputStyle} required />
                <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                <input placeholder="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} style={inputStyle} />
                <input placeholder="Poste visé" value={form.poste_vise} onChange={(e) => setForm({ ...form, poste_vise: e.target.value })} style={{ ...inputStyle, gridColumn: 'span 2' }} required />
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
          <div onClick={() => setRejectModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
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
