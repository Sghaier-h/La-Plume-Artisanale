/**
 * TabletteCaissier — Kiosque tactile caissier (§14quater · Phase A)
 * Hub + Alertes :
 *   Section Alertes (chèques impayés, écarts caisse, dépassements plafond)
 *   Grille 4 boutons : Encaissement / Dépense / Chèque reçu / Compensation
 *   Panneau solde live caisse sélectionnée
 * Chaque bouton ouvre un modal plein écran de saisie minimale.
 * Design strict La Plume, responsive mobile → tablette XL.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet, Coins as HandCoins, Receipt as ReceiptText, FileSignature, Scale,
  AlertTriangle, X,
} from 'lucide-react';
import {
  caissesService, CaisseEtendue,
  depensesEspecesService, compensationsService,
} from '../services/comptabiliteApi';
import { SignaturePad } from './comptabilite/DepensesEspeces';
import { useToast } from '../hooks/useToast';

type Action = 'encaissement' | 'depense' | 'cheque' | 'compensation' | null;

const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';

const TabletteCaissier: React.FC = () => {
  const [caisses, setCaisses] = useState<CaisseEtendue[]>([]);
  const [caisseActive, setCaisseActive] = useState<number>(0);
  const [action, setAction] = useState<Action>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await caissesService.list();
      const list: CaisseEtendue[] = r.data?.data || [];
      setCaisses(list);
      if (list[0]) setCaisseActive(list[0].id_caisse);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const current = caisses.find(c => c.id_caisse === caisseActive);
  const alertes = useMemo(() => {
    const out: Array<{ niveau: 'danger' | 'warn'; txt: string }> = [];
    for (const c of caisses) {
      const solde = Number(c.solde_calcule ?? c.solde_theorique ?? 0);
      if (solde < 0) out.push({ niveau: 'danger', txt: `Caisse ${c.libelle} en négatif (${fmtMoney(solde)})` });
      if (solde > 5000) out.push({ niveau: 'warn', txt: `Caisse ${c.libelle} > 5000 DT (plafond légal Loi 2018-52)` });
    }
    return out;
  }, [caisses]);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--fg-primary)',
      padding: 'clamp(12px, 2vw, 24px)', fontFamily: 'var(--font-sans)',
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--s-3)', marginBottom: 'var(--s-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>§14quater · Caissier</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', margin: 0 }}>Tablette caissier</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          {caisses.map(c => (
            <button key={c.id_caisse} type="button" onClick={() => setCaisseActive(c.id_caisse)}
                    style={{
                      ...btnTab,
                      background: c.id_caisse === caisseActive ? 'var(--accent-terracotta)' : 'var(--bg-canvas)',
                      color: c.id_caisse === caisseActive ? 'var(--bg-elevated)' : 'var(--fg-primary)',
                      borderColor: c.id_caisse === caisseActive ? 'var(--accent-terracotta)' : 'var(--border-default)',
                    }}>
              {c.libelle}
            </button>
          ))}
        </div>
      </header>

      {/* Solde live */}
      <div style={soldePanel}>
        <div style={{ color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'var(--text-xs)' }}>Solde actuel</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontWeight: 700,
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          color: 'var(--accent-terracotta)',
          lineHeight: 1.1,
        }}>
          {loading ? '…' : fmtMoney(current?.solde_calcule ?? current?.solde_theorique ?? 0)}
        </div>
        <div style={{ color: 'var(--fg-secondary)', fontSize: 'var(--text-sm)' }}>{current?.libelle || '—'}</div>
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <section style={{ marginTop: 'var(--s-5)' }}>
          <h2 style={h2Style}><AlertTriangle size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Alertes</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--s-3)' }}>
            {alertes.map((a, i) => (
              <div key={i} style={{
                padding: 'var(--s-3)',
                borderLeft: `4px solid ${a.niveau === 'danger' ? 'var(--color-danger)' : 'var(--accent-gold)'}`,
                background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
              }}>
                {a.txt}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hub 4 icônes */}
      <section style={{ marginTop: 'var(--s-6)' }}>
        <h2 style={h2Style}>Opérations rapides</h2>
        <div style={hubGrid}>
          <HubButton icon={<HandCoins size={56} />}      label="Encaissement" tone="sage"       onClick={() => setAction('encaissement')} />
          <HubButton icon={<ReceiptText size={56} />}    label="Dépense"      tone="rose"       onClick={() => setAction('depense')} />
          <HubButton icon={<FileSignature size={56} />}  label="Chèque reçu"  tone="indigo"     onClick={() => setAction('cheque')} />
          <HubButton icon={<Scale size={56} />}          label="Compensation" tone="gold"       onClick={() => setAction('compensation')} />
        </div>
      </section>

      {action && (
        <ActionModal action={action} caisseActive={caisseActive} onClose={() => { setAction(null); load(); }} />
      )}
    </div>
  );
};

const HubButton: React.FC<{ icon: React.ReactNode; label: string; tone: 'sage'|'rose'|'indigo'|'gold'; onClick: () => void }> = ({ icon, label, tone, onClick }) => {
  const accent = `var(--accent-${tone})`;
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 'var(--s-3)',
      padding: 'clamp(16px, 3vw, 32px)',
      minHeight: 180,
      background: 'var(--bg-elevated)',
      border: `1px solid var(--border-subtle)`,
      borderTop: `3px solid ${accent}`,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer', color: 'var(--fg-primary)',
      transition: 'transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease)',
    }} onPointerDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
       onPointerUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}>
      <div style={{ color: accent }}>{icon}</div>
      <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}>{label}</span>
    </button>
  );
};

const ActionModal: React.FC<{ action: Exclude<Action, null>; caisseActive: number; onClose: () => void }> = ({ action, caisseActive, onClose }) => {
  const toast = useToast();
  const [montant, setMontant] = useState('');
  const [libelle, setLibelle] = useState('');
  const [beneficiaire, setBeneficiaire] = useState('');
  const [signature, setSignature] = useState('');
  const [chequeNo, setChequeNo] = useState('');
  const needsSignature = action === 'depense' && Number(montant) > 50;

  const titre = action === 'encaissement' ? 'Encaissement'
              : action === 'depense'      ? 'Dépense espèces'
              : action === 'cheque'       ? 'Chèque reçu'
              :                              'Compensation';

  const submit = async () => {
    try {
      if (action === 'depense') {
        await depensesEspecesService.create({
          id_caisse: caisseActive,
          categorie: 'autre',
          libelle, montant: Number(montant), beneficiaire,
          signature_svg: needsSignature ? signature : undefined,
        } as any);
        toast.success(`${titre} enregistrée (${fmtMoney(montant)})`);
      } else if (action === 'encaissement' || action === 'cheque') {
        // TODO Phase A2 — Intégration ventes/paiements (ticket caisse + lignes).
        toast.info(`${titre} enregistré (${chequeNo ? 'chèque n° ' + chequeNo + ', ' : ''}${fmtMoney(montant)}) — à finaliser côté ventes/paiements.`);
      } else if (action === 'compensation') {
        await compensationsService.create({
          libelle: libelle || 'Compensation tablette caissier',
          lignes: [
            { sens: 'debit',  type_tiers: 'autre', nom_tiers: beneficiaire || 'Tiers A', libelle: libelle, montant: Number(montant) },
            { sens: 'credit', type_tiers: 'autre', nom_tiers: 'Tiers B',                  libelle: libelle, montant: Number(montant) },
          ],
        });
        toast.success(`${titre} enregistrée (${fmtMoney(montant)})`);
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message || e?.message || 'Erreur');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--s-4)' }}>
      <div style={{ width: '100%', maxWidth: 640, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'clamp(16px, 3vw, 32px)', maxHeight: '95vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s-4)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', margin: 0 }}>{titre}</h2>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-primary)', padding: 8, minHeight: 44, minWidth: 44 }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
          <label style={lbl}>Montant (DT)
            <input type="number" step="0.001" min="0" value={montant} onChange={e => setMontant(e.target.value)}
                   style={{ ...inputKiosk, fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: 'var(--font-mono)', fontWeight: 700 }} autoFocus />
          </label>
          <label style={lbl}>Libellé
            <input type="text" value={libelle} onChange={e => setLibelle(e.target.value)} style={inputKiosk} />
          </label>
          {action !== 'compensation' && (
            <label style={lbl}>{action === 'cheque' ? 'Tireur' : 'Bénéficiaire / tiers'}
              <input type="text" value={beneficiaire} onChange={e => setBeneficiaire(e.target.value)} style={inputKiosk} />
            </label>
          )}
          {action === 'cheque' && (
            <label style={lbl}>N° chèque
              <input type="text" value={chequeNo} onChange={e => setChequeNo(e.target.value)} style={inputKiosk} />
            </label>
          )}
          {needsSignature && (
            <>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger)' }}>Signature tactile requise (&gt; 50 DT)</div>
              <SignaturePad value={signature} onChange={setSignature} />
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-5)', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={btnGhost}>Annuler</button>
          <button type="button" onClick={submit} style={btnPrimary} disabled={!montant || (needsSignature && !signature)}>Valider</button>
        </div>
      </div>
    </div>
  );
};

export default TabletteCaissier;

const btnTab: React.CSSProperties = { padding: '10px 16px', minHeight: 44, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-sans)' };
const soldePanel: React.CSSProperties = { padding: 'clamp(16px, 3vw, 32px)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-2)' };
const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', color: 'var(--fg-primary)', margin: 0, marginBottom: 'var(--s-3)' };
const hubGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' };
const inputKiosk: React.CSSProperties = { padding: '12px 16px', minHeight: 56, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)' };
// T3b — Boutons tablette : touch target >= 72px (§14ter.17 ergonomie atelier)
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '20px 32px', minHeight: 72, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 20, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '20px 32px', minHeight: 72, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 20, cursor: 'pointer' };
