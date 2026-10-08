import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Package, AlertTriangle, ArrowRightLeft, PlusCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

const toArr = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data || x?.items || x?.rows || x?.alertes || x?.taches || []);

const TabletteMagasinier: React.FC = () => {
  const { user } = useAuth();
  const operateurId = user?.id;

  const [loading, setLoading] = useState(true);
  const [alertes, setAlertes] = useState<any[]>([]);
  const [taches, setTaches] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [mvt, setMvt] = useState({ id_mp: '', quantite: '', type_mouvement: 'SORTIE', id_entrepot_source: '', id_entrepot_destination: '', motif: '' });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!operateurId) return;
    try {
      const [alertesRes, tachesRes] = await Promise.all([
        api.get('/matieres-premieres/alertes/stock'),
        api.get(`/taches/operateur/${operateurId}/day`),
      ]);
      setAlertes(toArr(alertesRes.data?.data ?? alertesRes.data));
      const tachesData = toArr(tachesRes.data?.data ?? tachesRes.data).filter(
        (t: any) => !t.poste || String(t.poste).toLowerCase().includes('magasin') || String(t.type_tache || '').toLowerCase().includes('prep')
      );
      setTaches(tachesData);
    } catch (err) { console.error('Erreur chargement magasin:', err); }
    finally { setLoading(false); }
  }, [operateurId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !operateurId) return;
    const socket: Socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
    socket.on('tache:new', loadData);
    socket.on('tache:completed', loadData);
    return () => { socket.disconnect(); };
  }, [operateurId, loadData]);

  const handleEnregistrerMvt = async () => {
    if (!mvt.id_mp || !mvt.quantite) { alert('MP et quantité requis'); return; }
    setSaving(true);
    try {
      await api.post('/stock/mouvements', {
        id_mp: parseInt(mvt.id_mp, 10),
        quantite: parseFloat(mvt.quantite),
        type_mouvement: mvt.type_mouvement,
        id_entrepot_source: mvt.id_entrepot_source ? parseInt(mvt.id_entrepot_source, 10) : null,
        id_entrepot_destination: mvt.id_entrepot_destination ? parseInt(mvt.id_entrepot_destination, 10) : null,
        motif: mvt.motif,
        id_operateur: operateurId,
      });
      setMvt({ id_mp: '', quantite: '', type_mouvement: 'SORTIE', id_entrepot_source: '', id_entrepot_destination: '', motif: '' });
      setShowForm(false);
      loadData();
    } catch { alert('Erreur enregistrement mouvement'); }
    finally { setSaving(false); }
  };

  const handleTerminerTache = async (id: number) => {
    try { await api.put(`/taches/${id}/terminer`); loadData(); }
    catch { alert('Erreur finalisation'); }
  };

  const critiques = alertes.filter((a: any) => a.niveau === 'CRITIQUE' || (a.stock_actuel != null && a.stock_min != null && a.stock_actuel <= a.stock_min * 0.5)).length;

  return (
    <>
      {loading ? <LoadingSpinner message="Chargement du poste magasin..." /> : (
        <DashboardShell
          eyebrow="Poste magasin MP"
          title={`Bienvenue ${user?.prenom || ''} ${user?.nom || ''}`}
          subtitle="Alertes stock et transferts de matières premières."
          headerRight={<ThemeToggle />}
        >
          <div className="lp-metric-grid">
            <KpiCard label="Alertes stock" value={alertes.length} icon={<AlertTriangle size={18} />} tone="terracotta" />
            <KpiCard label="Critiques" value={critiques} icon={<AlertTriangle size={18} />} tone="rose" />
            <KpiCard label="Transferts du jour" value={taches.length} icon={<ArrowRightLeft size={18} />} tone="indigo" />
            <KpiCard label="MP suivies" value={alertes.length} icon={<Package size={18} />} tone="sage" />
          </div>

          <SectionCard
            title="Enregistrer un mouvement MP"
            subtitle="Entrée, sortie ou transfert"
            icon={<ArrowRightLeft size={16} />}
            actions={<button style={btnGhost} onClick={() => setShowForm(v => !v)}><PlusCircle size={14} /> {showForm ? 'Fermer' : 'Nouveau mouvement'}</button>}
          >
            {showForm ? (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
                  <div><label style={labelStyle}>ID matière première</label><input style={bigInputStyle} value={mvt.id_mp} onChange={e => setMvt({ ...mvt, id_mp: e.target.value })} /></div>
                  <div><label style={labelStyle}>Quantité</label><input type="number" style={bigInputStyle} value={mvt.quantite} onChange={e => setMvt({ ...mvt, quantite: e.target.value })} /></div>
                  <div>
                    <label style={labelStyle}>Type</label>
                    <select style={bigInputStyle} value={mvt.type_mouvement} onChange={e => setMvt({ ...mvt, type_mouvement: e.target.value })}>
                      <option>ENTREE</option><option>SORTIE</option><option>TRANSFERT</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>Entrepôt source</label><input style={bigInputStyle} value={mvt.id_entrepot_source} onChange={e => setMvt({ ...mvt, id_entrepot_source: e.target.value })} /></div>
                  <div><label style={labelStyle}>Entrepôt destination</label><input style={bigInputStyle} value={mvt.id_entrepot_destination} onChange={e => setMvt({ ...mvt, id_entrepot_destination: e.target.value })} /></div>
                </div>
                <label style={labelStyle}>Motif</label>
                <input style={bigInputStyle} value={mvt.motif} onChange={e => setMvt({ ...mvt, motif: e.target.value })} placeholder="Ex : préparation OF-2026-0042" />
                <button style={btnPrimary} onClick={handleEnregistrerMvt} disabled={saving}>
                  <CheckCircle size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            ) : (
              <div style={{ padding: 'var(--s-3)', color: 'var(--fg-muted)' }}>Cliquez sur "Nouveau mouvement" pour enregistrer une entrée, sortie ou transfert.</div>
            )}
          </SectionCard>

          <SectionCard title="Alertes stock" subtitle={`${alertes.length} MP sous seuil`} icon={<AlertTriangle size={16} />}>
            {alertes.length === 0 ? (
              <div style={{ padding: 'var(--s-4)', color: 'var(--fg-muted)' }}>Aucune alerte stock.</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                {alertes.map((a: any, i: number) => (
                  <div key={a.id_mp || a.id || i} style={rowCard}>
                    <div>
                      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>
                        {a.designation || a.nom_mp || `MP #${a.id_mp || a.id}`}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                        Stock : {a.stock_actuel ?? a.stock ?? '—'} · Seuil : {a.stock_min ?? a.seuil_min ?? '—'}
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: (a.niveau === 'CRITIQUE' ? 'var(--accent-rose)' : 'var(--accent-gold)'), color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                      {a.niveau || 'ALERTE'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Mes transferts du jour" subtitle={`${taches.length} tâches magasin`} icon={<ArrowRightLeft size={16} />}>
            {taches.length === 0 ? (
              <div style={{ padding: 'var(--s-4)', color: 'var(--fg-muted)' }}>Aucune préparation assignée.</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                {taches.map((t: any) => (
                  <div key={t.id_tache} style={rowCard}>
                    <div>
                      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{t.numero_of || `OF #${t.id_of}`}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                        {t.article_designation || t.type_tache} · {t.statut}
                      </div>
                    </div>
                    {t.statut !== 'TERMINEE' && (
                      <button style={{ ...btnPrimary, background: 'var(--accent-sage)', borderColor: 'var(--accent-sage)' }} onClick={() => handleTerminerTache(t.id_tache)}>
                        <CheckCircle size={14} /> Valider
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </DashboardShell>
      )}
    </>
  );
};

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8, color: 'var(--fg-secondary)' };
const bigInputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', fontSize: 'var(--text-lg)', border: '2px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', color: 'var(--fg-primary)', minHeight: 56,
};
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

export default TabletteMagasinier;
