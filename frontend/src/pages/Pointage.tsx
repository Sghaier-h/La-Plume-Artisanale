import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock, LogIn, LogOut, Users, Calendar, Activity } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import { useAuth } from '../hooks/useAuth';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data || x?.items || x?.pointages || []);

const fmtInt = (v: any) => {
  const n = Number(v ?? 0);
  return isNaN(n) ? '0' : n.toLocaleString('fr-FR');
};

const fmtTime = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  catch { return String(iso); }
};

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const Pointage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || user?.role === 'administrateur';
  const userId = (user as any)?.id_utilisateur || user?.id;

  const [today, setToday] = useState<any>(null);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [teamToday, setTeamToday] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  const loadToday = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/pointage/user/${userId}/today`);
      setToday(res.data?.data || res.data || null);
    } catch (e) { console.error('Erreur today:', e); }
  }, [userId]);

  const loadMonth = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/pointage/user/${userId}/month/${currentMonthKey()}`);
      setMonthData(asArray(res.data));
    } catch (e) { console.error('Erreur mois:', e); }
  }, [userId]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/pointage/stats/global');
      setStats(res.data?.data || res.data || {});
    } catch (e) { console.error('Erreur stats:', e); }
  }, []);

  const loadTeam = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/pointage', { params: { date: selectedDate } });
      setTeamToday(asArray(res.data));
    } catch (e) { console.error('Erreur équipe:', e); }
  }, [isAdmin, selectedDate]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadToday(), loadMonth(), loadStats(), loadTeam()]);
      setLoading(false);
    })();
  }, [loadToday, loadMonth, loadStats, loadTeam]);

  useEffect(() => {
    const socket = connectSocket();
    const refresh = () => { loadToday(); loadMonth(); loadStats(); loadTeam(); };
    socket.on('pointage:updated', refresh);
    return () => { socket.off('pointage:updated', refresh); };
  }, [loadToday, loadMonth, loadStats, loadTeam]);

  const doCheckIn = async () => {
    try {
      await api.post('/pointage/check-in', { id_utilisateur: userId });
      await loadToday(); await loadStats(); await loadTeam();
    } catch (e: any) { alert(`Erreur: ${e?.response?.data?.error || e?.message}`); }
  };

  const doCheckOut = async () => {
    try {
      await api.post('/pointage/check-out', { id_utilisateur: userId });
      await loadToday(); await loadStats(); await loadTeam();
    } catch (e: any) { alert(`Erreur: ${e?.response?.data?.error || e?.message}`); }
  };

  const elapsed = useMemo(() => {
    if (!today?.check_in || today?.check_out) return null;
    const ms = Date.now() - new Date(today.check_in).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [today]);

  const isCheckedIn = today?.check_in && !today?.check_out;

  return (
    <DashboardLayout title="Pointage" activeSection="pointage" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Présence & pointage"
        title="Pointage / Présence"
        subtitle="Gestion des entrées, sorties et présences quotidiennes."
        headerRight={<ThemeToggle />}
      >
        <div className="lp-metric-grid">
          <KpiCard label="Présents aujourd'hui" value={fmtInt(stats?.presents_aujourd_hui ?? stats?.presents)} icon={<Users size={18} />} tone="sage" loading={loading} />
          <KpiCard label="Absents" value={fmtInt(stats?.absents)} icon={<Users size={18} />} tone="terracotta" loading={loading} />
          <KpiCard label="Retards" value={fmtInt(stats?.retards)} icon={<Clock size={18} />} tone="gold" loading={loading} />
          <KpiCard label="Heures moyennes" value={fmtInt(stats?.heures_moyennes ?? stats?.heures_travaillees_moy)} unit="h" icon={<Activity size={18} />} tone="indigo" loading={loading} />
        </div>

        <SectionCard title="Mon pointage" icon={<Clock size={16} />} subtitle={isCheckedIn ? `Pointé à ${fmtTime(today?.check_in)} — écoulé ${elapsed}` : 'Non pointé'}>
          <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={doCheckIn} disabled={isCheckedIn}
              style={{ ...bigBtn, background: isCheckedIn ? 'var(--bg-hover)' : 'var(--accent-terracotta)', color: isCheckedIn ? 'var(--fg-muted)' : '#fff', cursor: isCheckedIn ? 'not-allowed' : 'pointer' }}>
              <LogIn size={20} /> Pointer entrée
            </button>
            <button onClick={doCheckOut} disabled={!isCheckedIn}
              style={{ ...bigBtn, background: !isCheckedIn ? 'var(--bg-hover)' : 'var(--accent-indigo)', color: !isCheckedIn ? 'var(--fg-muted)' : '#fff', cursor: !isCheckedIn ? 'not-allowed' : 'pointer' }}>
              <LogOut size={20} /> Pointer sortie
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 'auto' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>Aujourd'hui</span>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', color: 'var(--fg-primary)' }}>
                {fmtTime(today?.check_in)} → {fmtTime(today?.check_out)}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Mon mois" icon={<Calendar size={16} />} subtitle={currentMonthKey()}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--s-2)' }}>
            {monthData.length === 0 && <div style={{ color: 'var(--fg-muted)' }}>Aucune donnée</div>}
            {monthData.map((d: any, i: number) => (
              <div key={i} style={{ padding: 'var(--s-3)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontWeight: 600 }}>{d.date || d.jour}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', marginTop: 4 }}>
                  {fmtTime(d.check_in)} → {fmtTime(d.check_out)}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {isAdmin && (
          <SectionCard
            title="Vue équipe"
            icon={<Users size={16} />}
            subtitle={`Présences du ${selectedDate}`}
            actions={
              <input type="date" style={inputStyle} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead><tr>{['Utilisateur', 'Entrée', 'Sortie', 'Heures'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                <tbody>
                  {teamToday.length === 0 && <tr><td colSpan={4} style={{ padding: 'var(--s-4)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun pointage</td></tr>}
                  {teamToday.map((p: any, i: number) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <td style={tdStyle}>{p.nom_complet || `${p.prenom || ''} ${p.nom || ''}` || p.id_utilisateur}</td>
                      <td style={tdStyle}>{fmtTime(p.check_in)}</td>
                      <td style={tdStyle}>{fmtTime(p.check_out)}</td>
                      <td style={tdStyle}>{p.heures_travaillees || p.heures || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
};

const bigBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '18px 32px', fontSize: 'var(--text-md)', fontWeight: 700,
  border: '1px solid transparent', borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)', transition: 'transform var(--duration) var(--ease)',
};
const inputStyle: React.CSSProperties = { padding: '6px 10px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontSize: 'var(--text-xs)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-3)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: 'var(--s-3)', color: 'var(--fg-primary)' };

export default Pointage;
