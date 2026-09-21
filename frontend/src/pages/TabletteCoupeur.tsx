import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Scissors, Play, CheckCircle, Camera, Package } from 'lucide-react';
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

const TabletteCoupeur: React.FC = () => {
  const { user } = useAuth();
  const operateurId = user?.id;

  const [loading, setLoading] = useState(true);
  const [taches, setTaches] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState('');
  const [lotInfo, setLotInfo] = useState<any>(null);
  const [quantite, setQuantite] = useState('');
  const [scanning, setScanning] = useState(false);

  const loadTaches = useCallback(async () => {
    if (!operateurId) return;
    try {
      const res = await api.get(`/taches/operateur/${operateurId}/day`);
      const arr = toArr(res.data?.data ?? res.data).filter(
        (t: any) => !t.poste || String(t.poste).toLowerCase().includes('coupe') || String(t.type_tache || '').toLowerCase().includes('coupe')
      );
      setTaches(arr);
    } catch (err) {
      console.error('Erreur chargement tâches:', err);
    } finally {
      setLoading(false);
    }
  }, [operateurId]);

  useEffect(() => { loadTaches(); }, [loadTaches]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !operateurId) return;
    const socket: Socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
    socket.on('tache:new', loadTaches);
    socket.on('tache:completed', loadTaches);
    return () => { socket.disconnect(); };
  }, [operateurId, loadTaches]);

  const handleScanQr = async () => {
    if (!qrCode.trim()) return;
    setScanning(true);
    setLotInfo(null);
    try {
      const res = await api.get(`/tracabilite-lots/qr/${encodeURIComponent(qrCode.trim())}`);
      setLotInfo(res.data?.data ?? res.data);
    } catch {
      alert('Lot introuvable pour ce QR');
    } finally { setScanning(false); }
  };

  const handleCreerLotCoupe = async () => {
    if (!lotInfo) { alert('Scannez un lot d\'abord'); return; }
    try {
      await api.post('/tracabilite-lots/coupe', {
        id_lot_source: lotInfo.id_lot,
        id_of: lotInfo.id_of,
        id_operateur: operateurId,
        quantite_coupe: parseInt(quantite, 10) || 0,
      });
      alert('Lot de coupe créé');
      setLotInfo(null); setQrCode(''); setQuantite('');
      loadTaches();
    } catch { alert('Erreur création lot de coupe'); }
  };

  const handleDemarrer = async (id: number) => {
    try { await api.put(`/taches/${id}/demarrer`); loadTaches(); }
    catch { alert('Erreur démarrage'); }
  };
  const handleTerminer = async (id: number) => {
    try { await api.put(`/taches/${id}/terminer`); loadTaches(); }
    catch { alert('Erreur finalisation'); }
  };

  const enCours = taches.filter((t: any) => t.statut === 'EN_COURS');
  const aFaire = taches.filter((t: any) => t.statut === 'ASSIGNEE' || t.statut === 'EN_ATTENTE');
  const terminees = taches.filter((t: any) => t.statut === 'TERMINEE');

  return (
    <DashboardLayout title="Tablette Coupeur" activeSection="tablette" onSectionChange={() => {}}>
      {loading ? <LoadingSpinner message="Chargement du poste coupe..." /> : (
        <DashboardShell
          eyebrow="Poste coupe"
          title={`Bienvenue ${user?.prenom || ''} ${user?.nom || ''}`}
          subtitle="Scanne un lot QR et crée les lots de coupe correspondants."
          headerRight={<ThemeToggle />}
        >
          <div className="lp-metric-grid">
            <KpiCard label="À couper" value={aFaire.length} icon={<Scissors size={18} />} tone="gold" />
            <KpiCard label="En cours" value={enCours.length} icon={<Play size={18} />} tone="terracotta" />
            <KpiCard label="Terminées" value={terminees.length} icon={<CheckCircle size={18} />} tone="sage" hint="Aujourd'hui" />
            <KpiCard label="Total jour" value={taches.length} icon={<Package size={18} />} tone="indigo" />
          </div>

          <SectionCard title="Scanner QR lot" subtitle="Saisir ou coller le code QR d'un lot source" icon={<Camera size={16} />}>
            <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Code QR du lot (ex : LOT-2026-0042)"
                style={bigInputStyle}
              />
              <div style={btnRow}>
                <button style={btnPrimary} onClick={handleScanQr} disabled={scanning || !qrCode.trim()}>
                  <Camera size={16} /> {scanning ? 'Recherche...' : 'Rechercher lot'}
                </button>
              </div>
              {lotInfo && (
                <div style={{ display: 'grid', gap: 'var(--s-3)', padding: 'var(--s-4)', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'var(--s-3)' }}>
                    <InfoBox label="Lot" value={lotInfo.numero_lot || lotInfo.id_lot} />
                    <InfoBox label="OF" value={lotInfo.numero_of || lotInfo.id_of || '—'} />
                    <InfoBox label="Article" value={lotInfo.article_designation || '—'} />
                    <InfoBox label="Quantité dispo" value={lotInfo.quantite || lotInfo.quantite_disponible || '—'} />
                  </div>
                  <label style={labelStyle}>Quantité à couper</label>
                  <input type="number" inputMode="numeric" value={quantite} onChange={(e) => setQuantite(e.target.value)} style={bigInputStyle} placeholder="0" />
                  <button style={btnPrimary} onClick={handleCreerLotCoupe} disabled={!quantite}>
                    <Scissors size={16} /> Créer lot de coupe
                  </button>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Mes tâches de coupe" subtitle={`${aFaire.length} à faire · ${enCours.length} en cours`} icon={<Scissors size={16} />}>
            {taches.length === 0 ? (
              <div style={{ padding: 'var(--s-4)', color: 'var(--fg-muted)' }}>Aucune tâche assignée aujourd'hui.</div>
            ) : (
              <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
                {taches.map((t: any) => (
                  <div key={t.id_tache} style={rowCard}>
                    <div>
                      <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{t.numero_of || `#${t.id_of}`}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)' }}>
                        {t.article_designation || t.type_tache} · Qté {t.quantite_demandee} · {t.statut}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                      {t.statut === 'ASSIGNEE' && (
                        <button style={btnPrimary} onClick={() => handleDemarrer(t.id_tache)}>
                          <Play size={14} /> Démarrer
                        </button>
                      )}
                      {t.statut === 'EN_COURS' && (
                        <button style={{ ...btnPrimary, background: 'var(--accent-sage)', borderColor: 'var(--accent-sage)' }} onClick={() => handleTerminer(t.id_tache)}>
                          <CheckCircle size={14} /> Terminer
                        </button>
                      )}
                    </div>
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

const InfoBox: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ padding: 'var(--s-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{value}</div>
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
const rowCard: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--s-3)',
  padding: 'var(--s-4)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
};

export default TabletteCoupeur;
