/**
 * Comptes employés (Phase C · §11bis + §14quater.5)
 *
 * Liste des employés avec leur solde courant + KPI RH :
 * - nombre à solde négatif
 * - total dû aux employés (créditeurs)
 * - total débiteur (avances non remboursées)
 *
 * Design system La Plume strict : titres Fraunces italic, texte Inter,
 * chiffres JetBrains Mono, palette CSS vars `--accent-* / --bg-*`.
 * Responsive 400 px → 1920 px via `clamp()` + `repeat(auto-fit, minmax(220px, 1fr))`.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, TrendingDown, Scale, Wallet, Search, ArrowRight } from 'lucide-react';
import {
  DashboardShell,
  KpiCard,
  SectionCard,
} from '../../components/dashboard';
import api from '../../services/api';

type Compte = {
  id_employe: number;
  matricule: string;
  nom: string;
  prenom: string;
  statut: string;
  solde_courant: number;
  date_dernier_mouvement: string | null;
  rib_bancaire: string | null;
  banque: string | null;
};
type Kpi = {
  total_employes: number;
  nb_negatif: number;
  nb_positif: number;
  nb_zero: number;
  montant_du_total: number;
  montant_debiteur_total: number;
  solde_total: number;
};

const fmtInt = (n: number) => n.toLocaleString('fr-FR');
const fmtMoney = (n: number) =>
  n.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'TND',
    maximumFractionDigits: 3,
  });

const ComptesEmployes: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Compte[]>([]);
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [solde, setSolde] = useState<'' | 'negatif' | 'positif' | 'zero'>('');

  useEffect(() => {
    (async () => {
      try {
        const [list, kpiRes] = await Promise.all([
          api.get('/v2/rh/comptes-employes', { params: { q, solde, limit: 200 } }),
          api.get('/v2/rh/comptes-employes/kpi'),
        ]);
        setRows(list.data?.data || []);
        setKpi(kpiRes.data?.data || null);
      } catch (e) {
        console.error('ComptesEmployes:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, solde]);

  const filtered = useMemo(() => rows, [rows]);

  return (
    <DashboardShell
      eyebrow="§11bis · Comptes employés"
      title="Comptes employés"
      subtitle="Solde courant par salarié, RIB bancaire et dernier mouvement."
    >
      {/* ── KPI ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--s-4)',
        }}
      >
        <KpiCard
          label="Effectif actif"
          value={fmtInt(kpi?.total_employes ?? 0)}
          unit="salariés"
          icon={<Users size={18} />}
          tone="terracotta"
        />
        <KpiCard
          label="Soldes négatifs"
          value={fmtInt(kpi?.nb_negatif ?? 0)}
          unit="employés"
          hint="Avances non remboursées"
          icon={<TrendingDown size={18} />}
          tone="rose"
          onClick={() => setSolde('negatif')}
        />
        <KpiCard
          label="Soldes créditeurs"
          value={fmtInt(kpi?.nb_positif ?? 0)}
          unit="employés"
          hint="À verser"
          icon={<TrendingUp size={18} />}
          tone="sage"
          onClick={() => setSolde('positif')}
        />
        <KpiCard
          label="Dû aux employés"
          value={fmtMoney(kpi?.montant_du_total ?? 0)}
          icon={<Wallet size={18} />}
          tone="gold"
          hint="Somme des soldes > 0"
        />
        <KpiCard
          label="Débit employés"
          value={fmtMoney(kpi?.montant_debiteur_total ?? 0)}
          icon={<Scale size={18} />}
          tone="indigo"
          hint="Somme des soldes < 0"
        />
      </div>

      {/* ── Filtres + liste ─────────────────────────────────────── */}
      <SectionCard
        title="Liste des comptes"
        subtitle="Cliquer sur une ligne pour accéder au compte détaillé"
        actions={
          <div
            style={{
              display: 'flex',
              gap: 'var(--s-3)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  color: 'var(--fg-muted)',
                }}
              />
              <input
                placeholder="Rechercher…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={inputStyle}
              />
            </div>
            <select
              value={solde}
              onChange={(e) => setSolde(e.target.value as any)}
              style={inputStyle}
            >
              <option value="">Tous les soldes</option>
              <option value="negatif">Négatifs</option>
              <option value="zero">Zéro</option>
              <option value="positif">Positifs</option>
            </select>
          </div>
        }
      >
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
                <Th>Matricule</Th>
                <Th>Nom · Prénom</Th>
                <Th>Banque / RIB</Th>
                <Th align="right">Solde</Th>
                <Th>Dernier mvt</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={emptyCell}>
                    Chargement…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={emptyCell}>
                    Aucun compte à afficher.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const solde = Number(r.solde_courant || 0);
                  const tone =
                    solde > 0
                      ? 'var(--accent-sage)'
                      : solde < 0
                      ? 'var(--color-danger)'
                      : 'var(--fg-muted)';
                  return (
                    <tr
                      key={r.id_employe}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/rh/comptes-employes/${r.id_employe}`)}
                    >
                      <Td mono>{r.matricule}</Td>
                      <Td>
                        <strong>{r.nom}</strong>{' '}
                        <span style={{ color: 'var(--fg-secondary)' }}>
                          {r.prenom}
                        </span>
                      </Td>
                      <Td mono>
                        <div>{r.banque || '—'}</div>
                        <div style={{ color: 'var(--fg-muted)', fontSize: '0.75rem' }}>
                          {r.rib_bancaire || ''}
                        </div>
                      </Td>
                      <Td align="right" mono bold color={tone}>
                        {fmtMoney(solde)}
                      </Td>
                      <Td mono>
                        {r.date_dernier_mouvement
                          ? new Date(r.date_dernier_mouvement).toLocaleDateString('fr-FR')
                          : '—'}
                      </Td>
                      <Td>
                        <ArrowRight size={14} />
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

// ─── Styles / cells ───────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'var(--bg-canvas)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 10px 8px 30px',
  fontSize: 'var(--text-sm)',
  color: 'var(--fg-primary)',
  minWidth: 180,
  fontFamily: 'var(--font-sans)',
};

const emptyCell: React.CSSProperties = {
  padding: 'var(--s-5)',
  textAlign: 'center',
  color: 'var(--fg-muted)',
  fontStyle: 'italic',
};

const Th: React.FC<{ children?: React.ReactNode; align?: 'left' | 'right' }> = ({ children, align = 'left' }) => (
  <th
    style={{
      textAlign: align,
      padding: 'var(--s-3) var(--s-4)',
      fontSize: 'var(--text-xs)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--fg-muted)',
      fontWeight: 600,
      fontFamily: 'var(--font-sans)',
    }}
  >
    {children}
  </th>
);

const Td: React.FC<{
  children: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
  color?: string;
  align?: 'left' | 'right';
}> = ({ children, mono, bold, color, align = 'left' }) => (
  <td
    style={{
      padding: 'var(--s-3) var(--s-4)',
      verticalAlign: 'middle',
      textAlign: align,
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      fontWeight: bold ? 700 : 400,
      color: color || 'var(--fg-primary)',
    }}
  >
    {children}
  </td>
);

export default ComptesEmployes;
