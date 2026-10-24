/**
 * CessionsIntragroupe — Liste des cessions LP↔CAPSCOR (§14quater.3)
 */
import React, { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import { DashboardShell, SectionCard } from '../../components/dashboard';
import { cessionsService, Cession } from '../../services/comptabiliteApi';

const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

const statutColor: Record<string, string> = {
  calculee: '#C89B3C', vendue: '#7A8C6A', facturee: '#3B4E68',
  soldee: '#8A6E4A', annulee: '#B84A4A',
};

const CessionsIntragroupe: React.FC = () => {
  const [cessions, setCessions] = useState<Cession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const r = await cessionsService.list(); setCessions(r.data?.data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const annuler = async (c: Cession) => {
    const motif = window.prompt('Motif d\'annulation :');
    if (motif === null) return;
    try { await cessionsService.annuler(c.id_cession, motif || undefined); await load(); }
    catch (e: any) { alert(e?.response?.data?.error?.message || e?.message || 'Erreur'); }
  };

  return (
    <DashboardShell
      eyebrow="§14quater.3 · Cessions"
      title="Cessions intra-groupe"
      subtitle="Cessions LP → CAPSCOR calculées à partir des dossiers d'import. Marge appliquée au coût de revient prorata."
    >
      <SectionCard title="Liste des cessions" subtitle={`${cessions.length} cessions`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>N°</th>
                <th style={th}>Dossier</th>
                <th style={th}>Pays</th>
                <th style={{ ...th, textAlign: 'right' }}>Poids kg</th>
                <th style={{ ...th, textAlign: 'right' }}>Coût DT</th>
                <th style={{ ...th, textAlign: 'right' }}>Marge %</th>
                <th style={th}>Statut</th>
                <th style={th}>Date</th>
                <th style={th}> </th>
              </tr>
            </thead>
            <tbody>
              {cessions.map((c) => (
                <tr key={c.id_cession}>
                  <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{c.numero_cession || c.cle_unique}</td>
                  <td style={td}>{c.numero_dossier || '—'}</td>
                  <td style={td}>{c.pays_origine || '—'}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{(Number(c.poids_kg) || 0).toLocaleString('fr-FR')}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(c.cout_cession_dt)}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{Number(c.marge_pct || 0).toFixed(2)}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: (statutColor[c.statut] || '#888') + '22', color: statutColor[c.statut] || '#888', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {c.statut}
                    </span>
                  </td>
                  <td style={td}>{fmtDate(c.date_calcul)}</td>
                  <td style={td}>
                    {['soldee','annulee'].includes(c.statut) ? null : (
                      <button type="button" onClick={() => annuler(c)} style={btnDanger} title="Annuler cette cession">
                        <XCircle size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && cessions.length === 0 && (
                <tr><td colSpan={9} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune cession.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

export default CessionsIntragroupe;

const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnDanger: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '6px 10px', minHeight: 44, minWidth: 44,
  background: 'transparent', color: 'var(--color-danger)',
  border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
};
