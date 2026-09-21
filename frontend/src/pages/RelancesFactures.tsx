import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AlertCircle, Send, RefreshCw, Play, Mail, Settings as SettingsIcon, FileText } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { DashboardShell, KpiCard, SectionCard, ThemeToggle } from '../components/dashboard';
import { relancesService, parametrageService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const asArray = (x: any): any[] =>
  Array.isArray(x) ? x : (x?.data?.factures || x?.data?.relances || x?.data?.data || x?.data || x?.factures || x?.relances || []);

const fmtDT = (n: any) => `${Number(n || 0).toFixed(2)} DT`;
const fmtDate = (d: any) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
const isAdmin = (role?: string) => ['ADMIN', 'ADMINISTRATEUR', 'DIRECTION'].includes((role || '').toUpperCase());

const DEFAULT_TEMPLATES = {
  1: {
    subject: 'Rappel amiable — Facture {numero} en attente',
    html: "Bonjour {client},\n\nSauf erreur de notre part, la facture n° {numero} d'un montant de {montant} DT émise le {date} n'a pas encore été réglée.\n\nMerci de nous confirmer le règlement à votre convenance.\n\nCordialement,\nLa Plume Artisanale",
  },
  2: {
    subject: 'Relance — Facture {numero} en retard',
    html: "Bonjour {client},\n\nNotre facture n° {numero} d'un montant de {montant} DT reste impayée à ce jour. En retard de {jours} jours par rapport à l'échéance du {echeance}.\n\nMerci de procéder au règlement sous 7 jours pour éviter toute pénalité.\n\nCordialement,",
  },
  3: {
    subject: 'Mise en demeure — Facture {numero}',
    html: "Bonjour {client},\n\nMalgré nos précédentes relances, la facture n° {numero} de {montant} DT reste impayée. En retard de {jours} jours.\n\nSans règlement sous 8 jours, nous nous verrons contraints d'engager une procédure de recouvrement contentieux.\n\nCordialement,",
  },
};

const RelancesFactures: React.FC = () => {
  const { user } = useAuth() as any;
  const admin = isAdmin(user?.role);

  const [impayees, setImpayees] = useState<any[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [config, setConfig] = useState<any>({ j1_delai: 7, j2_delai: 15, j3_delai: 30, enabled: true, cron_hour: 9 });
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'ko'; msg: string } | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [imp, hist, st] = await Promise.all([
        relancesService.getFacturesImpayees(),
        relancesService.getRelances({ limit: 100 }),
        relancesService.getStatsGlobal(),
      ]);
      setImpayees(asArray(imp.data));
      const impCfg = (imp.data as any)?.data?.config || (imp.data as any)?.config;
      if (impCfg) setConfig((c: any) => ({ ...c, ...impCfg }));
      setHistorique(asArray(hist.data));
      setStats((st.data as any)?.data || st.data || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Socket.IO — refresh on relance:sent
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const url = process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://fabrication.laplume-artisanale.tn' : 'http://localhost:5000');
    const socket: Socket = io(url, { auth: { token }, transports: ['websocket', 'polling'] });
    socket.on('relance:sent', () => loadAll());
    return () => { socket.close(); };
  }, [loadAll]);

  const showToast = (type: 'ok' | 'ko', msg: string) => {
    setToast({ type, msg }); setTimeout(() => setToast(null), 3500);
  };

  const genererMaintenant = async (dryRun = false) => {
    setRunning(true);
    try {
      const r = await relancesService.genererRelances({ dry_run: dryRun });
      const d = (r.data as any)?.data || r.data;
      showToast('ok', dryRun
        ? `Simulation : ${d.dry_run || 0} relance(s) prêtes`
        : `${d.envoyees || 0} relance(s) envoyée(s) — ${d.skipped || 0} ignorée(s)`);
      loadAll();
    } catch (e: any) {
      showToast('ko', e?.response?.data?.message || 'Erreur génération relances');
    } finally { setRunning(false); }
  };

  const envoyerManuelle = async (idFacture: number, niveau: number) => {
    try {
      await relancesService.envoyerRelanceManuelle(idFacture, { niveau, canal: 'email' });
      showToast('ok', `Relance niveau ${niveau} envoyée`);
      loadAll();
    } catch (e: any) {
      showToast('ko', e?.response?.data?.message || 'Erreur envoi relance');
    }
  };

  const saveConfig = async () => {
    try {
      await Promise.all([
        parametrageService.update('relances.j1_delai', String(config.j1_delai)),
        parametrageService.update('relances.j2_delai', String(config.j2_delai)),
        parametrageService.update('relances.j3_delai', String(config.j3_delai)),
        parametrageService.update('relances.enabled', String(!!config.enabled)),
        parametrageService.update('relances.cron_hour', String(config.cron_hour)),
      ]);
      showToast('ok', 'Configuration enregistrée');
    } catch (e: any) {
      showToast('ko', 'Erreur enregistrement configuration');
    }
  };

  const kpis = useMemo(() => ({
    factures_impayees: impayees.length,
    total_impaye: impayees.reduce((s, f) => s + Number(f.montant_restant || f.montant_ttc || 0), 0),
    relances_mois: (() => {
      const now = new Date();
      return historique.filter((r) => {
        const d = new Date(r.date_relance);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
    })(),
    taux: stats.taux_recouvrement || 0,
  }), [impayees, historique, stats]);

  // ── UI helpers ────────────────────────────────────────────────
  const btnGhost: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    background: 'var(--bg-hover)', color: 'var(--fg-secondary)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-full)',
    fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  };
  const btnPrimary: React.CSSProperties = { ...btnGhost, background: 'var(--accent-terracotta)', color: '#fff', borderColor: 'var(--accent-terracotta)' };
  const btnDanger:  React.CSSProperties = { ...btnGhost, background: '#DC2626', color: '#fff', borderColor: '#DC2626' };
  const cellStyle: React.CSSProperties = { padding: 10, borderBottom: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' };
  const headStyle: React.CSSProperties = { ...cellStyle, background: 'var(--bg-hover)', fontWeight: 700, color: 'var(--fg-secondary)', textAlign: 'left' };
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)',
    color: 'var(--fg-primary)', fontSize: 'var(--text-sm)', width: '100%',
  };

  return (
    <DashboardLayout title="Relances factures" activeSection="relances" onSectionChange={() => {}}>
      <DashboardShell
        eyebrow="Facturation"
        title="Relances factures impayées"
        subtitle="Suivi automatique du recouvrement — amiable, ferme, mise en demeure."
        headerRight={
          <>
            <button onClick={() => loadAll()} style={btnGhost}><RefreshCw size={14} /> Actualiser</button>
            <button onClick={() => genererMaintenant(true)} disabled={running} style={btnGhost}>
              <Play size={14} /> Simuler
            </button>
            <button onClick={() => genererMaintenant(false)} disabled={running} style={btnPrimary}>
              <Send size={14} /> Générer relances
            </button>
            <ThemeToggle />
          </>
        }
      >
        {/* ── KPIs ───────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
          <KpiCard label="Factures impayées" value={kpis.factures_impayees} tone="terracotta" icon={<AlertCircle size={18} />} />
          <KpiCard label="Total impayé" value={fmtDT(kpis.total_impaye)} tone="terracotta" />
          <KpiCard label="Relances ce mois" value={kpis.relances_mois} tone="sage" icon={<Mail size={18} />} />
          <KpiCard label="Taux recouvrement" value={`${Number(kpis.taux || 0).toFixed(1)}%`} tone="sage" />
        </div>

        {/* ── Factures à relancer ────────────────────────────── */}
        <SectionCard title="Factures à relancer" icon={<AlertCircle size={16} />} subtitle={`${impayees.length} facture(s)`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headStyle}>N° Facture</th>
                  <th style={headStyle}>Client</th>
                  <th style={headStyle}>Échéance</th>
                  <th style={headStyle}>Jours retard</th>
                  <th style={headStyle}>Montant</th>
                  <th style={headStyle}>Dernière relance</th>
                  <th style={headStyle}>Prochaine (niveau)</th>
                  <th style={headStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ ...cellStyle, textAlign: 'center' }}>Chargement…</td></tr>
                ) : impayees.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...cellStyle, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune facture à relancer</td></tr>
                ) : impayees.map((f, i) => (
                  <tr key={f.id_facture || i}>
                    <td style={cellStyle}><strong>{f.numero_facture || `#${f.id_facture}`}</strong></td>
                    <td style={cellStyle}>{f.client_nom || '—'}</td>
                    <td style={cellStyle}>{fmtDate(f.date_echeance)}</td>
                    <td style={cellStyle}>
                      <span style={{ color: f.jours_retard > 30 ? '#DC2626' : f.jours_retard > 15 ? 'var(--accent-terracotta)' : 'inherit' }}>
                        {f.jours_retard || 0} j
                      </span>
                    </td>
                    <td style={cellStyle}>{fmtDT(f.montant_restant || f.montant_ttc)}</td>
                    <td style={cellStyle}>
                      {f.last_niveau ? `N${f.last_niveau} — ${fmtDate(f.last_date_relance)}` : '—'}
                    </td>
                    <td style={cellStyle}>
                      {f.prochain_niveau ? <strong>Niveau {f.prochain_niveau}</strong> : <span style={{ color: 'var(--fg-muted)' }}>En attente</span>}
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() => envoyerManuelle(f.id_facture, f.prochain_niveau || (f.last_niveau ? Math.min(3, f.last_niveau + 1) : 1))}
                        style={f.jours_retard > 30 ? btnDanger : btnPrimary}
                        disabled={!f.client_email}
                        title={!f.client_email ? 'Aucun email client' : ''}
                      >
                        <Send size={12} /> Relancer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── Historique ─────────────────────────────────────── */}
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Historique des relances" icon={<Mail size={16} />} subtitle={`${historique.length} relance(s)`}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={headStyle}>Date</th>
                    <th style={headStyle}>Facture</th>
                    <th style={headStyle}>Client</th>
                    <th style={headStyle}>Niveau / Type</th>
                    <th style={headStyle}>Canal</th>
                    <th style={headStyle}>Destinataire</th>
                    <th style={headStyle}>Statut</th>
                    <th style={headStyle}>Réponse</th>
                  </tr>
                </thead>
                <tbody>
                  {historique.length === 0 ? (
                    <tr><td colSpan={8} style={{ ...cellStyle, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune relance</td></tr>
                  ) : historique.map((r, i) => (
                    <tr key={r.id_relance || i}>
                      <td style={cellStyle}>{fmtDate(r.date_relance)}</td>
                      <td style={cellStyle}>{r.numero_facture || `#${r.id_facture}`}</td>
                      <td style={cellStyle}>{r.client_nom || '—'}</td>
                      <td style={cellStyle}>N{r.niveau} · {r.type_relance}</td>
                      <td style={cellStyle}>{r.canal}</td>
                      <td style={cellStyle}>{r.destinataire || '—'}</td>
                      <td style={cellStyle}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11,
                          background: r.statut === 'envoyee' ? 'var(--accent-sage)' : '#DC2626',
                          color: '#fff',
                        }}>{r.statut}</span>
                      </td>
                      <td style={cellStyle}>{r.reponse_recue ? '✓ ' + fmtDate(r.date_reponse) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* ── Configuration (admin) ──────────────────────────── */}
        {admin && (
          <div style={{ marginTop: 16 }}>
            <SectionCard title="Configuration des relances" icon={<SettingsIcon size={16} />} subtitle="Réservé aux administrateurs">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  Délai niveau 1 (jours)
                  <input type="number" style={inputStyle} value={config.j1_delai}
                    onChange={(e) => setConfig({ ...config, j1_delai: Number(e.target.value) })} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  Délai niveau 2 (jours)
                  <input type="number" style={inputStyle} value={config.j2_delai}
                    onChange={(e) => setConfig({ ...config, j2_delai: Number(e.target.value) })} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  Délai niveau 3 (jours)
                  <input type="number" style={inputStyle} value={config.j3_delai}
                    onChange={(e) => setConfig({ ...config, j3_delai: Number(e.target.value) })} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--fg-secondary)' }}>
                  Heure du cron (0-23)
                  <input type="number" min={0} max={23} style={inputStyle} value={config.cron_hour}
                    onChange={(e) => setConfig({ ...config, cron_hour: Number(e.target.value) })} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--fg-primary)' }}>
                  <input type="checkbox" checked={!!config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })} />
                  Scheduler actif
                </label>
              </div>
              <button onClick={saveConfig} style={btnPrimary}><SettingsIcon size={14} /> Enregistrer</button>
            </SectionCard>
          </div>
        )}

        {/* ── Templates ──────────────────────────────────────── */}
        <div style={{ marginTop: 16 }}>
          <SectionCard title="Templates des relances" icon={<FileText size={16} />} subtitle="3 niveaux : amiable, ferme, mise en demeure">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 12, background: 'var(--bg-elevated)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--fg-primary)' }}>
                    Niveau {n} — {n === 1 ? 'Amiable' : n === 2 ? 'Ferme' : 'Mise en demeure'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 6 }}>Sujet</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-primary)', marginBottom: 10 }}>
                    {(DEFAULT_TEMPLATES as any)[n].subject}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 6 }}>Contenu</div>
                  <textarea readOnly rows={7} value={(DEFAULT_TEMPLATES as any)[n].html}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg-muted)' }}>
              Variables : {`{client}`} {`{numero}`} {`{montant}`} {`{date}`} {`{echeance}`} {`{jours}`}
            </div>
          </SectionCard>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 2000,
            padding: '12px 18px', borderRadius: 'var(--radius-md)',
            background: toast.type === 'ok' ? 'var(--accent-sage)' : '#DC2626',
            color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}>{toast.msg}</div>
        )}
      </DashboardShell>
    </DashboardLayout>
  );
};

export default RelancesFactures;
