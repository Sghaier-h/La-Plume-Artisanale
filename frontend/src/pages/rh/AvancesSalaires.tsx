/**
 * Avances sur salaires (Phase C · §11bis + §14quater.6)
 *
 * Liste des avances par statut, wizard demande, validation 2 étapes
 * (approuver → payer) et remboursement.
 *
 * Accès : [ADMIN, RH_MANAGER].
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Plus, Check, X, Wallet, Undo2 } from 'lucide-react';
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

const STATUT_LABEL: Record<string, string> = {
  demande: 'En attente',
  approuvee: 'Approuvée',
  refusee: 'Refusée',
  payee: 'Payée',
  remboursee_partiel: 'Remboursement partiel',
  remboursee_total: 'Soldée',
};

const AvancesSalaires: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [statutFilter, setStatutFilter] = useState<string>('');
  const [form, setForm] = useState({
    id_employe: '',
    montant_demande: '',
    motif: '',
    modalite_remboursement: 'prochain_salaire',
  });

  const load = async () => {
    try {
      const res = await api.get('/v2/rh/avances', { params: { limit: 200 } });
      setRows(res.data?.data || []);
    } catch (e) {
      console.error('AvancesSalaires:', e);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const stats = {
    attente: rows.filter((r: any) => r.statut === 'demande').length,
    approuvees: rows.filter((r: any) => r.statut === 'approuvee').length,
    payees: rows.filter((r: any) => r.statut === 'payee').length,
    cumul: rows.reduce(
      (acc: number, r: any) =>
        acc + Number(r.statut === 'payee' ? r.solde_restant_avance : 0),
      0
    ),
  };

  const createAvance = async () => {
    try {
      await api.post('/v2/rh/avances', form);
      setShowNew(false);
      setForm({ id_employe: '', montant_demande: '', motif: '', modalite_remboursement: 'prochain_salaire' });
      load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Erreur création avance');
    }
  };

  const workflow = async (id: number, action: 'approuver' | 'refuser' | 'payer' | 'rembourser') => {
    try {
      if (action === 'refuser') {
        const motif = window.prompt('Motif du refus ?');
        if (!motif) return;
        await api.post(`/v2/rh/avances/${id}/refuser`, { motif_refus: motif });
      } else if (action === 'rembourser') {
        const montant = window.prompt('Montant à rembourser (DT) ?');
        if (!montant) return;
        await api.post(`/v2/rh/avances/${id}/rembourser`, { montant: Number(montant) });
      } else {
        await api.post(`/v2/rh/avances/${id}/${action}`, {});
      }
      load();
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || 'Erreur');
    }
  };

  return (
    <DashboardShell
      eyebrow="§11bis.6 · Avances sur salaires"
      title="Avances"
      subtitle="Demande → approbation → paiement → remboursement."
      headerRight={
        <button type="button" onClick={() => setShowNew(true)} style={btnPrimary}>
          <Plus size={14} style={{ marginRight: 6 }} />
          Nouvelle avance
        </button>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard label="En attente" value={String(stats.attente)} unit="demandes" tone="gold" icon={<Coins size={18} />}
          active={statutFilter === 'demande'} onClick={() => setStatutFilter((p) => p === 'demande' ? '' : 'demande')} />
        <KpiCard label="Approuvées" value={String(stats.approuvees)} unit="à payer" tone="indigo" icon={<Check size={18} />}
          active={statutFilter === 'approuvee'} onClick={() => setStatutFilter((p) => p === 'approuvee' ? '' : 'approuvee')} />
        <KpiCard label="Payées en cours" value={String(stats.payees)} unit="dossiers" tone="terracotta" icon={<Wallet size={18} />}
          active={statutFilter === 'payee'} onClick={() => setStatutFilter((p) => p === 'payee' ? '' : 'payee')} />
        <KpiCard label="Restant à récupérer" value={fmtMoney(stats.cumul)} tone="rose" icon={<Undo2 size={18} />}
          active={statutFilter === 'remboursee_partiel'} onClick={() => setStatutFilter((p) => p === 'remboursee_partiel' ? '' : 'remboursee_partiel')} />
      </div>

      <SectionCard title="Liste des avances" subtitle={`${rows.length} dossiers`}>
        <div style={{ overflowX: 'auto', margin: '0 calc(var(--s-5) * -1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                {['Employé', 'Date', 'Montant', 'Motif', 'Modalité', 'Statut', 'Restant', 'Actions'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.filter((r: any) => !statutFilter || r.statut === statutFilter).map((r: any) => (
                <tr key={r.id_avance} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdMono}>
                    <strong>{r.nom}</strong> {r.prenom}
                    <div style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }}>{r.matricule}</div>
                  </td>
                  <td style={tdMono}>{new Date(r.date_demande).toLocaleDateString('fr-FR')}</td>
                  <td style={{ ...tdMono, fontWeight: 700, color: 'var(--accent-gold)' }}>{fmtMoney(r.montant_demande)}</td>
                  <td style={td}>{r.motif || '—'}</td>
                  <td style={tdMono}>{r.modalite_remboursement || '—'}</td>
                  <td style={td}>
                    <StatutPill statut={r.statut} />
                  </td>
                  <td style={tdMono}>{fmtMoney(r.solde_restant_avance)}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.statut === 'demande' && (
                        <>
                          <button type="button" style={btnXs('sage')} onClick={() => workflow(r.id_avance, 'approuver')}>
                            <Check size={12} /> Approuver
                          </button>
                          <button type="button" style={btnXs('rose')} onClick={() => workflow(r.id_avance, 'refuser')}>
                            <X size={12} /> Refuser
                          </button>
                        </>
                      )}
                      {r.statut === 'approuvee' && (
                        <button type="button" style={btnXs('terracotta')} onClick={() => workflow(r.id_avance, 'payer')}>
                          <Wallet size={12} /> Payer
                        </button>
                      )}
                      {(r.statut === 'payee' || r.statut === 'remboursee_partiel') && (
                        <button type="button" style={btnXs('indigo')} onClick={() => workflow(r.id_avance, 'rembourser')}>
                          <Undo2 size={12} /> Rembourser
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.filter((r: any) => !statutFilter || r.statut === statutFilter).length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 'var(--s-5)', textAlign: 'center', color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                    Aucune avance.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showNew && (
        <SectionCard title="Nouvelle avance" subtitle="Saisir une demande au nom d'un employé">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' }}>
            <Field label="ID employé">
              <input value={form.id_employe} onChange={(e) => setForm({ ...form, id_employe: e.target.value })} style={inp} />
            </Field>
            <Field label="Montant (DT)">
              <input value={form.montant_demande} onChange={(e) => setForm({ ...form, montant_demande: e.target.value })} style={inp} inputMode="decimal" />
            </Field>
            <Field label="Motif">
              <input value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} style={inp} />
            </Field>
            <Field label="Modalité remboursement">
              <select value={form.modalite_remboursement} onChange={(e) => setForm({ ...form, modalite_remboursement: e.target.value })} style={inp}>
                <option value="prochain_salaire">Prochain salaire</option>
                <option value="mensualites_2">2 mensualités</option>
                <option value="mensualites_3">3 mensualités</option>
                <option value="mensualites_6">6 mensualités</option>
                <option value="mensualites_12">12 mensualités</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 'var(--s-4)' }}>
            <button type="button" style={btnPrimary} onClick={createAvance}>Créer la demande</button>
            <button type="button" style={btnGhost} onClick={() => setShowNew(false)}>Annuler</button>
          </div>
        </SectionCard>
      )}
    </DashboardShell>
  );
};

const StatutPill: React.FC<{ statut: string }> = ({ statut }) => {
  const bg: Record<string, string> = {
    demande: 'var(--accent-gold)',
    approuvee: 'var(--accent-indigo)',
    refusee: 'var(--color-danger)',
    payee: 'var(--accent-terracotta)',
    remboursee_partiel: 'var(--accent-sage)',
    remboursee_total: 'var(--accent-sage)',
  };
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        background: `color-mix(in srgb, ${bg[statut] || '#999'} 15%, transparent)`,
        color: bg[statut] || 'var(--fg-primary)',
        fontWeight: 700,
      }}
    >
      {STATUT_LABEL[statut] || statut}
    </span>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>{label}</span>
    {children}
  </label>
);

const inp: React.CSSProperties = {
  background: 'var(--bg-canvas)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 10px',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  color: 'var(--fg-primary)',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--s-3) var(--s-4)',
  fontSize: 'var(--text-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--fg-muted)',
  fontWeight: 600,
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
const btnXs = (tone: 'sage'|'rose'|'terracotta'|'indigo'): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '6px 10px', minHeight: 32,
  background: `color-mix(in srgb, var(--accent-${tone}) 15%, transparent)`,
  color: `var(--accent-${tone})`,
  border: `1px solid var(--accent-${tone})`,
  borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
});

export default AvancesSalaires;
