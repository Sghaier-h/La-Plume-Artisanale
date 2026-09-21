import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, PlusCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

const toArr = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data || x?.items || x?.rows || x?.controles || x?.non_conformites || []);

const TabletteQualite: React.FC = () => {
  const { user } = useAuth();
  const operateurId = user?.id;

  const [loading, setLoading] = useState(true);
  const [controles, setControles] = useState<any[]>([]);
  const [ncs, setNcs] = useState<any[]>([]);
  const [showNcForm, setShowNcForm] = useState(false);
  const [ncForm, setNcForm] = useState({ id_of: '', type_nc: '', gravite: 'MINEUR', description: '' });
  const [showControleForm, setShowControleForm] = useState(false);
  const [controleForm, setControleForm] = useState({ id_of: '', numero_piece: '', conforme: true, observations: '' });

  const loadData = useCallback(async () => {
    try {
      const [ncRes, ctrlRes] = await Promise.all([
        api.get('/qualite-avance/non-conformites', { params: { statut: 'OUVERTE' } }),
        api.get('/qualite-avance/controles', { params: { date: 'today' } }),
      ]);
      setNcs(toArr(ncRes.data?.data ?? ncRes.data));
      setControles(toArr(ctrlRes.data?.data ?? ctrlRes.data));
    } catch (err) { console.error('Erreur chargement qualité:', err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket: Socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
    socket.on('tache:new', loadData);
    socket.on('tache:completed', loadData);
    socket.on('production:updated', loadData);
    return () => { socket.disconnect(); };
  }, [loadData]);

  const handleValider = async (id: number) => {
    try { await api.post(`/qualite-avance/controles/${id}/valider`); loadData(); }
    catch { alert('Erreur validation'); }
  };
  const handleRefuser = async (id: number) => {
    try { await api.post(`/qualite-avance/controles/${id}/refuser`); loadData(); }
    catch { alert('Erreur refus'); }
  };

  const handleCreerControle = async () => {
    try {
      await api.post('/qualite-avance/controles', {
        id_of: parseInt(controleForm.id_of, 10) || null,
        numero_piece: controleForm.numero_piece || '1',
        type_controle: 'PREMIERE_PIECE',
        conforme: controleForm.conforme,
        observations: controleForm.observations,
        id_controleur: operateurId,
      });
      setShowControleForm(false);
      setControleForm({ id_of: '', numero_piece: '', conforme: true, observations: '' });
      loadData();
    } catch { alert('Erreur création contrôle'); }
  };

  const handleCreerNc = async () => {
    try {
      await api.post('/qualite-avance/non-conformites', {
        id_of: parseInt(ncForm.id_of, 10) || null,
        type_nc: ncForm.type_nc,
        gravite: ncForm.gravite,
        description: ncForm.description,
        id_declarant: operateurId,
      });
      setShowNcForm(false);
      setNcForm({ id_of: '', type_nc: '', gravite: 'MINEUR', description: '' });
      loadData();
    } catch { alert('Erreur création NC'); }
  };

  const conformes = controles.filter((c: any) => c.conforme === true || c.statut === 'VALIDE').length;
  const nonConformes = controles.length - conformes;

  return (
    <DashboardLayout title="Tablette Qualité" activeSection="tablette" onSectionChange={() => {}}>
      {loading ? <LoadingSpinner message="Chargement du poste qualité..." /> : (
        <DashboardShell
          eyebrow="Contrôle qualité"
          title={`Bienvenue ${user?.prenom || ''} ${user?.nom || ''}`}
          subtitle="Contrôles première pièce, non-conformités et validation."
          headerRight={<ThemeToggle />}
        >
          <div className="lp-metric-grid">
            <KpiCard label="Contrôles jour" value={controles.length} icon={<ShieldCheck size={18} />} tone="indigo" />
            <KpiCard label="Conformes" value={conformes} icon={<CheckCircle size={18} />} tone="sage" />
            <KpiCard label="Non conformes" value={nonConformes} icon={<XCircle size={18} />} tone="rose" />
            <KpiCard label="NC ouvertes" value={ncs.length} icon={<AlertTriangle size={18} />} tone="terracotta" />
          </div>

          <SectionCard
            title="Contrôles du jour"
            subtitle="Première pièce à valider"
            icon={<ShieldCheck size={16} />}
            actions={<button style={btnGhost} onClick={() => setShowControleForm(v => !v)}><PlusCircle size={14} /> Nouveau contrôle</button>}
          >
            {showControleForm && (
              <div style={formBox}>
                <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                  <div><label style={labelStyle}>ID OF</label><input style={bigInputStyle} value={controleForm.id_of} onChange={e => setControleForm({ ...controleForm, id_of: e.target.value })} /></div>
                  <div><label style={labelStyle}>N° pièce</label><input style={bigInputStyle} value={controleForm.numero_piece} onChange={e => setControleForm({ ...controleForm, numero_piece: e.target.value })} /></div>
                </div>
                <label style={labelStyle}>Observations</label>
                <textarea style={{ ...bigInputStyle, minHeight: 80 }} value={controleForm.observations} onChange={e => setControleForm({ ...controleForm, observations: e.target.value })} />
                <div style={btnRow}>
                  <button style={{ ...btnPrimary, background: controleForm.conforme ? 'var(--accent-sage)' : 'var(--accent-rose)', borderColor: 'transparent' }} onClick={() => setControleForm({ ...controleForm, conforme: !controleForm.conforme })}>
                    {controleForm.conforme ? <><CheckCircle size={16} /> Conforme</> : <><XCircle size={16} /> Non conforme</>}
                  </button>
                  <button style={btnPrimary} onClick={handleCreerControle}>Enregistrer</button>
                </div>
              </div>
            )}
            {controles.length === 0 ? (
              <div style={{ padding: 'var(--s-4)', color: 'var(--fg-muted)' }}>Aucun contrôle enregistré aujourd'hui.</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                {controles.map((c: any) => (
                  <div key={c.id_controle || c.id} style={rowCard}>
                    <div>
                      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>
                        OF {c.numero_of || c.id_of || '—'} · pièce {c.numero_piece || '1'}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                        {c.type_controle || 'PREMIERE_PIECE'} · {c.statut || (c.conforme ? 'CONFORME' : 'NON CONFORME')}
                      </div>
                    </div>
                    {(!c.statut || c.statut === 'EN_ATTENTE') && (
                      <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                        <button style={{ ...btnPrimary, background: 'var(--accent-sage)', borderColor: 'var(--accent-sage)' }} onClick={() => handleValider(c.id_controle || c.id)}>
                          <CheckCircle size={14} /> Valider
                        </button>
                        <button style={{ ...btnPrimary, background: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }} onClick={() => handleRefuser(c.id_controle || c.id)}>
                          <XCircle size={14} /> Refuser
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Non-conformités ouvertes"
            subtitle={`${ncs.length} à traiter`}
            icon={<AlertTriangle size={16} />}
            actions={<button style={btnGhost} onClick={() => setShowNcForm(v => !v)}><PlusCircle size={14} /> Déclarer NC</button>}
          >
            {showNcForm && (
              <div style={formBox}>
                <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))' }}>
                  <div><label style={labelStyle}>ID OF</label><input style={bigInputStyle} value={ncForm.id_of} onChange={e => setNcForm({ ...ncForm, id_of: e.target.value })} /></div>
                  <div><label style={labelStyle}>Type</label><input style={bigInputStyle} value={ncForm.type_nc} onChange={e => setNcForm({ ...ncForm, type_nc: e.target.value })} placeholder="Tissage, coupe, matière..." /></div>
                  <div>
                    <label style={labelStyle}>Gravité</label>
                    <select style={bigInputStyle} value={ncForm.gravite} onChange={e => setNcForm({ ...ncForm, gravite: e.target.value })}>
                      <option>MINEUR</option><option>MAJEUR</option><option>CRITIQUE</option>
                    </select>
                  </div>
                </div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...bigInputStyle, minHeight: 80 }} value={ncForm.description} onChange={e => setNcForm({ ...ncForm, description: e.target.value })} />
                <button style={btnPrimary} onClick={handleCreerNc}><PlusCircle size={16} /> Créer NC</button>
              </div>
            )}
            {ncs.length === 0 ? (
              <div style={{ padding: 'var(--s-4)', color: 'var(--fg-muted)' }}>Aucune non-conformité ouverte.</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                {ncs.map((nc: any) => (
                  <div key={nc.id_nc || nc.id} style={rowCard}>
                    <div>
                      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>
                        OF {nc.numero_of || nc.id_of || '—'} · {nc.type_nc || nc.type || '—'}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                        {nc.gravite || '—'} · {nc.description ? String(nc.description).slice(0, 80) : ''}
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--accent-rose)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 600 }}>{nc.gravite || 'NC'}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </DashboardShell>
      )}
    </DashboardLayout>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8, color: 'var(--fg-secondary)' };
const bigInputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', fontSize: 'var(--text-lg)', border: '2px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', minHeight: 56,
};
const btnRow: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)', marginTop: 'var(--s-3)' };
const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', minHeight: 48,
  borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-md)', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent',
};
const btnPrimary: React.CSSProperties = { ...btnBase, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)' };
const btnGhost: React.CSSProperties = { ...btnBase, background: 'var(--bg-hover)', color: 'var(--fg-primary)', borderColor: 'var(--border-default)', padding: '8px 14px', minHeight: 40, fontSize: 'var(--text-sm)' };
const rowCard: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-3)',
  padding: 'var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
};
const formBox: React.CSSProperties = {
  padding: 'var(--s-4)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-subtle)', marginBottom: 'var(--s-4)', display: 'grid', gap: 'var(--s-3)',
};

export default TabletteQualite;
