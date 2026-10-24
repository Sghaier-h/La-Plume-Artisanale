/**
 * SoustraitantForm — wizard création/édition 3 onglets.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, UserPlus, Scissors, CreditCard } from 'lucide-react';
import { DashboardShell, SectionCard } from '../../components/dashboard';
import {
  soustraitantsApi, SousTraitant, TypeActiviteST, UniteFacturationST, TYPE_ACTIVITE_LABEL,
} from '../../services/soustraitanceApi';

type Step = 'identite' | 'activite' | 'conditions';

const STEPS: Array<{ key: Step; label: string; icon: React.ReactNode }> = [
  { key: 'identite',   label: '1. Identité',         icon: <UserPlus size={14} /> },
  { key: 'activite',   label: '2. Activité & tarifs', icon: <Scissors size={14} /> },
  { key: 'conditions', label: '3. Conditions',       icon: <CreditCard size={14} /> },
];

const UNITES: Array<{ v: UniteFacturationST; l: string }> = [
  { v: 'piece',   l: 'Pièce' },
  { v: 'metre',   l: 'Mètre' },
  { v: 'kg',      l: 'Kilogramme' },
  { v: 'heure',   l: 'Heure' },
  { v: 'forfait', l: 'Forfait' },
];

const SoustraitantForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [step, setStep] = useState<Step>('identite');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SousTraitant> & { solde_initial?: number }>({
    code: '', raison_sociale: '', pays: 'Tunisie',
    type_activite: 'couture' as TypeActiviteST, actif: true,
    activites_secondaires: [], unite_facturation: 'piece',
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const st = await soustraitantsApi.detail(id);
        setForm(st);
      } catch (e: any) {
        setError(e.message || 'Chargement impossible');
      }
    })();
  }, [id, isEdit]);

  const update = (patch: Partial<SousTraitant>) => setForm(f => ({ ...f, ...patch }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await soustraitantsApi.update(id, form);
      } else {
        await soustraitantsApi.create(form as any);
      }
      navigate('/sous-traitants');
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e.message || 'Erreur enregistrement');
    } finally { setSaving(false); }
  };

  const next = () => {
    const order: Step[] = ['identite', 'activite', 'conditions'];
    const i = order.indexOf(step);
    setStep(order[Math.min(i + 1, order.length - 1)]);
  };
  const prev = () => {
    const order: Step[] = ['identite', 'activite', 'conditions'];
    const i = order.indexOf(step);
    setStep(order[Math.max(i - 1, 0)]);
  };

  return (
    <DashboardShell
      eyebrow="§14quater.3 · Sous-traitance"
      title={isEdit ? 'Modifier sous-traitant' : 'Nouveau sous-traitant'}
      subtitle="Wizard 3 étapes — Identité · Activité & tarifs · Conditions commerciales"
      headerRight={
        <button type="button" onClick={() => navigate('/sous-traitants')} style={btnGhost}>
          <ArrowLeft size={14} style={{ marginRight: 6 }} /> Annuler
        </button>
      }
    >
      <div role="tablist" style={{
        display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 'var(--s-2)',
      }}>
        {STEPS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setStep(s.key)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: step === s.key ? 'var(--accent-terracotta)' : 'transparent',
              color: step === s.key ? '#FBF8F3' : 'var(--fg-secondary)',
              border: '1px solid',
              borderColor: step === s.key ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
              borderRadius: 999,
              fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
              fontWeight: 600, cursor: 'pointer', minHeight: 44,
            }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: 'var(--s-3) var(--s-4)',
          background: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-danger)',
        }}>{error}</div>
      )}

      {step === 'identite' && (
        <SectionCard title="Identité & coordonnées" subtitle="Infos administratives">
          <FormGrid>
            <Field label="Code" required>
              <input value={form.code || ''} onChange={e => update({ code: e.target.value })} style={input} />
            </Field>
            <Field label="Raison sociale" required>
              <input value={form.raison_sociale || ''} onChange={e => update({ raison_sociale: e.target.value })} style={input} />
            </Field>
            <Field label="Identification (clef interne)">
              <input value={form.identification || ''} onChange={e => update({ identification: e.target.value })} style={input} />
            </Field>
            <Field label="SIRET / Matricule fiscal">
              <input value={form.siret_matricule_fiscal || form.matricule_fiscal || ''}
                     onChange={e => update({ siret_matricule_fiscal: e.target.value })} style={input} />
            </Field>
            <Field label="Contact nom">
              <input value={form.contact_nom || ''} onChange={e => update({ contact_nom: e.target.value })} style={input} />
            </Field>
            <Field label="Téléphone">
              <input value={form.contact_telephone || ''} onChange={e => update({ contact_telephone: e.target.value })} style={input} />
            </Field>
            <Field label="Email">
              <input value={form.contact_email || ''} onChange={e => update({ contact_email: e.target.value })} style={input} />
            </Field>
            <Field label="Adresse">
              <input value={form.adresse || ''} onChange={e => update({ adresse: e.target.value })} style={input} />
            </Field>
            <Field label="Ville">
              <input value={form.ville || ''} onChange={e => update({ ville: e.target.value })} style={input} />
            </Field>
            <Field label="Pays">
              <input value={form.pays || 'Tunisie'} onChange={e => update({ pays: e.target.value })} style={input} />
            </Field>
          </FormGrid>
        </SectionCard>
      )}

      {step === 'activite' && (
        <SectionCard title="Activité & tarifs" subtitle="Type d'activité principal, tarification, délais">
          <FormGrid>
            <Field label="Type d'activité principal" required>
              <select
                value={form.type_activite}
                onChange={e => update({ type_activite: e.target.value as TypeActiviteST })}
                style={input}>
                {(Object.keys(TYPE_ACTIVITE_LABEL) as TypeActiviteST[]).map(t => (
                  <option key={t} value={t}>{TYPE_ACTIVITE_LABEL[t]}</option>
                ))}
              </select>
            </Field>
            <Field label="Activités secondaires (séparées par virgule)">
              <input
                value={(form.activites_secondaires || []).join(', ')}
                onChange={e => update({ activites_secondaires: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                style={input}
                placeholder="broderie, finition"
              />
            </Field>
            <Field label="Tarif unitaire (TND)">
              <input type="number" step="0.001" value={form.tarif_unitaire ?? ''}
                     onChange={e => update({ tarif_unitaire: e.target.value === '' ? undefined : Number(e.target.value) })}
                     style={input} />
            </Field>
            <Field label="Unité de facturation">
              <select value={form.unite_facturation || 'piece'}
                      onChange={e => update({ unite_facturation: e.target.value as UniteFacturationST })}
                      style={input}>
                {UNITES.map(u => <option key={u.v} value={u.v}>{u.l}</option>)}
              </select>
            </Field>
            <Field label="Délai moyen (jours)">
              <input type="number" value={form.delai_moyen_jours ?? ''}
                     onChange={e => update({ delai_moyen_jours: e.target.value === '' ? undefined : Number(e.target.value) })}
                     style={input} />
            </Field>
            <Field label="Qualité moyenne (%)">
              <input type="number" step="0.1" value={form.qualite_moyenne_pct ?? ''}
                     onChange={e => update({ qualite_moyenne_pct: e.target.value === '' ? undefined : Number(e.target.value) })}
                     style={input} />
            </Field>
            <Field label="Note qualité (0-5)">
              <input type="number" step="0.1" min={0} max={5} value={form.note_qualite ?? ''}
                     onChange={e => update({ note_qualite: e.target.value === '' ? undefined : Number(e.target.value) })}
                     style={input} />
            </Field>
            <Field label="Date début relation">
              <input type="date" value={(form.date_debut_relation ?? '').slice(0, 10)}
                     onChange={e => update({ date_debut_relation: e.target.value })} style={input} />
            </Field>
          </FormGrid>
        </SectionCard>
      )}

      {step === 'conditions' && (
        <SectionCard title="Conditions commerciales" subtitle="Paiement, RIB, caisse">
          <FormGrid>
            <Field label="Conditions de paiement">
              <input value={form.conditions_paiement || ''}
                     onChange={e => update({ conditions_paiement: e.target.value })} style={input}
                     placeholder="30 jours fin de mois · ESP + VIR BIAT" />
            </Field>
            <Field label="RIB bancaire">
              <input value={form.rib_bancaire || ''}
                     onChange={e => update({ rib_bancaire: e.target.value })} style={input} />
            </Field>
            <Field label="Banque">
              <input value={form.banque || ''}
                     onChange={e => update({ banque: e.target.value })} style={input} />
            </Field>
            <Field label="Caisse par défaut (id)">
              <input type="number" value={form.caisse_defaut_paiement ?? ''}
                     onChange={e => update({ caisse_defaut_paiement: e.target.value === '' ? undefined : Number(e.target.value) })}
                     style={input} />
            </Field>
            {!isEdit && (
              <Field label="Solde initial compte (TND)">
                <input type="number" step="0.001" value={form.solde_initial ?? 0}
                       onChange={e => update({ solde_initial: Number(e.target.value) })} style={input} />
              </Field>
            )}
            <Field label="Notes libres">
              <textarea value={form.notes || ''}
                        onChange={e => update({ notes: e.target.value })}
                        style={{ ...input, minHeight: 90, fontFamily: 'var(--font-sans)' }} />
            </Field>
          </FormGrid>
        </SectionCard>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <button type="button" onClick={prev} disabled={step === 'identite'} style={btnGhost}>
          Précédent
        </button>
        {step !== 'conditions' ? (
          <button type="button" onClick={next} style={btnPrimary}>Suivant</button>
        ) : (
          <button type="button" onClick={save} disabled={saving} style={btnPrimary}>
            <Save size={14} style={{ marginRight: 6 }} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        )}
      </div>
    </DashboardShell>
  );
};

const FormGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    display: 'grid',
    gap: 'var(--s-4)',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  }}>{children}</div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{
      fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
      textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
    }}>
      {label} {required && <span style={{ color: 'var(--accent-terracotta)' }}>*</span>}
    </span>
    {children}
  </label>
);

const input: React.CSSProperties = {
  padding: '10px 12px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  color: 'var(--fg-primary)',
  minHeight: 44,
  width: '100%',
  maxWidth: '100%',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 16px', background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer', minHeight: 44,
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 16px', background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 500, cursor: 'pointer', minHeight: 44,
};

export default SoustraitantForm;
