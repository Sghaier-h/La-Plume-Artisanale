/**
 * BonRetourST — fiche d'un bon de retour avec contrôle qualité express + signature.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { useDynamicCrumb } from '../../components/BreadcrumbContext';
import SignatureCanvas from '../../components/sous-traitants/SignatureCanvas';
import {
  bonsSTApi, BonST, ControleQualiteExpress, TYPE_ACTIVITE_LABEL,
  fmtDate, fmtInt,
} from '../../services/soustraitanceApi';

const BonRetourST: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bon, setBon] = useState<BonST | null>(null);
  const [loading, setLoading] = useState(true);
  const [qteRetour, setQteRetour] = useState<number | ''>('');
  const [qteRejet, setQteRejet] = useState<number | ''>('');
  const [motifRejet, setMotifRejet] = useState('');
  const [controle, setControle] = useState<ControleQualiteExpress>({
    defauts_couture: false, defauts_teinture: false, defauts_dimension: false,
    defauts_autre: false, autre_description: '', photo_url: '',
  });
  const [sigRetour, setSigRetour] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useDynamicCrumb(bon?.numero_bon ? `Retour ${bon.numero_bon}` : null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await bonsSTApi.detail(id);
      setBon(b);
      setQteRetour(b.quantite_retournee ?? '');
      setQteRejet(b.quantite_rejetee ?? '');
      setMotifRejet(b.motif_rejet || '');
      if (b.controle_qualite) setControle({ ...controle, ...b.controle_qualite });
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async () => {
    if (!bon) return;
    setSaving(true);
    try {
      await bonsSTApi.controle(bon.id_of_st, {
        quantite_retournee: qteRetour === '' ? undefined : Number(qteRetour),
        quantite_rejetee:   qteRejet === '' ? undefined : Number(qteRejet),
        motif_rejet: motifRejet || undefined,
        controle_qualite: controle,
        signature_retour_svg: sigRetour || undefined,
      });
      await load();
    } finally { setSaving(false); }
  };

  if (!bon && !loading) return <DashboardShell title="Bon introuvable"><p>Bon non trouvé.</p></DashboardShell>;

  return (
    <DashboardShell
      eyebrow="§7.11 · Bon de retour ST"
      title={bon?.numero_bon ?? '—'}
      subtitle={bon ? `${bon.sous_traitant_nom} · ${(bon.type_activite ? (TYPE_ACTIVITE_LABEL as Record<string, string>)[bon.type_activite] : '')}` : ''}
      headerRight={
        <button type="button" onClick={() => navigate(-1)} style={btnGhost}>
          <ArrowLeft size={14} style={{ marginRight: 6 }} /> Retour
        </button>
      }
    >
      {bon && (
        <>
          <div style={{
            display: 'grid',
            gap: 'var(--s-4)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}>
            <KpiCard label="Qté envoyée" value={fmtInt(bon.quantite_envoyee)} tone="terracotta" />
            <KpiCard label="Qté retournée" value={fmtInt(bon.quantite_retournee)} tone="sage" icon={<CheckCircle size={18} />} />
            <KpiCard label="Qté rejetée" value={fmtInt(bon.quantite_rejetee ?? 0)} tone="rose" icon={<AlertTriangle size={18} />} />
            <KpiCard label="Date retour prévue" value={fmtDate(bon.date_retour_prevue)} tone="gold" />
          </div>

          <SectionCard title="Contrôle qualité express" subtitle="Cochez les défauts constatés">
            <div style={{
              display: 'grid',
              gap: 'var(--s-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}>
              <Check label="Qté retournée" type="number" value={qteRetour} onChange={v => setQteRetour(v)} />
              <Check label="Qté rejetée" type="number" value={qteRejet} onChange={v => setQteRejet(v)} />
            </div>
            <div style={{
              display: 'grid',
              gap: 'var(--s-3)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              marginTop: 'var(--s-4)',
            }}>
              <Toggle label="Défauts couture" value={!!controle.defauts_couture}
                      onChange={v => setControle({ ...controle, defauts_couture: v })} />
              <Toggle label="Défauts teinture" value={!!controle.defauts_teinture}
                      onChange={v => setControle({ ...controle, defauts_teinture: v })} />
              <Toggle label="Défauts dimension" value={!!controle.defauts_dimension}
                      onChange={v => setControle({ ...controle, defauts_dimension: v })} />
              <Toggle label="Autre défaut" value={!!controle.defauts_autre}
                      onChange={v => setControle({ ...controle, defauts_autre: v })} />
            </div>
            <div style={{ marginTop: 'var(--s-4)' }}>
              <Check label="Description autre défaut"
                     value={controle.autre_description || ''}
                     onChange={v => setControle({ ...controle, autre_description: String(v) })} />
            </div>
            <div style={{ marginTop: 'var(--s-4)' }}>
              <Check label="Photo URL (preuve)" value={controle.photo_url || ''}
                     onChange={v => setControle({ ...controle, photo_url: String(v) })} />
            </div>
            <div style={{ marginTop: 'var(--s-4)' }}>
              <Check label="Motif rejet (optionnel)" value={motifRejet}
                     onChange={v => setMotifRejet(String(v))} textarea />
            </div>
          </SectionCard>

          <SectionCard title="Signature de retour" subtitle="Récepteur magasinier ST">
            <SignatureCanvas
              label="Signature récepteur retour"
              value={bon.signature_retour_svg || undefined}
              disabled={!!bon.signature_retour_svg}
              onChange={(svg, empty) => setSigRetour(empty ? '' : svg)}
            />
            <div style={{ marginTop: 'var(--s-4)' }}>
              <button type="button" onClick={save} disabled={saving} style={btnPrimary}>
                <Save size={14} style={{ marginRight: 6 }} /> Enregistrer le contrôle
              </button>
            </div>
          </SectionCard>
        </>
      )}
    </DashboardShell>
  );
};

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <button type="button" onClick={() => onChange(!value)} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: 'var(--s-3) var(--s-4)',
    background: value ? 'var(--color-danger-bg)' : 'var(--bg-canvas)',
    color: value ? 'var(--color-danger)' : 'var(--fg-secondary)',
    border: `1px solid ${value ? 'var(--color-danger)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
    fontWeight: 600, cursor: 'pointer', minHeight: 44,
    textAlign: 'left',
  }}>
    <span style={{
      width: 18, height: 18, borderRadius: 4,
      border: `2px solid ${value ? 'var(--color-danger)' : 'var(--border-default)'}`,
      background: value ? 'var(--color-danger)' : 'transparent',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      color: '#FBF8F3', fontSize: 12,
    }}>{value ? '✓' : ''}</span>
    {label}
  </button>
);

const Check: React.FC<{ label: string; value: any; onChange: (v: any) => void; type?: string; textarea?: boolean }>
  = ({ label, value, onChange, type = 'text', textarea }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
      {label}
    </span>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)}
                style={{ ...input, minHeight: 80, fontFamily: 'var(--font-sans)' }} />
    ) : (
      <input type={type} value={value}
             onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
             style={input} />
    )}
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
  minHeight: 44, width: '100%', maxWidth: '100%',
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

export default BonRetourST;
