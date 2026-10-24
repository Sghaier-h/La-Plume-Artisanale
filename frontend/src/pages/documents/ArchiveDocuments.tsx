/**
 * ArchiveDocuments — Archive centrale polymorphique (§14quater · Phase A)
 * Recherche full-text, filtres (type, période, catégorie, tags), lien
 * d'ouverture vers l'entité associée (facture, paiement, dossier...).
 */
import React, { useEffect, useState } from 'react';
import { Search, FileText, Download, Link2 } from 'lucide-react';
import { DashboardShell, KpiCard, SectionCard } from '../../components/dashboard';
import { documentsArchiveService, DocumentArchive, TypeDocument } from '../../services/documentsArchiveApi';
import { SkeletonTable, EmptyState } from '../../components/ui';

const TYPES: TypeDocument[] = [
  'facture_recue','facture_emise','recu_caisse','rib','contrat',
  'bulletin_paie','attestation','bon_sortie_st','bon_retour_st',
  'scan_cheque','photo_piece','releve_bancaire','declaration_tva',
  'avoir','bon_commande','permit_douane','declaration_import',
  'certificat_origine','facture_fournisseur_etranger','autre',
];

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—';
const fmtKo   = (n?: number)   => n ? `${Math.round(n / 1024)} ko` : '—';

const ArchiveDocuments: React.FC = () => {
  const [docs, setDocs] = useState<DocumentArchive[]>([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState<TypeDocument | ''>('');
  const [periode, setPeriode] = useState('');
  const [loading, setLoading] = useState(true);

  const search = async () => {
    setLoading(true);
    try {
      const r = await documentsArchiveService.search({
        q: q || undefined,
        type: type || undefined,
        periode: periode || undefined,
      });
      setDocs(r.data?.data || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { search(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <DashboardShell
      eyebrow="§14quater · Archive"
      title="Archive de documents"
      subtitle="Recherche centralisée : factures, reçus, contrats, bulletins, scans. OCR + plein-texte sur titre, description et contenu."
    >
      <SectionCard title="Rechercher" subtitle="Full-text + filtres">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--s-3)' }}>
          <label style={lbl}>Mot-clé
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && search()} style={input} placeholder="facture, cnss, chèque…" />
          </label>
          <label style={lbl}>Type
            <select value={type} onChange={e => setType(e.target.value as any)} style={input}>
              <option value="">tous</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label style={lbl}>Période fiscale (YYYY-MM)
            <input type="month" value={periode} onChange={e => setPeriode(e.target.value)} style={input}/>
          </label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="button" onClick={search} style={btnPrimary}><Search size={14} style={{ marginRight: 6 }} />Rechercher</button>
          </div>
        </div>
      </SectionCard>

      <div style={kpiGrid}>
        <KpiCard label="Documents trouvés" value={String(docs.length)} icon={<FileText size={18} />} tone="terracotta" loading={loading}
          active={type === ''}
          onClick={() => { setType(''); search(); }}/>
      </div>

      <SectionCard title="Résultats" subtitle={`${docs.length} document(s)`}>
        {loading ? (
          <SkeletonTable rows={8} cols={8} />
        ) : docs.length === 0 ? (
          <EmptyState
            variant={q || type || periode ? 'search-no-result' : 'default'}
            title={q || type || periode ? `Aucun résultat${q ? ` pour « ${q} »` : ''}` : 'Aucun document'}
            description={q || type || periode ? 'Réinitialisez votre recherche ou vos filtres.' : 'Les documents archivés apparaîtront ici.'}
            cta={q || type || periode
              ? { label: 'Réinitialiser', onClick: () => { setQ(''); setType(''); setPeriode(''); setTimeout(search, 0); } }
              : undefined}
          />
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Code</th>
                <th style={th}>Titre</th>
                <th style={th}>Type</th>
                <th style={th}>Date doc</th>
                <th style={th}>Période</th>
                <th style={th}>Taille</th>
                <th style={th}>Confidentialité</th>
                <th style={th}> </th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id_document}>
                  <td style={{ ...td, fontFamily: 'var(--font-mono)' }}>{d.code_document || `#${d.id_document}`}</td>
                  <td style={td}><strong>{d.titre}</strong>{d.description && <div style={{ color: 'var(--fg-muted)', fontSize: 'var(--text-xs)' }}>{d.description}</div>}</td>
                  <td style={td}>{d.type_document}</td>
                  <td style={td}>{fmtDate(d.date_document)}</td>
                  <td style={td}>{d.periode_fiscale || '—'}</td>
                  <td style={td}>{fmtKo(d.taille_octets)}</td>
                  <td style={td}>{d.confidentialite}</td>
                  <td style={td}>
                    <a href={d.path_relatif || '#'} target="_blank" rel="noreferrer" style={btnSm}>
                      <Download size={14} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </SectionCard>
    </DashboardShell>
  );
};

export default ArchiveDocuments;

const kpiGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-4)', marginTop: 'var(--s-4)' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' };
const th: React.CSSProperties = { textAlign: 'left', padding: 'var(--s-2)', color: 'var(--fg-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)' };
const td: React.CSSProperties = { padding: 'var(--s-2)', borderBottom: '1px solid var(--border-subtle)' };
const btnPrimary: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '10px 16px', minHeight: 44, background: 'var(--accent-terracotta)', color: 'var(--bg-elevated)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer' };
const btnSm: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 10px', minHeight: 44, minWidth: 44, background: 'transparent', color: 'var(--fg-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--fg-secondary)' };
const input: React.CSSProperties = { padding: '10px 12px', minHeight: 44, background: 'var(--bg-canvas)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)' };
