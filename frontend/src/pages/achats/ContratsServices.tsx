import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSignature,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import EcheanceCard from '../../components/achats/EcheanceCard';
import {
  contratsServicesService,
  ContratService,
  CategorieContratService,
  StatutContratService,
} from '../../services/achatsApi';

const MOCK_CONTRATS: ContratService[] = [
  {
    id_contrat_service: 1,
    numero_contrat: 'CTR-DST-2024',
    libelle: 'Maintenance annuelle métiers Dornier',
    id_fournisseur: 3,
    fournisseur_nom: 'Dornier Service Tunis',
    categorie: 'maintenance',
    date_debut: '2024-01-15',
    date_fin: new Date(Date.now() + 86400_000 * 25).toISOString(),
    montant_annuel_ht: 42000,
    montant_mensuel_ht: 3500,
    periodicite_facturation: 'trimestrielle',
    renouvellement_auto: false,
    date_prochaine_facturation_prevue: new Date(
      Date.now() + 86400_000 * 40,
    ).toISOString(),
    statut: 'a_renouveler',
  },
  {
    id_contrat_service: 2,
    numero_contrat: 'ONE-2023-4587',
    libelle: 'Fourniture électricité MT — atelier tissage',
    id_fournisseur: 5,
    fournisseur_nom: 'ONE Électricité',
    categorie: 'electricite',
    date_debut: '2023-06-01',
    montant_annuel_ht: 148000,
    montant_mensuel_ht: 12333,
    periodicite_facturation: 'mensuelle',
    renouvellement_auto: true,
    date_prochaine_facturation_prevue: new Date(
      Date.now() + 86400_000 * 12,
    ).toISOString(),
    statut: 'actif',
  },
  {
    id_contrat_service: 3,
    numero_contrat: 'SONEDE-9877',
    libelle: 'Abonnement eau industrielle',
    id_fournisseur: 6,
    fournisseur_nom: 'SONEDE',
    categorie: 'eau',
    date_debut: '2022-01-01',
    montant_annuel_ht: 8400,
    montant_mensuel_ht: 700,
    periodicite_facturation: 'trimestrielle',
    renouvellement_auto: true,
    date_prochaine_facturation_prevue: new Date(
      Date.now() + 86400_000 * 45,
    ).toISOString(),
    statut: 'actif',
  },
  {
    id_contrat_service: 4,
    numero_contrat: 'OOR-B2B-1189',
    libelle: 'Fibre pro + téléphonie 4 postes',
    id_fournisseur: 7,
    fournisseur_nom: 'Ooredoo Business',
    categorie: 'internet',
    date_debut: '2025-03-01',
    date_fin: '2027-02-28',
    montant_annuel_ht: 4560,
    montant_mensuel_ht: 380,
    periodicite_facturation: 'mensuelle',
    renouvellement_auto: true,
    date_prochaine_facturation_prevue: new Date(
      Date.now() + 86400_000 * 5,
    ).toISOString(),
    statut: 'actif',
  },
  {
    id_contrat_service: 5,
    numero_contrat: 'ASS-STAR-2026',
    libelle: 'Assurance multirisques atelier + stock',
    id_fournisseur: 8,
    fournisseur_nom: 'STAR Assurances',
    categorie: 'assurance',
    date_debut: '2026-01-01',
    date_fin: '2026-12-31',
    montant_annuel_ht: 18500,
    montant_mensuel_ht: 1541.67,
    periodicite_facturation: 'annuelle',
    renouvellement_auto: false,
    date_prochaine_facturation_prevue: new Date(
      Date.now() + 86400_000 * 90,
    ).toISOString(),
    statut: 'actif',
  },
  {
    id_contrat_service: 6,
    numero_contrat: 'CAB-BAKKAR',
    libelle: 'Honoraires expert-comptable',
    id_fournisseur: 9,
    fournisseur_nom: 'Cabinet Bakkar',
    categorie: 'honoraires',
    date_debut: '2024-01-01',
    montant_annuel_ht: 12000,
    montant_mensuel_ht: 1000,
    periodicite_facturation: 'mensuelle',
    renouvellement_auto: true,
    date_prochaine_facturation_prevue: new Date(
      Date.now() + 86400_000 * 8,
    ).toISOString(),
    statut: 'actif',
  },
];

const CAT_LABEL: Record<CategorieContratService, string> = {
  loyer: 'Loyer',
  maintenance: 'Maintenance',
  telecoms: 'Télécoms',
  honoraires: 'Honoraires',
  assurance: 'Assurance',
  internet: 'Internet',
  electricite: 'Électricité',
  eau: 'Eau',
  autre: 'Autre',
};

const STATUT_TONE: Record<
  StatutContratService,
  { label: string; tone: string }
> = {
  actif: { label: 'Actif', tone: 'bg-emerald-50 text-emerald-700' },
  a_renouveler: {
    label: 'À renouveler',
    tone: 'bg-[#FBF3E0] text-[#8A6412]',
  },
  resilie: { label: 'Résilié', tone: 'bg-gray-100 text-gray-500' },
};

const daysUntil = (iso?: string): number => {
  if (!iso) return Infinity;
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return Infinity;
  return Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24));
};

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.contrats)) return d.contrats;
  return fallback;
};

const ContratsServices: React.FC = () => {
  const [contrats, setContrats] = useState<ContratService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CategorieContratService | 'all'>(
    'all',
  );
  const [statutFilter, setStatutFilter] = useState<
    StatutContratService | 'all'
  >('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        contratsServicesService.getContrats(),
      ]);
      if (cancelled) return;
      setContrats(pickArray<ContratService>(res, MOCK_CONTRATS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const echeancesProches = useMemo(
    () =>
      contrats
        .filter((c) => c.statut === 'actif' || c.statut === 'a_renouveler')
        .filter((c) => c.date_fin && daysUntil(c.date_fin) <= 60)
        .sort(
          (a, b) => daysUntil(a.date_fin) - daysUntil(b.date_fin),
        ),
    [contrats],
  );

  const kpis = useMemo(() => {
    const actifs = contrats.filter((c) => c.statut === 'actif').length;
    const totalAnnuel = contrats
      .filter((c) => c.statut !== 'resilie')
      .reduce((s, c) => s + Number(c.montant_annuel_ht || 0), 0);
    const totalMensuel = totalAnnuel / 12;
    const aRenouveler = contrats.filter(
      (c) => c.statut === 'a_renouveler',
    ).length;
    return {
      total: contrats.length,
      actifs,
      totalMensuel,
      aRenouveler,
    };
  }, [contrats]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contrats.filter((c) => {
      if (catFilter !== 'all' && c.categorie !== catFilter) return false;
      if (statutFilter !== 'all' && c.statut !== statutFilter) return false;
      if (
        q &&
        !`${c.libelle} ${c.fournisseur_nom ?? ''} ${c.numero_contrat ?? ''}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [contrats, search, catFilter, statutFilter]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileSignature className="w-8 h-8 text-[#C8663D]" />
                Contrats & services récurrents
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Loyer, maintenance, télécoms, assurance, honoraires · §9.8
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau contrat
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Contrats total"
              value={kpis.total}
              icon={<FileSignature className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="Actifs"
              value={kpis.actifs}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="sage"
            />
            <KpiCard
              label="Charge mensuelle HT"
              value={kpis.totalMensuel.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              icon={<RefreshCw className="w-5 h-5" />}
              color="terracotta"
              subtitle={`≈ ${(kpis.totalMensuel * 12).toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })} DT/an`}
            />
            <KpiCard
              label="À renouveler"
              value={kpis.aRenouveler}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={kpis.aRenouveler > 0 ? 'warning' : 'sage'}
            />
          </div>

          {echeancesProches.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-[#C89B3C]" />
                Échéances de renouvellement dans 30–60 jours
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {echeancesProches.slice(0, 6).map((c) => (
                  <EcheanceCard
                    key={c.id_contrat_service}
                    titre={c.libelle}
                    soustitre={c.fournisseur_nom}
                    echeance={c.date_fin as string}
                    montant={c.montant_annuel_ht}
                    devise="DT/an"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher contrat, fournisseur…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={catFilter}
                  onChange={(e) =>
                    setCatFilter(e.target.value as CategorieContratService | 'all')
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
                    setStatutFilter(e.target.value as StatutContratService | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="actif">Actif</option>
                  <option value="a_renouveler">À renouveler</option>
                  <option value="resilie">Résilié</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Contrat</th>
                    <th className="text-left px-4 py-3 font-semibold">Fournisseur</th>
                    <th className="text-left px-4 py-3 font-semibold">Catégorie</th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Mensuel HT
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">
                      Annuel HT
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Périodicité
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Échéance</th>
                    <th className="text-left px-4 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const st = STATUT_TONE[c.statut];
                    const jours = daysUntil(c.date_fin);
                    const alerte = jours <= 30 && jours >= 0;
                    return (
                      <tr
                        key={c.id_contrat_service}
                        className="border-b border-gray-100 hover:bg-[#FBF8F3]/60 group"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {c.libelle}
                          </div>
                          <div className="font-mono text-[10px] text-gray-500">
                            {c.numero_contrat}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {c.fournisseur_nom}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF0F5] text-[#4A5D75]">
                            {CAT_LABEL[c.categorie]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          {(c.montant_mensuel_ht ?? c.montant_annuel_ht / 12)
                            .toLocaleString('fr-FR', {
                              maximumFractionDigits: 2,
                            })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {c.montant_annuel_ht.toLocaleString('fr-FR', {
                            maximumFractionDigits: 0,
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">
                          {c.periodicite_facturation.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3">
                          {c.date_fin ? (
                            <span
                              className={
                                alerte
                                  ? 'text-[#8A6412] font-semibold'
                                  : 'text-gray-700'
                              }
                            >
                              {new Date(c.date_fin).toLocaleDateString('fr-FR')}
                              {alerte && (
                                <span className="ml-1 text-[10px]">
                                  ({jours}j)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">Tacite</span>
                          )}
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
                        Aucun contrat pour ces filtres.
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

export default ContratsServices;
