/**
 * SoustraitantDetails — fiche sous-traitant avec onglets.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Phone, Mail, MapPin, Coins, Package, FileText, AlertTriangle, Check, X } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { useDynamicCrumb } from '../../components/BreadcrumbContext';
import {
  soustraitantsApi, comptesSTApi, SousTraitant, TravailST, BonST,
  MouvementCompteST, CompteSousTraitant, TYPE_ACTIVITE_LABEL, TYPE_ACTIVITE_TONE,
  fmtDate, fmtInt, fmtMoney,
} from '../../services/soustraitanceApi';

type TabKey = 'infos' | 'travaux' | 'bons_sortie' | 'bons_retour' | 'compte' | 'paiements';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'infos',       label: 'Infos' },
  { key: 'travaux',     label: 'Travaux' },
  { key: 'bons_sortie', label: 'Bons sortie' },
  { key: 'bons_retour', label: 'Bons retour' },
  { key: 'compte',      label: 'Compte' },
  { key: 'paiements',   label: 'Paiements' },
];

const SoustraitantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [st, setSt] = useState<SousTraitant | null>(null);
  const [tab, setTab] = useState<TabKey>('infos');
  const [travaux, setTravaux] = useState<TravailST[]>([]);
  const [bons, setBons] = useState<BonST[]>([]);
  const [compte, setCompte] = useState<CompteSousTraitant | null>(null);
  const [mouvements, setMouvements] = useState<MouvementCompteST[]>([]);
  const [loading, setLoading] = useState(true);

  useDynamicCrumb(st?.raison_sociale ?? null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [stRes, trRes, bRes, cRes] = await Promise.all([
          soustraitantsApi.detail(id),
          soustraitantsApi.travaux(id).catch(() => []),
          soustraitantsApi.bons(id).catch(() => []),
          soustraitantsApi.compte(id).catch(() => null),
        ]);
        setSt(stRes);
        setTravaux(trRes || []);
        setBons(bRes || []);
        setCompte(cRes);
        if (cRes?.id_compte_st) {
          const mv = await comptesSTApi.mouvements(cRes.id_compte_st).catch(() => []);
          setMouvements(mv || []);
        }
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (!st && !loading) {
    return (
      <DashboardShell title="Introuvable">
        <p style={{ color: 'var(--fg-muted)' }}>Sous-traitant introuvable.</p>
      </DashboardShell>
    );
  }

  const bonsSortie = bons.filter(b => ['en_preparation','expedie','chez_st'].includes(b.statut));
  const bonsRetour = bons.filter(b => ['en_retour_partiel','retour_complet','litige'].includes(b.statut));

  return (
    <DashboardShell
      eyebrow={`§14quater.3 · ${st ? TYPE_ACTIVITE_LABEL[st.type_activite] : ''}`}
      title={st?.raison_sociale ?? ''}
      subtitle={st?.identification ? `Identification · ${st.identification}` : undefined}
      headerRight={
        <>
          <button type="button" onClick={() => navigate('/sous-traitants')} style={btnGhost}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Retour
          </button>
          {st && (
            <button type="button" onClick={() => navigate(`/sous-traitants/${st.id_soustraitant}/edit`)} style={btnPrimary}>
              <Pencil size={14} style={{ marginRight: 6 }} /> Modifier
            </button>
          )}
        </>
      }
    >
      {st && (
        <div style={{
          display: 'grid',
          gap: 'var(--s-4)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}>
          <KpiCard label="Solde courant" value={fmtMoney(Number(st.solde_courant ?? compte?.solde_courant ?? 0))}
                   icon={<Coins size={18} />} tone="gold" />
          <KpiCard label="Travaux en cours" value={fmtInt(travaux.filter(t => t.statut === 'en_cours').length)}
                   icon={<Package size={18} />} tone="terracotta" />
          <KpiCard label="Bons ouverts" value={fmtInt(bonsSortie.length)}
                   icon={<FileText size={18} />} tone="sage" />
          <KpiCard label="Qualité moy." value={st.qualite_moyenne_pct != null ? `${Number(st.qualite_moyenne_pct).toFixed(1)}%` : '—'}
                   icon={<Check size={18} />} tone="indigo" />
        </div>
      )}

      <div role="tablist" style={{
        display: 'flex', flexWrap: 'wrap', gap: 'var(--s-2)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 'var(--s-2)',
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              background: tab === t.key ? 'var(--accent-terracotta)' : 'transparent',
              color: tab === t.key ? '#FBF8F3' : 'var(--fg-secondary)',
              border: '1px solid',
              borderColor: tab === t.key ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
              borderRadius: 999,
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >{t.label}</button>
        ))}
      </div>

      {tab === 'infos' && st && (
        <SectionCard title="Informations" subtitle="Coordonnées et conditions commerciales">
          <div style={{
            display: 'grid',
            gap: 'var(--s-4)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}>
            <InfoRow icon={<Phone size={14} />} label="Téléphone" value={st.contact_telephone || '—'} />
            <InfoRow icon={<Mail size={14} />} label="Email" value={st.contact_email || '—'} />
            <InfoRow icon={<MapPin size={14} />} label="Adresse" value={`${st.adresse || ''} ${st.ville || ''}`.trim() || '—'} />
            <InfoRow label="Pays" value={st.pays || '—'} />
            <InfoRow label="Activité" value={(TYPE_ACTIVITE_LABEL as Record<string, string>)[st.type_activite]} />
            <InfoRow label="Secondaires" value={(st.activites_secondaires || []).map(a => (TYPE_ACTIVITE_LABEL as Record<string, string>)[a] || a).join(', ') || '—'} />
            <InfoRow label="Tarif unitaire" value={st.tarif_unitaire != null ? `${Number(st.tarif_unitaire).toFixed(3)} TND / ${st.unite_facturation}` : '—'} mono />
            <InfoRow label="Délai moyen" value={st.delai_moyen_jours ? `${st.delai_moyen_jours} jours` : '—'} mono />
            <InfoRow label="Qualité moy." value={st.qualite_moyenne_pct != null ? `${Number(st.qualite_moyenne_pct).toFixed(1)}%` : '—'} mono />
            <InfoRow label="Note qualité" value={st.note_qualite != null ? `${Number(st.note_qualite).toFixed(1)} / 5` : '—'} mono />
            <InfoRow label="Depuis" value={fmtDate(st.date_debut_relation)} mono />
            <InfoRow label="SIRET / MF" value={st.siret_matricule_fiscal || st.matricule_fiscal || '—'} mono />
            <InfoRow label="RIB" value={st.rib_bancaire || '—'} mono />
            <InfoRow label="Banque" value={st.banque || '—'} />
            <InfoRow label="Conditions" value={st.conditions_paiement || '—'} />
          </div>
          {st.notes && (
            <p style={{ marginTop: 'var(--s-4)', color: 'var(--fg-secondary)', fontStyle: 'italic' }}>
              {st.notes}
            </p>
          )}
        </SectionCard>
      )}

      {tab === 'travaux' && (
        <SectionCard title="Journal des travaux" subtitle={`${travaux.length} travaux enregistrés`}>
          <TableWrap>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Début</th><th style={th}>Activité</th><th style={th}>Qté</th>
                <th style={th}>Tarif</th><th style={{ ...th, textAlign: 'right' }}>Montant</th>
                <th style={th}>Statut</th>
              </tr></thead>
              <tbody>
                {travaux.map(t => (
                  <tr key={t.id_travail} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={tdMono}>{fmtDate(t.date_debut)}</td>
                    <td style={td}>{TYPE_ACTIVITE_LABEL[t.type_activite] || t.type_activite}</td>
                    <td style={tdMono}>{fmtInt(t.quantite)} {t.unite}</td>
                    <td style={tdMono}>{t.tarif_applique != null ? Number(t.tarif_applique).toFixed(3) : '—'}</td>
                    <td style={{ ...tdMono, textAlign: 'right', color: 'var(--accent-gold)' }}>
                      {fmtMoney(Number(t.montant ?? 0))}
                    </td>
                    <td style={td}><StatutBadge statut={t.statut} /></td>
                  </tr>
                ))}
                {!travaux.length && <tr><td colSpan={6} style={emptyTd}>Aucun travail enregistré.</td></tr>}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}

      {(tab === 'bons_sortie' || tab === 'bons_retour') && (
        <SectionCard
          title={tab === 'bons_sortie' ? 'Bons de sortie' : 'Bons de retour'}
          subtitle={`${(tab === 'bons_sortie' ? bonsSortie : bonsRetour).length} bons`}
        >
          <TableWrap>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>N° bon</th><th style={th}>Date envoi</th><th style={th}>Date retour prévue</th>
                <th style={th}>Qté envoyée</th><th style={th}>Qté retour</th>
                <th style={th}>Statut</th>
                <th style={th}></th>
              </tr></thead>
              <tbody>
                {(tab === 'bons_sortie' ? bonsSortie : bonsRetour).map(b => (
                  <tr key={b.id_of_st} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={tdMono}>{b.numero_bon}</td>
                    <td style={tdMono}>{fmtDate(b.date_envoi_reel || b.date_envoi_prevue)}</td>
                    <td style={tdMono}>{fmtDate(b.date_retour_prevue)}</td>
                    <td style={tdMono}>{fmtInt(b.quantite_envoyee)}</td>
                    <td style={tdMono}>{fmtInt(b.quantite_retournee)}</td>
                    <td style={td}><StatutBadge statut={b.statut} /></td>
                    <td style={td}>
                      <button
                        type="button"
                        onClick={() => navigate(tab === 'bons_sortie'
                          ? `/bons-sortie-st/${b.id_of_st}`
                          : `/bons-retour-st/${b.id_of_st}`)}
                        style={linkBtn}
                      >Ouvrir</button>
                    </td>
                  </tr>
                ))}
                {!(tab === 'bons_sortie' ? bonsSortie : bonsRetour).length &&
                  <tr><td colSpan={7} style={emptyTd}>Aucun bon.</td></tr>}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}

      {tab === 'compte' && compte && (
        <SectionCard title="Compte courant" subtitle={`Solde ${fmtMoney(Number(compte.solde_courant))}`}>
          <div style={{
            display: 'grid',
            gap: 'var(--s-3)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            marginBottom: 'var(--s-4)',
          }}>
            <InfoRow label="Solde initial" value={fmtMoney(Number(compte.solde_initial))} mono />
            <InfoRow label="Solde courant" value={fmtMoney(Number(compte.solde_courant))} mono />
            <InfoRow label="Dernier mvt" value={fmtDate(compte.date_dernier_mouvement)} mono />
            <InfoRow label="Reset solde" value={fmtDate(compte.date_reset_solde)} mono />
          </div>
          <TableWrap>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Date</th><th style={th}>Type</th>
                <th style={{ ...th, textAlign: 'right' }}>Montant</th>
                <th style={th}>Libellé</th><th style={th}>Référence</th>
              </tr></thead>
              <tbody>
                {mouvements.map(m => (
                  <tr key={m.id_mouvement_cst} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={tdMono}>{fmtDate(m.date_mouvement)}</td>
                    <td style={td}><TypeMvtBadge type={m.type_mvt} /></td>
                    <td style={{ ...tdMono, textAlign: 'right',
                      color: Number(m.montant) > 0 ? 'var(--accent-terracotta)' : 'var(--accent-sage)' }}>
                      {Number(m.montant) > 0 ? '+' : ''}{fmtMoney(Number(m.montant))}
                    </td>
                    <td style={td}>{m.libelle || '—'}</td>
                    <td style={tdMono}>{m.reference_externe || '—'}</td>
                  </tr>
                ))}
                {!mouvements.length && <tr><td colSpan={5} style={emptyTd}>Aucun mouvement.</td></tr>}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}

      {tab === 'paiements' && (
        <SectionCard title="Paiements" subtitle="Historique paiements uniquement">
          <TableWrap>
            <table style={tableStyle}>
              <thead><tr>
                <th style={th}>Date</th>
                <th style={{ ...th, textAlign: 'right' }}>Montant</th>
                <th style={th}>Libellé</th><th style={th}>Référence</th>
              </tr></thead>
              <tbody>
                {mouvements.filter(m => m.type_mvt === 'paiement').map(m => (
                  <tr key={m.id_mouvement_cst} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <td style={tdMono}>{fmtDate(m.date_mouvement)}</td>
                    <td style={{ ...tdMono, textAlign: 'right', color: 'var(--accent-sage)' }}>
                      {fmtMoney(Math.abs(Number(m.montant)))}
                    </td>
                    <td style={td}>{m.libelle}</td>
                    <td style={tdMono}>{m.reference_externe || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </SectionCard>
      )}
    </DashboardShell>
  );
};

const InfoRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode; mono?: boolean }>
  = ({ icon, label, value, mono }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
      {label}
    </span>
    <span style={{
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--fg-primary)',
      wordBreak: 'break-word',
    }}>
      {value}
    </span>
  </div>
);

const StatutBadge: React.FC<{ statut: string }> = ({ statut }) => {
  const map: Record<string, { c: string; t: string }> = {
    en_cours:         { c: 'var(--accent-indigo)',    t: 'En cours' },
    termine:          { c: 'var(--accent-sage)',      t: 'Terminé' },
    valide:           { c: 'var(--accent-sage)',      t: 'Validé' },
    refuse:           { c: 'var(--color-danger)',     t: 'Refusé' },
    paye:             { c: 'var(--accent-gold)',      t: 'Payé' },
    en_preparation:   { c: 'var(--fg-muted)',         t: 'Préparation' },
    expedie:          { c: 'var(--accent-indigo)',    t: 'Expédié' },
    chez_st:          { c: 'var(--accent-terracotta)',t: 'Chez ST' },
    en_retour_partiel:{ c: 'var(--accent-gold)',      t: 'Retour partiel' },
    retour_complet:   { c: 'var(--accent-sage)',      t: 'Retour complet' },
    litige:           { c: 'var(--color-danger)',     t: 'Litige' },
    annule:           { c: 'var(--fg-muted)',         t: 'Annulé' },
  };
  const m = map[statut] || { c: 'var(--fg-muted)', t: statut };
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999,
      background: `${m.c}22`, color: m.c,
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
      textTransform: 'uppercase', fontWeight: 700,
    }}>{m.t}</span>
  );
};

const TypeMvtBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, { c: string; t: string }> = {
    creance:      { c: 'var(--accent-terracotta)', t: 'Créance' },
    paiement:     { c: 'var(--accent-sage)',       t: 'Paiement' },
    ajustement:   { c: 'var(--accent-indigo)',     t: 'Ajustement' },
    compensation: { c: 'var(--accent-gold)',       t: 'Compensation' },
  };
  const m = map[type] || { c: 'var(--fg-muted)', t: type };
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999,
      background: `${m.c}22`, color: m.c,
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
      textTransform: 'uppercase', fontWeight: 700,
    }}>{m.t}</span>
  );
};

const TableWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ overflowX: 'auto', maxWidth: '100%' }}>{children}</div>
);

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', background: 'var(--accent-terracotta)', color: '#FBF8F3',
  border: '1px solid var(--accent-terracotta)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 600, cursor: 'pointer', minHeight: 44,
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '8px 14px', background: 'var(--bg-canvas)', color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)', borderRadius: 999,
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)',
  fontWeight: 500, cursor: 'pointer', minHeight: 44,
};
const linkBtn: React.CSSProperties = {
  background: 'transparent', border: 'none',
  color: 'var(--accent-terracotta)', fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
  textTransform: 'uppercase', letterSpacing: '0.05em', minHeight: 32,
};
const tableStyle: React.CSSProperties = {
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
const tdMono: React.CSSProperties = {
  ...td, fontFamily: 'var(--font-mono)',
};
const emptyTd: React.CSSProperties = {
  padding: 'var(--s-6)', textAlign: 'center', color: 'var(--fg-muted)',
};

export default SoustraitantDetails;
