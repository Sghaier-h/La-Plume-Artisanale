/**
 * RapprochementBancaire — UI 3 colonnes (non-matché / suggestions / rapprochées)
 * (§14quater Phase A)
 */
import React, { useEffect, useRef, useState } from 'react';
import { Upload, Zap, CheckCircle, Ban } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { rapprochementV2Service, RapprochementImport, RapprochementLigne } from '../../services/comptabiliteApi';

const fmtMoney = (n: any) => (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT';
const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString('fr-FR');

const RapprochementBancaire: React.FC = () => {
  const [imports, setImports] = useState<RapprochementImport[]>([]);
  const [selectedImport, setSelectedImport] = useState<number | null>(null);
  const [lignes, setLignes] = useState<RapprochementLigne[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const r = await rapprochementV2Service.listImports();
      const list: RapprochementImport[] = r.data?.data || [];
      setImports(list);
      if (!selectedImport && list[0]) setSelectedImport(list[0].id_import_bq);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selectedImport) return;
    (async () => {
      const r = await rapprochementV2Service.listLignes({ id_import_bq: selectedImport });
      setLignes(r.data?.data || []);
    })();
  }, [selectedImport]);

  const uploadFile = async (file: File) => {
    const text = await file.text();
    // Parsing CSV minimal : date;libelle;debit;credit;reference
    const rows = text.split(/\r?\n/).filter(l => l.trim()).slice(1);
    const parsed = rows.map(r => {
      const [d, lib, deb, cred, ref] = r.split(';');
      return {
        date_valeur: d?.trim(),
        libelle_bq: lib?.trim(),
        montant_debit: Number(deb || 0),
        montant_credit: Number(cred || 0),
        reference_bq: ref?.trim(),
      };
    }).filter(l => l.date_valeur);
    try {
      const r = await rapprochementV2Service.createImport({
        fichier_source: file.name,
        format: file.name.toLowerCase().endsWith('.ofx') ? 'ofx' : 'csv',
        lignes: parsed,
      });
      await load();
      setSelectedImport(r.data?.data?.id_import_bq || null);
    } catch (e: any) {
      window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || e?.message || 'Erreur import'));
    }
  };

  const matchingAuto = async () => {
    if (!selectedImport) return;
    setMatching(true);
    try { await rapprochementV2Service.matchingAuto(selectedImport); const r = await rapprochementV2Service.listLignes({ id_import_bq: selectedImport }); setLignes(r.data?.data || []); }
    finally { setMatching(false); }
  };

  const rapprocher = async (l: RapprochementLigne) => {
    if (!l.id_mouvement_journal_matche) {
      const id = window.prompt('ID écriture à rapprocher :');
      if (!id) return;
      l.id_mouvement_journal_matche = Number(id);
    }
    try {
      await rapprochementV2Service.rapprocher(l.id_ligne_bq, l.id_mouvement_journal_matche);
      const r = await rapprochementV2Service.listLignes({ id_import_bq: selectedImport! });
      setLignes(r.data?.data || []);
    } catch (e: any) { window.showToast?.('error', 'Erreur', String(e?.response?.data?.error?.message || 'Erreur')); }
  };

  const ignorer = async (l: RapprochementLigne) => {
    try {
      await rapprochementV2Service.ignorer(l.id_ligne_bq);
      const r = await rapprochementV2Service.listLignes({ id_import_bq: selectedImport! });
      setLignes(r.data?.data || []);
    } catch (e: any) { window.showToast?.('info', 'Information', String(e?.message)); }
  };

  const colNonMatche  = lignes.filter(l => l.matching_statut === 'non_matche');
  const colSuggestion = lignes.filter(l => l.matching_statut === 'suggere');
  const colRapproche  = lignes.filter(l => l.matching_statut === 'rapproche');

  const curImport = imports.find(i => i.id_import_bq === selectedImport);

  return (
    <DashboardShell
      eyebrow="§14quater · Rapprochement bancaire"
      title="Rapprochement bancaire"
      subtitle="Import de relevés OFX/CSV/XLSX, matching automatique avec les écritures bancaires de l'ERP, validation manuelle sur les cas douteux."
      headerRight={
        <>
          <input ref={fileInput} type="file" accept=".csv,.ofx,.xlsx,.pdf" style={{ display: 'none' }}
                 onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />
          <button type="button" onClick={() => fileInput.current?.click()} style={btnGhost}>
            <Upload size={14} style={{ marginRight: 6 }} /> Importer relevé
          </button>
          <button type="button" onClick={matchingAuto} disabled={!selectedImport || matching} style={btnPrimary}>
            <Zap size={14} style={{ marginRight: 6 }} /> {matching ? 'Matching…' : 'Matching auto'}
          </button>
        </>
      }
    >
      <div style={kpiGrid}>
        <KpiCard label="Imports" value={String(imports.length)} tone="terracotta" loading={loading}/>
        <KpiCard label="À rapprocher" value={String(colNonMatche.length)} tone="gold" loading={loading}/>
        <KpiCard label="Suggestions" value={String(colSuggestion.length)} tone="indigo" loading={loading}/>
        <KpiCard label="Rapprochées" value={String(colRapproche.length)} tone="sage" loading={loading}/>
      </div>

      <SectionCard title="Imports de relevés" subtitle={curImport?.fichier_source || 'Choisir un relevé'}>
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>
          {imports.map(i => (
            <button key={i.id_import_bq} type="button" onClick={() => setSelectedImport(i.id_import_bq)}
                    style={{ ...btnGhost, borderColor: i.id_import_bq === selectedImport ? 'var(--accent-terracotta)' : 'var(--border-default)' }}>
              {i.fichier_source} <span style={{ marginLeft: 6, color: 'var(--fg-muted)' }}>({i.nb_lignes_total})</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div style={colsGrid}>
        <SectionCard title="Non rapprochées" subtitle={`${colNonMatche.length}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {colNonMatche.map(l => (
              <LigneCard key={l.id_ligne_bq} l={l} tone="danger" actions={
                <>
                  <button type="button" onClick={() => rapprocher(l)} style={btnSmSuccess}><CheckCircle size={14} /></button>
                  <button type="button" onClick={() => ignorer(l)} style={btnSmGhost}><Ban size={14} /></button>
                </>
              }/>
            ))}
            {colNonMatche.length === 0 && <div style={{ color: 'var(--fg-muted)' }}>Aucune ligne non rapprochée.</div>}
          </div>
        </SectionCard>

        <SectionCard title="Suggestions" subtitle={`${colSuggestion.length}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {colSuggestion.map(l => (
              <LigneCard key={l.id_ligne_bq} l={l} tone="warning" actions={
                <>
                  <button type="button" onClick={() => rapprocher(l)} style={btnSmSuccess}><CheckCircle size={14} /></button>
                  <button type="button" onClick={() => ignorer(l)} style={btnSmGhost}><Ban size={14} /></button>
                </>
              }/>
            ))}
            {colSuggestion.length === 0 && <div style={{ color: 'var(--fg-muted)' }}>Aucune suggestion.</div>}
          </div>
        </SectionCard>

        <SectionCard title="Rapprochées" subtitle={`${colRapproche.length}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {colRapproche.map(l => <LigneCard key={l.id_ligne_bq} l={l} tone="success" />)}
            {colRapproche.length === 0 && <div style={{ color: 'var(--fg-muted)' }}>Aucune.</div>}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
};

const LigneCard: React.FC<{ l: RapprochementLigne; tone: 'danger' | 'warning' | 'success'; actions?: React.ReactNode }> = ({ l, tone, actions }) => {
  const border = tone === 'danger' ? 'var(--color-danger)'
               : tone === 'warning' ? 'var(--accent-gold)'
               : 'var(--color-success)';
  const amount = Number(l.montant_credit || 0) - Number(l.montant_debit || 0);
  return (
    <div style={{ padding: 'var(--s-3)', background: 'var(--bg-canvas)', border: `1px solid ${border}44`, borderLeft: `3px solid ${border}`, borderRadius: 'var(--radius-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--s-2)', alignItems: 'baseline' }}>
        <strong style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>{fmtDate(l.date_valeur)}</strong>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {amount >= 0 ? '+' : ''}{fmtMoney(amount)}
        </span>
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)', marginTop: 4 }}>{l.libelle_bq}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-muted)', marginTop: 4 }}>
        {l.reference_bq || '—'}{l.score_matching ? ` · score ${Number(l.score_matching).toFixed(0)}%` : ''}
      </div>
      {actions && <div style={{ marginTop: 'var(--s-2)', display: 'flex', gap: 'var(--s-2)' }}>{actions}</div>}
    </div>
  );
};

export default RapprochementBancaire;

const kpiGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' };
const colsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--s-4)', marginTop: 'var(--s-4)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer', marginLeft: 'var(--s-2)' };
const btnGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' };
const btnSmSuccess: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minHeight: 44, minWidth: 44, background: 'transparent', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' };
const btnSmGhost: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minHeight: 44, minWidth: 44, background: 'transparent', color: 'var(--fg-muted)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' };
