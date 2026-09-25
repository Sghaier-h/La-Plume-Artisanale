import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, PlusCircle, Filter, Zap, CheckCircle2, XCircle,
  Mail, Phone, MessageCircle, ArrowRight, X, Clock,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../components/dashboard';
import { leadsApi, pickData } from '../services/crmApi';
import { fmtRelative, fmtDate } from '../utils/formatters';

interface LeadRow {
  id_lead: number;
  canal: string;
  source_detail?: string;
  nom_prospect?: string;
  email?: string;
  telephone?: string;
  societe?: string;
  message?: string;
  statut: 'nouveau' | 'en_traitement' | 'converti' | 'perdu';
  motif_perte?: string;
  date_capture: string;
  date_conversion?: string | null;
  id_client_converti?: number;
  compte_converti_nom?: string;
  compte_converti_code?: string;
}

type StatutFilter = 'all' | LeadRow['statut'];

const STATUT_TONE: Record<LeadRow['statut'], string> = {
  nouveau:       'var(--accent-indigo)',
  en_traitement: 'var(--accent-gold)',
  converti:      'var(--accent-sage)',
  perdu:         'var(--color-danger)',
};

const CANAL_ICON: Record<string, React.ReactNode> = {
  email_recu:    <Mail size={12} />,
  formulaire_web:<Users size={12} />,
  whatsapp:      <MessageCircle size={12} />,
  telegram:      <MessageCircle size={12} />,
  telephone:     <Phone size={12} />,
  pub_facebook:  <Users size={12} />,
  pub_google:    <Users size={12} />,
  salon:         <Users size={12} />,
  referral:      <Users size={12} />,
};

const CrmLeads: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [statut, setStatut] = useState<StatutFilter>('all');
  const [busyConvert, setBusyConvert] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const reload = () => setDebounced((v) => v + ''); // trigger effect

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { limit: 200 };
        if (debounced) params.q = debounced;
        if (statut !== 'all') params.statut = statut;
        const res = await leadsApi.list(params);
        if (cancelled) return;
        setRows(pickData<LeadRow>(res));
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.error?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, statut]);

  const kpis = useMemo(() => {
    const total = rows.length;
    const nouveaux = rows.filter((r) => r.statut === 'nouveau').length;
    const enTrait  = rows.filter((r) => r.statut === 'en_traitement').length;
    const convertis = rows.filter((r) => r.statut === 'converti').length;
    return { total, nouveaux, enTrait, convertis };
  }, [rows]);

  const toggle = (s: StatutFilter) => setStatut((p) => (p === s ? 'all' : s));

  const convertLead = async (id: number) => {
    if (!window.confirm('Convertir ce lead en compte (statut=lead) ?')) return;
    try {
      setBusyConvert(id);
      await leadsApi.convertir(id);
      reload();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e.message);
    } finally {
      setBusyConvert(null);
    }
  };

  return (
    <DashboardShell
      eyebrow="§3.4 · Funnel"
      title="Leads"
      subtitle="Prises de contact entrantes avant qualification en compte."
      headerRight={
        <button type="button" style={btnPrimary} onClick={() => alert('Formulaire création à venir (route /crm/leads/nouveau)')}>
          <PlusCircle size={14} style={{ marginRight: 6 }} /> Nouveau lead
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <KpiCard label="Total leads"    value={kpis.total}      tone="terracotta" icon={<Users size={18} />}       onClick={() => setStatut('all')} />
        <KpiCard label="Nouveaux"       value={kpis.nouveaux}   tone="indigo"     icon={<Zap size={18} />}          onClick={() => toggle('nouveau')} />
        <KpiCard label="En traitement"  value={kpis.enTrait}    tone="gold"       icon={<Clock size={18} />}        onClick={() => toggle('en_traitement')} />
        <KpiCard label="Convertis"      value={kpis.convertis}  tone="sage"       icon={<CheckCircle2 size={18} />}  onClick={() => toggle('converti')} />
      </div>

      <SectionCard title="Liste leads" subtitle={`${rows.length} ligne(s)`}>
        <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', marginBottom: 'var(--s-4)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--fg-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Nom, email, société…" style={inputStyle(true)} />
            {search && (
              <button onClick={() => setSearch('')} style={btnClear}><X size={14} /></button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--fg-muted)' }} />
            <select value={statut} onChange={(e) => setStatut(e.target.value as StatutFilter)} style={inputStyle(false)}>
              <option value="all">Tous statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="en_traitement">En traitement</option>
              <option value="converti">Converti</option>
              <option value="perdu">Perdu</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: 'var(--s-4)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun lead.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Prospect', 'Canal', 'Société', 'Capturé', 'Statut', 'Actions'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id_lead} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{r.nom_prospect || '-'}</div>
                      {r.email && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{r.email}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 999,
                        background: 'color-mix(in srgb, var(--accent-terracotta) 12%, transparent)',
                        color: 'var(--accent-terracotta)', fontSize: 'var(--text-xs)',
                      }}>
                        {CANAL_ICON[r.canal] || <Users size={12} />} {r.canal}
                      </span>
                      {r.source_detail && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 2 }}>{r.source_detail}</div>
                      )}
                    </td>
                    <td style={tdStyle}>{r.societe || '-'}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                      {fmtRelative(r.date_capture)}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                        borderRadius: 999, fontSize: 'var(--text-xs)', fontWeight: 600,
                        background: `color-mix(in srgb, ${STATUT_TONE[r.statut]} 15%, transparent)`,
                        color: STATUT_TONE[r.statut],
                      }}>
                        {r.statut}
                      </span>
                      {r.statut === 'converti' && r.compte_converti_code && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 2 }}>
                          → {r.compte_converti_code}
                        </div>
                      )}
                      {r.statut === 'perdu' && r.motif_perte && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 2 }}>
                          {r.motif_perte}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {r.statut !== 'converti' && r.statut !== 'perdu' && (
                        <button
                          onClick={() => convertLead(r.id_lead)}
                          disabled={busyConvert === r.id_lead}
                          style={btnConvert}
                          title="Convertir en compte"
                        >
                          <ArrowRight size={12} /> Convertir
                        </button>
                      )}
                      {r.id_client_converti && (
                        <button
                          onClick={() => navigate(`/clients/${r.id_client_converti}`)}
                          style={btnLink}
                          title="Voir le compte"
                        >
                          Voir compte
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
};
const btnConvert: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '4px 10px', background: 'var(--accent-sage)', color: 'var(--fg-inverse)',
  border: 'none', borderRadius: 999, fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
};
const btnLink: React.CSSProperties = {
  padding: '4px 10px', marginLeft: 6, background: 'transparent',
  border: '1px solid var(--border-default)', borderRadius: 999,
  color: 'var(--accent-indigo)', fontSize: 'var(--text-xs)', cursor: 'pointer',
};
const btnClear: React.CSSProperties = {
  position: 'absolute', right: 8, top: 8, background: 'transparent',
  border: 'none', cursor: 'pointer', color: 'var(--fg-muted)',
};
const inputStyle = (padLeft: boolean): React.CSSProperties => ({
  width: '100%',
  padding: padLeft ? '8px 12px 8px 36px' : '8px 12px',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-canvas)',
  color: 'var(--fg-primary)',
  fontSize: 'var(--text-sm)',
});
const thStyle: React.CSSProperties = {
  padding: 'var(--s-3)', textAlign: 'left',
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'var(--text-xs)', fontWeight: 600,
  color: 'var(--fg-primary)', background: 'var(--bg-canvas)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const tdStyle: React.CSSProperties = { padding: 'var(--s-3)', color: 'var(--fg-primary)', verticalAlign: 'top' };

export default CrmLeads;
