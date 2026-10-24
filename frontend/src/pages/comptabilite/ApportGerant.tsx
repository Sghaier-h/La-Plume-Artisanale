/**
 * ApportGerant.tsx — §14quater.6
 *
 * Hub du mode de paiement spécial « Apport gérant » (ADMIN seulement).
 * Permet au gérant d'injecter personnellement de l'argent (espèces,
 * chèque, virement) dans une caisse. Chaque saisie :
 *  - crée une ligne dans `comptes_courants_associes` (CCA du gérant)
 *  - alimente `caisses_mouvements` avec type_mouvement='apport_gerant'
 *  - permet de rattacher une pièce justificative via `documents_archive`
 *
 * UI minimaliste cohérente avec le reste du module comptabilité : KPI
 * solde CCA + historique mouvements + formulaire saisie.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Coins as HandCoins, FilePlus, PiggyBank, Scale, ArrowDown, ArrowUp } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import {
  apportGerantService,
  caissesService,
  CaisseEtendue,
  ApportGerantMouvement,
  SoldeCCA,
  TypeApportGerant,
  ModePaiementApport,
} from '../../services/comptabiliteApi';

const fmtMoney = (n: number) =>
  (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('fr-FR'); } catch { return String(iso); }
};

interface FormState {
  montant: string;
  type_mvt: TypeApportGerant;
  mode_paiement: ModePaiementApport;
  id_caisse_destination: number;
  reference: string;
  libelle: string;
  notes: string;
  justificatif?: File | null;
}

const initialForm: FormState = {
  montant: '',
  type_mvt: 'apport',
  mode_paiement: 'espece',
  id_caisse_destination: 0,
  reference: '',
  libelle: '',
  notes: '',
  justificatif: null,
};

const ApportGerant: React.FC = () => {
  const [caisses, setCaisses] = useState<CaisseEtendue[]>([]);
  const [solde, setSolde] = useState<SoldeCCA | null>(null);
  const [historique, setHistorique] = useState<ApportGerantMouvement[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cResp, sResp, hResp] = await Promise.all([
        caissesService.list(),
        apportGerantService.solde(),
        apportGerantService.historique({ limit: 50 }),
      ]);
      const cList: CaisseEtendue[] = cResp.data?.data || [];
      setCaisses(cList);
      setSolde(sResp.data?.data || null);
      setHistorique(hResp.data?.data || []);
      // Pré-sélection : la caisse "apport_gerant" si elle existe
      const apportCaisse = cList.find(c => c.type_caisse === 'apport_gerant')
                        || cList.find(c => c.type_caisse === 'principale')
                        || cList[0];
      if (apportCaisse && !form.id_caisse_destination) {
        setForm(f => ({ ...f, id_caisse_destination: apportCaisse.id_caisse }));
      }
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { void load(); }, [load]);

  const canSubmit = useMemo(() => {
    const m = Number(form.montant);
    return m > 0 && form.id_caisse_destination > 0;
  }, [form]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // Pièce justificative : upload préalable dans documents_archive si fournie.
      let id_document_archive: number | null = null;
      if (form.justificatif) {
        try {
          const fd = new FormData();
          fd.append('file', form.justificatif);
          fd.append('type_document', 'recu_caisse');
          fd.append('titre', form.libelle || `Justificatif apport gérant ${form.montant} DT`);
          const r = await fetch('/api/v2/documents/archive', {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
            body: fd,
          });
          if (r.ok) {
            const j = await r.json();
            id_document_archive = j?.data?.id_document ?? j?.id_document ?? null;
          }
        } catch { /* non bloquant */ }
      }

      await apportGerantService.saisir({
        montant: Number(form.montant),
        type_mvt: form.type_mvt,
        mode_paiement: form.mode_paiement,
        id_caisse_destination: form.id_caisse_destination,
        id_document_archive: id_document_archive || undefined,
        reference: form.reference || undefined,
        libelle: form.libelle || undefined,
        notes: form.notes || undefined,
      });
      setSuccess(`${form.type_mvt === 'apport' ? 'Apport' : 'Retrait'} de ${fmtMoney(Number(form.montant))} enregistré.`);
      setForm({ ...initialForm, id_caisse_destination: form.id_caisse_destination });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error?.message || e?.message || 'Erreur de saisie');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      eyebrow="Comptabilité · §14quater.6"
      title="Apport gérant"
      subtitle="Mode de paiement spécial réservé à l'administrateur — alimente le compte courant d'associé"
    >
      {/* ─── KPIs ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gap: 'var(--s-4)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        marginBottom: 'var(--s-6)',
      }}>
        <KpiCard
          label="Solde CCA (gérant)"
          value={fmtMoney(Number(solde?.solde_calcule || 0))}
          hint={solde?.libelle || 'Compte courant associé'}
          tone="gold"
          icon={<PiggyBank size={18} />}
          loading={loading}
        />
        <KpiCard
          label="Mouvements"
          value={Number(solde?.nb_mouvements || 0)}
          hint="Depuis la création"
          tone="indigo"
          icon={<Scale size={18} />}
          loading={loading}
        />
        <KpiCard
          label="Dernier mouvement"
          value={fmtDate(solde?.dernier_mouvement)}
          tone="sage"
          icon={<HandCoins size={18} />}
          loading={loading}
        />
      </div>

      {/* ─── Formulaire saisie ───────────────────────────────── */}
      <SectionCard
        title="Saisir un apport / retrait"
        subtitle="L'écriture se fait automatiquement sur la caisse de destination + le CCA du gérant"
        icon={<FilePlus size={18} />}
      >
        <form onSubmit={onSubmit} style={{ padding: 'var(--s-4)', display: 'grid', gap: 'var(--s-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s-3)' }}>
            <label>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Type *</span>
              <select
                value={form.type_mvt}
                onChange={(e) => setForm({ ...form, type_mvt: e.target.value as TypeApportGerant })}
                style={inputStyle}
              >
                <option value="apport">Apport (le gérant verse)</option>
                <option value="retrait">Retrait (la société rembourse)</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Mode de paiement *</span>
              <select
                value={form.mode_paiement}
                onChange={(e) => setForm({ ...form, mode_paiement: e.target.value as ModePaiementApport })}
                style={inputStyle}
              >
                <option value="espece">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
              </select>
            </label>
            <label>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Montant (DT) *</span>
              <input
                type="number" step="0.001" min="0"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: e.target.value })}
                style={inputStyle}
                placeholder="0.000"
                required
              />
            </label>
            <label>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Caisse destination *</span>
              <select
                value={form.id_caisse_destination}
                onChange={(e) => setForm({ ...form, id_caisse_destination: Number(e.target.value) })}
                style={inputStyle}
                required
              >
                <option value={0}>— Choisir —</option>
                {caisses.filter(c => c.actif).map(c => (
                  <option key={c.id_caisse} value={c.id_caisse}>
                    {c.code} — {c.libelle}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-3)' }}>
            <label>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Référence (n° chèque, virement...)</span>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                style={inputStyle}
              />
            </label>
            <label>
              <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Libellé</span>
              <input
                type="text"
                value={form.libelle}
                onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                style={inputStyle}
                placeholder="Apport gérant Octobre 2026"
              />
            </label>
          </div>
          <label>
            <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Pièce justificative (upload)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setForm({ ...form, justificatif: e.target.files?.[0] || null })}
              style={{ ...inputStyle, padding: 4 }}
            />
          </label>
          <label>
            <span style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>
          {error   && <div style={msgErrStyle}>{error}</div>}
          {success && <div style={msgOkStyle}>{success}</div>}
          <div>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                padding: '0.7rem 1.4rem', minHeight: 44, borderRadius: 8,
                border: 'none', background: 'var(--accent-terracotta, #c75a3b)',
                color: '#fff', cursor: (!canSubmit || submitting) ? 'not-allowed' : 'pointer',
                fontWeight: 600, opacity: (!canSubmit || submitting) ? 0.6 : 1,
              }}
            >
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </SectionCard>

      {/* ─── Historique ───────────────────────────────────────── */}
      <div style={{ marginTop: 'var(--s-6)' }}>
        <SectionCard
          title="Historique des mouvements CCA"
          subtitle={`${historique.length} mouvement(s) affichés`}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated-2, #f6f3ee)' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Mode</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Montant</th>
                  <th style={thStyle}>Caisse</th>
                  <th style={thStyle}>Référence</th>
                  <th style={thStyle}>Libellé</th>
                </tr>
              </thead>
              <tbody>
                {historique.length === 0 && (
                  <tr><td colSpan={7} style={{ ...tdStyle, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun mouvement</td></tr>
                )}
                {historique.map(m => (
                  <tr key={m.id_mvt_apport}>
                    <td style={tdStyle}>{fmtDate(m.date_mouvement)}</td>
                    <td style={tdStyle}>
                      {m.type_mvt === 'apport'
                        ? <span style={{ color: 'var(--accent-sage, #4a7a63)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowDown size={14} /> Apport</span>
                        : <span style={{ color: 'var(--accent-terracotta, #c75a3b)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowUp size={14} /> Retrait</span>}
                    </td>
                    <td style={tdStyle}>{m.mode_paiement}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtMoney(Number(m.montant))}
                    </td>
                    <td style={tdStyle}>{m.caisse_code || m.id_caisse_destination}</td>
                    <td style={tdStyle}>{m.reference || '—'}</td>
                    <td style={tdStyle}>{m.libelle || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.55rem 0.7rem', borderRadius: 8,
  border: '1px solid var(--border, #ccc)', fontFamily: 'inherit', fontSize: '0.95rem',
  background: 'var(--bg-input, #fff)', color: 'var(--fg-primary, #222)',
};
const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '0.6rem', borderBottom: '1px solid var(--border-subtle, #e5dfd5)',
  fontWeight: 600,
};
const tdStyle: React.CSSProperties = {
  padding: '0.55rem 0.6rem', borderBottom: '1px solid var(--border-subtle, #f0ebe3)',
};
const msgErrStyle: React.CSSProperties = {
  padding: '0.6rem 0.8rem', borderRadius: 8,
  background: 'rgba(199, 90, 59, 0.1)', color: 'var(--accent-terracotta, #c75a3b)',
  border: '1px solid rgba(199, 90, 59, 0.3)',
};
const msgOkStyle: React.CSSProperties = {
  padding: '0.6rem 0.8rem', borderRadius: 8,
  background: 'rgba(74, 122, 99, 0.1)', color: 'var(--accent-sage, #4a7a63)',
  border: '1px solid rgba(74, 122, 99, 0.3)',
};

export default ApportGerant;
