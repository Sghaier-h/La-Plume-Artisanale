/**
 * DepensesEspeces — Journal des dépenses espèces courantes (§9.9 + §14quater)
 * Clôture mensuelle en bloc, signature tactile pour > 50 DT.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Trash2, Plus } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { depensesEspecesService, DepenseEspece } from '../../services/comptabiliteApi';

const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');
const curPeriode = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const CATS = ['pourboire','cafe_ouvriers','depannage','consommable','petit_entretien','transport','carburant','parking','timbres','peage','communication','autre'];

const DepensesEspeces: React.FC = () => {
  const [periode, setPeriode] = useState(curPeriode());
  const [depenses, setDepenses] = useState<DepenseEspece[]>([]);
  const [totaux, setTotaux] = useState<any>({ total: 0, nb: 0, nb_non_cloturees: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ date_depense: '', categorie: 'cafe_ouvriers', libelle: '', montant: '', beneficiaire: '' });
  const [signaturePath, setSignaturePath] = useState<string>('');
  const [cloturableFilter, setCloturableFilter] = useState<'all' | 'cloturee' | 'en_attente'>('all');

  const load = async () => {
    try {
      const [l, t] = await Promise.all([
        depensesEspecesService.list({ periode }),
        depensesEspecesService.totaux(periode),
      ]);
      setDepenses(l.data?.data || []);
      setTotaux(t.data?.data || {});
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [periode]);

  const needsSignature = useMemo(() => Number(form.montant) > 50, [form.montant]);

  const submit = async () => {
    try {
      await depensesEspecesService.create({
        date_depense: form.date_depense || undefined,
        categorie: form.categorie,
        libelle: form.libelle,
        montant: Number(form.montant),
        beneficiaire: form.beneficiaire,
        signature_svg: needsSignature ? signaturePath : undefined,
      } as any);
      setShowCreate(false);
      setForm({ date_depense: '', categorie: 'cafe_ouvriers', libelle: '', montant: '', beneficiaire: '' });
      setSignaturePath('');
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Erreur');
    }
  };

  const cloturer = async () => {
    if (!window.confirm(`Clôturer définitivement la période ${periode} ?`)) return;
    try {
      await depensesEspecesService.cloturerMois(periode);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Erreur');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette dépense ?')) return;
    try { await depensesEspecesService.remove(id); await load(); } catch (e: any) { alert(e?.message); }
  };

  return (
    <DashboardShell
      eyebrow="§9.9 · Dépenses espèces"
      title="Journal des dépenses"
      subtitle="Dépenses courantes en espèces, clôturables en bloc en fin de mois. Signature tactile obligatoire pour tout montant > 50 DT."
      headerRight={
        <>
          <input type="month" value={periode} onChange={(e) => setPeriode(e.target.value)} style={input} />
          <button type="button" onClick={() => setShowCreate(true)} style={btnPrimary}>
            <Plus size={14} style={{ marginRight: 6 }} /> Nouvelle
          </button>
          <button type="button" onClick={cloturer} disabled={!totaux.nb_non_cloturees} style={btnDanger}>
            <Lock size={14} style={{ marginRight: 6 }} /> Clôturer {periode}
          </button>
        </>
      }
    >
      <div style={kpiGrid}>
        <KpiCard label="Total période" value={fmtMoney(totaux.total).replace(' DT','')} unit="DT" loading={loading} tone="terracotta"
          active={cloturableFilter === 'all'}
          onClick={() => setCloturableFilter('all')} />
        <KpiCard label="Nb dépenses" value={String(totaux.nb || 0)} loading={loading} tone="indigo"
          active={cloturableFilter === 'cloturee'}
          onClick={() => setCloturableFilter((p) => p === 'cloturee' ? 'all' : 'cloturee')} />
        <KpiCard label="À clôturer" value={String(totaux.nb_non_cloturees || 0)} loading={loading} tone="gold"
          active={cloturableFilter === 'en_attente'}
          onClick={() => setCloturableFilter((p) => p === 'en_attente' ? 'all' : 'en_attente')} />
      </div>

      <SectionCard title={`Journal ${periode}`} subtitle={`${depenses.length} dépenses`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Catégorie</th>
                <th style={th}>Libellé</th>
                <th style={th}>Bénéficiaire</th>
                <th style={{ ...th, textAlign: 'right' }}>Montant</th>
                <th style={th}>Statut</th>
                <th style={th}> </th>
              </tr>
            </thead>
            <tbody>
              {depenses.filter((d) =>
                cloturableFilter === 'all' ||
                (cloturableFilter === 'cloturee' && d.comptabilisee) ||
                (cloturableFilter === 'en_attente' && !d.comptabilisee)
              ).map((d) => (
                <tr key={d.id_depense}>
                  <td style={td}>{fmtDate(d.date_depense)}</td>
                  <td style={td}>{d.categorie}</td>
                  <td style={td}>{d.libelle || '—'}</td>
                  <td style={td}>{d.beneficiaire || '—'}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmtMoney(d.montant)}</td>
                  <td style={td}>{d.comptabilisee ? <span style={{ color: 'var(--color-success)' }}>comptabilisée</span> : <span style={{ color: 'var(--fg-muted)' }}>en attente</span>}</td>
                  <td style={td}>
                    {!d.comptabilisee && (
                      <button type="button" onClick={() => remove(d.id_depense)} style={btnDangerSm} title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && depenses.filter((d) =>
                cloturableFilter === 'all' ||
                (cloturableFilter === 'cloturee' && d.comptabilisee) ||
                (cloturableFilter === 'en_attente' && !d.comptabilisee)
              ).length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucune dépense pour {periode}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showCreate && (
        <div style={modalBackdrop} onClick={() => setShowCreate(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0, marginBottom: 'var(--s-4)' }}>Nouvelle dépense espèces</h3>
            <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <label style={lbl}>Date<input type="date" value={form.date_depense} onChange={e => setForm(f => ({ ...f, date_depense: e.target.value }))} style={input}/></label>
              <label style={lbl}>Catégorie
                <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={input}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label style={lbl}>Montant (DT)<input type="number" step="0.001" min="0" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} style={input}/></label>
              <label style={lbl}>Bénéficiaire<input type="text" value={form.beneficiaire} onChange={e => setForm(f => ({ ...f, beneficiaire: e.target.value }))} style={input}/></label>
            </div>
            <label style={{ ...lbl, marginTop: 'var(--s-3)' }}>Libellé<input type="text" value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} style={input}/></label>
            {needsSignature && (
              <div style={{ marginTop: 'var(--s-4)' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)', marginBottom: 4 }}>Signature tactile requise (&gt; 50 DT)</div>
                <SignaturePad value={signaturePath} onChange={setSignaturePath} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-5)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={btnGhost}>Annuler</button>
              <button type="button" onClick={submit} style={btnPrimary} disabled={needsSignature && !signaturePath}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

// Signature pad : canvas tactile → SVG path (stocké en signature_svg).
export const SignaturePad: React.FC<{ value: string; onChange: (p: string) => void }> = ({ value, onChange }) => {
  const [drawing, setDrawing] = useState(false);
  const [path, setPath] = useState(value);
  const [current, setCurrent] = useState<string[]>([]);

  const getPoint = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  return (
    <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)' }}>
      <svg
        viewBox="0 0 400 150"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 150, touchAction: 'none', cursor: 'crosshair' }}
        onPointerDown={(e) => {
          const [x, y] = getPoint(e);
          setDrawing(true);
          setCurrent([`M ${x.toFixed(1)} ${y.toFixed(1)}`]);
        }}
        onPointerMove={(e) => {
          if (!drawing) return;
          const [x, y] = getPoint(e);
          setCurrent((c) => [...c, `L ${x.toFixed(1)} ${y.toFixed(1)}`]);
        }}
        onPointerUp={() => {
          setDrawing(false);
          const newPath = (path ? path + ' ' : '') + current.join(' ');
          setPath(newPath);
          setCurrent([]);
          onChange(newPath);
        }}
      >
        <path d={path} stroke="var(--fg-primary)" strokeWidth="2" fill="none" />
        <path d={current.join(' ')} stroke="var(--accent-terracotta)" strokeWidth="2" fill="none" />
      </svg>
      <div style={{ padding: 'var(--s-2)', textAlign: 'right' }}>
        <button type="button" onClick={() => { setPath(''); onChange(''); }} style={{ background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', cursor: 'pointer', minHeight: 36 }}>
          Effacer
        </button>
      </div>
    </div>
  );
};

export default DepensesEspeces;

const kpiGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', marginLeft: 'var(--s-2)' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' };
const btnDanger: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', marginLeft: 'var(--s-2)' };
const btnDangerSm: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minHeight: 44, minWidth: 44, background: 'transparent', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' };
const modalBackdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--s-4)' };
const modalCard: React.CSSProperties = { background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--s-5)', width: '100%', maxWidth: 560, boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' };
const input: React.CSSProperties = { padding: '10px 12px', minHeight: 44, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)' };
