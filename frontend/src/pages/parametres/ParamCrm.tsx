import React, { useEffect, useState } from 'react';
import { Tag, Target, XCircle, ChevronDown, Plus, Trash2, Coins, Hash } from 'lucide-react';
import { DashboardShell, SectionCard } from '../../components/dashboard';
import { paramCrmApi } from '../../services/crmApi';

// §15 — Paramètres CRM (branchés backend v2)

type SectionKind = 'sources-leads' | 'motifs-perte' | 'categories-clients' | 'devises';

interface SectionMeta {
  key: SectionKind;
  label: string;
  icon: React.ReactNode;
  hasColor?: boolean;
  extraCols?: { key: string; label: string; input?: 'text' | 'number' }[];
}

const SECTIONS: SectionMeta[] = [
  { key: 'sources-leads',      label: 'Sources de leads',    icon: <Target size={18} /> },
  { key: 'motifs-perte',       label: 'Motifs de perte',     icon: <XCircle size={18} /> },
  { key: 'categories-clients', label: 'Catégories clients',  icon: <Tag size={18} />, hasColor: true },
  { key: 'devises',            label: 'Devises acceptées',   icon: <Coins size={18} />,
    extraCols: [
      { key: 'symbole',            label: 'Symbole',  input: 'text' },
      { key: 'arrondi',            label: 'Décimales', input: 'number' },
      { key: 'taux_change_vs_tnd', label: 'Taux / TND', input: 'number' },
    ],
  },
];

interface Row {
  id_source?: number;
  id_motif?: number;
  id_categorie?: number;
  code: string;
  libelle: string;
  couleur?: string;
  symbole?: string;
  arrondi?: number;
  taux_change_vs_tnd?: number;
  actif: boolean;
  ordre?: number;
}

const idOf = (kind: SectionKind, r: Row): any =>
  kind === 'devises' ? r.code
  : kind === 'sources-leads' ? r.id_source
  : kind === 'motifs-perte' ? r.id_motif
  : r.id_categorie;

const ParamCrm: React.FC = () => {
  const [data, setData] = useState<Record<SectionKind, Row[]>>({
    'sources-leads': [], 'motifs-perte': [], 'categories-clients': [], 'devises': [],
  });
  const [numConfigs, setNumConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<SectionKind | 'num'>('sources-leads');
  const [newRow, setNewRow] = useState<Partial<Row>>({});

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s1, s2, s3, s4, sn] = await Promise.all([
        paramCrmApi.list('sources-leads'),
        paramCrmApi.list('motifs-perte'),
        paramCrmApi.list('categories-clients'),
        paramCrmApi.list('devises'),
        paramCrmApi.numListe().catch(() => ({ data: { data: [] } })),
      ]);
      setData({
        'sources-leads':      (s1.data.data as Row[]) || [],
        'motifs-perte':       (s2.data.data as Row[]) || [],
        'categories-clients': (s3.data.data as Row[]) || [],
        'devises':            (s4.data.data as Row[]) || [],
      });
      setNumConfigs((sn.data as any).data || []);
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e.message);
    } finally { setLoading(false); }
  };
  useEffect(() => { reload(); }, []);

  const add = async (kind: SectionKind) => {
    if (!newRow.libelle) return;
    const payload: any = {
      code: newRow.code || String(newRow.libelle).toUpperCase().replace(/\s+/g, '_'),
      libelle: newRow.libelle,
      actif: true,
      ordre: 999,
    };
    if (kind === 'categories-clients') payload.couleur = newRow.couleur || null;
    if (kind === 'devises') {
      payload.symbole = newRow.symbole || null;
      payload.arrondi = newRow.arrondi ?? 2;
      payload.taux_change_vs_tnd = newRow.taux_change_vs_tnd ?? 1;
    }
    try {
      await paramCrmApi.upsert(kind, payload);
      setNewRow({});
      reload();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e.message);
    }
  };

  const remove = async (kind: SectionKind, r: Row) => {
    if (!window.confirm(`Supprimer "${r.libelle}" ?`)) return;
    try {
      await paramCrmApi.remove(kind, idOf(kind, r));
      reload();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e.message);
    }
  };

  const saveNum = async (entite: string, patch: any) => {
    try {
      await paramCrmApi.numUpdate(entite, patch);
      reload();
    } catch (e: any) { alert(e?.response?.data?.error?.message || e.message); }
  };

  return (
    <DashboardShell
      eyebrow="§15 · Paramètres"
      title="CRM & Clients"
      subtitle="Sources de leads, motifs de perte, catégories, devises et numérotation automatique."
    >
      {loading && <div style={{ padding: 'var(--s-8)', color: 'var(--fg-muted)' }}>Chargement…</div>}
      {error && <div style={{ padding: 'var(--s-4)', color: 'var(--color-danger)', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}

      {SECTIONS.map((sec) => {
        const items = data[sec.key];
        const isOpen = expanded === sec.key;
        return (
          <SectionCard key={sec.key}
            icon={sec.icon}
            title={sec.label}
            subtitle={`${items.length} entrée(s)`}
            headerRight={
              <button style={btnGhost} onClick={() => setExpanded((p) => (p === sec.key ? 'sources-leads' : sec.key))}>
                <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--duration)' }} />
              </button>
            }
          >
            {isOpen && (
              <>
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={thStyle}>Code</th>
                      <th style={thStyle}>Libellé</th>
                      {sec.hasColor && <th style={thStyle}>Couleur</th>}
                      {sec.extraCols?.map((c) => <th key={c.key} style={thStyle}>{c.label}</th>)}
                      <th style={thStyle}>Actif</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => (
                      <tr key={`${sec.key}-${idOf(sec.key, r)}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{r.code}</td>
                        <td style={tdStyle}>{r.libelle}</td>
                        {sec.hasColor && (
                          <td style={tdStyle}>
                            {r.couleur && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 14, height: 14, borderRadius: 4, background: r.couleur, border: '1px solid var(--border-subtle)' }} />
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{r.couleur}</span>
                              </span>
                            )}
                          </td>
                        )}
                        {sec.extraCols?.map((c) => <td key={c.key} style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{(r as any)[c.key] ?? '-'}</td>)}
                        <td style={tdStyle}>{r.actif ? '✓' : '—'}</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <button onClick={() => remove(sec.key, r)} style={btnDanger}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', gap: 8, marginTop: 'var(--s-4)', paddingTop: 'var(--s-4)', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  <input placeholder="Code (auto)" value={newRow.code || ''} onChange={(e) => setNewRow({ ...newRow, code: e.target.value })}
                         style={{ ...inputStyle, width: 140, fontFamily: 'var(--font-mono)' }} />
                  <input placeholder="Libellé" value={newRow.libelle || ''} onChange={(e) => setNewRow({ ...newRow, libelle: e.target.value })}
                         style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
                  {sec.hasColor && (
                    <input type="color" value={newRow.couleur || '#C8663D'} onChange={(e) => setNewRow({ ...newRow, couleur: e.target.value })}
                           style={{ ...inputStyle, width: 44, padding: 0, height: 38 }} />
                  )}
                  {sec.extraCols?.map((c) => (
                    <input key={c.key} type={c.input || 'text'} placeholder={c.label}
                           value={(newRow as any)[c.key] ?? ''}
                           onChange={(e) => setNewRow({ ...newRow, [c.key]: c.input === 'number' ? Number(e.target.value) : e.target.value })}
                           style={{ ...inputStyle, width: 120 }} />
                  ))}
                  <button onClick={() => add(sec.key)} style={btnPrimary}>
                    <Plus size={14} style={{ marginRight: 4 }} /> Ajouter
                  </button>
                </div>
              </>
            )}
          </SectionCard>
        );
      })}

      {/* Numérotation configurable */}
      <SectionCard
        icon={<Hash size={18} />}
        title="Numérotation automatique"
        subtitle="Format des codes générés pour clients, contacts, leads, opportunités, interactions"
        headerRight={
          <button style={btnGhost} onClick={() => setExpanded((p) => (p === 'num' ? 'sources-leads' : 'num'))}>
            <ChevronDown size={14} style={{ transform: expanded === 'num' ? 'rotate(180deg)' : 'none' }} />
          </button>
        }
      >
        {expanded === 'num' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--s-4)' }}>
            {numConfigs.map((n: any) => (
              <div key={n.entite} style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--s-4)',
                background: 'var(--bg-canvas)',
              }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600, color: 'var(--fg-primary)', marginBottom: 4 }}>
                  {n.entite}
                </div>
                <label style={labelStyle}>Format</label>
                <input defaultValue={n.format}
                       onBlur={(e) => e.target.value !== n.format && saveNum(n.entite, { format: e.target.value })}
                       style={{ ...inputStyle, fontFamily: 'var(--font-mono)', width: '100%', marginBottom: 6 }} />
                <label style={labelStyle}>Reset</label>
                <select defaultValue={n.reset_period}
                        onChange={(e) => saveNum(n.entite, { reset_period: e.target.value })}
                        style={{ ...inputStyle, width: '100%', marginBottom: 6 }}>
                  <option value="jamais">Jamais</option>
                  <option value="annuel">Annuel</option>
                  <option value="mensuel">Mensuel</option>
                </select>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
                  Séquence : {n.sequence_courante ?? 0} · Dernière période : {n.derniere_periode || '—'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 6 }}>
                  Placeholders : <code>{'{YYYY}'}</code> <code>{'{YY}'}</code> <code>{'{MM}'}</code> <code>{'{YYYYMM}'}</code> <code>{'{SEQ:N}'}</code>
                </div>
              </div>
            ))}
            {numConfigs.length === 0 && (
              <div style={{ color: 'var(--fg-muted)' }}>Aucune configuration détectée (exécuter <code>npm run seed:demo</code>).</div>
            )}
          </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '8px 14px',
  background: 'var(--accent-terracotta)', color: 'var(--fg-inverse)',
  border: '1px solid var(--accent-terracotta)', borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  padding: '6px 10px', background: 'transparent', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999, cursor: 'pointer',
};
const btnDanger: React.CSSProperties = {
  padding: 4, background: 'transparent', border: 'none',
  color: 'var(--color-danger)', cursor: 'pointer',
};
const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--bg-elevated)',
  color: 'var(--fg-primary)',
  fontSize: 'var(--text-sm)',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
  color: 'var(--fg-muted)', marginBottom: 2, marginTop: 6,
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const thStyle: React.CSSProperties = {
  padding: 'var(--s-2)', textAlign: 'left',
  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
  fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--fg-primary)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
  borderBottom: '1px solid var(--border-subtle)',
};
const tdStyle: React.CSSProperties = { padding: 'var(--s-2)', color: 'var(--fg-primary)' };

export default ParamCrm;
