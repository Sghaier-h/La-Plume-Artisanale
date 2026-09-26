import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  FileText,
  Receipt,
  Landmark,
  Building,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// Types (§14.14 dashboard comptable)
// ═══════════════════════════════════════════════════════════════════
type StatutEcriture = 'brouillon' | 'validee';

interface EcritureJour {
  id_ecriture: number;
  numero: string;
  date: string;
  libelle: string;
  journal: string;
  montant: number;
  statut: StatutEcriture;
}

interface AlerteCompta {
  id: number;
  categorie: 'tva' | 'banque' | 'immo' | 'ecriture' | 'client' | 'fournisseur';
  message: string;
  gravite: 'haute' | 'moyenne' | 'basse';
  echeance: string | null;
}

interface ActionMensuelle {
  id: number;
  titre: string;
  categorie: string;
  echeance: string;
  fait: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// Mock
// ═══════════════════════════════════════════════════════════════════
const daysAhead = (d: number) => new Date(Date.now() + d * 86400_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400_000).toISOString();

const MOCK_ECRITURES: EcritureJour[] = [
  { id_ecriture: 1, numero: 'EC-2026001250', date: daysAgo(0), libelle: 'Facture VE-2026-0148 — Hotel Marina Djerba', journal: 'VE', montant: 6420, statut: 'validee' },
  { id_ecriture: 2, numero: 'EC-2026001251', date: daysAgo(0), libelle: 'Encaissement chèque 220118 — Boutique El Menzah', journal: 'BQ1', montant: 4200, statut: 'validee' },
  { id_ecriture: 3, numero: 'EC-2026001252', date: daysAgo(0), libelle: 'Facture fournisseur FILAT-905 — Filature Tunisie', journal: 'AC', montant: 12800, statut: 'brouillon' },
  { id_ecriture: 4, numero: 'EC-2026001253', date: daysAgo(0), libelle: 'Note frais déplacement salon Paris', journal: 'OD', montant: 1450, statut: 'brouillon' },
  { id_ecriture: 5, numero: 'EC-2026001254', date: daysAgo(0), libelle: 'Vente comptoir showroom — Djerba', journal: 'CA', montant: 2180, statut: 'validee' },
];

const MOCK_ALERTES: AlerteCompta[] = [
  { id: 1, categorie: 'tva', message: 'Déclaration TVA mensuelle février à finaliser', gravite: 'haute', echeance: daysAhead(3) },
  { id: 2, categorie: 'banque', message: '38 lignes bancaires BIAT non rapprochées', gravite: 'moyenne', echeance: null },
  { id: 3, categorie: 'immo', message: '5 immobilisations en attente d\'amortissement Q1', gravite: 'moyenne', echeance: daysAhead(12) },
  { id: 4, categorie: 'ecriture', message: '2 écritures en brouillon depuis plus de 5 jours', gravite: 'basse', echeance: null },
  { id: 5, categorie: 'client', message: 'Factures impayées > 60 j : 8 dossiers pour 42 800 TND', gravite: 'haute', echeance: null },
  { id: 6, categorie: 'fournisseur', message: 'Échéance fournisseur > 30 j : 4 factures', gravite: 'moyenne', echeance: daysAhead(5) },
];

const MOCK_ACTIONS: ActionMensuelle[] = [
  { id: 1, titre: 'Clôture mensuelle février 2026', categorie: 'Clôture', echeance: daysAhead(6), fait: false },
  { id: 2, titre: 'Déclaration TVA mensuelle', categorie: 'Fiscalité', echeance: daysAhead(3), fait: false },
  { id: 3, titre: 'CNSS trimestriel — envoi Damancom', categorie: 'Social', echeance: daysAhead(9), fait: false },
  { id: 4, titre: 'État de rapprochement BIAT + UIB', categorie: 'Trésorerie', echeance: daysAhead(2), fait: false },
  { id: 5, titre: 'Dotation amortissements Q1', categorie: 'Immobilisations', echeance: daysAhead(12), fait: false },
  { id: 6, titre: 'Provisions congés payés février', categorie: 'Provisions', echeance: daysAhead(6), fait: true },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════
const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d as T[];
  return fallback;
};

const fmtDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
};

const CATEGORIE_META: Record<AlerteCompta['categorie'], { icon: React.ReactNode; label: string }> = {
  tva: { icon: <Receipt className="w-4 h-4" />, label: 'TVA' },
  banque: { icon: <Landmark className="w-4 h-4" />, label: 'Banque' },
  immo: { icon: <Building className="w-4 h-4" />, label: 'Immo.' },
  ecriture: { icon: <FileText className="w-4 h-4" />, label: 'Écriture' },
  client: { icon: <FileText className="w-4 h-4" />, label: 'Client' },
  fournisseur: { icon: <FileText className="w-4 h-4" />, label: 'Fournisseur' },
};

// ═══════════════════════════════════════════════════════════════════
// KpiCard local
// ═══════════════════════════════════════════════════════════════════
interface KpiProps {
  label: string;
  value: string | number;
  hint?: string;
  color: 'terracotta' | 'sage' | 'indigo' | 'gold';
  icon?: React.ReactNode;
}
const COLORS: Record<KpiProps['color'], string> = {
  terracotta: '#C8663D',
  sage: '#4A6C5B',
  indigo: '#3B4E68',
  gold: '#D6A756',
};
const KpiCard: React.FC<KpiProps> = ({ label, value, hint, color, icon }) => (
  <div className="rounded-xl p-5 shadow-sm bg-white" style={{ borderLeft: `4px solid ${COLORS[color]}` }}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div
          className="text-[11px] uppercase tracking-widest font-medium mb-2"
          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
        >
          {label}
        </div>
        <div
          className="text-3xl italic font-medium"
          style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: COLORS[color] }}
        >
          {value}
        </div>
        {hint && <div className="text-xs mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>{hint}</div>}
      </div>
      {icon && (
        <div className="rounded-lg p-2 shrink-0" style={{ background: `${COLORS[color]}18`, color: COLORS[color] }}>
          {icon}
        </div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════
type Tab = 'journal' | 'alertes' | 'actions';

const DashboardComptable: React.FC = () => {
  const [tab, setTab] = useState<Tab>('journal');
  const [ecritures, setEcritures] = useState<EcritureJour[]>([]);
  const [alertes, setAlertes] = useState<AlerteCompta[]>([]);
  const [actions, setActions] = useState<ActionMensuelle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/comptabilite/journal-du-jour'),
        api.get('/comptabilite/alertes'),
        api.get('/comptabilite/actions-mensuelles'),
      ]);
      if (cancelled) return;
      setEcritures(pickArray<EcritureJour>(results[0], MOCK_ECRITURES));
      setAlertes(pickArray<AlerteCompta>(results[1], MOCK_ALERTES));
      setActions(pickArray<ActionMensuelle>(results[2], MOCK_ACTIONS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const aValider = ecritures.filter((e) => e.statut === 'brouillon').length;
    const tvaDeclarer = alertes.filter((a) => a.categorie === 'tva').length;
    const banqueAFaire = alertes.filter((a) => a.categorie === 'banque').length;
    const immoAAmortir = alertes.filter((a) => a.categorie === 'immo').length;
    return { aValider, tvaDeclarer, banqueAFaire, immoAAmortir };
  }, [ecritures, alertes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'journal', label: 'Journal du jour', icon: <FileText className="w-4 h-4" /> },
    { key: 'alertes', label: 'Alertes', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'actions', label: 'Actions du mois', icon: <ClipboardList className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)', color: 'var(--fg-muted, #7A6E63)' }}
            >
              DASHBOARD · COMPTABLE
            </div>
            <h1
              className="text-3xl italic font-medium flex items-center gap-3"
              style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
            >
              <Calculator className="w-7 h-7" style={{ color: '#C8663D' }} />
              Dashboard Comptable
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted, #7A6E63)' }}>
              §14.14 &middot; pilotage quotidien du poste comptable — SYSCOA / fiscalité TN
            </p>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Écritures à valider" value={kpis.aValider} hint="Brouillons en attente" color="terracotta" icon={<FileText className="w-5 h-5" />} />
            <KpiCard label="TVA à déclarer" value={kpis.tvaDeclarer} hint="Déclarations dues" color="gold" icon={<Receipt className="w-5 h-5" />} />
            <KpiCard label="Rapprochement banque" value={kpis.banqueAFaire} hint="Comptes à traiter" color="indigo" icon={<Landmark className="w-5 h-5" />} />
            <KpiCard label="Immo à amortir" value={kpis.immoAAmortir} hint="Périodes en cours" color="sage" icon={<Building className="w-5 h-5" />} />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    color: tab === t.key ? '#C8663D' : 'var(--fg-muted, #7A6E63)',
                    borderBottom: tab === t.key ? '2px solid #C8663D' : '2px solid transparent',
                    background: tab === t.key ? 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))' : 'transparent',
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'journal' && (
              <table className="min-w-full text-sm">
                <thead style={{ background: 'var(--bg-canvas)' }}>
                  <tr>
                    {['N° pièce', 'Journal', 'Libellé', 'Montant', 'Statut'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                  {ecritures.map((e) => (
                    <tr key={e.id_ecriture} className="hover:bg-[#FDF2ED]/50 group">
                      <td
                        className="px-4 py-3 text-xs font-semibold"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: '#3B4E68',
                        }}
                      >
                        {e.numero}
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: '#C8663D',
                        }}
                      >
                        {e.journal}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {e.libelle}
                      </td>
                      <td
                        className="px-4 py-3 text-right font-semibold"
                        style={{
                          fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                          color: 'var(--fg-primary, #2F2A26)',
                        }}
                      >
                        {e.montant.toLocaleString('fr-FR')} <span className="text-xs" style={{ color: 'var(--fg-muted, #7A6E63)' }}>TND</span>
                      </td>
                      <td className="px-4 py-3">
                        {e.statut === 'validee' ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: '#EEF4F0', color: '#4A6C5B' }}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Validée
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))', color: '#D6A756' }}
                          >
                            <Clock className="w-3 h-3" />
                            Brouillon
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'alertes' && (
              <div className="p-4 space-y-3">
                {alertes.map((a) => {
                  const meta = CATEGORIE_META[a.categorie];
                  const c = a.gravite === 'haute' ? '#C4574C' : a.gravite === 'moyenne' ? '#D6A756' : '#3B4E68';
                  const bg = a.gravite === 'haute' ? '#FDEDEA' : a.gravite === 'moyenne' ? 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))' : '#EDF0F5';
                  return (
                    <div
                      key={a.id}
                      className="rounded-lg p-4 flex items-start gap-3"
                      style={{ background: bg, borderLeft: `4px solid ${c}` }}
                    >
                      <div className="shrink-0 mt-0.5" style={{ color: c }}>
                        {meta.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[11px] uppercase tracking-widest font-semibold"
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                              color: c,
                            }}
                          >
                            {meta.label}
                          </span>
                          {a.echeance && (
                            <span
                              className="text-[11px]"
                              style={{
                                fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                                color: 'var(--fg-muted, #7A6E63)',
                              }}
                            >
                              échéance {fmtDate(a.echeance)}
                            </span>
                          )}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                          {a.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'actions' && (
              <table className="min-w-full text-sm">
                <thead style={{ background: 'var(--bg-canvas)' }}>
                  <tr>
                    {['Action', 'Catégorie', 'Échéance', 'Statut'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left italic font-medium text-xs uppercase tracking-wide"
                        style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', color: 'var(--fg-primary, #2F2A26)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle, #E7DFD3)' }}>
                  {actions.map((a) => {
                    const days = Math.ceil((new Date(a.echeance).getTime() - Date.now()) / 86400_000);
                    return (
                      <tr key={a.id} className="hover:bg-[#FDF2ED]/50 group">
                        <td className="px-4 py-3" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                          {a.titre}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: 'var(--fg-muted, #7A6E63)',
                          }}
                        >
                          {a.categorie}
                        </td>
                        <td
                          className="px-4 py-3 text-xs"
                          style={{
                            fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            color: !a.fait && days <= 3 ? '#C4574C' : 'var(--fg-primary, #2F2A26)',
                          }}
                        >
                          {fmtDate(a.echeance)} &middot; {days >= 0 ? `dans ${days} j` : `retard ${Math.abs(days)} j`}
                        </td>
                        <td className="px-4 py-3">
                          {a.fait ? (
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: '#EEF4F0', color: '#4A6C5B' }}
                            >
                              <CheckCircle2 className="w-3 h-3" /> Fait
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))', color: '#D6A756' }}
                            >
                              <Clock className="w-3 h-3" /> À faire
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardComptable;
