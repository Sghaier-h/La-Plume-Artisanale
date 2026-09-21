import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Package, ScanLine, Printer, RefreshCw, X, CheckCircle2, Search, Layers } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { tracabiliteLotsService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data?.items || x?.data?.data || x?.data || x?.items || []);

const toneByStatut = (s?: string): 'sage' | 'gold' | 'terracotta' | 'indigo' | 'rose' => {
  const v = (s || '').toLowerCase();
  if (v.includes('dispo')) return 'sage';
  if (v.includes('reserv')) return 'gold';
  if (v.includes('exped') || v.includes('livr')) return 'indigo';
  if (v.includes('2') || v.includes('second')) return 'rose';
  return 'terracotta';
};

const TracabiliteLots: React.FC = () => {
  useAuth();
  const [lots, setLots] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statutFilter, setStatutFilter] = useState('');
  const [qualiteFilter, setQualiteFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [detailLot, setDetailLot] = useState<any>(null);
  const [chaine, setChaine] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await tracabiliteLotsService.getStatsGlobal();
      setStats(res.data?.data || res.data || {});
    } catch { /* silent */ }
  }, []);

  const loadLots = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statutFilter) params.statut = statutFilter;
      if (qualiteFilter) params.qualite = qualiteFilter;
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await tracabiliteLotsService.getLotsCoupe(params);
      setLots(asArray(res.data));
    } catch (e) {
      console.error('Erreur chargement lots:', e);
      setLots([]);
    } finally {
      setLoading(false);
    }
  }, [statutFilter, qualiteFilter, search, dateFrom, dateTo]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadLots(); }, [loadLots]);

  // Socket.IO: refresh on lot events
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const url = process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://fabrication.laplume-artisanale.tn' : 'http://localhost:5000');
    const socket: Socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
    const refresh = () => { loadStats(); loadLots(); };
    socket.on('lot:created', refresh);
    socket.on('lot:updated', refresh);
    socket.on('lot:status', refresh);
    return () => { socket.close(); };
  }, [loadStats, loadLots]);

  const scanQR = async () => {
    if (!qrInput.trim()) return;
    setBusy(true);
    try {
      const res = await tracabiliteLotsService.scanQR(qrInput.trim());
      setScanResult(res.data?.data || res.data);
    } catch (e: any) {
      setScanResult({ error: e.response?.data?.message || 'Lot introuvable' });
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (lot: any) => {
    setDetailLot(lot);
    setChaine(null);
    try {
      const res = await tracabiliteLotsService.getChaine(lot.id_lot || lot.id);
      setChaine(res.data?.data || res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const changeStatut = async (lot: any, statut: string) => {
    try {
      await tracabiliteLotsService.updateStatutLot(lot.id_lot || lot.id, statut);
      loadLots();
    } catch (e) { console.error(e); }
  };

  const imprimer = async (lot: any) => {
    try {
      const res = await tracabiliteLotsService.genererEtiquette(lot.id_lot || lot.id);
      alert('Étiquette générée:\n' + JSON.stringify(res.data?.data || res.data, null, 2));
    } catch (e: any) {
      alert('Erreur impression: ' + (e.response?.data?.message || e.message));
    }
  };

  const kpi = useMemo(() => ({
    total: stats.total ?? stats.total_lots ?? lots.length,
    dispo: stats.disponibles ?? stats.disponible ?? lots.filter(l => (l.statut || '').toLowerCase().includes('dispo')).length,
    reserves: stats.reserves ?? stats.reserve ?? lots.filter(l => (l.statut || '').toLowerCase().includes('reserv')).length,
    second: stats.second_choix ?? stats.second ?? lots.filter(l => (l.qualite || '').toLowerCase().includes('2')).length,
  }), [stats, lots]);

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)', fontSize: 'var(--text-sm)',
  };

  return (
    <DashboardLayout title="Traçabilité des lots" activeSection="tracabilite" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Suivi qualité fouta"
        title="Traçabilité des lots"
        subtitle="Scannez, consultez la chaîne de fabrication et pilotez le statut de vos lots."
        headerRight={
          <>
            <button onClick={() => { loadStats(); loadLots(); }} style={btnGhost}>
              <RefreshCw size={14} /> Actualiser
            </button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Total lots" value={String(kpi.total)} icon={<Package size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="Disponibles" value={String(kpi.dispo)} icon={<CheckCircle2 size={18} />} tone="sage" loading={loading} />
          <KpiCard label="Réservés" value={String(kpi.reserves)} icon={<Layers size={18} />} tone="gold" loading={loading} />
          <KpiCard label="2ème choix" value={String(kpi.second)} icon={<X size={18} />} tone="rose" loading={loading} />
        </div>

        <SectionCard title="Scanner QR" subtitle="Saisissez ou collez un code QR pour identifier un lot" icon={<ScanLine size={16} />}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') scanQR(); }}
              placeholder="Code QR (ex: LOT-2026-0001)"
              style={{ ...inputStyle, flex: 1, minWidth: 240 }}
            />
            <button onClick={scanQR} disabled={busy} style={{ ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)' }}>
              <ScanLine size={14} /> Scanner
            </button>
          </div>
          {scanResult && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              {scanResult.error ? (
                <span style={{ color: 'var(--accent-rose, tomato)' }}>{scanResult.error}</span>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                    <strong>{scanResult.numero_lot || scanResult.code || '—'}</strong> · {scanResult.article || scanResult.designation || '—'} · <em>{scanResult.statut || ''}</em>
                  </div>
                  <button style={btnGhost} onClick={() => openDetail(scanResult)}>Voir la chaîne</button>
                </div>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Lots de coupe"
          subtitle="Filtrez par statut, qualité, date ou recherche libre"
          icon={<Package size={16} />}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', top: 10, left: 10, color: 'var(--fg-muted)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" style={{ ...inputStyle, width: '100%', paddingLeft: 30 }} />
            </div>
            <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)} style={inputStyle}>
              <option value="">Tous statuts</option>
              <option value="disponible">Disponible</option>
              <option value="reserve">Réservé</option>
              <option value="expedie">Expédié</option>
            </select>
            <select value={qualiteFilter} onChange={(e) => setQualiteFilter(e.target.value)} style={inputStyle}>
              <option value="">Toutes qualités</option>
              <option value="1er choix">1er choix</option>
              <option value="2eme choix">2ème choix</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-hover)', textAlign: 'left', color: 'var(--fg-secondary)' }}>
                  {['Numéro', 'Article', 'Qualité', 'Pièces', 'Métrage', 'Emplacement', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</td></tr>
                ) : lots.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun lot trouvé</td></tr>
                ) : lots.map((l, i) => (
                  <tr key={l.id_lot || l.id || i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 10px' }}><button onClick={() => openDetail(l)} style={{ background: 'none', border: 'none', color: 'var(--accent-terracotta)', cursor: 'pointer', fontWeight: 600 }}>{l.numero_lot || l.code || l.id_lot || l.id}</button></td>
                    <td style={{ padding: '8px 10px' }}>{l.article || l.designation || '—'}</td>
                    <td style={{ padding: '8px 10px' }}>{l.qualite || '—'}</td>
                    <td style={{ padding: '8px 10px' }}>{l.nombre_pieces ?? l.pieces ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>{l.metrage ?? '—'}</td>
                    <td style={{ padding: '8px 10px' }}>{l.emplacement || '—'}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, background: `var(--accent-${toneByStatut(l.statut)})`, color: '#fff' }}>{l.statut || '—'}</span>
                    </td>
                    <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      <select
                        value=""
                        onChange={(e) => { if (e.target.value) changeStatut(l, e.target.value); }}
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: 11, marginRight: 6 }}
                      >
                        <option value="">Statut…</option>
                        <option value="disponible">Disponible</option>
                        <option value="reserve">Réservé</option>
                        <option value="expedie">Expédié</option>
                      </select>
                      <button onClick={() => imprimer(l)} style={{ ...btnGhost, padding: '4px 10px', fontSize: 11 }}>
                        <Printer size={12} /> Étiquette
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {detailLot && (
          <div
            onClick={() => setDetailLot(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxWidth: 720, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: 24 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--fg-primary)' }}>Détail lot — {detailLot.numero_lot || detailLot.code || detailLot.id_lot}</h3>
                  <p style={{ margin: 0, color: 'var(--fg-muted)', fontSize: 'var(--text-xs)' }}>Chaîne complète de fabrication</p>
                </div>
                <button onClick={() => setDetailLot(null)} style={btnGhost}><X size={14} /></button>
              </div>
              {!chaine ? (
                <p style={{ color: 'var(--fg-muted)' }}>Chargement de la chaîne…</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['of', 'suivi', 'machine', 'operateur', 'matieres_premieres'].map(k => (
                    <div key={k} style={{ padding: 10, background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: 4, letterSpacing: '0.5px' }}>{k.replace('_', ' ')}</div>
                      <pre style={{ margin: 0, fontSize: 12, color: 'var(--fg-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {JSON.stringify(chaine[k] ?? chaine[k.toUpperCase()] ?? '—', null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
};

export default TracabiliteLots;
