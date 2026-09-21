import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Factory, Play, CheckCircle, AlertTriangle, Activity, TrendingUp, Wrench } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

const toArr = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data || x?.items || x?.taches || x?.rows || []);

const TabletteTisseur: React.FC = () => {
  const { user } = useAuth();
  const operateurId = user?.id;

  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState<any[]>([]);
  const [suivi, setSuivi] = useState<any>({ pieces: 0, rendement: 0, trs: 0 });
  const [ofCourant, setOfCourant] = useState<any>(null);
  const [machineId, setMachineId] = useState<number | null>(null);
  const [quantite, setQuantite] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!operateurId) return;
    try {
      const [tachesRes, suiviRes] = await Promise.all([
        api.get(`/taches/operateur/${operateurId}/day`),
        api.get(`/suivi-fabrication/operateur/${operateurId}/day`),
      ]);
      const tachesData = toArr(tachesRes.data?.data ?? tachesRes.data);
      setTaches(tachesData);
      const enCours = tachesData.find((t: any) => t.statut === 'EN_COURS');
      setOfCourant(enCours || tachesData[0] || null);
      if (enCours?.id_machine) setMachineId(enCours.id_machine);

      const s = suiviRes.data?.data ?? suiviRes.data ?? {};
      setSuivi({
        pieces: s.pieces_realisees ?? s.total_pieces ?? 0,
        rendement: s.rendement ?? s.taux_rendement ?? 0,
        trs: s.trs ?? s.taux_trs ?? 0,
      });
    } catch (err) {
      console.error('Erreur chargement tisseur:', err);
    } finally {
      setLoading(false);
    }
  }, [operateurId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !operateurId) return;
    const socket: Socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
    const refresh = () => loadData();
    socket.on('tache:new', refresh);
    socket.on('tache:completed', refresh);
    socket.on('production:updated', refresh);
    socket.on('machine:status', refresh);
    return () => { socket.disconnect(); };
  }, [operateurId, loadData]);

  const handleDemarrer = async (id: number) => {
    try { await api.put(`/taches/${id}/demarrer`); loadData(); }
    catch { alert('Erreur démarrage'); }
  };

  const handleDeclarerProduction = async () => {
    if (!ofCourant || !quantite) return;
    setSaving(true);
    try {
      await api.post('/suivi-fabrication', {
        id_of: ofCourant.id_of,
        id_operateur: operateurId,
        id_machine: machineId,
        quantite_produite: parseInt(quantite, 10) || 0,
      });
      setQuantite('');
      loadData();
    } catch { alert('Erreur déclaration production'); }
    finally { setSaving(false); }
  };

  const handleTerminer = async () => {
    if (!ofCourant) return;
    if (!window.confirm(`Terminer la tâche ${ofCourant.numero_of || ofCourant.id_tache} ?`)) return;
    try {
      await api.put(`/taches/${ofCourant.id_tache}/terminer`, {
        quantite_realisee: parseInt(quantite, 10) || ofCourant.quantite_realisee || 0,
      });
      setQuantite('');
      loadData();
    } catch { alert('Erreur finalisation'); }
  };

  const handleIncident = async (statut: 'PANNE' | 'OPERATIONNELLE') => {
    if (!machineId) { alert('Aucune machine associée'); return; }
    try {
      await api.put(`/machines/${machineId}/statut`, { statut });
      loadData();
    } catch { alert('Erreur changement statut machine'); }
  };

  const tachesSuivantes = taches.filter((t: any) => t.statut !== 'EN_COURS' && t.statut !== 'TERMINEE').slice(0, 5);

  return (
    <DashboardLayout title="Tablette Tisseur" activeSection="tablette" onSectionChange={() => {}}>
      {loading ? <LoadingSpinner message="Chargement du poste tisseur..." /> : (
        <DashboardShell
          eyebrow="Poste tissage"
          title={`Bienvenue ${user?.prenom || ''} ${user?.nom || ''}`}
          subtitle="Suivi en temps réel de votre production et de votre machine."
          headerRight={<ThemeToggle />}
        >
          <div className="lp-metric-grid">
            <KpiCard label="Pièces produites" value={suivi.pieces} icon={<Factory size={18} />} tone="terracotta" hint="Aujourd'hui" />
            <KpiCard label="Rendement" value={`${Number(suivi.rendement || 0).toFixed(0)}%`} icon={<TrendingUp size={18} />} tone="sage" />
            <KpiCard label="TRS" value={`${Number(suivi.trs || 0).toFixed(0)}%`} icon={<Activity size={18} />} tone="indigo" />
            <KpiCard label="Tâches du jour" value={taches.length} icon={<CheckCircle size={18} />} tone="gold" />
          </div>

          <SectionCard title="OF en cours" subtitle={ofCourant ? `OF ${ofCourant.numero_of || '-'}` : 'Aucune tâche active'} icon={<Factory size={16} />}>
            {ofCourant ? (
              <div style={{ display: 'grid', gap: 'var(--s-4)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--s-3)' }}>
                  <InfoBox label="OF" value={ofCourant.numero_of || `#${ofCourant.id_of}`} />
                  <InfoBox label="Article" value={ofCourant.article_designation || ofCourant.designation || '—'} />
                  <InfoBox label="Machine" value={ofCourant.numero_machine || (machineId ? `#${machineId}` : '—')} />
                  <InfoBox label="Quantité" value={`${ofCourant.quantite_realisee || 0} / ${ofCourant.quantite_demandee || 0}`} />
                </div>
                <div>
                  <label style={labelStyle}>Quantité produite (à déclarer)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={quantite}
                    onChange={(e) => setQuantite(e.target.value)}
                    style={bigInputStyle}
                    placeholder="0"
                  />
                </div>
                <div style={btnRow}>
                  {ofCourant.statut !== 'EN_COURS' && (
                    <button style={{ ...btnPrimary, background: 'var(--accent-indigo)', borderColor: 'var(--accent-indigo)' }} onClick={() => handleDemarrer(ofCourant.id_tache)}>
                      <Play size={16} /> Démarrer
                    </button>
                  )}
                  <button style={btnPrimary} disabled={saving || !quantite} onClick={handleDeclarerProduction}>
                    <TrendingUp size={16} /> Déclarer production
                  </button>
                  <button style={{ ...btnPrimary, background: 'var(--accent-sage)', borderColor: 'var(--accent-sage)' }} onClick={handleTerminer}>
                    <CheckCircle size={16} /> Terminer
                  </button>
                </div>
                <div style={{ ...btnRow, borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--s-4)' }}>
                  <button style={btnDanger} onClick={() => handleIncident('PANNE')}>
                    <AlertTriangle size={16} /> Signaler panne
                  </button>
                  <button style={btnGhost} onClick={() => handleIncident('OPERATIONNELLE')}>
                    <Wrench size={16} /> Machine OK
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--s-6)', color: 'var(--fg-muted)' }}>Aucune tâche en cours.</div>
            )}
          </SectionCard>

          <SectionCard title="Prochaines tâches" subtitle={`${tachesSuivantes.length} en attente`} icon={<CheckCircle size={16} />}>
            {tachesSuivantes.length === 0 ? (
              <div style={{ padding: 'var(--s-4)', color: 'var(--fg-muted)' }}>Aucune tâche à venir.</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                {tachesSuivantes.map((t: any) => (
                  <div key={t.id_tache} style={rowCard}>
                    <div>
                      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{t.numero_of || `#${t.id_of}`}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                        {t.article_designation || t.type_tache} · Qté {t.quantite_demandee}
                      </div>
                    </div>
                    {t.statut === 'ASSIGNEE' && (
                      <button style={btnPrimary} onClick={() => handleDemarrer(t.id_tache)}>
                        <Play size={14} /> Démarrer
                      </button>
                    )}
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

// Shared inline styles (tablet-optimized: min 48px touch targets, min text-md)
const InfoBox: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ padding: 'var(--s-3)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--fg-primary)' }}>{value}</div>
  </div>
);
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8, color: 'var(--fg-secondary)' };
const bigInputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', fontSize: 'var(--text-lg)', border: '2px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', minHeight: 56,
};
const btnRow: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)' };
const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', minHeight: 48,
  borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-md)', fontWeight: 600, cursor: 'pointer', border: '1px solid transparent',
};
const btnPrimary: React.CSSProperties = { ...btnBase, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)' };
const btnDanger: React.CSSProperties = { ...btnBase, background: 'var(--color-danger, #b91c1c)', color: '#fff' };
const btnGhost: React.CSSProperties = { ...btnBase, background: 'var(--bg-hover)', color: 'var(--fg-primary)', borderColor: 'var(--border-default)' };
const rowCard: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-3)',
  padding: 'var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
};

export default TabletteTisseur;
