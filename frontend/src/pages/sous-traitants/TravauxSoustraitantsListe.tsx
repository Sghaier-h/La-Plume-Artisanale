/**
 * TravauxSoustraitantsListe — journal des travaux ST filtré par statut, type, période.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Coins, FileText, ArrowLeft } from 'lucide-react';
import { DashboardShell, SectionCard } from '../../components/dashboard';
import {
  travauxApi, TravailST, StatutTravailST, TypeActiviteST,
  TYPE_ACTIVITE_LABEL, fmtDate, fmtInt, fmtMoney,
} from '../../services/soustraitanceApi';
import { SkeletonTable, EmptyState } from '../../components/ui';

const STATUT_LABEL: Record<StatutTravailST | '', string> = {
  '': 'Tous statuts',
  en_cours: 'En cours',
  termine: 'Terminé',
  valide: 'Validé',
  refuse: 'Refusé',
  paye: 'Payé',
};

const TravauxSoustraitantsListe: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<TravailST[]>([]);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState<StatutTravailST | ''>('');
  const [type, setType] = useState<TypeActiviteST | ''>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [refusModal, setRefusModal] = useState<{ id: number; motif: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await travauxApi.list({
        statut: statut || undefined,
        type_activite: type || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setItems(rows || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statut, type, dateFrom, dateTo]);

  const totals = useMemo(() => ({
    nb: items.length,
    montant: items.reduce((s, t) => s + Number(t.montant ?? 0), 0),
    en_cours: items.filter(t => t.statut === 'en_cours').length,
    valide: items.filter(t => t.statut === 'valide').length,
    paye: items.filter(t => t.statut === 'paye').length,
  }), [items]);

  const valider = async (id: number) => {
    await travauxApi.valider(id);
    load();
  };
  const payer = async (id: number) => {
    const ref = prompt('Référence paiement (optionnel) :');
    await travauxApi.payer(id, ref || undefined);
    load();
  };
  const confirmRefus = async () => {
    if (!refusModal) return;
    await travauxApi.refuser(refusModal.id, refusModal.motif);
    setRefusModal(null);
    load();
  };

  return (
    <DashboardShell
      eyebrow="§14quater.3 · Sous-traitance"
      title="Travaux sous-traitants"
      subtitle="Journal des travaux par activité, statut, période — validation, refus, paiement."
      headerRight={
        <button type="button" onClick={() => navigate('/sous-traitants')} style={btnGhost}>
          <ArrowLeft size={14} style={{ marginRight: 6 }} /> Sous-traitants
        </button>
      }
    >
      <div style={{
        display: 'grid',
        gap: 'var(--s-4)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      }}>
        <MiniKpi label="Travaux" value={fmtInt(totals.nb)} tone="var(--accent-terracotta)" />
        <MiniKpi label="En cours" value={fmtInt(totals.en_cours)} tone="var(--accent-indigo)" />
        <MiniKpi label="Validés" value={fmtInt(totals.valide)} tone="var(--accent-sage)" />
        <MiniKpi label="Payés" value={fmtInt(totals.paye)} tone="var(--accent-gold)" />
        <MiniKpi label="Montant total" value={fmtMoney(totals.montant)} tone="var(--accent-gold)" mono />
      </div>

      <SectionCard
        title="Filtres"
        subtitle="Statut · Type d'activité · Période"
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s-3)' }}>
          <select value={statut} onChange={e => setStatut(e.target.value as any)} style={input}>
            {Object.entries(STATUT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value as any)} style={input}>
            <option value="">Tous types</option>
            {(Object.keys(TYPE_ACTIVITE_LABEL) as TypeActiviteST[]).map(t =>
              <option key={t} value={t}>{TYPE_ACTIVITE_LABEL[t]}</option>)}
          </select>
          <label style={lab}>
            Du
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={input} />
          </label>
          <label style={lab}>
            Au
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={input} />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Liste" subtitle={`${items.length} travaux affichés`}>
        {loading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : !items.length ? (
          <EmptyState
            variant={statut || type || dateFrom || dateTo ? 'search-no-result' : 'default'}
            title={statut || type || dateFrom || dateTo ? 'Aucun travail ne correspond' : 'Aucun travail enregistré'}
            description={statut || type || dateFrom || dateTo ? 'Modifiez vos filtres pour élargir la sélection.' : 'Les travaux sous-traités validés apparaîtront ici.'}
            cta={statut || type || dateFrom || dateTo
              ? { label: 'Réinitialiser', onClick: () => { setStatut(''); setType(''); setDateFrom(''); setDateTo(''); } }
              : undefined}
          />
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Début</th>
                <th style={th}>Sous-traitant</th>
                <th style={th}>Activité</th>
                <th style={th}>Qté</th>
                <th style={th}>Tarif</th>
                <th style={{ ...th, textAlign: 'right' }}>Montant</th>
                <th style={th}>Statut</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id_travail} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td style={tdMono}>{fmtDate(t.date_debut)}</td>
                  <td style={td}>
                    <button type="button" onClick={() => navigate(`/sous-traitants/${t.id_soustraitant}`)}
                            style={linkInline}>{t.sous_traitant_nom || `ST #${t.id_soustraitant}`}</button>
                  </td>
                  <td style={td}>{TYPE_ACTIVITE_LABEL[t.type_activite] || t.type_activite}</td>
                  <td style={tdMono}>{fmtInt(t.quantite)} {t.unite}</td>
                  <td style={tdMono}>{t.tarif_applique != null ? Number(t.tarif_applique).toFixed(3) : '—'}</td>
                  <td style={{ ...tdMono, textAlign: 'right', color: 'var(--accent-gold)' }}>
                    {fmtMoney(Number(t.montant ?? 0))}
                  </td>
                  <td style={td}>
                    <span style={{ ...badge, background: 'var(--bg-canvas)', color: 'var(--fg-secondary)' }}>
                      {STATUT_LABEL[t.statut as StatutTravailST] || t.statut}
                    </span>
                  </td>
                  <td style={td}>
                    {t.statut === 'en_cours' && (
                      <button type="button" onClick={() => valider(t.id_travail)} style={btnMini}>
                        <Check size={10} /> Valider
                      </button>
                    )}
                    {t.statut === 'valide' && (
                      <button type="button" onClick={() => payer(t.id_travail)} style={btnMini}>
                        <Coins size={10} /> Payer
                      </button>
                    )}
                    {['en_cours', 'termine'].includes(t.statut) && (
                      <button type="button" onClick={() => setRefusModal({ id: t.id_travail, motif: '' })} style={{ ...btnMini, color: 'var(--color-danger)' }}>
                        <X size={10} /> Refuser
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </SectionCard>

      {refusModal && (
        <div style={modalBackdrop} onClick={() => setRefusModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0 }}>Motif de refus</h3>
            <textarea value={refusModal.motif}
                      onChange={e => setRefusModal({ ...refusModal, motif: e.target.value })}
                      placeholder="Qualité insuffisante…"
                      style={{ ...input, minHeight: 90, width: '100%', fontFamily: 'var(--font-sans)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--s-2)' }}>
              <button type="button" onClick={() => setRefusModal(null)} style={btnGhost}>Annuler</button>
              <button type="button" onClick={confirmRefus} disabled={!refusModal.motif.trim()} style={{ ...btnPrimary, background: 'var(--color-danger)' }}>
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

const MiniKpi: React.FC<{ label: string; value: React.ReactNode; tone: string; mono?: boolean }>
  = ({ label, value, tone, mono }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 2,
    padding: 'var(--s-4)',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)',
  }}>
    <span style={{
      fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
      textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em',
    }}>{label}</span>
    <span style={{
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-serif)',
      fontStyle: mono ? 'normal' : 'italic',
      fontSize: 'var(--text-xl)', fontWeight: 700, color: tone,
    }}>{value}</span>
  </div>
);

const input: React.CSSProperties = {
  padding: '8px 10px', background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)', color: 'var(--fg-primary)',
  minHeight: 36,
};
const lab: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};
const table: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)',
};
const th: React.CSSProperties = {
  padding: 'var(--s-2) var(--s-3)', textAlign: 'left',
  fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
  fontSize: 'var(--text-xs)', color: 'var(--fg-muted)',
  letterSpacing: '0.05em', borderBottom: '1px solid var(--border-default)',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: 'var(--s-3)', color: 'var(--fg-primary)',
  fontSize: 'var(--text-sm)', verticalAlign: 'top',
};
const tdMono: React.CSSProperties = { ...td, fontFamily: 'var(--font-mono)' };
const badge: React.CSSProperties = {
  padding: '2px 10px', borderRadius: 999,
  fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
  textTransform: 'uppercase', fontWeight: 700,
};
const linkInline: React.CSSProperties = {
  background: 'transparent', border: 'none', padding: 0,
  color: 'var(--accent-terracotta)', fontWeight: 600,
  cursor: 'pointer', fontSize: 'var(--text-sm)',
  textAlign: 'left',
};
const btnMini: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'transparent', border: 'none',
  color: 'var(--accent-terracotta)', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)', fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  cursor: 'pointer', minHeight: 32, marginRight: 8,
};
const btnPrimary: React.CSSProperties = {
  padding: '8px 16px', background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer', minHeight: 44,
};
const btnGhost: React.CSSProperties = {
  padding: '8px 16px', background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 500, cursor: 'pointer', minHeight: 44,
};
const modalBackdrop: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(42,42,42,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 'var(--s-4)',
};
const modalBox: React.CSSProperties = {
  background: 'var(--bg-elevated)', padding: 'var(--s-5)',
  borderRadius: 'var(--radius-md)', maxWidth: 480, width: '100%',
  display: 'flex', flexDirection: 'column', gap: 'var(--s-3)',
  boxShadow: 'var(--shadow-md)',
};

export default TravauxSoustraitantsListe;
