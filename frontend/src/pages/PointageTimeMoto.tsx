import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Clock, RefreshCw, Upload, Save, Cloud, Users, History, CheckCircle2 } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://fabrication.laplume-artisanale.tn/api'
    : 'http://localhost:5000/api');

const client = axios.create({ baseURL: API_URL });
client.interceptors.request.use((cfg: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

type TmConfig = {
  start_time: string;
  tolerance_minutes: number;
  break_minimum_minutes: number;
  timezone: string;
};

type MappingRow = {
  id_utilisateur: number;
  prenom?: string;
  nom?: string;
  email?: string;
  numero_employe?: string | null;
  role?: string;
};

type HistoryRow = {
  id: number;
  timemoto_id?: string;
  user_id: number;
  prenom?: string;
  nom?: string;
  numero_employe?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  heures_travaillees?: number;
  retard_minutes?: number;
  device_id?: string;
  imported_at?: string;
};

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : x?.data?.items || x?.data?.data || x?.data || x?.items || [];

const asObj = (x: any): any => (x?.data?.data ?? x?.data ?? x ?? {});

const PointageTimeMoto: React.FC = () => {
  useAuth();
  const [config, setConfig] = useState<TmConfig>({
    start_time: '08:00',
    tolerance_minutes: 5,
    break_minimum_minutes: 30,
    timezone: 'Africa/Tunis',
  });
  const [configDirty, setConfigDirty] = useState(false);
  const [mapping, setMapping] = useState<MappingRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [csvPreview, setCsvPreview] = useState<string[][] | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [lastImport, setLastImport] = useState<{ imported: number; errors: any[]; skipped: any[] } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cfgRes, mapRes, histRes] = await Promise.all([
        client.get('/pointage/timemoto/config'),
        client.get('/pointage/timemoto/mapping'),
        client.get('/pointage/timemoto/history?limit=50'),
      ]);
      const cfg = asObj(cfgRes.data);
      setConfig({
        start_time: cfg.start_time || '08:00',
        tolerance_minutes: Number(cfg.tolerance_minutes ?? 5),
        break_minimum_minutes: Number(cfg.break_minimum_minutes ?? 30),
        timezone: cfg.timezone || 'Africa/Tunis',
      });
      setConfigDirty(false);
      setMapping(asArray(mapRes.data));
      setHistory(asArray(histRes.data));
    } catch (e) {
      console.error('Chargement TimeMoto échoué:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const url =
      process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://fabrication.laplume-artisanale.tn'
        : 'http://localhost:5000');
    const socket: Socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('pointage:updated', () => load());
    return () => { socket.close(); };
  }, [load]);

  const stats = useMemo(() => {
    const mapped = mapping.filter(m => m.numero_employe).length;
    const importedToday = history.filter(h => {
      const d = h.imported_at ? new Date(h.imported_at) : null;
      if (!d) return false;
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    const retards = history.filter(h => (h.retard_minutes || 0) > 0).length;
    return { mapped, unmapped: mapping.length - mapped, importedToday, retards };
  }, [mapping, history]);

  const saveConfig = async () => {
    try {
      await client.put('/pointage/timemoto/config', config);
      setConfigDirty(false);
      showToast('Configuration enregistrée');
      load();
    } catch (e: any) {
      alert('Erreur: ' + (e.response?.data?.message || e.message));
    }
  };

  const saveMapping = async (row: MappingRow, badge: string) => {
    try {
      await client.put(`/pointage/timemoto/mapping/${row.id_utilisateur}`, {
        numero_employe: badge || null,
      });
      setMapping(m => m.map(x => x.id_utilisateur === row.id_utilisateur ? { ...x, numero_employe: badge } : x));
      showToast(`Badge mis à jour pour ${row.prenom || ''} ${row.nom || ''}`);
    } catch (e: any) {
      alert('Erreur mapping: ' + (e.response?.data?.message || e.message));
    }
  };

  const onFilePick = async (file: File | null) => {
    setCsvFile(file);
    setCsvPreview(null);
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0).slice(0, 6);
      const sep = lines[0]?.includes(';') ? ';' : lines[0]?.includes('\t') ? '\t' : ',';
      setCsvPreview(lines.map(l => l.split(sep)));
    } catch {}
  };

  const doImportCsv = async () => {
    if (!csvFile) return;
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append('file', csvFile);
      const r = await client.post('/pointage/timemoto/csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = asObj(r.data);
      setLastImport({ imported: data.imported || 0, errors: data.errors || [], skipped: data.skipped || [] });
      showToast(`Import terminé : ${data.imported || 0} punchs`);
      setCsvFile(null);
      setCsvPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (e: any) {
      alert('Erreur import: ' + (e.response?.data?.message || e.message));
    } finally {
      setImporting(false);
    }
  };

  const doCloudSync = async () => {
    setSyncing(true);
    try {
      const r = await client.post('/pointage/timemoto/sync', {});
      const data = asObj(r.data);
      if (data.mocked) {
        showToast('TimeMoto Cloud non configuré (mode démo).');
      } else {
        showToast(`Sync cloud : ${data.imported || 0} punchs importés`);
        setLastSync(new Date().toLocaleString('fr-FR'));
        load();
      }
    } catch (e: any) {
      alert('Erreur sync: ' + (e.response?.data?.message || e.message));
    } finally {
      setSyncing(false);
    }
  };

  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  };
  const btnPrimary: React.CSSProperties = {
    ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff',
    borderColor: 'var(--accent-terracotta)',
  };
  const btnAccent: React.CSSProperties = {
    ...btnGhost, background: 'var(--accent-sage)', color: '#fff',
    borderColor: 'var(--accent-sage)',
  };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', width: '100%',
  };
  const th: React.CSSProperties = {
    textAlign: 'left', padding: '8px 10px', fontSize: 11, textTransform: 'uppercase',
    color: 'var(--fg-muted)', borderBottom: '1px solid var(--border-subtle)',
  };
  const td: React.CSSProperties = {
    padding: '8px 10px', fontSize: 'var(--text-sm)', color: 'var(--fg-primary)',
    borderBottom: '1px solid var(--border-subtle)',
  };

  return (
    <>
      <DashboardShell
        eyebrow="Ressources humaines"
        title="Synchro pointeuse TimeMoto"
        subtitle="Import CSV/USB, sync cloud, configuration retards et mapping badges."
        headerRight={
          <>
            <button onClick={load} style={btnGhost}><RefreshCw size={14} /> Actualiser</button>
            <ThemeToggle />
          </>
        }
      >
        <div className="lp-metric-grid">
          <KpiCard label="Employés mappés" value={String(stats.mapped)} icon={<Users size={18} />} tone="sage" loading={loading} />
          <KpiCard label="Sans badge" value={String(stats.unmapped)} icon={<Users size={18} />} tone="rose" loading={loading} />
          <KpiCard label="Importés (aujourd'hui)" value={String(stats.importedToday)} icon={<Upload size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="Retards détectés" value={String(stats.retards)} icon={<Clock size={18} />} tone="gold" loading={loading} />
        </div>

        {/* ─── Configuration ─── */}
        <SectionCard title="Configuration" subtitle="Règles retards et fuseau horaire" icon={<Clock size={16} />}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Heure de début</span>
              <input type="time" value={config.start_time}
                onChange={(e) => { setConfig({ ...config, start_time: e.target.value }); setConfigDirty(true); }}
                style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Tolérance retard (min)</span>
              <input type="number" min={0} value={config.tolerance_minutes}
                onChange={(e) => { setConfig({ ...config, tolerance_minutes: Number(e.target.value) }); setConfigDirty(true); }}
                style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Pause minimum (min)</span>
              <input type="number" min={0} value={config.break_minimum_minutes}
                onChange={(e) => { setConfig({ ...config, break_minimum_minutes: Number(e.target.value) }); setConfigDirty(true); }}
                style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Fuseau horaire</span>
              <input type="text" value={config.timezone}
                onChange={(e) => { setConfig({ ...config, timezone: e.target.value }); setConfigDirty(true); }}
                style={inputStyle} />
            </label>
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={saveConfig} disabled={!configDirty} style={{ ...btnPrimary, opacity: configDirty ? 1 : 0.5 }}>
              <Save size={14} /> Enregistrer
            </button>
          </div>
        </SectionCard>

        {/* ─── Mapping ─── */}
        <SectionCard title="Mapping employés → badges TimeMoto" subtitle="Numéro badge = utilisateur.numero_employe" icon={<Users size={16} />}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Nom</th>
                  <th style={th}>Email</th>
                  <th style={th}>Rôle</th>
                  <th style={th}>Badge TimeMoto</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mapping.map((row) => (
                  <MappingLine key={row.id_utilisateur} row={row} onSave={saveMapping} inputStyle={inputStyle} btn={btnGhost} td={td} />
                ))}
                {!loading && mapping.length === 0 && (
                  <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun utilisateur</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ─── Import CSV ─── */}
        <SectionCard title="Import CSV (USB export)" subtitle="Colonnes attendues : EmployeeID, Date, Time, Direction, Location" icon={<Upload size={16} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={(e) => onFilePick(e.target.files?.[0] || null)}
              style={{ ...inputStyle, padding: 6 }}
            />
            {csvPreview && csvPreview.length > 0 && (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{csvPreview[0].map((c, i) => (<th key={i} style={th}>{c}</th>))}</tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(1).map((row, i) => (
                      <tr key={i}>{row.map((c, j) => (<td key={j} style={td}>{c}</td>))}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
              {lastImport && (
                <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                  Dernier import : {lastImport.imported} importés, {lastImport.skipped.length} ignorés, {lastImport.errors.length} erreurs
                </span>
              )}
              <button onClick={doImportCsv} disabled={!csvFile || importing} style={{ ...btnPrimary, opacity: !csvFile || importing ? 0.5 : 1 }}>
                <Upload size={14} /> {importing ? 'Import en cours…' : 'Importer le CSV'}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ─── Sync cloud ─── */}
        <SectionCard title="Sync TimeMoto Cloud" subtitle="Nécessite TIMEMOTO_CLOUD_URL + TIMEMOTO_CLOUD_TOKEN côté serveur" icon={<Cloud size={16} />}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' }}>
              {lastSync ? <>Dernière synchro : <strong>{lastSync}</strong></> : 'Aucune synchro effectuée durant cette session.'}
            </div>
            <button onClick={doCloudSync} disabled={syncing} style={{ ...btnAccent, opacity: syncing ? 0.5 : 1 }}>
              <Cloud size={14} /> {syncing ? 'Synchronisation…' : 'Synchroniser maintenant'}
            </button>
          </div>
        </SectionCard>

        {/* ─── Historique ─── */}
        <SectionCard title="Historique des imports" subtitle="Derniers pointages issus de la pointeuse" icon={<History size={16} />}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Employé</th>
                  <th style={th}>Badge</th>
                  <th style={th}>Check-in</th>
                  <th style={th}>Check-out</th>
                  <th style={th}>Heures</th>
                  <th style={th}>Retard</th>
                  <th style={th}>Terminal</th>
                  <th style={th}>Importé</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td style={td}>{h.date ? new Date(h.date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={td}>{h.prenom || ''} {h.nom || ''}</td>
                    <td style={td}>{h.timemoto_id || h.numero_employe || '—'}</td>
                    <td style={td}>{h.check_in ? new Date(h.check_in).toLocaleTimeString('fr-FR') : '—'}</td>
                    <td style={td}>{h.check_out ? new Date(h.check_out).toLocaleTimeString('fr-FR') : '—'}</td>
                    <td style={td}>{h.heures_travaillees ?? '—'}</td>
                    <td style={td}>{h.retard_minutes ? `${h.retard_minutes} min` : '—'}</td>
                    <td style={td}>{h.device_id || '—'}</td>
                    <td style={td}>{h.imported_at ? new Date(h.imported_at).toLocaleString('fr-FR') : '—'}</td>
                  </tr>
                ))}
                {!loading && history.length === 0 && (
                  <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun import TimeMoto pour l'instant.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1200,
            background: 'var(--accent-sage)', color: '#fff', padding: '10px 16px',
            borderRadius: 'var(--radius-md)', boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)',
          }}>
            <CheckCircle2 size={16} /> {toast}
          </div>
        )}
      </DashboardShell>
    </>
  );
};

// ── Ligne éditable inline pour le mapping badge ────────────────────
const MappingLine: React.FC<{
  row: MappingRow;
  onSave: (row: MappingRow, badge: string) => void;
  inputStyle: React.CSSProperties;
  btn: React.CSSProperties;
  td: React.CSSProperties;
}> = ({ row, onSave, inputStyle, btn, td }) => {
  const [val, setVal] = useState<string>(row.numero_employe || '');
  const dirty = (row.numero_employe || '') !== val;
  return (
    <tr>
      <td style={td}>{row.prenom || ''} {row.nom || ''}</td>
      <td style={td}>{row.email || '—'}</td>
      <td style={td}>{row.role || '—'}</td>
      <td style={td}>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Numéro badge TimeMoto"
          style={{ ...inputStyle, padding: '6px 8px' }}
        />
      </td>
      <td style={td}>
        <button onClick={() => onSave(row, val)} disabled={!dirty} style={{ ...btn, opacity: dirty ? 1 : 0.5 }}>
          <Save size={12} /> Enregistrer
        </button>
      </td>
    </tr>
  );
};

export default PointageTimeMoto;
