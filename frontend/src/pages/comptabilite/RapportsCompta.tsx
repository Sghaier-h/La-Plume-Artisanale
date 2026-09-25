import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Scale,
  BookOpenCheck,
  FileSpreadsheet,
  FileDown,
  Download,
  ArrowRight,
  X,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import PeriodePicker, { Granularite } from '../../components/comptabilite/PeriodePicker';
import {
  rapportsService,
  LigneRapport,
  RapportCompta,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — §10.8 Compte de résultat et bilan
// ═══════════════════════════════════════════════════════════════════

const MOCK_COMPTE_RESULTAT: RapportCompta = {
  exercice: 2026,
  date_generation: new Date().toISOString(),
  resultat_net: 78450,
  lignes: [
    { libelle: 'Chiffre d\'affaires (70)', code: '70', montant_n: 942500, montant_n1: 812000, bold: true },
    { libelle: 'Ventes produits finis', code: '701', montant_n: 842000, montant_n1: 720000 },
    { libelle: 'Prestations de services', code: '706', montant_n: 38500, montant_n1: 32000 },
    { libelle: 'Ventes marchandises', code: '707', montant_n: 62000, montant_n1: 60000 },
    { libelle: '− Achats consommés (60)', code: '60', montant_n: -340000, montant_n1: -298000, bold: true },
    { libelle: '− Services extérieurs (61+62)', code: '61-62', montant_n: -168000, montant_n1: -145000, bold: true },
    { libelle: 'Sous-traitance', code: '611', montant_n: -68000, montant_n1: -52000 },
    { libelle: 'Locations (loyer)', code: '613', montant_n: -24000, montant_n1: -22000 },
    { libelle: 'Électricité (STEG)', code: '6281', montant_n: -18400, montant_n1: -16200 },
    { libelle: 'Eau (SONEDE)', code: '6282', montant_n: -3800, montant_n1: -3400 },
    { libelle: 'Autres services', code: 'autres', montant_n: -53800, montant_n1: -51400 },
    { libelle: '− Impôts et taxes (63)', code: '63', montant_n: -12500, montant_n1: -11200 },
    { libelle: '− Charges de personnel (64)', code: '64', montant_n: -364000, montant_n1: -320000, bold: true },
    { libelle: '= Résultat d\'exploitation', montant_n: 58000, montant_n1: 37800, bold: true },
    { libelle: '− Charges financières (67)', code: '67', montant_n: -8400, montant_n1: -9200 },
    { libelle: '+ Produits financiers (76)', code: '76', montant_n: 2100, montant_n1: 1800 },
    { libelle: '− Dotations aux amortissements (68)', code: '68', montant_n: -42000, montant_n1: -38000 },
    { libelle: '= Résultat net', montant_n: 78450, montant_n1: 45500, bold: true },
  ],
};

const MOCK_BILAN: RapportCompta = {
  exercice: 2026,
  date_generation: new Date().toISOString(),
  total_actif: 1128200,
  total_passif: 1128200,
  lignes: [
    { libelle: 'ACTIF', montant_n: 1128200, montant_n1: 1042000, bold: true },
    { libelle: 'Immobilisations nettes (2 − amort)', code: '2', montant_n: 664200, montant_n1: 618000 },
    { libelle: 'Stocks (3)', code: '3', montant_n: 184000, montant_n1: 168000 },
    { libelle: 'Créances clients (411)', code: '411', montant_n: 168000, montant_n1: 145000 },
    { libelle: 'Trésorerie (51+53)', code: '5', montant_n: 112000, montant_n1: 111000 },
    { libelle: 'PASSIF', montant_n: 1128200, montant_n1: 1042000, bold: true },
    { libelle: 'Capitaux propres (10+12)', code: '10-12', montant_n: 578450, montant_n1: 500000 },
    { libelle: 'Dettes financières (16)', code: '16', montant_n: 96000, montant_n1: 120000 },
    { libelle: 'Dettes fournisseurs (401)', code: '401', montant_n: 67000, montant_n1: 45000 },
    { libelle: 'Dettes fiscales (44)', code: '44', montant_n: 42200, montant_n1: 32000 },
    { libelle: 'Dettes sociales (42)', code: '42', montant_n: 344550, montant_n1: 345000 },
  ],
};

const MOCK_BALANCE: RapportCompta = {
  exercice: 2026,
  date_generation: new Date().toISOString(),
  lignes: [
    { libelle: '10 · Capital social', code: '10', montant_n: 500000, montant_n1: 500000 },
    { libelle: '120 · Résultat de l\'exercice', code: '120', montant_n: 78450, montant_n1: 45500 },
    { libelle: '16 · Emprunts bancaires', code: '16', montant_n: 96000, montant_n1: 120000 },
    { libelle: '2131 · Bâtiments', code: '2131', montant_n: 350000, montant_n1: 350000 },
    { libelle: '2154 · Matériel industriel', code: '2154', montant_n: 525000, montant_n1: 480000 },
    { libelle: '31 · Matières premières', code: '31', montant_n: 109000, montant_n1: 87000 },
    { libelle: '35 · Produits finis', code: '35', montant_n: 36000, montant_n1: 68000 },
    { libelle: '401 · Fournisseurs', code: '401', montant_n: 67000, montant_n1: 45000 },
    { libelle: '411 · Clients', code: '411', montant_n: 168000, montant_n1: 128000 },
    { libelle: '44551 · TVA collectée', code: '44551', montant_n: 31500, montant_n1: 18500 },
    { libelle: '44561 · TVA déductible', code: '44561', montant_n: 20800, montant_n1: 12300 },
    { libelle: '5111 · Banque BIAT TND', code: '5111', montant_n: 144000, montant_n1: 84000 },
    { libelle: '5310 · Caisse', code: '5310', montant_n: 2400, montant_n1: 1200 },
    { libelle: '601 · Achats MP', code: '601', montant_n: 298000, montant_n1: 245000 },
    { libelle: '641 · Rémunérations', code: '641', montant_n: 296000, montant_n1: 260000 },
    { libelle: '701 · Ventes PF', code: '701', montant_n: 842000, montant_n1: 720000 },
  ],
};

type RapportKey = 'compte_resultat' | 'bilan' | 'grand_livre' | 'balance';

const CARDS: {
  key: RapportKey;
  titre: string;
  description: string;
  icon: React.ReactNode;
  couleur: string;
  fond: string;
}[] = [
  {
    key: 'compte_resultat',
    titre: 'Compte de résultat',
    description: 'Charges (60/61/62/63/64/65/67/68) vs Produits (70/74/76) — N vs N-1',
    icon: <BarChart3 className="w-6 h-6" />,
    couleur: '#C8663D',
    fond: '#FDF2ED',
  },
  {
    key: 'bilan',
    titre: 'Bilan',
    description: 'Actif (2/3/411/5) et Passif (10/12/16/401/44/42) — patrimoine à date',
    icon: <Scale className="w-6 h-6" />,
    couleur: '#4A5D75',
    fond: '#EDF0F5',
  },
  {
    key: 'grand_livre',
    titre: 'Grand Livre',
    description: 'Détail des écritures ligne par ligne par compte — piste d\'audit',
    icon: <BookOpenCheck className="w-6 h-6" />,
    couleur: '#7A8C6A',
    fond: '#EEF4F0',
  },
  {
    key: 'balance',
    titre: 'Balance générale',
    description: 'Soldes N/N-1 de tous les comptes, contrôle Σ débits = Σ crédits',
    icon: <FileSpreadsheet className="w-6 h-6" />,
    couleur: '#C89B3C',
    fond: '#FBF3E0',
  },
];

const RapportsCompta: React.FC = () => {
  const [rapportOpen, setRapportOpen] = useState<RapportKey | null>(null);
  const [rapport, setRapport] = useState<RapportCompta | null>(null);
  const [loading, setLoading] = useState(false);
  const [granularite, setGranularite] = useState<Granularite>('annee');
  const [periode, setPeriode] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (!rapportOpen) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const anneeInt = parseInt(periode.slice(0, 4), 10);
      const req = (() => {
        if (rapportOpen === 'compte_resultat')
          return rapportsService.compteResultat({ exercice: anneeInt, comparaison: true });
        if (rapportOpen === 'bilan')
          return rapportsService.bilan({ exercice: anneeInt, comparaison: true });
        if (rapportOpen === 'balance')
          return rapportsService.balance({ periode });
        return rapportsService.grandLivre({ compte: '411', periode });
      })();
      const r = await Promise.allSettled([req]);
      if (cancelled) return;
      const fallback =
        rapportOpen === 'compte_resultat'
          ? MOCK_COMPTE_RESULTAT
          : rapportOpen === 'bilan'
          ? MOCK_BILAN
          : rapportOpen === 'balance'
          ? MOCK_BALANCE
          : { ...MOCK_BALANCE, lignes: MOCK_BALANCE.lignes.slice(0, 8) };
      const pick = (res: PromiseSettledResult<any>): RapportCompta => {
        if (res.status !== 'fulfilled') return fallback;
        const d = res.value?.data?.data ?? res.value?.data;
        if (d && Array.isArray(d.lignes)) return d as RapportCompta;
        return fallback;
      };
      setRapport(pick(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [rapportOpen, periode]);

  const kpis = useMemo(() => {
    const ca = MOCK_COMPTE_RESULTAT.lignes.find((l) => l.code === '70')?.montant_n || 0;
    const resultat = MOCK_COMPTE_RESULTAT.resultat_net || 0;
    const totalActif = MOCK_BILAN.total_actif || 0;
    const marge = ca ? (resultat / ca) * 100 : 0;
    return { ca, resultat, totalActif, marge };
  }, []);

  const closeModal = () => {
    setRapportOpen(null);
    setRapport(null);
  };

  const currentTitle = CARDS.find((c) => c.key === rapportOpen)?.titre || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-64 p-6">
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
                <BarChart3 className="w-8 h-8 text-[#C8663D]" />
                Rapports comptables
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Compte de résultat, bilan, grand livre, balance (§10.8)
              </p>
            </div>
            <PeriodePicker
              granularite={granularite}
              onGranulariteChange={setGranularite}
              valeur={periode}
              onValeurChange={setPeriode}
            />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Chiffre d'affaires N" value={kpis.ca.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="terracotta" evolutionPct={16.1} />
            <KpiCard label="Résultat net" value={kpis.resultat.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color={kpis.resultat >= 0 ? 'sage' : 'warning'} evolutionPct={72.4} />
            <KpiCard label="Total bilan" value={kpis.totalActif.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="indigo" />
            <KpiCard label="Marge nette" value={kpis.marge.toFixed(1)} suffix="%" color={kpis.marge > 5 ? 'sage' : 'warning'} />
          </div>

          {/* Cartes rapports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CARDS.map((c) => (
              <button
                key={c.key}
                onClick={() => setRapportOpen(c.key)}
                className="text-left rounded-xl shadow-sm border border-white/60 p-6 hover:shadow-lg transition-all group"
                style={{ backgroundColor: c.fond }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-lg text-white"
                    style={{ backgroundColor: c.couleur }}
                  >
                    {c.icon}
                  </div>
                  <ArrowRight
                    className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform"
                    style={{ color: c.couleur }}
                  />
                </div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{
                    fontFamily: 'var(--font-serif, Fraunces, serif)',
                    color: c.couleur,
                  }}
                >
                  {c.titre}
                </h3>
                <p className="text-sm text-gray-700">{c.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal rapport */}
      {rapportOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gradient-to-r from-[#FDF2ED] to-white border-b flex items-center justify-between">
              <div>
                <h3
                  className="font-semibold text-lg text-gray-900"
                  style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                >
                  {currentTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Période {periode} · généré{' '}
                  {rapport && new Date(rapport.date_generation).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-xs">
                  <FileDown className="w-4 h-4" /> PDF
                </button>
                <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-xs">
                  <Download className="w-4 h-4" /> Excel
                </button>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C8663D]" />
                </div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-20">
                        Code
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                        Libellé
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                        Exercice N
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                        Exercice N-1
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                        Écart
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(rapport?.lignes || []).map((l: LigneRapport, i) => {
                      const ecart = Number(l.montant_n || 0) - Number(l.montant_n1 || 0);
                      const pct = l.montant_n1
                        ? (ecart / Math.abs(Number(l.montant_n1))) * 100
                        : 0;
                      return (
                        <tr
                          key={i}
                          className={`${
                            l.bold ? 'bg-gray-50 font-semibold' : 'hover:bg-[#FDF2ED]/30'
                          }`}
                        >
                          <td
                            className="px-3 py-2 font-mono text-xs text-[#3B4E68]"
                            style={{
                              fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                            }}
                          >
                            {l.code}
                          </td>
                          <td className={`px-3 py-2 ${l.bold ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                            {l.bold ? l.libelle : <span className="pl-4">{l.libelle}</span>}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <MontantCell value={l.montant_n} devise="" bold={l.bold} />
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            <MontantCell value={l.montant_n1 || 0} devise="" />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`text-xs font-semibold ${
                                ecart >= 0 ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {ecart >= 0 ? '+' : ''}
                              {pct.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {rapport?.total_actif != null && (
                      <tr className="bg-[#3B4E68] text-white font-bold">
                        <td className="px-3 py-2" colSpan={2}>
                          TOTAL {rapportOpen === 'bilan' ? 'BILAN' : ''}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <MontantCell
                            value={rapport.total_actif}
                            devise=""
                            bold
                            className="!text-white"
                          />
                        </td>
                        <td colSpan={2} />
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportsCompta;
