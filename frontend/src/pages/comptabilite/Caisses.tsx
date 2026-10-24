/**
 * Caisses — Hub des caisses multiples (§14quater.1)
 * Design strict La Plume : DashboardShell + KpiCard + SectionCard.
 * Responsive : grilles auto-fit, clamp() sur typographie, overflow-x
 * sur tableaux, boutons ≥ 44px.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, ArrowLeftRight, PiggyBank, Store, Scale, Coins as HandCoins,
  AlertTriangle, ChevronRight,
} from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { caissesService, CaisseEtendue, RoutageCaisse } from '../../services/comptabiliteApi';
import { Skeleton, EmptyState } from '../../components/ui';

const typeIcon: Record<string, React.ReactNode> = {
  principale:       <Wallet size={18} />,
  cheques_clients:  <PiggyBank size={18} />,
  compensation:     <Scale size={18} />,
  apport_gerant:    <HandCoins size={18} />,
  showroom:         <Store size={18} />,
  custom:           <Wallet size={18} />,
};
const typeTone: Record<string, any> = {
  principale: 'terracotta',
  cheques_clients: 'indigo',
  compensation: 'sage',
  apport_gerant: 'gold',
  showroom: 'rose',
  custom: 'brown',
};

const fmtMoney = (n: number) =>
  (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';

const Caisses: React.FC = () => {
  const navigate = useNavigate();
  const [caisses, setCaisses] = useState<CaisseEtendue[]>([]);
  const [routage, setRoutage] = useState<RoutageCaisse[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showTransfert, setShowTransfert] = useState(false);
  const [transfertForm, setTransfertForm] = useState({
    id_caisse_source: 0, id_caisse_dest: 0, montant: '', libelle: '',
  });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [c, r] = await Promise.all([caissesService.list(), caissesService.routage()]);
      setCaisses(c.data?.data || []);
      setRoutage(r.data?.data || []);
    } catch (e: any) { setError(e?.message || 'Erreur chargement'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const totalGlobal = caisses.reduce((s, c) => s + Number(c.solde_calcule || c.solde_theorique || 0), 0);
  const nbActives = caisses.filter(c => c.actif).length;

  const soumettreTransfert = async () => {
    try {
      await caissesService.transfert({
        id_caisse_source: transfertForm.id_caisse_source,
        id_caisse_dest:   transfertForm.id_caisse_dest,
        montant:          Number(transfertForm.montant),
        libelle:          transfertForm.libelle,
      });
      setShowTransfert(false);
      setTransfertForm({ id_caisse_source: 0, id_caisse_dest: 0, montant: '', libelle: '' });
      await load();
    } catch (e: any) {
      window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || e?.message || 'Erreur transfert'));
    }
  };

  return (
    <DashboardShell
      eyebrow="§14quater.1 · Caisses"
      title="Caisses multiples"
      subtitle="Pilotage des caisses La Plume (principale, showroom, chèques, compensation, apport gérant) avec routage automatique par mode de paiement."
      headerRight={
        <button
          type="button"
          onClick={() => setShowTransfert(true)}
          style={btnPrimary}
        >
          <ArrowLeftRight size={14} style={{ marginRight: 6 }} />
          Transfert interne
        </button>
      }
    >
      {error && (
        <div style={alertStyle}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={kpiGrid}>
        <KpiCard
          label="Solde cumulé"
          value={fmtMoney(totalGlobal).replace(' DT', '')}
          unit="DT"
          hint={`${nbActives} caisses actives`}
          icon={<Wallet size={18} />}
          tone="terracotta"
          loading={loading}
          active={typeFilter === ''}
          onClick={() => setTypeFilter('')}
        />
        <KpiCard
          label="Chèques en attente"
          value={fmtMoney(caisses.find(c => c.type_caisse === 'cheques_clients')?.solde_calcule ?? 0).replace(' DT', '')}
          unit="DT"
          hint="À encaisser"
          icon={<PiggyBank size={18} />}
          tone="indigo"
          loading={loading}
          active={typeFilter === 'cheques_clients'}
          onClick={() => setTypeFilter((p) => p === 'cheques_clients' ? '' : 'cheques_clients')}
        />
        <KpiCard
          label="Compensations"
          value={fmtMoney(caisses.find(c => c.type_caisse === 'compensation')?.solde_calcule ?? 0).replace(' DT', '')}
          unit="DT"
          hint="Opérations croisées"
          icon={<Scale size={18} />}
          tone="sage"
          loading={loading}
          active={typeFilter === 'compensation'}
          onClick={() => setTypeFilter((p) => p === 'compensation' ? '' : 'compensation')}
        />
        <KpiCard
          label="Routages actifs"
          value={String(routage.length)}
          unit="modes"
          hint="Mode → caisse par défaut"
          icon={<ArrowLeftRight size={18} />}
          tone="gold"
          loading={loading}
        />
      </div>

      <SectionCard
        title="Mes caisses"
        subtitle="Clic sur une caisse pour voir son journal de mouvements."
      >
        <div style={cardGrid}>
          {caisses.filter((c) => !typeFilter || c.type_caisse === typeFilter).map((c) => (
            <button
              key={c.id_caisse}
              type="button"
              onClick={() => navigate(`/comptabilite/caisses/${c.id_caisse}`)}
              style={caisseCard}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-2)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                  <span style={{ color: `var(--accent-${typeTone[c.type_caisse] || 'terracotta'})` }}>
                    {typeIcon[c.type_caisse] || <Wallet size={18} />}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(1rem, 1.2vw, 1.15rem)', color: 'var(--fg-primary)' }}>
                    {c.libelle}
                  </span>
                </span>
                <ChevronRight size={16} style={{ color: 'var(--fg-muted)' }} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {c.code} · {c.type_caisse}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                fontWeight: 700,
                color: 'var(--fg-primary)',
                marginTop: 'var(--s-2)',
              }}>
                {fmtMoney(c.solde_calcule ?? c.solde_theorique ?? 0)}
              </div>
            </button>
          ))}
          {loading && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ ...caisseCard, pointerEvents: 'none' }}>
                  <Skeleton className="h-5 w-1/2 mb-3" />
                  <Skeleton className="h-3 w-1/3 mb-3" />
                  <Skeleton className="h-8 w-2/3" />
                </div>
              ))}
            </>
          )}
          {!loading && caisses.filter((c) => !typeFilter || c.type_caisse === typeFilter).length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState
                variant={typeFilter ? 'search-no-result' : 'default'}
                title={typeFilter ? 'Aucune caisse ne correspond' : 'Aucune caisse configurée'}
                description={typeFilter ? 'Essayez un autre type de caisse.' : 'Les caisses enregistrées apparaîtront ici.'}
                cta={typeFilter ? { label: 'Réinitialiser', onClick: () => setTypeFilter('') } : undefined}
              />
            </div>
          )}
          {error && !loading && (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState
                variant="error"
                title="Impossible de charger les caisses"
                description={error}
                cta={{ label: 'Réessayer', onClick: () => { setError(null); setLoading(true); load(); } }}
              />
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Routage par mode de paiement"
        subtitle="Caisse par défaut appliquée automatiquement à chaque encaissement/décaissement."
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Mode</th>
                <th style={th}>Caisse par défaut</th>
                <th style={th}>Libellé</th>
                <th style={th}>Actif</th>
              </tr>
            </thead>
            <tbody>
              {routage.map((r) => (
                <tr key={r.id_routage}>
                  <td style={td}>{r.mode_paiement}</td>
                  <td style={td}>{r.caisse_libelle} <span style={{ color: 'var(--fg-muted)' }}>({r.caisse_code})</span></td>
                  <td style={td}>{r.libelle || '—'}</td>
                  <td style={td}>{r.actif ? 'oui' : 'non'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showTransfert && (
        <div style={modalBackdrop} onClick={() => setShowTransfert(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0, marginBottom: 'var(--s-4)' }}>
              Transfert interne
            </h3>
            <div style={{ display: 'grid', gap: 'var(--s-3)' }}>
              <label style={lbl}>
                Caisse source
                <select
                  value={transfertForm.id_caisse_source}
                  onChange={(e) => setTransfertForm(f => ({ ...f, id_caisse_source: Number(e.target.value) }))}
                  style={input}
                >
                  <option value={0}>— choisir —</option>
                  {caisses.map(c => (
                    <option key={c.id_caisse} value={c.id_caisse}>{c.libelle}</option>
                  ))}
                </select>
              </label>
              <label style={lbl}>
                Caisse destination
                <select
                  value={transfertForm.id_caisse_dest}
                  onChange={(e) => setTransfertForm(f => ({ ...f, id_caisse_dest: Number(e.target.value) }))}
                  style={input}
                >
                  <option value={0}>— choisir —</option>
                  {caisses.map(c => (
                    <option key={c.id_caisse} value={c.id_caisse}>{c.libelle}</option>
                  ))}
                </select>
              </label>
              <label style={lbl}>
                Montant (DT)
                <input
                  type="number" step="0.001" min="0"
                  value={transfertForm.montant}
                  onChange={(e) => setTransfertForm(f => ({ ...f, montant: e.target.value }))}
                  style={input}
                />
              </label>
              <label style={lbl}>
                Libellé
                <input
                  type="text"
                  value={transfertForm.libelle}
                  onChange={(e) => setTransfertForm(f => ({ ...f, libelle: e.target.value }))}
                  style={input}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-5)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowTransfert(false)} style={btnGhost}>Annuler</button>
              <button type="button" onClick={soumettreTransfert} style={btnPrimary}>Transférer</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default Caisses;

// ─── styles — tokens strict La Plume ─────────────────────────────────
const kpiGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 'var(--s-4)',
  marginBottom: 'var(--s-6)',
};
const cardGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 'var(--s-4)',
};
const caisseCard: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--s-2)',
  padding: 'var(--s-4)',
  background: 'var(--bg-canvas)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  textAlign: 'left',
  font: 'inherit',
  color: 'inherit',
  minHeight: 110,
};
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44,
  background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)',
  border: '1px solid transparent', borderRadius: 'var(--radius-sm)',
  fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer',
};
const btnGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44,
  background: 'transparent', color: 'var(--fg-primary)',
  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
  fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer',
};
const alertStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 'var(--s-2)', color: 'var(--color-danger)',
  background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)',
  padding: 'var(--s-3)', borderRadius: 'var(--radius-sm)', marginBottom: 'var(--s-4)',
};
const modalBackdrop: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--s-4)',
};
const modalCard: React.CSSProperties = {
  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
  padding: 'var(--s-5)', width: '100%', maxWidth: 480, boxShadow: 'var(--shadow-lg)',
};
const lbl: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)',
};
const input: React.CSSProperties = {
  padding: '10px 12px', minHeight: 44,
  background: 'var(--bg-canvas)', border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)',
  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)',
};
