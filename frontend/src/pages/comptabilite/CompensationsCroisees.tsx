/**
 * CompensationsCroisees — Opérations équilibrées (§14quater.4)
 * Wizard 2 lignes avec vérification balance = 0 en direct.
 */
import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { compensationsService, Compensation, CompensationLigne } from '../../services/comptabiliteApi';

const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

const statutColor: Record<string, string> = { brouillon: '#8A6E4A', validee: '#7A8C6A', annulee: '#B84A4A' };

const emptyLigne = (sens: 'debit' | 'credit'): CompensationLigne => ({
  sens, type_tiers: 'autre', nom_tiers: '', libelle: '', montant: 0,
});

const CompensationsCroisees: React.FC = () => {
  const [compensations, setCompensations] = useState<Compensation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [form, setForm] = useState({ libelle: '', date_compensation: '', notes: '' });
  const [lignes, setLignes] = useState<CompensationLigne[]>([emptyLigne('debit'), emptyLigne('credit')]);

  const load = async () => {
    try { const r = await compensationsService.list(); setCompensations(r.data?.data || []); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const totalDebit  = lignes.filter(l => l.sens === 'debit').reduce((s, l) => s + Number(l.montant || 0), 0);
  const totalCredit = lignes.filter(l => l.sens === 'credit').reduce((s, l) => s + Number(l.montant || 0), 0);
  const equilibre   = Math.abs(totalDebit - totalCredit) < 0.001 && totalDebit > 0;

  const addLigne = (sens: 'debit' | 'credit') => setLignes(l => [...l, emptyLigne(sens)]);
  const removeLigne = (idx: number) => setLignes(l => l.filter((_, i) => i !== idx));
  const updateLigne = (idx: number, patch: Partial<CompensationLigne>) =>
    setLignes(l => l.map((x, i) => i === idx ? { ...x, ...patch } : x));

  const submit = async () => {
    if (!equilibre) { window.showToast?.('error', 'Erreur', String('Balance invalide : débit ≠ crédit')); return; }
    try {
      await compensationsService.create({
        libelle: form.libelle,
        date_compensation: form.date_compensation || undefined,
        notes: form.notes,
        lignes,
      });
      setShowCreate(false);
      setForm({ libelle: '', date_compensation: '', notes: '' });
      setLignes([emptyLigne('debit'), emptyLigne('credit')]);
      await load();
    } catch (e: any) {
      window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || e?.message || 'Erreur'));
    }
  };

  const valider = async (c: Compensation) => {
    try { await compensationsService.valider(c.id_compensation); await load(); }
    catch (e: any) { window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur validation')); }
  };
  const annuler = async (c: Compensation) => {
    const motif = window.prompt('Motif d\'annulation :');
    if (motif === null) return;
    try { await compensationsService.annuler(c.id_compensation, motif || undefined); await load(); }
    catch (e: any) { window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur')); }
  };

  return (
    <DashboardShell
      eyebrow="§14quater.4 · Compensations"
      title="Compensations croisées"
      subtitle="Opérations équilibrées sans flux de trésorerie (ex. CNSS vs avance employée, créance client vs dette fournisseur)."
      headerRight={
        <button type="button" onClick={() => setShowCreate(true)} style={btnPrimary}>
          <Plus size={14} style={{ marginRight: 6 }} /> Nouvelle compensation
        </button>
      }
    >
      <div style={kpiGrid}>
        <KpiCard label="Total compensations" value={String(compensations.length)} tone="terracotta" loading={loading}
          active={statutFilter === ''}
          onClick={() => setStatutFilter('')}/>
        <KpiCard label="En brouillon" value={String(compensations.filter(c => c.statut === 'brouillon').length)} tone="gold" loading={loading}
          active={statutFilter === 'brouillon'}
          onClick={() => setStatutFilter((p) => p === 'brouillon' ? '' : 'brouillon')}/>
        <KpiCard label="Validées" value={String(compensations.filter(c => c.statut === 'validee').length)} tone="sage" loading={loading}
          active={statutFilter === 'validee'}
          onClick={() => setStatutFilter((p) => p === 'validee' ? '' : 'validee')}/>
      </div>

      <SectionCard title="Liste des compensations" subtitle={`${compensations.length} opérations`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>N°</th>
                <th style={th}>Date</th>
                <th style={th}>Libellé</th>
                <th style={{ ...th, textAlign: 'right' }}>Montant</th>
                <th style={{ ...th, textAlign: 'right' }}>Lignes</th>
                <th style={th}>Statut</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {compensations.filter((c) => !statutFilter || c.statut === statutFilter).map((c) => (
                <tr key={c.id_compensation}>
                  <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{c.numero_compensation}</td>
                  <td style={td}>{fmtDate(c.date_compensation)}</td>
                  <td style={td}>{c.libelle}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(c.montant_total)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{c.nb_lignes || '—'}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: statutColor[c.statut] + '22', color: statutColor[c.statut], fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {c.statut}
                    </span>
                  </td>
                  <td style={td}>
                    {c.statut === 'brouillon' && (
                      <button type="button" onClick={() => valider(c)} style={btnSmSuccess}>
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {c.statut !== 'annulee' && (
                      <button type="button" onClick={() => annuler(c)} style={btnSmDanger}>
                        <XCircle size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && compensations.filter((c) => !statutFilter || c.statut === statutFilter).length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune compensation.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showCreate && (
        <div style={modalBackdrop} onClick={() => setShowCreate(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0, marginBottom: 'var(--s-4)' }}>Nouvelle compensation croisée</h3>
            <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <label style={lbl}>Date<input type="date" value={form.date_compensation} onChange={e => setForm(f => ({ ...f, date_compensation: e.target.value }))} style={input}/></label>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Libellé<input type="text" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} style={input}/></label>
            </div>

            <h4 style={{ marginTop: 'var(--s-4)', marginBottom: 'var(--s-2)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Lignes</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Sens</th>
                    <th style={th}>Type tiers</th>
                    <th style={th}>Nom tiers</th>
                    <th style={th}>Libellé</th>
                    <th style={{ ...th, textAlign: 'right' }}>Montant</th>
                    <th style={th}> </th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((l, idx) => (
                    <tr key={idx}>
                      <td style={td}>
                        <select value={l.sens} onChange={e => updateLigne(idx, { sens: e.target.value as any })} style={inputSmall}>
                          <option value="debit">débit</option><option value="credit">crédit</option>
                        </select>
                      </td>
                      <td style={td}>
                        <select value={l.type_tiers} onChange={e => updateLigne(idx, { type_tiers: e.target.value as any })} style={inputSmall}>
                          <option value="client">client</option>
                          <option value="fournisseur">fournisseur</option>
                          <option value="employe">employé</option>
                          <option value="autre">autre</option>
                        </select>
                      </td>
                      <td style={td}><input type="text" value={l.nom_tiers || ''} onChange={e => updateLigne(idx, { nom_tiers: e.target.value })} style={inputSmall}/></td>
                      <td style={td}><input type="text" value={l.libelle || ''} onChange={e => updateLigne(idx, { libelle: e.target.value })} style={inputSmall}/></td>
                      <td style={td}><input type="number" step="0.001" min="0" value={l.montant || 0} onChange={e => updateLigne(idx, { montant: Number(e.target.value) })} style={{ ...inputSmall, textAlign: 'right', fontFamily: 'var(--font-mono)' }}/></td>
                      <td style={td}>
                        {lignes.length > 2 && (
                          <button type="button" onClick={() => removeLigne(idx)} style={btnSmDanger}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-3)' }}>
              <button type="button" onClick={() => addLigne('debit')} style={btnGhost}>+ Ligne débit</button>
              <button type="button" onClick={() => addLigne('credit')} style={btnGhost}>+ Ligne crédit</button>
            </div>

            <div style={{ marginTop: 'var(--s-4)', padding: 'var(--s-3)', background: equilibre ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', borderRadius: 'var(--radius-sm)', color: equilibre ? 'var(--color-success)' : 'var(--color-danger)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              Débit: {totalDebit.toFixed(3)} DT · Crédit: {totalCredit.toFixed(3)} DT · {equilibre ? 'balance = 0 ✓' : 'DÉSÉQUILIBRE'}
            </div>

            <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-5)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={btnGhost}>Annuler</button>
              <button type="button" onClick={submit} style={btnPrimary} disabled={!equilibre || !form.libelle}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default CompensationsCroisees;

const kpiGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' };
const btnSmSuccess: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minHeight: 44, minWidth: 44, background: 'transparent', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginRight: 4 };
const btnSmDanger: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minHeight: 44, minWidth: 44, background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' };
const modalBackdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--s-4)' };
const modalCard: React.CSSProperties = { background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--s-5)', width: '100%', maxWidth: 760, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' };
const input: React.CSSProperties = { padding: '10px 12px', minHeight: 44, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)' };
const inputSmall: React.CSSProperties = { padding: '6px 8px', minHeight: 36, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', width: '100%' };
