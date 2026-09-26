import React, { useEffect, useMemo, useState } from 'react';
import {
  MessageSquare, Phone, Mail, CalendarDays, FileText, Search, Filter,
  PlusCircle, Clock, CalendarCheck, AlertCircle, X, MessageCircle,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { interactionsApi, pickData } from '../../services/crmApi';
import { fmtDateTime } from '../../utils/formatters';

type TypeInter = 'appel_entrant' | 'appel_sortant' | 'email_recu' | 'email_envoye'
               | 'whatsapp' | 'telegram' | 'rdv' | 'note';

interface Interaction {
  id_interaction: number;
  id_client?: number;
  id_lead?: number;
  id_contact?: number;
  type: TypeInter;
  sujet?: string;
  contenu?: string;
  direction: 'entrant' | 'sortant' | 'interne';
  date_interaction: string;
  suivi_date?: string | null;
  suivi_effectue: boolean;
  compte_raison_sociale?: string;
  compte_nom_particulier?: string;
  contact_nom?: string;
  contact_prenom?: string;
  utilisateur_nom?: string;
  lead_nom?: string;
}

type FilterKey = 'all' | 'aujourd_hui' | 'semaine' | 'mois' | 'retard' | TypeInter;

const TYPE_META: Record<TypeInter, { label: string; icon: React.ReactNode; tone: string }> = {
  appel_entrant: { label: 'Appel entrant', icon: <Phone size={12} />,         tone: 'var(--accent-indigo)' },
  appel_sortant: { label: 'Appel sortant', icon: <Phone size={12} />,         tone: 'var(--accent-indigo)' },
  email_recu:    { label: 'Email reçu',    icon: <Mail size={12} />,          tone: 'var(--accent-terracotta)' },
  email_envoye:  { label: 'Email envoyé',  icon: <Mail size={12} />,          tone: 'var(--accent-terracotta)' },
  whatsapp:      { label: 'WhatsApp',      icon: <MessageCircle size={12} />, tone: 'var(--accent-sage)' },
  telegram:      { label: 'Telegram',      icon: <MessageSquare size={12} />, tone: 'var(--accent-indigo)' },
  rdv:           { label: 'RDV',           icon: <CalendarDays size={12} />,  tone: 'var(--accent-sage)' },
  note:          { label: 'Note',          icon: <FileText size={12} />,      tone: 'var(--fg-muted)' },
};

const Interactions: React.FC = () => {
  const [rows, setRows] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = { limit: 200 };
        if (debounced) params.q = debounced;
        if (['appel_entrant','appel_sortant','email_recu','email_envoye','whatsapp','telegram','rdv','note'].includes(filter)) {
          params.type = filter;
        }
        if (filter === 'retard') params.suivi_en_retard = true;
        const res = await interactionsApi.list(params);
        if (cancelled) return;
        let list = pickData<Interaction>(res);
        // filtres client-side pour bornes temporelles
        const startDay   = new Date(); startDay.setHours(0,0,0,0);
        const startWeek  = new Date(); startWeek.setDate(startWeek.getDate() - 7);
        const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0,0,0,0);
        if (filter === 'aujourd_hui') list = list.filter((r) => new Date(r.date_interaction) >= startDay);
        if (filter === 'semaine')     list = list.filter((r) => new Date(r.date_interaction) >= startWeek);
        if (filter === 'mois')        list = list.filter((r) => new Date(r.date_interaction) >= startMonth);
        setRows(list);
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.error?.message || e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debounced, filter]);

  const kpis = useMemo(() => {
    const startDay   = new Date(); startDay.setHours(0,0,0,0);
    const startWeek  = new Date(); startWeek.setDate(startWeek.getDate() - 7);
    const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0,0,0,0);
    const aujourdhui = rows.filter((r) => new Date(r.date_interaction) >= startDay).length;
    const semaine    = rows.filter((r) => new Date(r.date_interaction) >= startWeek).length;
    const mois       = rows.filter((r) => new Date(r.date_interaction) >= startMonth).length;
    const enRetard   = rows.filter((r) => r.suivi_date && !r.suivi_effectue && new Date(r.suivi_date).getTime() < Date.now()).length;
    return { aujourdhui, semaine, mois, enRetard };
  }, [rows]);

  const toggleFilter = (f: FilterKey) => setFilter((p) => (p === f ? 'all' : f));

  return (
    <DashboardShell
      eyebrow="§3.5 · CRM · Journal"
      title="Interactions"
      subtitle="Journal chronologique · appels, emails, WhatsApp, RDV, notes."
      headerRight={
        <button type="button" style={btnPrimary} title="Bientôt : création inline">
          <PlusCircle size={14} style={{ marginRight: 6 }} />
          Nouvelle interaction
        </button>
      }
    >
      {/* KPI cliquables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <KpiCard label="Aujourd'hui"        value={kpis.aujourdhui} tone="terracotta" icon={<CalendarCheck size={18} />} onClick={() => toggleFilter('aujourd_hui')} />
        <KpiCard label="Cette semaine"      value={kpis.semaine}    tone="sage"       icon={<CalendarDays size={18} />}   onClick={() => toggleFilter('semaine')} />
        <KpiCard label="Ce mois"            value={kpis.mois}       tone="indigo"     icon={<Clock size={18} />}          onClick={() => toggleFilter('mois')} />
        <KpiCard label="Suivi en retard"    value={kpis.enRetard}   tone="gold"       icon={<AlertCircle size={18} />}    onClick={() => toggleFilter('retard')} />
      </div>

      <SectionCard title="Journal" subtitle={`${rows.length} ligne(s)`}>
        <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', marginBottom: 'var(--s-4)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--fg-muted)' }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="Sujet, contenu, contact, compte…"
                   style={inputStyle(true)} />
            {search && (
              <button onClick={() => setSearch('')} style={btnClear}><X size={14} /></button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--fg-muted)' }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as FilterKey)} style={inputStyle(false)}>
              <option value="all">Tous types</option>
              <option value="appel_entrant">Appel entrant</option>
              <option value="appel_sortant">Appel sortant</option>
              <option value="email_recu">Email reçu</option>
              <option value="email_envoye">Email envoyé</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="telegram">Telegram</option>
              <option value="rdv">RDV</option>
              <option value="note">Note</option>
              <option value="retard">— Suivi en retard</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: 'var(--s-4)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune interaction.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Date', 'Type', 'Compte/Lead', 'Contact', 'Sujet', 'Suivi'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const meta = TYPE_META[r.type];
                  const enRetard = r.suivi_date && !r.suivi_effectue && new Date(r.suivi_date).getTime() < Date.now();
                  return (
                    <tr key={r.id_interaction} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--fg-muted)' }}>
                        {fmtDateTime(r.date_interaction)}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 999,
                          background: `color-mix(in srgb, ${meta.tone} 12%, transparent)`,
                          color: meta.tone, fontSize: 'var(--text-xs)', fontWeight: 500,
                        }}>
                          {meta.icon} {meta.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {r.compte_raison_sociale || r.compte_nom_particulier || r.lead_nom || '-'}
                      </td>
                      <td style={tdStyle}>
                        {[r.contact_prenom, r.contact_nom].filter(Boolean).join(' ') || '-'}
                      </td>
                      <td style={{ ...tdStyle, maxWidth: 320 }}>
                        <div style={{ fontWeight: 600 }}>{r.sujet || '-'}</div>
                        {r.contenu && <div style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-xs)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.contenu}</div>}
                      </td>
                      <td style={tdStyle}>
                        {r.suivi_date && (
                          <span style={{ color: enRetard ? 'var(--accent-gold)' : 'var(--fg-muted)', fontSize: 'var(--text-xs)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {enRetard ? <AlertCircle size={12} /> : <Clock size={12} />}
                            {fmtDateTime(r.suivi_date)}
                          </span>
                        )}
                        {!r.suivi_date && '-'}
                      </td>
                    </tr>
                  );
                })}
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
const tdStyle: React.CSSProperties = { padding: 'var(--s-3)', color: 'var(--fg-primary)' };

export default Interactions;
