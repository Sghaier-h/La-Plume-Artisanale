/**
 * DossiersImport — Liste des dossiers d'import (§14quater.2)
 * KPI (ouverts / en douane / poids total / coût cumulé) + wizard création rapide.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, PackageCheck, Weight, DollarSign, Plus, ChevronRight } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { dossiersImportService, DossierImport, StatutDossierImport } from '../../services/comptabiliteApi';

const fmtInt   = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DT';

const statutTone: Record<StatutDossierImport, string> = {
  ouvert:    '#C8663D', en_douane: '#C89B3C', arrive: '#7A8C6A',
  liquide:   '#3B4E68', ferme:     '#8A6E4A', annule: '#B84A4A',
};

const DossiersImport: React.FC = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<DossierImport[]>([]);
  const [kpi, setKpi] = useState<any>({ ouverts: 0, en_douane: 0, poids_total_kg: 0, cout_cumule_dt: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    pays_origine: '', fournisseur_etranger: '', nb_colis: '', poids_total_kg: '',
    incoterm: 'CIF', devise_etrangere: 'EUR', taux_change: '3.42',
  });

  const load = async () => {
    try {
      const [l, k] = await Promise.all([dossiersImportService.list(), dossiersImportService.kpi()]);
      setDossiers(l.data?.data || []);
      setKpi(k.data?.data || {});
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      const r = await dossiersImportService.create({
        pays_origine: form.pays_origine,
        fournisseur_etranger: form.fournisseur_etranger,
        nb_colis: Number(form.nb_colis) || undefined,
        poids_total_kg: Number(form.poids_total_kg) || undefined,
        incoterm: form.incoterm,
        devise_etrangere: form.devise_etrangere,
        taux_change: Number(form.taux_change) || undefined,
      });
      setShowCreate(false);
      navigate(`/comptabilite/dossiers-import/${r.data?.data?.id_dossier}`);
    } catch (e: any) {
      alert(e?.response?.data?.error?.message || e?.message || 'Erreur création');
    }
  };

  return (
    <DashboardShell
      eyebrow="§14quater.2 · Imports"
      title="Dossiers d'import"
      subtitle="Suivi des achats internationaux : marchandises, frais annexes, calcul du coût de revient et imputation prorata."
      headerRight={
        <button type="button" onClick={() => setShowCreate(true)} style={btnPrimary}>
          <Plus size={14} style={{ marginRight: 6 }} /> Nouveau dossier
        </button>
      }
    >
      <div style={kpiGrid}>
        <KpiCard label="Dossiers ouverts"   value={fmtInt(kpi.ouverts)}      icon={<Ship size={18} />}         tone="terracotta" loading={loading} />
        <KpiCard label="En douane"          value={fmtInt(kpi.en_douane)}    icon={<PackageCheck size={18} />} tone="gold"       loading={loading} />
        <KpiCard label="Poids total"        value={fmtInt(kpi.poids_total_kg)} unit="kg" icon={<Weight size={18} />} tone="sage" loading={loading} />
        <KpiCard label="Coût cumulé"        value={fmtMoney(kpi.cout_cumule_dt).replace(' DT','')} unit="DT" icon={<DollarSign size={18} />} tone="indigo" loading={loading} />
      </div>

      <SectionCard title="Liste des dossiers" subtitle={`${dossiers.length} dossiers`}>
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>N°</th>
                <th style={th}>Date</th>
                <th style={th}>Pays</th>
                <th style={th}>Fournisseur</th>
                <th style={th}>Statut</th>
                <th style={{ ...th, textAlign: 'right' }}>Poids kg</th>
                <th style={{ ...th, textAlign: 'right' }}>Coût DT</th>
                <th style={th}> </th>
              </tr>
            </thead>
            <tbody>
              {dossiers.map((d) => (
                <tr key={d.id_dossier} onClick={() => navigate(`/comptabilite/dossiers-import/${d.id_dossier}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{d.numero_dossier}</td>
                  <td style={td}>{new Date(d.date_ouverture).toLocaleDateString('fr-FR')}</td>
                  <td style={td}>{d.pays_origine}</td>
                  <td style={td}>{d.fournisseur_etranger}</td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: statutTone[d.statut] + '22', color: statutTone[d.statut], fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {d.statut}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtInt(d.poids_total_kg)}</td>
                  <td style={{ ...td, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmtMoney(d.cout_total_dt)}</td>
                  <td style={{ ...td, color: 'var(--fg-muted)' }}><ChevronRight size={14} /></td>
                </tr>
              ))}
              {!loading && dossiers.length === 0 && (
                <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: 'var(--fg-muted)' }}>Aucun dossier</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {showCreate && (
        <div style={modalBackdrop} onClick={() => setShowCreate(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0, marginBottom: 'var(--s-4)' }}>Nouveau dossier d'import</h3>
            <div style={{ display: 'grid', gap: 'var(--s-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <label style={lbl}>Pays d'origine<input type="text" value={form.pays_origine} onChange={e => setForm(f => ({ ...f, pays_origine: e.target.value }))} style={input}/></label>
              <label style={lbl}>Fournisseur<input type="text" value={form.fournisseur_etranger} onChange={e => setForm(f => ({ ...f, fournisseur_etranger: e.target.value }))} style={input}/></label>
              <label style={lbl}>Nombre de colis<input type="number" value={form.nb_colis} onChange={e => setForm(f => ({ ...f, nb_colis: e.target.value }))} style={input}/></label>
              <label style={lbl}>Poids total (kg)<input type="number" step="0.001" value={form.poids_total_kg} onChange={e => setForm(f => ({ ...f, poids_total_kg: e.target.value }))} style={input}/></label>
              <label style={lbl}>Incoterm
                <select value={form.incoterm} onChange={e => setForm(f => ({ ...f, incoterm: e.target.value }))} style={input}>
                  {['FOB','CIF','DAP','EXW','DDP'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label style={lbl}>Devise
                <select value={form.devise_etrangere} onChange={e => setForm(f => ({ ...f, devise_etrangere: e.target.value }))} style={input}>
                  {['EUR','USD','GBP','CHF','CNY'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label style={lbl}>Taux de change<input type="number" step="0.000001" value={form.taux_change} onChange={e => setForm(f => ({ ...f, taux_change: e.target.value }))} style={input}/></label>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-5)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={btnGhost}>Annuler</button>
              <button type="button" onClick={submit} style={btnPrimary}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default DossiersImport;

const kpiGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer' };
const modalBackdrop: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--s-4)' };
const modalCard: React.CSSProperties = { background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--s-5)', width: '100%', maxWidth: 680, boxShadow: 'var(--shadow-lg)' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' };
const input: React.CSSProperties = { padding: '10px 12px', minHeight: 44, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)' };
