import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Filter, PlusCircle, Mail, Phone, Building2, Star, UserCheck, Clock, X } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { contactsApi, pickData } from '../../services/crmApi';
import { fmtRelative } from '../../utils/formatters';

interface ContactRow {
  id_contact: number;
  id_client?: number;
  role: 'responsable' | 'acheteur' | 'commercial_client' | 'technique' | 'comptabilite' | 'autre';
  civilite?: string;
  nom: string;
  prenom?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  est_principal: boolean;
  actif: boolean;
  compte_raison_sociale?: string;
  compte_nom_particulier?: string;
  code_client?: string;
  updated_at?: string;
}

type Filter = 'all' | ContactRow['role'] | 'principal' | 'sans_email';

const Contacts: React.FC = () => {
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [error, setError] = useState<string | null>(null);

  // Debounce 250ms
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
        if (filter !== 'all' && filter !== 'principal' && filter !== 'sans_email') params.role = filter;
        const res = await contactsApi.list(params);
        if (cancelled) return;
        let list = pickData<ContactRow>(res);
        if (filter === 'principal')  list = list.filter((c) => c.est_principal);
        if (filter === 'sans_email') list = list.filter((c) => !c.email);
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
    const total = rows.length;
    const actifs = rows.filter((c) => c.actif).length;
    const decideurs = rows.filter((c) => c.role === 'responsable' || c.est_principal).length;
    const withEmail = rows.filter((c) => !!c.email).length;
    return { total, actifs, decideurs, sansEmail: total - withEmail };
  }, [rows]);

  const filtered = rows;

  const toggleFilter = (f: Filter) => setFilter((p) => (p === f ? 'all' : f));

  return (
    <DashboardShell
      eyebrow="§3.2 · CRM"
      title="Contacts"
      subtitle="Interlocuteurs B2B rattachés aux comptes clients · principal, décideur, technique."
      headerRight={
        <button
          type="button"
          style={btnPrimary}
          title="Bientôt : création inline via drawer"
        >
          <PlusCircle size={14} style={{ marginRight: 6 }} />
          Nouveau contact
        </button>
      }
    >
      {/* KPI cliquables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <KpiCard label="Total contacts" value={kpis.total}      tone="terracotta" icon={<Users size={18} />}      onClick={() => setFilter('all')} />
        <KpiCard label="Principaux"     value={kpis.decideurs}  tone="indigo"     icon={<Star size={18} />}       onClick={() => toggleFilter('principal')} />
        <KpiCard label="Actifs"         value={kpis.actifs}     tone="sage"       icon={<UserCheck size={18} />}  onClick={() => setFilter('all')} />
        <KpiCard label="Sans email"     value={kpis.sansEmail}  tone="gold"       icon={<Clock size={18} />}      onClick={() => toggleFilter('sans_email')} />
      </div>

      {/* Barre recherche + filtre */}
      <SectionCard title="Répertoire" subtitle={`${filtered.length} contact(s)`}>
        <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', marginBottom: 'var(--s-4)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--fg-muted)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, email, compte, fonction…"
              style={inputStyle(true)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--fg-muted)' }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} style={inputStyle(false)}>
              <option value="all">Tous rôles</option>
              <option value="responsable">Responsable</option>
              <option value="acheteur">Acheteur</option>
              <option value="commercial_client">Commercial client</option>
              <option value="technique">Technique</option>
              <option value="comptabilite">Comptabilité</option>
              <option value="autre">Autre</option>
              <option value="principal">— Principal seulement</option>
              <option value="sans_email">— Sans email</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>Chargement…</div>
        ) : error ? (
          <div style={{ padding: 'var(--s-4)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 'var(--s-8)', textAlign: 'center', color: 'var(--fg-muted)' }}>
            Aucun contact pour ces critères.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 'var(--text-sm)', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Nom', 'Rôle', 'Email', 'Téléphone', 'Compte', 'MAJ'].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id_contact} style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                      onClick={() => { /* drawer TODO */ }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>
                        {(c.prenom || '') + ' ' + c.nom}
                      </div>
                      {c.est_principal && (
                        <span style={badgePrincipal}>
                          <Star size={10} /> Principal
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>{c.role}</td>
                    <td style={tdStyle}>
                      {c.email ? (
                        <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()}
                           style={{ color: 'var(--accent-indigo)', textDecoration: 'none' }}>
                          <Mail size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{c.email}</span>
                        </a>
                      ) : '-'}
                    </td>
                    <td style={tdStyle}>
                      {c.telephone ? (
                        <a href={`tel:${c.telephone}`} onClick={(e) => e.stopPropagation()}
                           style={{ color: 'var(--accent-sage)', textDecoration: 'none' }}>
                          <Phone size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{c.telephone}</span>
                        </a>
                      ) : '-'}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={12} style={{ color: 'var(--fg-muted)' }} />
                        {c.compte_raison_sociale || c.compte_nom_particulier || '-'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      {fmtRelative(c.updated_at || null)}
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
  padding: 'var(--s-3)',
  textAlign: 'left',
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'var(--text-xs)', fontWeight: 600,
  color: 'var(--fg-primary)',
  background: 'var(--bg-canvas)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--s-3)',
  color: 'var(--fg-primary)',
};

const badgePrincipal: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em',
  padding: '2px 8px', borderRadius: 999,
  background: 'color-mix(in srgb, var(--accent-terracotta) 15%, transparent)',
  color: 'var(--accent-terracotta)',
  marginTop: 4,
};

export default Contacts;
