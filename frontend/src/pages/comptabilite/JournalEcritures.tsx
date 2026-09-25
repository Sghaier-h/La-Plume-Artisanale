import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  PlusCircle,
  Upload,
  Lock,
  X,
  CheckCircle2,
  Download,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import JournalBadge from '../../components/comptabilite/JournalBadge';
import StatutEcritureBadge from '../../components/comptabilite/StatutEcriture';
import PeriodePicker, { Granularite } from '../../components/comptabilite/PeriodePicker';
import {
  ecrituresService,
  EcritureComptable,
  StatutEcriture,
  CodeJournal,
  LigneEcriture,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — journal chronologique
// ═══════════════════════════════════════════════════════════════════

const MOCK_LIGNES_1: LigneEcriture[] = [
  { id_compte_comptable: 402, numero_compte: '411', libelle_compte: 'Clients', libelle: 'Facture VE-2026-0142', debit: 4760, credit: 0, id_tiers: 12, type_tiers: 'client', nom_tiers: 'Boutique El Menzah SARL' },
  { id_compte_comptable: 701, numero_compte: '701', libelle_compte: 'Ventes PF', libelle: 'Ventes foutas', debit: 0, credit: 4000, nom_tiers: '' },
  { id_compte_comptable: 404, numero_compte: '44551', libelle_compte: 'TVA collectée', libelle: 'TVA 19%', debit: 0, credit: 760, nom_tiers: '' },
];

const MOCK_LIGNES_2: LigneEcriture[] = [
  { id_compte_comptable: 601, numero_compte: '601', libelle_compte: 'Achats MP', libelle: 'Achat fil coton 40/2 lot 2648', debit: 12500, credit: 0 },
  { id_compte_comptable: 405, numero_compte: '44561', libelle_compte: 'TVA déductible', libelle: 'TVA 19%', debit: 2375, credit: 0 },
  { id_compte_comptable: 401, numero_compte: '401', libelle_compte: 'Fournisseurs', libelle: 'Facture FILAT-892', debit: 0, credit: 14875, id_tiers: 4, type_tiers: 'fournisseur', nom_tiers: 'Filature Tunisie SA' },
];

const MOCK_LIGNES_3: LigneEcriture[] = [
  { id_compte_comptable: 501, numero_compte: '5111', libelle_compte: 'Banque BIAT', libelle: 'Encaissement virement client', debit: 8420, credit: 0 },
  { id_compte_comptable: 402, numero_compte: '411', libelle_compte: 'Clients', libelle: 'Solde facture VE-2026-0128', debit: 0, credit: 8420, id_tiers: 5, type_tiers: 'client', nom_tiers: 'Hotel Marina Djerba' },
];

const MOCK_ECRITURES: EcritureComptable[] = [
  {
    id_ecriture: 8001,
    numero_ecriture: 'EC-2026001248',
    date_ecriture: new Date(Date.now() - 3600_000 * 5).toISOString(),
    date_piece: new Date(Date.now() - 3600_000 * 5).toISOString(),
    libelle: 'Facture VE-2026-0142 — Boutique El Menzah',
    id_journal: 1,
    code_journal: 'VE',
    id_piece_source: 142,
    type_piece_source: 'facture',
    montant_total: 4760,
    statut: 'validee',
    lignes: MOCK_LIGNES_1,
  },
  {
    id_ecriture: 8002,
    numero_ecriture: 'EC-2026001247',
    date_ecriture: new Date(Date.now() - 3600_000 * 12).toISOString(),
    date_piece: new Date(Date.now() - 3600_000 * 26).toISOString(),
    libelle: 'Facture fournisseur FILAT-892 — Filature Tunisie',
    id_journal: 2,
    code_journal: 'AC',
    id_piece_source: 892,
    type_piece_source: 'facture_fournisseur',
    montant_total: 14875,
    statut: 'validee',
    lignes: MOCK_LIGNES_2,
  },
  {
    id_ecriture: 8003,
    numero_ecriture: 'EC-2026001246',
    date_ecriture: new Date(Date.now() - 3600_000 * 24).toISOString(),
    libelle: 'Encaissement virement client — Hotel Marina Djerba',
    id_journal: 3,
    code_journal: 'BQ1',
    id_piece_source: 445,
    type_piece_source: 'paiement',
    montant_total: 8420,
    statut: 'validee',
    lignes: MOCK_LIGNES_3,
  },
  {
    id_ecriture: 8004,
    numero_ecriture: 'EC-2026001245',
    date_ecriture: new Date(Date.now() - 3600_000 * 48).toISOString(),
    libelle: 'Loyer usine Sfax — décembre',
    id_journal: 4,
    code_journal: 'OD',
    montant_total: 2000,
    statut: 'brouillon',
    lignes: [
      { id_compte_comptable: 604, numero_compte: '613', libelle_compte: 'Loyer', libelle: 'Loyer décembre', debit: 2000, credit: 0 },
      { id_compte_comptable: 401, numero_compte: '401', libelle_compte: 'Fournisseurs', libelle: 'À régler propriétaire Sfax', debit: 0, credit: 2000, id_tiers: 8, type_tiers: 'fournisseur', nom_tiers: 'SCI Sfax Immo' },
    ],
  },
  {
    id_ecriture: 8005,
    numero_ecriture: 'EC-2026001244',
    date_ecriture: new Date(Date.now() - 3600_000 * 72).toISOString(),
    libelle: 'Encaissement espèces — showroom Djerba',
    id_journal: 5,
    code_journal: 'CA',
    montant_total: 1420,
    statut: 'validee',
    lignes: [
      { id_compte_comptable: 504, numero_compte: '5311', libelle_compte: 'Caisse showroom', libelle: 'Vente comptoir', debit: 1420, credit: 0 },
      { id_compte_comptable: 701, numero_compte: '701', libelle_compte: 'Ventes PF', libelle: 'Foutas + jetés', debit: 0, credit: 1193, nom_tiers: '' },
      { id_compte_comptable: 404, numero_compte: '44551', libelle_compte: 'TVA', libelle: 'TVA 19%', debit: 0, credit: 227, nom_tiers: '' },
    ],
  },
  {
    id_ecriture: 8006,
    numero_ecriture: 'EC-2025012456',
    date_ecriture: new Date('2025-12-28').toISOString(),
    libelle: 'Salaires décembre 2025 (verrouillé N-1)',
    id_journal: 6,
    code_journal: 'PA',
    montant_total: 24800,
    statut: 'cloturee',
    lignes: [
      { id_compte_comptable: 607, numero_compte: '641', libelle_compte: 'Rémunérations', libelle: 'Salaires bruts', debit: 24800, credit: 0 },
      { id_compte_comptable: 403, numero_compte: '421', libelle_compte: 'Personnel', libelle: 'Net à payer', debit: 0, credit: 24800 },
    ],
  },
];

const JournalEcritures: React.FC = () => {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJournal, setFilterJournal] = useState<CodeJournal | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<StatutEcriture | 'all'>('all');
  const [detail, setDetail] = useState<EcritureComptable | null>(null);
  const [granularite, setGranularite] = useState<Granularite>('mois');
  const [periode, setPeriode] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([ecrituresService.getEcritures()]);
      if (cancelled) return;
      const pick = (res: PromiseSettledResult<any>): EcritureComptable[] => {
        if (res.status !== 'fulfilled') return MOCK_ECRITURES;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.ecritures)) return d.ecritures;
        return MOCK_ECRITURES;
      };
      setEcritures(pick(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return ecritures.filter((e) => {
      if (filterJournal !== 'all' && e.code_journal !== filterJournal) return false;
      if (filterStatut !== 'all' && e.statut !== filterStatut) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.numero_ecriture.toLowerCase().includes(q) ||
          e.libelle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [ecritures, search, filterJournal, filterStatut]);

  const kpis = useMemo(() => {
    const brouillons = ecritures.filter((e) => e.statut === 'brouillon').length;
    const validees = ecritures.filter((e) => e.statut === 'validee').length;
    const totalDebit = ecritures.reduce(
      (s, e) => s + (e.lignes || []).reduce((x, l) => x + Number(l.debit || 0), 0),
      0
    );
    const totalCredit = ecritures.reduce(
      (s, e) => s + (e.lignes || []).reduce((x, l) => x + Number(l.credit || 0), 0),
      0
    );
    return {
      total: ecritures.length,
      brouillons,
      validees,
      totalDebit,
      totalCredit,
      equilibre: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }, [ecritures]);

  const handleValider = async (e: EcritureComptable) => {
    try {
      await ecrituresService.valider(e.id_ecriture);
    } catch {
      /* mock */
    }
    setEcritures((prev) =>
      prev.map((x) => (x.id_ecriture === e.id_ecriture ? { ...x, statut: 'validee' } : x))
    );
    setDetail(null);
  };

  const handleVerrouiller = async () => {
    if (!window.confirm(`Verrouiller définitivement la période ${periode} ?`)) return;
    try {
      await ecrituresService.verrouillerPeriode(periode);
    } catch {
      /* mock */
    }
    alert(`Période ${periode} verrouillée. Les écritures ne sont plus modifiables.`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1
                className="text-3xl font-bold flex items-center gap-3"
                style={{
                  fontFamily: 'var(--font-serif, Fraunces, serif)',
                  color: 'var(--fg-primary, #2F2A26)',
                }}
              >
                <FileText className="w-8 h-8 text-[#C8663D]" />
                Journal des écritures
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Écritures chronologiques par journal · SYSCOA (§10.2)
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PeriodePicker
                granularite={granularite}
                onGranulariteChange={setGranularite}
                valeur={periode}
                onValeurChange={setPeriode}
              />
              <button
                onClick={handleVerrouiller}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Lock className="w-4 h-4" /> Verrouiller période
              </button>
              <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                <Upload className="w-4 h-4" /> Import bancaire
              </button>
              <button className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] shadow-sm">
                <PlusCircle className="w-4 h-4" /> Nouvelle écriture
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Écritures période"
              value={kpis.total}
              color="indigo"
              subtitle={`${kpis.validees} validées · ${kpis.brouillons} brouillons`}
            />
            <KpiCard
              label="Total débit"
              value={kpis.totalDebit.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              color="sage"
            />
            <KpiCard
              label="Total crédit"
              value={kpis.totalCredit.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              color="terracotta"
            />
            <KpiCard
              label="Équilibre"
              value={kpis.equilibre ? 'OK' : 'DÉSÉQUILIBRE'}
              color={kpis.equilibre ? 'sage' : 'warning'}
              subtitle="Σ débits = Σ crédits"
            />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="N° pièce, libellé…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterJournal}
              onChange={(e) => setFilterJournal(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5"
            >
              <option value="all">Tous journaux</option>
              <option value="VE">VE — Ventes</option>
              <option value="AC">AC — Achats</option>
              <option value="OD">OD — Op. diverses</option>
              <option value="CA">CA — Caisse</option>
              <option value="BQ1">BQ1 — Banque TND</option>
              <option value="BQ2">BQ2 — Banque EUR</option>
              <option value="PA">PA — Paie</option>
            </select>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5"
            >
              <option value="all">Tous statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="validee">Validée</option>
              <option value="cloturee">Verrouillée</option>
            </select>
            <div className="text-sm text-gray-500 ml-auto">
              {filtered.length} / {ecritures.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N° pièce</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Journal</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Libellé / Tiers</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Débit</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Crédit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e) => {
                  const tiers = (e.lignes || []).find((l) => l.nom_tiers)?.nom_tiers;
                  return (
                    <tr key={e.id_ecriture} className="hover:bg-[#FDF2ED]/40 group">
                      <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
                        {new Date(e.date_ecriture).toLocaleDateString('fr-FR')}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-xs font-semibold text-[#3B4E68]"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                      >
                        {e.numero_ecriture}
                      </td>
                      <td className="px-4 py-3">
                        <JournalBadge code={e.code_journal || 'OD'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{e.libelle}</div>
                        {tiers && (
                          <div className="text-xs text-gray-500 italic">↳ {tiers}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={e.montant_total} devise="" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={e.montant_total} devise="" />
                      </td>
                      <td className="px-4 py-3">
                        <StatutEcritureBadge statut={e.statut} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDetail(e)}
                          className="text-xs text-[#3B4E68] hover:text-[#C8663D] inline-flex items-center gap-1 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> Détail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Aucune écriture pour ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal détail */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gradient-to-r from-[#FDF2ED] to-white border-b flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold text-lg text-gray-900"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                >
                  Écriture{' '}
                  <span
                    className="font-mono text-[#C8663D]"
                    style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                  >
                    {detail.numero_ecriture}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(detail.date_ecriture).toLocaleString('fr-FR')} ·{' '}
                  <JournalBadge code={detail.code_journal || 'OD'} showLabel />
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Libellé</div>
                <div className="text-gray-900">{detail.libelle}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Lignes</div>
                <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs">N° compte</th>
                      <th className="px-3 py-2 text-left text-xs">Libellé</th>
                      <th className="px-3 py-2 text-right text-xs">Débit</th>
                      <th className="px-3 py-2 text-right text-xs">Crédit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(detail.lignes || []).map((l, i) => (
                      <tr key={i} className="hover:bg-gray-50 group">
                        <td
                          className="px-3 py-2 font-mono text-xs font-semibold text-[#3B4E68]"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                        >
                          {l.numero_compte}
                          {l.libelle_compte && (
                            <div className="text-[10px] font-normal text-gray-500">
                              {l.libelle_compte}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {l.libelle}
                          {l.nom_tiers && (
                            <div className="text-[11px] italic text-gray-500">↳ {l.nom_tiers}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <MontantCell value={l.debit} devise="" showZero={false} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <MontantCell value={l.credit} devise="" showZero={false} />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={2} className="px-3 py-2 text-right">
                        TOTAL
                      </td>
                      <td className="px-3 py-2 text-right">
                        <MontantCell
                          value={(detail.lignes || []).reduce((s, l) => s + Number(l.debit || 0), 0)}
                          devise=""
                          bold
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <MontantCell
                          value={(detail.lignes || []).reduce((s, l) => s + Number(l.credit || 0), 0)}
                          devise=""
                          bold
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                {detail.statut === 'brouillon' && (
                  <button
                    onClick={() => handleValider(detail)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Valider l'écriture
                  </button>
                )}
                <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEcritures;
