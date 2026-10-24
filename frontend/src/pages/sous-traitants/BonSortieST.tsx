/**
 * BonSortieST — fiche d'un bon de sortie ST avec signature canvas tactile.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Truck } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { useDynamicCrumb } from '../../components/BreadcrumbContext';
import SignatureCanvas from '../../components/sous-traitants/SignatureCanvas';
import {
  bonsSTApi, BonST, TYPE_ACTIVITE_LABEL,
  fmtDate, fmtInt, fmtMoney,
} from '../../services/soustraitanceApi';

const BonSortieST: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bon, setBon] = useState<BonST | null>(null);
  const [loading, setLoading] = useState(true);
  const [sigSortie, setSigSortie] = useState<string>('');
  const [sigRecepteur, setSigRecepteur] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useDynamicCrumb(bon?.numero_bon ?? null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await bonsSTApi.detail(id);
      setBon(b);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const signSortie = async () => {
    if (!bon || !sigSortie) return;
    setSaving(true);
    try {
      await bonsSTApi.signer(bon.id_of_st, 'sortie', sigSortie);
      await load();
    } finally { setSaving(false); }
  };
  const signRecepteur = async () => {
    if (!bon || !sigRecepteur) return;
    setSaving(true);
    try {
      await bonsSTApi.signer(bon.id_of_st, 'recepteur', sigRecepteur);
      await load();
    } finally { setSaving(false); }
  };

  if (!bon && !loading) {
    return <DashboardShell title="Bon introuvable"><p>Bon non trouvé.</p></DashboardShell>;
  }

  return (
    <DashboardShell
      eyebrow="§7.11 · Bon de sortie ST"
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
            <KpiCard label="Qté envoyée" value={fmtInt(bon.quantite_envoyee)} icon={<Truck size={18} />} tone="terracotta" />
            <KpiCard label="Qté retournée" value={fmtInt(bon.quantite_retournee)} tone="sage" />
            <KpiCard label="Date livraison" value={fmtDate(bon.date_livraison_prevue || bon.date_envoi_prevue)} tone="indigo" />
            <KpiCard label="Date retour prévue" value={fmtDate(bon.date_retour_prevue)} tone="gold" />
          </div>

          <SectionCard title="Détails de l'envoi" subtitle="Instructions, coût, statut">
            <div style={{
              display: 'grid',
              gap: 'var(--s-3)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            }}>
              <KV label="Statut" v={bon.statut.toUpperCase()} />
              <KV label="Date envoi réel" v={fmtDate(bon.date_envoi_reel)} mono />
              <KV label="Coût prestation HT" v={fmtMoney(Number(bon.cout_prestation_ht ?? 0))} mono />
              <KV label="Instructions" v={bon.instructions_speciales || '—'} />
              {bon.notes && <KV label="Notes" v={bon.notes} />}
            </div>
          </SectionCard>

          <SectionCard title="Signatures tactiles obligatoires" subtitle="Expéditeur + récepteur (§7.11)">
            <div style={{
              display: 'grid',
              gap: 'var(--s-4)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}>
              <div>
                <SignatureCanvas
                  label="Signature expéditeur (magasinier ST)"
                  value={bon.signature_sortie_svg || undefined}
                  disabled={!!bon.signature_sortie_svg}
                  onChange={(svg, empty) => setSigSortie(empty ? '' : svg)}
                />
                {!bon.signature_sortie_svg && (
                  <button type="button" onClick={signSortie} disabled={!sigSortie || saving} style={{ ...btnPrimary, marginTop: 12 }}>
                    <Save size={14} style={{ marginRight: 6 }} /> Valider signature expéditeur
                  </button>
                )}
              </div>
              <div>
                <SignatureCanvas
                  label="Signature récepteur (sous-traitant)"
                  value={bon.signature_recepteur_svg || undefined}
                  disabled={!!bon.signature_recepteur_svg}
                  onChange={(svg, empty) => setSigRecepteur(empty ? '' : svg)}
                />
                {!bon.signature_recepteur_svg && (
                  <button type="button" onClick={signRecepteur} disabled={!sigRecepteur || saving} style={{ ...btnPrimary, marginTop: 12 }}>
                    <Save size={14} style={{ marginRight: 6 }} /> Valider signature récepteur
                  </button>
                )}
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </DashboardShell>
  );
};

const KV: React.FC<{ label: string; v: React.ReactNode; mono?: boolean }> = ({ label, v, mono }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', color: 'var(--fg-primary)', fontSize: 'var(--text-sm)' }}>{v}</span>
  </div>
);

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

export default BonSortieST;
