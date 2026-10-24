/**
 * Compensations RH (Phase C · §11bis + §14quater.7)
 *
 * Compensations CNSS salarié / CNSS employeur / IRPP / acompte privé /
 * remboursement avance / autre, à appliquer sur le compte employé.
 *
 * Design system La Plume strict.
 */
import React, { useEffect, useState } from 'react';
import { Scale, Plus, Check, X } from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';
import api from '../../services/api';

const fmtMoney = (n: number) =>
  Number(n ?? 0).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 3,
  });

const CompensationsRh: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    id_employe: '',
    date_compensation: new Date().toISOString().slice(0, 10),
    type_compensation: 'cnss_salarie',
    montant_a_compenser: '',
    source: 'salaire',
    motif: '',
  });

  const load = async () => {
    try {
      const res = await api.get('/v2/rh/compensations-rh', { params: { limit: 200 } });
      setRows(res.data?.data || []);
    } catch (e) {
      console.error('CompensationsRh:', e);
    }
  };
  useEffect(() => { load(); }, []);

  const stats = {
    attente: rows.filter((r: any) => r.statut === 'en_attente').length,
    appliquees: rows.filter((r: any) => r.statut === 'appliquee').length,
    annulees: rows.filter((r: any) => r.statut === 'annulee').length,
  };

  const createComp = async () => {
    try {
      await api.post('/v2/rh/compensations-rh', form);
      setShowNew(false);
      setForm({ ...form, montant_a_compenser: '', motif: '' });
      load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Erreur création compensation');
    }
  };

  const appliquer = async (id: number) => {
    try { await api.post(`/v2/rh/compensations-rh/${id}/appliquer`, {}); load(); }
    catch (e: any) { alert(e?.response?.data?.error?.message || 'Erreur'); }
  };
  const annuler = async (id: number) => {
    try { await api.post(`/v2/rh/compensations-rh/${id}/annuler`, {}); load(); }
    catch (e: any) { alert(e?.response?.data?.error?.message || 'Erreur'); }
  };

  return (
    <DashboardShell
      eyebrow="§11bis.4 · Compensations RH"
      title="Compensations RH"
      subtitle="CNSS, IRPP, acomptes privés, remboursements d'avance."
      headerRight={
        <button type="button" onClick={() => setShowNew(true)} style={btnPrimary}>
          <Plus size={14} style={{ marginRight: 6 }} />
          Nouvelle compensation
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <KpiCard label="En attente" value={String(stats.attente)} unit="à appliquer" tone="gold" icon={<Scale size={18} />} />
        <KpiCard label="Appliquées" value={String(stats.appliquees)} unit="totales" tone="sage" icon={<Check size={18} />} />
        <KpiCard label="Annulées" value={String(stats.annulees)} unit="totales" tone="rose" icon={<X size={18} />} />
      </div>

      <SectionCard title="Compensations" subtitle={`${rows.length} opérations`}>
        <div style={{ overflowX: 'auto', margin: '0 calc(var(--s-5) * -1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                {['Date', 'Employé', 'Type', 'Montant', 'Source', 'Statut', 'Motif', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id_comp_rh} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdMono}>{new Date(r.date_compensation).toLocaleDateString('fr-FR')}</td>
                  <td style={td}>
                    <strong>{r.nom}</strong> {r.prenom}
                    <div style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }}>{r.matricule}</div>
                  </td>
                  <td style={td}>{r.type_compensation}</td>
                  <td style={{ ...tdMono, fontWeight: 700, color: 'var(--accent-gold)' }}>{fmtMoney(r.montant_a_compenser)}</td>
                  <td style={td}>{r.source}</td>
                  <td style={td}>{r.statut}</td>
                  <td style={td}>{r.motif || '—'}</td>
                  <td style={td}>
                    {r.statut === 'en_attente' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" style={btnXs('sage')} onClick={() => appliquer(r.id_comp_rh)}>
                          <Check size={12} /> Appliquer
                        </button>
                        <button type="button" style={btnXs('rose')} onClick={() => annuler(r.id_comp_rh)}>
                          <X size={12} /> Annuler
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--s-5)', textAlign: 'center', color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                    Aucune compensation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showNew && (
        <SectionCard
          title="Nouvelle compensation"
          subtitle="Saisie 2 lignes : montant + source (balance = 0 attendue)"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
            <Field label="ID employé">
              <input value={form.id_employe} onChange={(e) => setForm({ ...form, id_employe: e.target.value })} style={inp} />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date_compensation} onChange={(e) => setForm({ ...form, date_compensation: e.target.value })} style={inp} />
            </Field>
            <Field label="Type">
              <select value={form.type_compensation} onChange={(e) => setForm({ ...form, type_compensation: e.target.value })} style={inp}>
                <option value="cnss_salarie">CNSS salarié</option>
                <option value="cnss_employeur">CNSS employeur</option>
                <option value="impot_irpp">Impôt IRPP</option>
                <option value="acompte_prive">Acompte privé</option>
                <option value="avance_remboursement">Remboursement avance</option>
                <option value="autre">Autre</option>
              </select>
            </Field>
            <Field label="Montant (DT)">
              <input value={form.montant_a_compenser} onChange={(e) => setForm({ ...form, montant_a_compenser: e.target.value })} style={inp} inputMode="decimal" />
            </Field>
            <Field label="Source">
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={inp}>
                <option value="salaire">Salaire</option>
                <option value="prime">Prime</option>
                <option value="caisse_compensation">Caisse compensation</option>
              </select>
            </Field>
            <Field label="Motif">
              <input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} style={inp} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--s-4)' }}>
            <button type="button" style={btnPrimary} onClick={createComp}>Créer</button>
            <button type="button" style={btnGhost} onClick={() => setShowNew(false)}>Annuler</button>
          </div>
        </SectionCard>
      )}
    </DashboardShell>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>{label}</span>
    {children}
  </label>
);

const inp: React.CSSProperties = {
  background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)', padding: '8px 10px',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--fg-primary)',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: 'var(--s-3) var(--s-4)',
  fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em',
  color: 'var(--fg-muted)', fontWeight: 600,
};
const td: React.CSSProperties = { padding: 'var(--s-3) var(--s-4)', verticalAlign: 'middle' };
const tdMono: React.CSSProperties = { ...td, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' };

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '10px 18px', minHeight: 44,
  background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '10px 18px', minHeight: 44,
  background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
};
const btnXs = (tone: 'sage'|'rose'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '6px 10px', minHeight: 32,
  background: `color-mix(in srgb, var(--accent-${tone}) 15%, transparent)`,
  color: `var(--accent-${tone})`, border: `1px solid var(--accent-${tone})`,
  borderRadius: 999, fontFamily: 'var(--font-sans)', fontSize: '0.75rem',
  fontWeight: 600, cursor: 'pointer',
});

export default CompensationsRh;
