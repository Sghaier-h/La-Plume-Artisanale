/**
 * Ajustements comptes RH (Phase C · §11bis + §14quater.5)
 *
 * - Liste des ajustements (reset zéro / correction / régularisation)
 * - Saisie d'un nouvel ajustement avec génération auto du code AJ-{NOM}-{YYYY}-{NN}
 * - Double validation ADMIN (le validateur ≠ créateur)
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

const AjustementsComptesRh: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [form, setForm] = useState({
    id_employe: '',
    date_ajustement: new Date().toISOString().slice(0, 10),
    montant: '',
    motif: '',
    type_ajustement: 'correction_solde',
  });

  const load = async () => {
    try {
      const res = await api.get('/v2/rh/ajustements', { params: { limit: 200 } });
      setRows(res.data?.data || []);
    } catch (e) {
      console.error('AjustementsComptesRh:', e);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const stats = {
    attente: rows.filter((r: any) => r.statut_validation === 'en_attente').length,
    validees: rows.filter((r: any) => r.statut_validation === 'validee').length,
    rejetees: rows.filter((r: any) => r.statut_validation === 'rejetee').length,
  };

  const createAjust = async () => {
    try {
      await api.post('/v2/rh/ajustements', form);
      setShowNew(false);
      setForm({ ...form, montant: '', motif: '' });
      load();
    } catch (e: any) {
      window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur création ajustement'));
    }
  };

  const valider = async (id: number) => {
    try { await api.post(`/v2/rh/ajustements/${id}/valider`, {}); load(); }
    catch (e: any) { window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur validation')); }
  };
  const rejeter = async (id: number) => {
    const motif = window.prompt('Motif du rejet ?');
    if (!motif) return;
    try { await api.post(`/v2/rh/ajustements/${id}/rejeter`, { motif_rejet: motif }); load(); }
    catch (e: any) { window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur rejet')); }
  };

  return (
    <DashboardShell
      eyebrow="§11bis.5 · Ajustements RH"
      title="Ajustements de comptes RH"
      subtitle="Reset zéro, correction solde, régularisation (double validation ADMIN)."
      headerRight={
        <button type="button" onClick={() => setShowNew(true)} style={btnPrimary}>
          <Plus size={14} style={{ marginRight: 6 }} />
          Nouveau
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
        <KpiCard label="En attente" value={String(stats.attente)} unit="à valider" tone="gold" icon={<Scale size={18} />}
          active={statutFilter === 'en_attente'} onClick={() => setStatutFilter((p) => p === 'en_attente' ? '' : 'en_attente')} />
        <KpiCard label="Validées" value={String(stats.validees)} unit="totales" tone="sage" icon={<Check size={18} />}
          active={statutFilter === 'validee'} onClick={() => setStatutFilter((p) => p === 'validee' ? '' : 'validee')} />
        <KpiCard label="Rejetées" value={String(stats.rejetees)} unit="totales" tone="rose" icon={<X size={18} />}
          active={statutFilter === 'rejetee'} onClick={() => setStatutFilter((p) => p === 'rejetee' ? '' : 'rejetee')} />
      </div>

      <SectionCard title="Historique des ajustements" subtitle={`${rows.length} opérations`}>
        <div style={{ overflowX: 'auto', margin: '0 calc(var(--s-5) * -1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                {['Code', 'Date', 'Employé', 'Type', 'Montant', 'Avant', 'Après', 'Statut', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.filter((r: any) => !statutFilter || r.statut_validation === statutFilter).map((r: any) => (
                <tr key={r.id_ajustement} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdMono}><strong>{r.code_ajustement}</strong></td>
                  <td style={tdMono}>{new Date(r.date_ajustement).toLocaleDateString('fr-FR')}</td>
                  <td style={td}>
                    <strong>{r.nom}</strong> {r.prenom}
                    <div style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }}>{r.matricule}</div>
                  </td>
                  <td style={td}>{r.type_ajustement}</td>
                  <td style={{ ...tdMono, fontWeight: 700, color: Number(r.montant) >= 0 ? 'var(--accent-sage)' : 'var(--color-danger)' }}>
                    {fmtMoney(r.montant)}
                  </td>
                  <td style={tdMono}>{fmtMoney(r.ancienne_valeur)}</td>
                  <td style={tdMono}>{fmtMoney(r.nouvelle_valeur)}</td>
                  <td style={td}>{r.statut_validation}</td>
                  <td style={td}>
                    {r.statut_validation === 'en_attente' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" style={btnXs('sage')} onClick={() => valider(r.id_ajustement)}>
                          <Check size={12} /> Valider
                        </button>
                        <button type="button" style={btnXs('rose')} onClick={() => rejeter(r.id_ajustement)}>
                          <X size={12} /> Rejeter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {rows.filter((r: any) => !statutFilter || r.statut_validation === statutFilter).length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 'var(--s-5)', textAlign: 'center', color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                    Aucun ajustement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showNew && (
        <SectionCard title="Nouvel ajustement" subtitle="Code AJ-{NOM}-{YYYY}-{NN} généré auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
            <Field label="ID employé">
              <input value={form.id_employe} onChange={(e) => setForm({ ...form, id_employe: e.target.value })} style={inp} />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date_ajustement} onChange={(e) => setForm({ ...form, date_ajustement: e.target.value })} style={inp} />
            </Field>
            <Field label="Type">
              <select value={form.type_ajustement} onChange={(e) => setForm({ ...form, type_ajustement: e.target.value })} style={inp}>
                <option value="reset_zero">Reset à zéro</option>
                <option value="correction_solde">Correction de solde</option>
                <option value="regularisation">Régularisation</option>
                <option value="autre">Autre</option>
              </select>
            </Field>
            <Field label="Montant (DT, signé)">
              <input value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} style={inp} inputMode="decimal" />
            </Field>
            <Field label="Motif (obligatoire)">
              <input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} style={inp} />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--s-4)' }}>
            <button type="button" style={btnPrimary} onClick={createAjust}>Créer</button>
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

export default AjustementsComptesRh;
