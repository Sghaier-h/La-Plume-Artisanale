import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  PlusCircle,
  Search,
  Filter,
  Layers,
  AlertTriangle,
  ListChecks,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantMoisTotal from '../../components/achats/MontantMoisTotal';
import {
  depensesEspecesService,
  DepenseEspeces,
  CategorieDepenseEspeces,
  ModeDepense,
  StatutComptaDepense,
} from '../../services/achatsApi';

const SEUIL_FACTURE_DT = 100; // alerte à partir de 100 DT / facture (loi TN §9.9)
const SEUIL_BLOC_OBLIGATOIRE_DT = 500;

const iso = (d: Date) => d.toISOString();

const MOCK_DEPENSES: DepenseEspeces[] = [
  {
    id_depense: 1,
    date_depense: iso(new Date()),
    libelle: 'Café + baguettes ouvriers atelier',
    montant: 18.5,
    categorie: 'cafe_ouvriers',
    mode: 'petite_caisse',
    saisi_par_nom: 'Karim Ben Salah',
    statut_compta: 'non_comptabilise',
  },
  {
    id_depense: 2,
    date_depense: iso(new Date(Date.now() - 86400_000 * 1)),
    libelle: 'Taxi livraison bobines Sfax',
    montant: 42,
    categorie: 'transport_local',
    mode: 'perso_rembourse',
    saisi_par_nom: 'Mohamed Trabelsi',
    statut_compta: 'non_comptabilise',
  },
  {
    id_depense: 3,
    date_depense: iso(new Date(Date.now() - 86400_000 * 3)),
    libelle: 'Boulons + ressort quincaillerie du coin',
    montant: 27,
    categorie: 'depannage',
    mode: 'petite_caisse',
    saisi_par_nom: 'Mohamed Trabelsi',
    statut_compta: 'non_comptabilise',
  },
  {
    id_depense: 4,
    date_depense: iso(new Date(Date.now() - 86400_000 * 5)),
    libelle: 'Pourboire déchargement bobines',
    montant: 10,
    categorie: 'pourboire',
    mode: 'petite_caisse',
    saisi_par_nom: 'Karim Ben Salah',
    statut_compta: 'non_comptabilise',
  },
  {
    id_depense: 5,
    date_depense: iso(new Date(Date.now() - 86400_000 * 8)),
    libelle: 'Papeterie dépannage (encre imprimante bureau)',
    montant: 45.75,
    categorie: 'petite_fourniture',
    mode: 'petite_caisse',
    saisi_par_nom: 'Sonia Kabbaj',
    statut_compta: 'non_comptabilise',
  },
  {
    id_depense: 6,
    date_depense: iso(new Date(Date.now() - 86400_000 * 12)),
    libelle: 'Repas ouvriers heures sup samedi',
    montant: 85,
    categorie: 'restauration_atelier',
    mode: 'petite_caisse',
    saisi_par_nom: 'Ali Fouti',
    statut_compta: 'non_comptabilise',
  },
  {
    id_depense: 7,
    date_depense: iso(new Date(Date.now() - 86400_000 * 40)),
    libelle: 'Bloc dépenses aout — comptabilisé',
    montant: 320.5,
    categorie: 'divers',
    mode: 'petite_caisse',
    saisi_par_nom: 'Ali Fouti',
    statut_compta: 'comptabilise_bloc',
  },
];

const CAT_LABEL: Record<CategorieDepenseEspeces, string> = {
  pourboire: 'Pourboire',
  transport_local: 'Transport local',
  petite_fourniture: 'Petite fourniture',
  restauration_atelier: 'Restauration atelier',
  cafe_ouvriers: 'Café ouvriers',
  depannage: 'Dépannage',
  divers: 'Divers',
};

const MODE_LABEL: Record<ModeDepense, string> = {
  petite_caisse: 'Petite caisse',
  perso_rembourse: 'Perso remboursé',
};

const STATUT_LABEL: Record<StatutComptaDepense, { label: string; tone: string }> = {
  non_comptabilise: { label: 'Non compt.', tone: 'bg-gray-100 text-gray-700' },
  comptabilise_bloc: {
    label: 'Bloc comptabilisé',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  comptabilise_individuel: {
    label: 'Individuel',
    tone: 'bg-[#EEF4F0] text-[#4A6C5B]',
  },
};

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.depenses)) return d.depenses;
  return fallback;
};

const isSameMonth = (iso1: string, ref = new Date()) => {
  const d = new Date(iso1);
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
  );
};

const DepensesEspeces: React.FC = () => {
  const [depenses, setDepenses] = useState<DepenseEspeces[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<
    CategorieDepenseEspeces | 'all'
  >('all');
  const [statutFilter, setStatutFilter] = useState<
    StatutComptaDepense | 'all'
  >('all');
  const [selection, setSelection] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        depensesEspecesService.getDepenses(),
      ]);
      if (cancelled) return;
      setDepenses(pickArray<DepenseEspeces>(res, MOCK_DEPENSES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalMois = useMemo(
    () =>
      depenses
        .filter((d) => isSameMonth(d.date_depense))
        .reduce((s, d) => s + Number(d.montant || 0), 0),
    [depenses],
  );

  const compteurMois = useMemo(
    () => depenses.filter((d) => isSameMonth(d.date_depense)).length,
    [depenses],
  );

  const kpis = useMemo(() => {
    const nonCompt = depenses.filter(
      (d) => d.statut_compta === 'non_comptabilise',
    ).length;
    const audessus100 = depenses.filter((d) => d.montant >= 100).length;
    return {
      total: depenses.length,
      nonCompt,
      audessus100,
      totalMois,
    };
  }, [depenses, totalMois]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return depenses.filter((d) => {
      if (catFilter !== 'all' && d.categorie !== catFilter) return false;
      if (statutFilter !== 'all' && d.statut_compta !== statutFilter) return false;
      if (
        q &&
        !`${d.libelle} ${d.saisi_par_nom ?? ''}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [depenses, search, catFilter, statutFilter]);

  const toggleSelect = (id: number) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleComptabiliserBloc = async () => {
    const ids = Array.from(selection);
    if (ids.length === 0) {
      alert('Sélectionne au moins une ligne à comptabiliser en bloc.');
      return;
    }
    try {
      await depensesEspecesService.comptabiliserBloc(ids);
    } catch {
      /* fallback */
    }
    setDepenses((prev) =>
      prev.map((d) =>
        ids.includes(d.id_depense)
          ? { ...d, statut_compta: 'comptabilise_bloc' }
          : d,
      ),
    );
    setSelection(new Set());
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <div className="ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Coins className="w-8 h-8 text-[#C8663D]" />
                Dépenses courantes espèces
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Petite caisse — hors circuit fiscal · §9.9 · Alerte ≥ 100 DT / bloc obligatoire ≥ 500 DT
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter dépense
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="lg:col-span-1">
              <MontantMoisTotal
                total={totalMois}
                seuilAlerte={SEUIL_FACTURE_DT}
                seuilBloc={SEUIL_BLOC_OBLIGATOIRE_DT}
                compteur={compteurMois}
              />
            </div>
            <KpiCard
              label="Total dépenses"
              value={kpis.total}
              icon={<Coins className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="Non comptabilisées"
              value={kpis.nonCompt}
              icon={<Layers className="w-5 h-5" />}
              color="warning"
            />
            <KpiCard
              label="≥ 100 DT (facture souhaitée)"
              value={kpis.audessus100}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={kpis.audessus100 > 0 ? 'terracotta' : 'sage'}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher libellé, saisi par…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={catFilter}
                  onChange={(e) =>
                    setCatFilter(
                      e.target.value as CategorieDepenseEspeces | 'all',
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  {Object.entries(CAT_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <select
                  value={statutFilter}
                  onChange={(e) =>
                    setStatutFilter(
                      e.target.value as StatutComptaDepense | 'all',
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="non_comptabilise">Non comptabilisé</option>
                  <option value="comptabilise_bloc">Comptabilisé en bloc</option>
                  <option value="comptabilise_individuel">Individuel</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleComptabiliserBloc}
                disabled={selection.size === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-[#7A8C6A] hover:bg-[#6B7C5B] text-white px-4 py-2 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ListChecks className="w-4 h-4" />
                Comptabiliser en bloc ({selection.size})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-4 py-3"></th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Libellé</th>
                    <th className="text-left px-4 py-3 font-semibold">Catégorie</th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Montant DT
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Mode</th>
                    <th className="text-left px-4 py-3 font-semibold">Saisi par</th>
                    <th className="text-left px-4 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const st = STATUT_LABEL[d.statut_compta];
                    const alerte = d.montant >= 100;
                    return (
                      <tr
                        key={d.id_depense}
                        className={`border-b border-gray-100 hover:bg-[#FBF8F3]/60 ${
                          selection.has(d.id_depense) ? 'bg-[#FBF3E0]/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            disabled={d.statut_compta !== 'non_comptabilise'}
                            checked={selection.has(d.id_depense)}
                            onChange={() => toggleSelect(d.id_depense)}
                            className="accent-[#C8663D]"
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(d.date_depense).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {d.libelle}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF0F5] text-[#4A5D75]">
                            {CAT_LABEL[d.categorie]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              alerte
                                ? 'font-bold text-[#8A6412]'
                                : 'font-semibold text-gray-800'
                            }
                          >
                            {d.montant.toLocaleString('fr-FR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          {alerte && (
                            <div className="text-[10px] text-[#8A6412] mt-0.5 flex items-center justify-end gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Facture souhaitée
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {MODE_LABEL[d.mode]}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {d.saisi_par_nom || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.tone}`}
                          >
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        Aucune dépense pour ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepensesEspeces;
