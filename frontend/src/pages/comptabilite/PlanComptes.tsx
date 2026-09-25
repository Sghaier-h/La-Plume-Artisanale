import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Download,
  PlusCircle,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import {
  planComptesService,
  CompteComptable,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — Plan SYSCOA simplifié adapté Tunisie (§10.1)
// ═══════════════════════════════════════════════════════════════════

const CLASSES: Record<number, { libelle: string; type: CompteComptable['type_compte'] }> = {
  1: { libelle: 'Capitaux', type: 'passif' },
  2: { libelle: 'Immobilisations', type: 'actif' },
  3: { libelle: 'Stocks', type: 'actif' },
  4: { libelle: 'Tiers', type: 'actif' },
  5: { libelle: 'Financiers', type: 'actif' },
  6: { libelle: 'Charges', type: 'charges' },
  7: { libelle: 'Produits', type: 'produits' },
};

const MOCK_COMPTES: CompteComptable[] = [
  // Classe 1
  { id_compte_comptable: 101, numero_compte: '10', libelle: 'Capital social', type_compte: 'passif', classe: 1, sous_type: 'capitaux_propres', actif: true, solde_ouverture: 500000, mouvement_debit: 0, mouvement_credit: 0, solde_actuel: 500000 },
  { id_compte_comptable: 102, numero_compte: '120', libelle: 'Résultat de l\'exercice', type_compte: 'passif', classe: 1, sous_type: 'capitaux_propres', actif: true, solde_ouverture: 0, mouvement_debit: 0, mouvement_credit: 78450, solde_actuel: 78450 },
  { id_compte_comptable: 103, numero_compte: '16', libelle: 'Emprunts bancaires', type_compte: 'passif', classe: 1, actif: true, solde_ouverture: 120000, mouvement_debit: 24000, mouvement_credit: 0, solde_actuel: 96000 },
  // Classe 2
  { id_compte_comptable: 201, numero_compte: '2131', libelle: 'Bâtiments industriels', type_compte: 'actif', classe: 2, sous_type: 'immobilisations', actif: true, solde_ouverture: 350000, mouvement_debit: 0, mouvement_credit: 0, solde_actuel: 350000 },
  { id_compte_comptable: 202, numero_compte: '2154', libelle: 'Matériel industriel (Dornier)', type_compte: 'actif', classe: 2, sous_type: 'immobilisations', actif: true, solde_ouverture: 480000, mouvement_debit: 45000, mouvement_credit: 0, solde_actuel: 525000 },
  { id_compte_comptable: 203, numero_compte: '2183', libelle: 'Matériel informatique', type_compte: 'actif', classe: 2, sous_type: 'immobilisations', actif: true, solde_ouverture: 18000, mouvement_debit: 3200, mouvement_credit: 0, solde_actuel: 21200 },
  // Classe 3
  { id_compte_comptable: 301, numero_compte: '31', libelle: 'Matières premières (fil coton)', type_compte: 'actif', classe: 3, sous_type: 'stocks', actif: true, solde_ouverture: 87000, mouvement_debit: 320000, mouvement_credit: 298000, solde_actuel: 109000 },
  { id_compte_comptable: 302, numero_compte: '33', libelle: 'Semi-finis (tissu écru)', type_compte: 'actif', classe: 3, sous_type: 'stocks', actif: true, solde_ouverture: 34000, mouvement_debit: 220000, mouvement_credit: 215000, solde_actuel: 39000 },
  { id_compte_comptable: 303, numero_compte: '35', libelle: 'Produits finis (foutas, jetés)', type_compte: 'actif', classe: 3, sous_type: 'stocks', actif: true, solde_ouverture: 68000, mouvement_debit: 480000, mouvement_credit: 512000, solde_actuel: 36000 },
  // Classe 4
  { id_compte_comptable: 401, numero_compte: '401', libelle: 'Fournisseurs', type_compte: 'passif', classe: 4, sous_type: 'dettes_fournisseurs', actif: true, solde_ouverture: 45000, mouvement_debit: 380000, mouvement_credit: 402000, solde_actuel: 67000 },
  { id_compte_comptable: 402, numero_compte: '411', libelle: 'Clients', type_compte: 'actif', classe: 4, actif: true, solde_ouverture: 128000, mouvement_debit: 890000, mouvement_credit: 850000, solde_actuel: 168000 },
  { id_compte_comptable: 403, numero_compte: '421', libelle: 'Personnel — rémunérations dues', type_compte: 'passif', classe: 4, sous_type: 'personnel', actif: true, solde_ouverture: 32000, mouvement_debit: 380000, mouvement_credit: 384000, solde_actuel: 36000 },
  { id_compte_comptable: 404, numero_compte: '44551', libelle: 'TVA collectée', type_compte: 'passif', classe: 4, sous_type: 'tva', est_tva: true, actif: true, solde_ouverture: 18500, mouvement_debit: 165000, mouvement_credit: 178000, solde_actuel: 31500 },
  { id_compte_comptable: 405, numero_compte: '44561', libelle: 'TVA déductible', type_compte: 'actif', classe: 4, sous_type: 'tva', est_tva: true, actif: true, solde_ouverture: 12300, mouvement_debit: 87000, mouvement_credit: 78500, solde_actuel: 20800 },
  { id_compte_comptable: 406, numero_compte: '44571', libelle: 'TVA à payer', type_compte: 'passif', classe: 4, sous_type: 'tva', est_tva: true, actif: true, solde_ouverture: 0, mouvement_debit: 0, mouvement_credit: 10700, solde_actuel: 10700 },
  // Classe 5
  { id_compte_comptable: 501, numero_compte: '5111', libelle: 'Banque BIAT TND', type_compte: 'actif', classe: 5, sous_type: 'banque', actif: true, solde_ouverture: 84000, mouvement_debit: 780000, mouvement_credit: 720000, solde_actuel: 144000 },
  { id_compte_comptable: 502, numero_compte: '5112', libelle: 'Banque BIAT EUR', type_compte: 'actif', classe: 5, sous_type: 'banque', actif: true, solde_ouverture: 22000, mouvement_debit: 145000, mouvement_credit: 132000, solde_actuel: 35000 },
  { id_compte_comptable: 503, numero_compte: '5310', libelle: 'Caisse siège', type_compte: 'actif', classe: 5, sous_type: 'caisse', actif: true, solde_ouverture: 1200, mouvement_debit: 24000, mouvement_credit: 22800, solde_actuel: 2400 },
  { id_compte_comptable: 504, numero_compte: '5311', libelle: 'Caisse showroom', type_compte: 'actif', classe: 5, sous_type: 'caisse', actif: true, solde_ouverture: 800, mouvement_debit: 8400, mouvement_credit: 7900, solde_actuel: 1300 },
  // Classe 6
  { id_compte_comptable: 601, numero_compte: '601', libelle: 'Achats matières premières', type_compte: 'charges', classe: 6, sous_type: 'achats', actif: true, solde_ouverture: 0, mouvement_debit: 298000, mouvement_credit: 0, solde_actuel: 298000 },
  { id_compte_comptable: 602, numero_compte: '607', libelle: 'Achats marchandises', type_compte: 'charges', classe: 6, sous_type: 'achats', actif: true, solde_ouverture: 0, mouvement_debit: 42000, mouvement_credit: 0, solde_actuel: 42000 },
  { id_compte_comptable: 603, numero_compte: '611', libelle: 'Sous-traitance', type_compte: 'charges', classe: 6, actif: true, solde_ouverture: 0, mouvement_debit: 68000, mouvement_credit: 0, solde_actuel: 68000 },
  { id_compte_comptable: 604, numero_compte: '613', libelle: 'Locations (loyer)', type_compte: 'charges', classe: 6, actif: true, solde_ouverture: 0, mouvement_debit: 24000, mouvement_credit: 0, solde_actuel: 24000 },
  { id_compte_comptable: 605, numero_compte: '6281', libelle: 'Électricité (STEG)', type_compte: 'charges', classe: 6, actif: true, solde_ouverture: 0, mouvement_debit: 18400, mouvement_credit: 0, solde_actuel: 18400 },
  { id_compte_comptable: 606, numero_compte: '6282', libelle: 'Eau (SONEDE)', type_compte: 'charges', classe: 6, actif: true, solde_ouverture: 0, mouvement_debit: 3800, mouvement_credit: 0, solde_actuel: 3800 },
  { id_compte_comptable: 607, numero_compte: '641', libelle: 'Rémunérations du personnel', type_compte: 'charges', classe: 6, sous_type: 'personnel', actif: true, solde_ouverture: 0, mouvement_debit: 296000, mouvement_credit: 0, solde_actuel: 296000 },
  { id_compte_comptable: 608, numero_compte: '645', libelle: 'Charges sociales (CNSS)', type_compte: 'charges', classe: 6, sous_type: 'personnel', actif: true, solde_ouverture: 0, mouvement_debit: 68000, mouvement_credit: 0, solde_actuel: 68000 },
  { id_compte_comptable: 609, numero_compte: '6811', libelle: 'Dotations aux amortissements', type_compte: 'charges', classe: 6, actif: true, solde_ouverture: 0, mouvement_debit: 42000, mouvement_credit: 0, solde_actuel: 42000 },
  // Classe 7
  { id_compte_comptable: 701, numero_compte: '701', libelle: 'Ventes produits finis', type_compte: 'produits', classe: 7, sous_type: 'ventes', actif: true, solde_ouverture: 0, mouvement_debit: 0, mouvement_credit: 842000, solde_actuel: 842000 },
  { id_compte_comptable: 702, numero_compte: '706', libelle: 'Prestations de services', type_compte: 'produits', classe: 7, sous_type: 'ventes', actif: true, solde_ouverture: 0, mouvement_debit: 0, mouvement_credit: 38500, solde_actuel: 38500 },
  { id_compte_comptable: 703, numero_compte: '707', libelle: 'Ventes marchandises', type_compte: 'produits', classe: 7, sous_type: 'ventes', actif: true, solde_ouverture: 0, mouvement_debit: 0, mouvement_credit: 62000, solde_actuel: 62000 },
  { id_compte_comptable: 704, numero_compte: '74', libelle: 'Subventions d\'exploitation', type_compte: 'produits', classe: 7, actif: true, solde_ouverture: 0, mouvement_debit: 0, mouvement_credit: 12500, solde_actuel: 12500 },
];

// ═══════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

const PlanComptes: React.FC = () => {
  const [comptes, setComptes] = useState<CompteComptable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState<number | 'all'>('all');
  const [expandedClasses, setExpandedClasses] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7]));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await Promise.allSettled([planComptesService.getComptes()]);
      if (cancelled) return;
      const pick = (r: PromiseSettledResult<any>): CompteComptable[] => {
        if (r.status !== 'fulfilled') return MOCK_COMPTES;
        const d = r.value?.data?.data ?? r.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.comptes)) return d.comptes;
        return MOCK_COMPTES;
      };
      setComptes(pick(res[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return comptes.filter((c) => {
      if (filterClasse !== 'all' && c.classe !== filterClasse) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.numero_compte.toLowerCase().includes(q) ||
          c.libelle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [comptes, search, filterClasse]);

  const grouped = useMemo(() => {
    const map = new Map<number, CompteComptable[]>();
    filtered.forEach((c) => {
      if (!map.has(c.classe)) map.set(c.classe, []);
      map.get(c.classe)!.push(c);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const kpis = useMemo(() => {
    const totalActif = comptes
      .filter((c) => c.type_compte === 'actif')
      .reduce((s, c) => s + (c.solde_actuel || 0), 0);
    const totalPassif = comptes
      .filter((c) => c.type_compte === 'passif')
      .reduce((s, c) => s + (c.solde_actuel || 0), 0);
    const totalCharges = comptes
      .filter((c) => c.type_compte === 'charges')
      .reduce((s, c) => s + (c.solde_actuel || 0), 0);
    const totalProduits = comptes
      .filter((c) => c.type_compte === 'produits')
      .reduce((s, c) => s + (c.solde_actuel || 0), 0);
    return {
      totalActif,
      totalPassif,
      totalCharges,
      totalProduits,
      resultat: totalProduits - totalCharges,
      nbComptes: comptes.length,
    };
  }, [comptes]);

  const toggleClasse = (classe: number) => {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classe)) next.delete(classe);
      else next.add(classe);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

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
                <BookOpen className="w-8 h-8 text-[#C8663D]" />
                Plan comptable SYSCOA
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Classes 1 à 7 — Plan SYSCOA simplifié adapté Tunisie (§10.1)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm"
                title="Exporter en Excel"
              >
                <Download className="w-4 h-4" /> Export Excel
              </button>
              <button className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] shadow-sm">
                <PlusCircle className="w-4 h-4" /> Nouveau compte
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Total actif"
              value={kpis.totalActif.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              color="sage"
              subtitle={`${comptes.filter((c) => c.type_compte === 'actif').length} comptes`}
            />
            <KpiCard
              label="Total passif"
              value={kpis.totalPassif.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              color="indigo"
              subtitle={`${comptes.filter((c) => c.type_compte === 'passif').length} comptes`}
            />
            <KpiCard
              label="Charges (classe 6)"
              value={kpis.totalCharges.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              color="terracotta"
            />
            <KpiCard
              label="Résultat provisoire"
              value={kpis.resultat.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
              suffix="DT"
              color={kpis.resultat >= 0 ? 'sage' : 'warning'}
              subtitle="Produits − Charges"
            />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher n° compte ou libellé…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterClasse}
              onChange={(e) =>
                setFilterClasse(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
              }
              className="text-sm border rounded-lg px-2 py-1.5"
            >
              <option value="all">Toutes classes</option>
              {Object.entries(CLASSES).map(([c, cfg]) => (
                <option key={c} value={c}>
                  Classe {c} — {cfg.libelle}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-500 ml-auto">
              {filtered.length} / {comptes.length} comptes
            </div>
          </div>

          {/* Arbre par classe */}
          <div className="space-y-3">
            {grouped.map(([classe, items]) => {
              const cfg = CLASSES[classe];
              const expanded = expandedClasses.has(classe);
              const totalSolde = items.reduce((s, c) => s + (c.solde_actuel || 0), 0);
              return (
                <div
                  key={classe}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => toggleClasse(classe)}
                    className="w-full px-5 py-3 bg-gradient-to-r from-gray-50 to-white border-b flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {expanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold text-sm"
                        style={{
                          backgroundColor:
                            classe <= 2
                              ? '#4A5D75'
                              : classe === 3
                              ? '#7A8C6A'
                              : classe === 4
                              ? '#C89B3C'
                              : classe === 5
                              ? '#3B4E68'
                              : classe === 6
                              ? '#C8663D'
                              : '#7A8C6A',
                        }}
                      >
                        {classe}
                      </div>
                      <div className="text-left">
                        <div
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                        >
                          Classe {classe} · {cfg?.libelle || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {items.length} compte(s) · {cfg?.type}
                        </div>
                      </div>
                    </div>
                    <MontantCell value={totalSolde} bold />
                  </button>

                  {expanded && (
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-32">
                            N° compte
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                            Libellé
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-32">
                            Nature
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-40">
                            Solde ouverture
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-32">
                            Débit N
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-32">
                            Crédit N
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase w-40">
                            Solde N
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map((c) => (
                          <tr key={c.id_compte_comptable} className="hover:bg-[#FDF2ED]/40">
                            <td
                              className="px-4 py-2 font-mono font-semibold text-[#3B4E68]"
                              style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                            >
                              {c.numero_compte}
                            </td>
                            <td className="px-4 py-2 text-gray-900">
                              {c.libelle}
                              {c.est_tva && (
                                <span className="ml-2 text-[10px] font-bold bg-[#FBF3E0] text-[#8A6412] px-1.5 py-0.5 rounded uppercase">
                                  TVA
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                                  c.type_compte === 'actif'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : c.type_compte === 'passif'
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : c.type_compte === 'charges'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-green-50 text-green-700'
                                }`}
                              >
                                {c.type_compte}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <MontantCell value={c.solde_ouverture || 0} devise="" />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <MontantCell
                                value={c.mouvement_debit || 0}
                                devise=""
                                showZero={false}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <MontantCell
                                value={c.mouvement_credit || 0}
                                devise=""
                                showZero={false}
                              />
                            </td>
                            <td className="px-4 py-2 text-right">
                              <MontantCell value={c.solde_actuel || 0} bold devise="" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
            {grouped.length === 0 && (
              <div className="bg-white rounded-lg p-8 text-center text-gray-400">
                Aucun compte pour ces critères.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComptes;
