/**
 * DossierImportDetails — Détail d'un dossier d'import (§14quater.2)
 * Onglets : Infos / Lignes / Frais / Cessions / Suivi
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator } from 'lucide-react';
import { DashboardShell, SectionCard } from '../../components/dashboard';
import { dossiersImportService } from '../../services/comptabiliteApi';

type Tab = 'infos' | 'lignes' | 'frais' | 'cessions' | 'suivi';

const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

const DossierImportDetails: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const idNum = Number(id);
  const [dossier, setDossier] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('infos');
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const load = async () => {
    try { const r = await dossiersImportService.getOne(idNum); setDossier(r.data?.data || null); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [idNum]);

  const recalculer = async () => {
    setRecalculating(true);
    try { await dossiersImportService.recalculer(idNum, { marge_pct: 5 }); await load(); }
    catch (e: any) { window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur recalcul')); }
    finally { setRecalculating(false); }
  };

  if (loading) return <DashboardShell title="Chargement…"><></></DashboardShell>;
  if (!dossier) return <DashboardShell title="Introuvable"><p>Dossier introuvable.</p></DashboardShell>;

  const tabs: Tab[] = ['infos', 'lignes', 'frais', 'cessions', 'suivi'];

  return (
    <DashboardShell
      eyebrow={`§14quater.2 · ${dossier.numero_dossier}`}
      title={`Dossier import — ${dossier.pays_origine}`}
      subtitle={dossier.fournisseur_etranger}
      headerRight={
        <>
          <button type="button" onClick={() => navigate('/comptabilite/dossiers-import')} style={btnGhost}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Retour
          </button>
          <button type="button" onClick={recalculer} disabled={recalculating} style={btnPrimary}>
            <Calculator size={14} style={{ marginRight: 6 }} />
            {recalculating ? 'Recalcul…' : 'Recalculer cessions'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', marginBottom: 'var(--s-5)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={tabBtn(tab === t)}>{t}</button>
        ))}
      </div>

      {tab === 'infos' && (
        <SectionCard title="Informations générales">
          <div style={gridInfos}>
            <Info label="N° dossier" value={dossier.numero_dossier} />
            <Info label="Date ouverture" value={new Date(dossier.date_ouverture).toLocaleDateString('fr-FR')} />
            <Info label="Statut" value={dossier.statut} />
            <Info label="Pays d'origine" value={dossier.pays_origine} />
            <Info label="Fournisseur" value={dossier.fournisseur_etranger} />
            <Info label="Incoterm" value={dossier.incoterm || '—'} />
            <Info label="Devise" value={dossier.devise_etrangere} />
            <Info label="Taux de change" value={dossier.taux_change} />
            <Info label="Colis" value={dossier.nb_colis} />
            <Info label="Poids total (kg)" value={fmtMoney(dossier.poids_total_kg)} />
            <Info label="Coût total (DT)" value={fmtMoney(dossier.cout_total_dt)} />
            <Info label="Déclaration douane" value={dossier.numero_declaration_douane || '—'} />
          </div>
        </SectionCard>
      )}

      {tab === 'lignes' && (
        <SectionCard title="Marchandises" subtitle={`${dossier.lignes?.length || 0} lignes`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Description</th>
                  <th style={{ ...th, textAlign: 'right' }}>Qté</th>
                  <th style={th}>Unité</th>
                  <th style={{ ...th, textAlign: 'right' }}>Poids kg</th>
                  <th style={{ ...th, textAlign: 'right' }}>PU devise</th>
                  <th style={{ ...th, textAlign: 'right' }}>Montant devise</th>
                  <th style={{ ...th, textAlign: 'right' }}>Coût prorata/kg (DT)</th>
                </tr>
              </thead>
              <tbody>
                {(dossier.lignes || []).map((l: any) => (
                  <tr key={l.id_ligne}>
                    <td style={td}>{l.description_marchandise}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(l.quantite)}</td>
                    <td style={td}>{l.unite}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(l.poids_kg)}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(l.prix_unitaire_devise)}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(l.montant_devise)}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(l.cout_prorata_kg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === 'frais' && (
        <SectionCard title="Frais annexes" subtitle={`${dossier.frais?.length || 0} frais`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Type</th>
                  <th style={th}>Libellé</th>
                  <th style={th}>Date</th>
                  <th style={th}>Prorata</th>
                  <th style={{ ...th, textAlign: 'right' }}>Montant DT</th>
                </tr>
              </thead>
              <tbody>
                {(dossier.frais || []).map((f: any) => (
                  <tr key={f.id_frais}>
                    <td style={td}>{f.type_frais}</td>
                    <td style={td}>{f.libelle || '—'}</td>
                    <td style={td}>{f.date_frais ? new Date(f.date_frais).toLocaleDateString('fr-FR') : '—'}</td>
                    <td style={td}>{f.repartition_prorata ? 'oui' : 'non'}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(f.montant_dt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === 'cessions' && (
        <SectionCard title="Cessions LP → CAPSCOR" subtitle={`${dossier.cessions?.length || 0} cessions`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>N°</th>
                  <th style={{ ...th, textAlign: 'right' }}>Poids kg</th>
                  <th style={{ ...th, textAlign: 'right' }}>Coût DT</th>
                  <th style={{ ...th, textAlign: 'right' }}>Marge %</th>
                  <th style={th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {(dossier.cessions || []).map((c: any) => (
                  <tr key={c.id_cession}>
                    <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{c.numero_cession || c.cle_unique}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(c.poids_kg)}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(c.cout_cession_dt)}</td>
                    <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(c.marge_pct)}</td>
                    <td style={td}>{c.statut}</td>
                  </tr>
                ))}
                {(!dossier.cessions || dossier.cessions.length === 0) && (
                  <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Pas encore de cessions. Clic "Recalculer" ci-dessus pour générer.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === 'suivi' && (
        <SectionCard title="Suivi" subtitle="Dates & notes">
          <div style={gridInfos}>
            <Info label="Date ouverture" value={new Date(dossier.date_ouverture).toLocaleDateString('fr-FR')} />
            <Info label="Dédouanement" value={dossier.date_dedouanement ? new Date(dossier.date_dedouanement).toLocaleDateString('fr-FR') : '—'} />
            <Info label="N° déclaration" value={dossier.numero_declaration_douane || '—'} />
          </div>
          {dossier.notes && (
            <p style={{ marginTop: 'var(--s-4)', color: 'var(--fg-secondary)', whiteSpace: 'pre-wrap' }}>{dossier.notes}</p>
          )}
        </SectionCard>
      )}
    </DashboardShell>
  );
};

const Info: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ padding: 'var(--s-3)', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ marginTop: 4, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--fg-primary)' }}>{value ?? '—'}</div>
  </div>
);

export default DossierImportDetails;

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '10px 16px', minHeight: 44, background: 'transparent',
  border: 'none', borderBottom: `2px solid ${active ? 'var(--accent-terracotta)' : 'transparent'}`,
  color: active ? 'var(--accent-terracotta)' : 'var(--fg-secondary)',
  fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
});
const gridInfos: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--s-3)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', marginRight: 'var(--s-2)' };
