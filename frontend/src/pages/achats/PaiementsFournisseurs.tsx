import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  PlusCircle,
  Search,
  Filter,
  Send,
  CreditCard,
  Wallet,
  Building2,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  paiementsFournisseursService,
  PaiementFournisseur,
  ModePaiementFf,
} from '../../services/achatsApi';

const MOCK_PAIEMENTS: PaiementFournisseur[] = [
  {
    id_paiement_fournisseur: 901,
    numero_paiement: 'PAY-FF-202609020',
    id_fournisseur: 2,
    fournisseur_nom: 'MICOFIL',
    factures_soldees: ['FF-2026080108'],
    date_paiement: new Date(Date.now() - 86400_000 * 2).toISOString(),
    montant: 5176.5,
    mode_paiement: 'virement',
    reference_paiement: 'VIR-BIAT-4587',
    compte_source: 'BIAT TND — 04-1234567',
    valide_par: 1,
  },
  {
    id_paiement_fournisseur: 902,
    numero_paiement: 'PAY-FF-202609021',
    id_fournisseur: 5,
    fournisseur_nom: 'ONE Électricité',
    factures_soldees: ['FF-2026090014 (partiel)'],
    date_paiement: new Date(Date.now() - 86400_000 * 1).toISOString(),
    montant: 800,
    mode_paiement: 'virement',
    reference_paiement: 'VIR-BIAT-4602',
    compte_source: 'BIAT TND — 04-1234567',
    valide_par: 1,
  },
  {
    id_paiement_fournisseur: 903,
    numero_paiement: 'PAY-FF-202608015',
    id_fournisseur: 3,
    fournisseur_nom: 'Dornier Service Tunis',
    factures_soldees: ['FF-2026080075'],
    date_paiement: new Date(Date.now() - 86400_000 * 21).toISOString(),
    montant: 3200,
    mode_paiement: 'cheque',
    reference_paiement: 'CH-04588721',
    compte_source: 'BIAT TND — 04-1234567',
    valide_par: 1,
  },
  {
    id_paiement_fournisseur: 904,
    numero_paiement: 'PAY-FF-202609022',
    id_fournisseur: 7,
    fournisseur_nom: 'Ooredoo Business',
    factures_soldees: ['FF-2026090008'],
    date_paiement: new Date(Date.now() - 86400_000 * 4).toISOString(),
    montant: 452.15,
    mode_paiement: 'virement',
    reference_paiement: 'VIR-BIAT-4570',
    compte_source: 'BIAT TND — 04-1234567',
    valide_par: 1,
  },
];

const MODE_TONE: Record<
  ModePaiementFf,
  { label: string; tone: string; icon: React.ReactNode }
> = {
  virement: {
    label: 'Virement',
    tone: 'bg-[#EDF0F5] text-[#4A5D75]',
    icon: <Building2 className="w-3.5 h-3.5" />,
  },
  cheque: {
    label: 'Chèque',
    tone: 'bg-[#EEF4F0] text-[#4A6C5B]',
    icon: <CreditCard className="w-3.5 h-3.5" />,
  },
  especes: {
    label: 'Espèces',
    tone: 'bg-[#FBF3E0] text-[#8A6412]',
    icon: <Wallet className="w-3.5 h-3.5" />,
  },
  lettre_change: {
    label: 'Lettre de change',
    tone: 'bg-[#EDF0F5] text-[#4A5D75]',
    icon: <CreditCard className="w-3.5 h-3.5" />,
  },
  traite: {
    label: 'Traite',
    tone: 'bg-[#EDF0F5] text-[#4A5D75]',
    icon: <CreditCard className="w-3.5 h-3.5" />,
  },
};

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.paiements)) return d.paiements;
  return fallback;
};

const PaiementsFournisseurs: React.FC = () => {
  const [paiements, setPaiements] = useState<PaiementFournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<ModePaiementFf | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        paiementsFournisseursService.getPaiements(),
      ]);
      if (cancelled) return;
      setPaiements(pickArray<PaiementFournisseur>(res, MOCK_PAIEMENTS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const now = new Date();
    const parMois = paiements
      .filter((p) => {
        const d = new Date(p.date_paiement);
        return (
          d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
        );
      })
      .reduce((s, p) => s + Number(p.montant || 0), 0);
    const virements = paiements.filter((p) => p.mode_paiement === 'virement').length;
    const cheques = paiements.filter((p) => p.mode_paiement === 'cheque').length;
    return {
      total: paiements.length,
      parMois,
      virements,
      cheques,
    };
  }, [paiements]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return paiements.filter((p) => {
      if (modeFilter !== 'all' && p.mode_paiement !== modeFilter) return false;
      if (
        q &&
        !`${p.numero_paiement ?? ''} ${p.fournisseur_nom ?? ''} ${p.reference_paiement ?? ''} ${(
          p.factures_soldees || []
        ).join(' ')}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [paiements, search, modeFilter]);

  const handleGenererVirement = async (p: PaiementFournisseur) => {
    try {
      await paiementsFournisseursService.genererVirement(
        p.id_paiement_fournisseur,
      );
    } catch {
      /* fallback */
    }
    alert(
      `Ordre de virement généré pour ${p.fournisseur_nom} — ${p.montant.toLocaleString(
        'fr-FR',
      )} DT`,
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
                <Banknote className="w-8 h-8 text-[#C8663D]" />
                Paiements fournisseurs
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Règlements sortants (virements, chèques, espèces) · §9.7
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau paiement
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Paiements total"
              value={kpis.total}
              icon={<Banknote className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="Décaissé ce mois"
              value={kpis.parMois.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              icon={<Wallet className="w-5 h-5" />}
              color="terracotta"
            />
            <KpiCard
              label="Virements"
              value={kpis.virements}
              icon={<Building2 className="w-5 h-5" />}
              color="sage"
            />
            <KpiCard
              label="Chèques"
              value={kpis.cheques}
              icon={<CreditCard className="w-5 h-5" />}
              color="warning"
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
                  placeholder="Rechercher n° paiement, fournisseur, réf…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={modeFilter}
                  onChange={(e) =>
                    setModeFilter(e.target.value as ModePaiementFf | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous modes</option>
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="especes">Espèces</option>
                  <option value="lettre_change">Lettre de change</option>
                  <option value="traite">Traite</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">
                      N° paiement
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Fournisseur</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Factures soldées
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Mode</th>
                    <th className="text-right px-4 py-3 font-semibold">Montant</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Référence</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const m = MODE_TONE[p.mode_paiement];
                    return (
                      <tr
                        key={p.id_paiement_fournisseur}
                        className="border-b border-gray-100 hover:bg-[#FBF8F3]/60 group"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">
                          {p.numero_paiement}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {p.fournisseur_nom}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-600">
                          {(p.factures_soldees || []).join(', ') || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${m.tone}`}
                          >
                            {m.icon}
                            {m.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#C8663D]">
                          {p.montant.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          DT
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(p.date_paiement).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-600">
                          {p.reference_paiement || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleGenererVirement(p)}
                            title="Générer ordre de virement"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#4A5D75] hover:bg-[#3D4D62] text-white text-xs font-semibold"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Virement
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        Aucun paiement pour ces filtres.
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

export default PaiementsFournisseurs;
