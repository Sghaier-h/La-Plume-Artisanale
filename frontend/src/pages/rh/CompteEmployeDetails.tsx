/**
 * Détail d'un compte employé (Phase C · §11bis + §14quater.5)
 * Fiche avec onglets : Infos · Mouvements · Avances · Ajustements · Compensations.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Wallet, Scale, Coins, Receipt, History,
} from 'lucide-react';
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

const dateFR = (s: string | null) =>
  s ? new Date(s).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

type Tab = 'infos' | 'mouvements' | 'avances' | 'ajustements' | 'compensations';

const CompteEmployeDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('infos');
  const [compte, setCompte] = useState<any>(null);
  const [mouvements, setMouvements] = useState<any[]>([]);
  const [avances, setAvances] = useState<any[]>([]);
  const [ajustements, setAjustements] = useState<any[]>([]);
  const [compensations, setCompensations] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [c, m, av, aj, cp] = await Promise.all([
          api.get(`/v2/rh/comptes-employes/${id}/solde`),
          api.get(`/v2/rh/comptes-employes/${id}/mouvements`),
          api.get(`/v2/rh/avances`, { params: { id_employe: id } }),
          api.get(`/v2/rh/ajustements`, { params: { id_employe: id } }),
          api.get(`/v2/rh/compensations-rh`, { params: { id_employe: id } }),
        ]);
        setCompte(c.data?.data);
        setMouvements(m.data?.data || []);
        setAvances(av.data?.data || []);
        setAjustements(aj.data?.data || []);
        setCompensations(cp.data?.data || []);
      } catch (e) {
        console.error('CompteEmployeDetails:', e);
      }
    })();
  }, [id]);

  if (!compte)
    return (
      <DashboardShell title="Compte employé" subtitle="Chargement…">
        <div style={{ padding: 'var(--s-5)', color: 'var(--fg-muted)' }}>Chargement…</div>
      </DashboardShell>
    );

  const solde = Number(compte.solde_courant || 0);
  const soldeTone =
    solde > 0 ? 'sage' : solde < 0 ? 'rose' : 'indigo';

  return (
    <DashboardShell
      eyebrow="§11bis · Compte employé"
      title={`${compte.nom} ${compte.prenom}`}
      subtitle={`Matricule ${compte.matricule} · ${compte.banque || 'Banque non renseignée'}`}
      headerRight={
        <button type="button" onClick={() => navigate(-1)} style={btnGhost}>
          <ArrowLeft size={14} style={{ marginRight: 6 }} />
          Retour
        </button>
      }
    >
      {/* KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Solde courant"
          value={fmtMoney(solde)}
          icon={<Wallet size={18} />}
          tone={soldeTone as any}
          hint="Mis à jour en temps réel"
        />
        <KpiCard
          label="Dernier mouvement"
          value={dateFR(compte.date_dernier_mouvement)}
          icon={<History size={18} />}
          tone="indigo"
        />
        <KpiCard
          label="Avances en cours"
          value={String(
            avances.filter((a: any) => ['payee', 'remboursee_partiel'].includes(a.statut)).length
          )}
          unit="dossiers"
          icon={<Coins size={18} />}
          tone="gold"
        />
        <KpiCard
          label="Compensations"
          value={String(compensations.length)}
          unit="totales"
          icon={<Scale size={18} />}
          tone="terracotta"
        />
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([
          ['infos', 'Infos'],
          ['mouvements', 'Mouvements'],
          ['avances', 'Avances'],
          ['ajustements', 'Ajustements'],
          ['compensations', 'Compensations'],
        ] as [Tab, string][]).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            style={{
              ...tabStyle,
              background: tab === k ? 'var(--accent-terracotta)' : 'var(--bg-canvas)',
              color: tab === k ? '#FBF8F3' : 'var(--fg-secondary)',
              borderColor: tab === k ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'infos' && (
        <SectionCard title="Informations compte" subtitle="RIB · banque · caisse défaut">
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--s-4)',
            }}
          >
            <Info label="Matricule">{compte.matricule}</Info>
            <Info label="Nom complet">
              {compte.nom} {compte.prenom}
            </Info>
            <Info label="RIB bancaire" mono>
              {compte.rib_bancaire || '—'}
            </Info>
            <Info label="Banque">{compte.banque || '—'}</Info>
            <Info label="Caisse défaut salaire" mono>
              {compte.caisse_defaut_paiement_salaire || '—'}
            </Info>
          </dl>
        </SectionCard>
      )}

      {tab === 'mouvements' && (
        <SectionCard
          title="Historique des mouvements"
          subtitle={`${mouvements.length} lignes · tri décroissant date`}
        >
          <Table
            headers={['Date', 'Type', 'Sens', 'Montant', 'Libellé', 'Solde après']}
            rows={mouvements.map((m: any) => [
              dateFR(m.date_mouvement),
              m.type_mvt,
              m.sens,
              fmtMoney(m.montant),
              m.libelle || '—',
              fmtMoney(m.solde_apres),
            ])}
          />
        </SectionCard>
      )}

      {tab === 'avances' && (
        <SectionCard title="Avances sur salaires" subtitle={`${avances.length} dossiers`}>
          <Table
            headers={['Date', 'Montant', 'Statut', 'Modalité', 'Restant']}
            rows={avances.map((a: any) => [
              dateFR(a.date_demande),
              fmtMoney(a.montant_demande),
              a.statut,
              a.modalite_remboursement || '—',
              fmtMoney(a.solde_restant_avance),
            ])}
          />
        </SectionCard>
      )}

      {tab === 'ajustements' && (
        <SectionCard title="Ajustements RH" subtitle={`${ajustements.length} opérations`}>
          <Table
            headers={['Code', 'Date', 'Type', 'Montant', 'Statut', 'Motif']}
            rows={ajustements.map((a: any) => [
              a.code_ajustement,
              dateFR(a.date_ajustement),
              a.type_ajustement,
              fmtMoney(a.montant),
              a.statut_validation,
              a.motif,
            ])}
          />
        </SectionCard>
      )}

      {tab === 'compensations' && (
        <SectionCard title="Compensations RH" subtitle={`${compensations.length} lignes`}>
          <Table
            headers={['Date', 'Type', 'Montant', 'Source', 'Statut']}
            rows={compensations.map((c: any) => [
              dateFR(c.date_compensation),
              c.type_compensation,
              fmtMoney(c.montant_a_compenser),
              c.source,
              c.statut,
            ])}
          />
        </SectionCard>
      )}
    </DashboardShell>
  );
};

// ─── sous-composants ─────────────────────────────────────────────
const Info: React.FC<{ label: string; mono?: boolean; children: React.ReactNode }> = ({
  label,
  mono,
  children,
}) => (
  <div>
    <dt
      style={{
        fontSize: 'var(--text-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--fg-muted)',
      }}
    >
      {label}
    </dt>
    <dd
      style={{
        margin: 0,
        marginTop: 4,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        color: 'var(--fg-primary)',
        fontSize: 'var(--text-sm)',
      }}
    >
      {children}
    </dd>
  </div>
);

const Table: React.FC<{ headers: string[]; rows: React.ReactNode[][] }> = ({ headers, rows }) => (
  <div style={{ overflowX: 'auto', margin: '0 calc(var(--s-5) * -1)' }}>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)',
      }}
    >
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
          {headers.map((h) => (
            <th
              key={h}
              style={{
                textAlign: 'left',
                padding: 'var(--s-3) var(--s-4)',
                fontSize: 'var(--text-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--fg-muted)',
                fontWeight: 600,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={headers.length}
              style={{
                padding: 'var(--s-5)',
                textAlign: 'center',
                color: 'var(--fg-muted)',
                fontStyle: 'italic',
              }}
            >
              Aucun élément.
            </td>
          </tr>
        ) : (
          rows.map((cells, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {cells.map((c, j) => (
                <td
                  key={j}
                  style={{
                    padding: 'var(--s-3) var(--s-4)',
                    verticalAlign: 'middle',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--fg-primary)',
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const tabStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 999,
  border: '1px solid',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  cursor: 'pointer',
};

const btnGhost: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 14px',
  background: 'var(--bg-canvas)',
  color: 'var(--fg-secondary)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 500,
  cursor: 'pointer',
};

export default CompteEmployeDetails;
