import React, { useState, useEffect, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  CreditCard,
  GitMerge,
  Clock,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  facturesFournisseurService,
  FactureFournisseur,
  StatutFactureFournisseur,
} from '../../services/achatsApi';

const MOCK_FACTURES: FactureFournisseur[] = [
  {
    id_facture_fournisseur: 501,
    numero_ff_interne: 'FF-2026090012',
    numero_facture_fournisseur: 'SF-24578',
    id_fournisseur: 1,
    fournisseur_nom: 'SOTUFIL',
    bc_lies: [42],
    bc_numeros: ['BC-202609042'],
    date_facture: new Date(Date.now() - 86400_000 * 4).toISOString(),
    date_reception_facture: new Date(Date.now() - 86400_000 * 2).toISOString(),
    date_echeance: new Date(Date.now() + 86400_000 * 26).toISOString(),
    montant_ht: 2950,
    montant_tva: 560.5,
    montant_ttc: 3510.5,
    devise: 'TND',
    statut: 'en_attente_paiement',
  },
  {
    id_facture_fournisseur: 502,
    numero_ff_interne: 'FF-2026090013',
    numero_facture_fournisseur: 'DST-2609-01',
    id_fournisseur: 3,
    fournisseur_nom: 'Dornier Service Tunis',
    bc_lies: [44],
    bc_numeros: ['BC-202609044'],
    date_facture: new Date(Date.now() - 86400_000 * 1).toISOString(),
    date_reception_facture: new Date(Date.now() - 3600_000 * 6).toISOString(),
    date_echeance: new Date(Date.now() + 86400_000 * 29).toISOString(),
    montant_ht: 1810,
    montant_tva: 343.9,
    montant_ttc: 2153.9,
    devise: 'TND',
    statut: 'en_litige',
    notes: 'Livraison partielle — 1/2 navettes seulement',
  },
  {
    id_facture_fournisseur: 503,
    numero_ff_interne: 'FF-2026080108',
    numero_facture_fournisseur: 'MC-2258',
    id_fournisseur: 2,
    fournisseur_nom: 'MICOFIL',
    bc_lies: [46],
    bc_numeros: ['BC-202608040'],
    date_facture: new Date(Date.now() - 86400_000 * 32).toISOString(),
    date_reception_facture: new Date(Date.now() - 86400_000 * 30).toISOString(),
    date_echeance: new Date(Date.now() - 86400_000 * 2).toISOString(),
    montant_ht: 4350,
    montant_tva: 826.5,
    montant_ttc: 5176.5,
    devise: 'TND',
    statut: 'payee',
  },
  {
    id_facture_fournisseur: 504,
    numero_ff_interne: 'FF-2026090014',
    numero_facture_fournisseur: 'ONE-2026-09',
    id_fournisseur: 5,
    fournisseur_nom: 'ONE Électricité',
    date_facture: new Date(Date.now() - 86400_000 * 5).toISOString(),
    date_reception_facture: new Date(Date.now() - 86400_000 * 4).toISOString(),
    date_echeance: new Date(Date.now() + 86400_000 * 10).toISOString(),
    montant_ht: 1245.32,
    montant_tva: 236.61,
    montant_ttc: 1481.93,
    devise: 'TND',
    statut: 'payee_partiel',
  },
  {
    id_facture_fournisseur: 505,
    numero_ff_interne: 'FF-2026090015',
    numero_facture_fournisseur: 'IMX-14587',
    id_fournisseur: 4,
    fournisseur_nom: 'IMEXTUN',
    bc_lies: [45],
    bc_numeros: ['BC-202609045'],
    date_facture: new Date(Date.now() - 86400_000 * 3).toISOString(),
    date_reception_facture: new Date(Date.now() - 86400_000 * 1).toISOString(),
    date_echeance: new Date(Date.now() + 86400_000 * 45).toISOString(),
    montant_ht: 850,
    montant_tva: 161.5,
    montant_ttc: 1011.5,
    devise: 'TND',
    statut: 'en_attente_paiement',
  },
];

const STATUT_TONE: Record<
  StatutFactureFournisseur,
  { label: string; tone: string }
> = {
  en_attente_paiement: {
    label: 'À payer',
    tone: 'bg-[#FBF3E0] text-[#8A6412]',
  },
  payee_partiel: {
    label: 'Partiellement payée',
    tone: 'bg-[#EDF0F5] text-[#4A5D75]',
  },
  payee: { label: 'Soldée', tone: 'bg-emerald-50 text-emerald-700' },
  en_litige: { label: 'En litige', tone: 'bg-red-50 text-red-700' },
  annulee: { label: 'Annulée', tone: 'bg-gray-100 text-gray-500' },
};

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.factures)) return d.factures;
  return fallback;
};

const FacturesFournisseur: React.FC = () => {
  const [factures, setFactures] = useState<FactureFournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<
    StatutFactureFournisseur | 'all'
  >('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        facturesFournisseurService.getFactures(),
      ]);
      if (cancelled) return;
      setFactures(pickArray<FactureFournisseur>(res, MOCK_FACTURES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const now = Date.now();
    const enAttente = factures.filter(
      (f) => f.statut === 'en_attente_paiement' || f.statut === 'payee_partiel',
    );
    const montantAPayer = enAttente.reduce(
      (s, f) => s + Number(f.montant_ttc || 0),
      0,
    );
    const echues = enAttente.filter(
      (f) => new Date(f.date_echeance).getTime() < now,
    ).length;
    const litiges = factures.filter((f) => f.statut === 'en_litige').length;
    return {
      total: factures.length,
      aPayer: enAttente.length,
      montantAPayer,
      echues,
      litiges,
    };
  }, [factures]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return factures.filter((f) => {
      if (statutFilter !== 'all' && f.statut !== statutFilter) return false;
      if (
        q &&
        !`${f.numero_ff_interne} ${f.numero_facture_fournisseur} ${
          f.fournisseur_nom ?? ''
        } ${(f.bc_numeros || []).join(' ')}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [factures, search, statutFilter]);

  const handleComptabiliser = async (f: FactureFournisseur) => {
    try {
      await facturesFournisseurService.comptabiliser(f.id_facture_fournisseur);
    } catch {
      /* noop */
    }
    alert(`Facture ${f.numero_ff_interne} envoyée pour comptabilisation.`);
  };
  const handlePayer = async (f: FactureFournisseur) => {
    try {
      await facturesFournisseurService.payer(f.id_facture_fournisseur, {
        montant: f.montant_ttc,
      });
    } catch {
      /* noop */
    }
    setFactures((prev) =>
      prev.map((x) =>
        x.id_facture_fournisseur === f.id_facture_fournisseur
          ? { ...x, statut: 'payee' }
          : x,
      ),
    );
  };

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
                <Receipt className="w-8 h-8 text-[#C8663D]" />
                Factures fournisseur
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Factures reçues, rapprochement 3-way et règlement · §9.5
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Enregistrer facture
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="À payer"
              value={kpis.aPayer}
              icon={<Clock className="w-5 h-5" />}
              color="warning"
              subtitle={`${kpis.echues} échue(s)`}
            />
            <KpiCard
              label="Montant TTC dû"
              value={kpis.montantAPayer.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              icon={<CreditCard className="w-5 h-5" />}
              color="terracotta"
            />
            <KpiCard
              label="En litige"
              value={kpis.litiges}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={kpis.litiges > 0 ? 'terracotta' : 'sage'}
            />
            <KpiCard
              label="Factures total"
              value={kpis.total}
              icon={<Receipt className="w-5 h-5" />}
              color="indigo"
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
                  placeholder="Rechercher n° FF, facture, fournisseur, BC…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statutFilter}
                  onChange={(e) =>
                    setStatutFilter(
                      e.target.value as StatutFactureFournisseur | 'all',
                    )
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="en_attente_paiement">À payer</option>
                  <option value="payee_partiel">Partiellement payée</option>
                  <option value="payee">Soldée</option>
                  <option value="en_litige">Litige</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">N° FF</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      N° fournisseur
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Fournisseur</th>
                    <th className="text-left px-4 py-3 font-semibold">BC lié(s)</th>
                    <th className="text-right px-4 py-3 font-semibold">HT</th>
                    <th className="text-right px-4 py-3 font-semibold">TVA</th>
                    <th className="text-right px-4 py-3 font-semibold">TTC</th>
                    <th className="text-left px-4 py-3 font-semibold">Échéance</th>
                    <th className="text-left px-4 py-3 font-semibold">Statut</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => {
                    const st = STATUT_TONE[f.statut];
                    const echeance = new Date(f.date_echeance).getTime();
                    const enRetard =
                      echeance < Date.now() &&
                      (f.statut === 'en_attente_paiement' ||
                        f.statut === 'payee_partiel');
                    return (
                      <tr
                        key={f.id_facture_fournisseur}
                        className="border-b border-gray-100 hover:bg-[#FBF8F3]/60 group"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">
                          {f.numero_ff_interne}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {f.numero_facture_fournisseur}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {f.fournisseur_nom}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {(f.bc_numeros || []).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800">
                          {f.montant_ht.toLocaleString('fr-FR', {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {f.montant_tva.toLocaleString('fr-FR', {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#C8663D]">
                          {f.montant_ttc.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              enRetard
                                ? 'text-red-700 font-semibold'
                                : 'text-gray-700'
                            }
                          >
                            {new Date(f.date_echeance).toLocaleDateString('fr-FR')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.tone}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleComptabiliser(f)}
                              title="Rapprocher / comptabiliser"
                              className="p-1.5 rounded hover:bg-[#EDF0F5] text-[#4A5D75]"
                            >
                              <GitMerge className="w-4 h-4" />
                            </button>
                            {(f.statut === 'en_attente_paiement' ||
                              f.statut === 'payee_partiel') && (
                              <button
                                type="button"
                                onClick={() => handlePayer(f)}
                                title="Payer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#7A8C6A] hover:bg-[#6B7C5B] text-white text-xs font-semibold"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Payer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                        Aucune facture fournisseur pour ces filtres.
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

export default FacturesFournisseur;
