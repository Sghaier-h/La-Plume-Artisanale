/**
 * CaisseDetails — Journal des mouvements d'une caisse (§14quater.1)
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { caissesService, CaisseEtendue, MouvementCaisseEtendu } from '../../services/comptabiliteApi';

const fmtMoney = (n: any) =>
  (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
const fmtDate = (iso: string) => new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const CaisseDetails: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [caisse, setCaisse] = useState<CaisseEtendue | null>(null);
  const [mvts, setMvts] = useState<MouvementCaisseEtendu[]>([]);
  const [loading, setLoading] = useState(true);
  const idNum = Number(id);

  useEffect(() => {
    (async () => {
      try {
        const [c, m] = await Promise.all([
          caissesService.getOne(idNum),
          caissesService.mouvements(idNum, { limit: 200 }),
        ]);
        setCaisse(c.data?.data || null);
        setMvts(m.data?.data || []);
      } finally { setLoading(false); }
    })();
  }, [idNum]);

  const entrees = mvts.filter(m => m.type_mvt === 'entree' || m.type_mvt === 'transfert').reduce((s, m) => s + Number(m.montant || 0), 0);
  const sorties = mvts.filter(m => m.type_mvt === 'sortie').reduce((s, m) => s + Number(m.montant || 0), 0);

  return (
    <DashboardShell
      eyebrow="§14quater.1 · Caisse"
      title={caisse?.libelle || 'Caisse'}
      subtitle={caisse ? `${caisse.code} · ${caisse.type_caisse}` : ''}
      headerRight={
        <button type="button" onClick={() => navigate('/comptabilite/caisses')} style={btnGhost}>
          <ArrowLeft size={14} style={{ marginRight: 6 }} /> Retour
        </button>
      }
    >
      <div style={kpiGrid}>
        <KpiCard
          label="Solde actuel"
          value={fmtMoney(caisse?.solde_calcule ?? caisse?.solde_theorique ?? 0).replace(' DT', '')}
          unit="DT"
          icon={<Wallet size={18} />}
          tone="terracotta"
          loading={loading}
        />
        <KpiCard
          label="Total entrées"
          value={fmtMoney(entrees).replace(' DT', '')}
          unit="DT"
          icon={<TrendingUp size={18} />}
          tone="sage"
          loading={loading}
        />
        <KpiCard
          label="Total sorties"
          value={fmtMoney(sorties).replace(' DT', '')}
          unit="DT"
          icon={<TrendingDown size={18} />}
          tone="rose"
          loading={loading}
        />
      </div>

      <SectionCard title="Journal des mouvements" subtitle={`${mvts.length} opérations`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Date</th>
                <th style={th}>Type</th>
                <th style={th}>Mode</th>
                <th style={th}>Libellé</th>
                <th style={{ ...th, textAlign: 'right' }}>Montant</th>
              </tr>
            </thead>
            <tbody>
              {mvts.map((m) => (
                <tr key={m.id_mouvement}>
                  <td style={td}>{fmtDate(m.date_mouvement)}</td>
                  <td style={td}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: m.type_mvt === 'entree' ? 'var(--color-success-bg)' :
                                  m.type_mvt === 'sortie' ? 'var(--color-danger-bg)' :
                                  'var(--bg-canvas)',
                      color: m.type_mvt === 'entree' ? 'var(--color-success)' :
                             m.type_mvt === 'sortie' ? 'var(--color-danger)' :
                             'var(--fg-primary)',
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                    }}>
                      {m.type_mvt}
                    </span>
                  </td>
                  <td style={td}>{m.mode_paiement || '—'}</td>
                  <td style={td}>{m.libelle || '—'}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(m.montant)}</td>
                </tr>
              ))}
              {!loading && mvts.length === 0 && (
                <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun mouvement</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DashboardShell>
  );
};

export default CaisseDetails;

const kpiGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44,
  background: 'transparent', color: 'var(--fg-primary)',
  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
  fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer',
};
