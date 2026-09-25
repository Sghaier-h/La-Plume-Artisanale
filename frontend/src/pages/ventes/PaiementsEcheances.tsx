import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  Landmark,
  X,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import AgeCreanceBadge from '../../components/ventes/AgeCreanceBadge';
import {
  paiementsService,
  PaiementEcheance,
  StatutPaiement,
  TrancheAge,
  ModePaiement,
} from '../../services/ventesComplementsApi';

const isoDaysFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const computeTranche = (jours: number): TrancheAge => {
  if (jours <= 30) return '0-30';
  if (jours <= 60) return '30-60';
  if (jours <= 90) return '60-90';
  return '90+';
};

const MOCK_PAIEMENTS: PaiementEcheance[] = [
  {
    id_paiement: 1,
    id_facture: 1001,
    numero_facture: 'FAC-2026-1001',
    id_client: 12,
    nom_client: 'Hammam Boutique Paris',
    date_facture: isoDaysFromToday(-15),
    date_echeance: isoDaysFromToday(15),
    montant_du_dt: 4850,
    montant_regle_dt: 0,
    solde_dt: 4850,
    mode_paiement_attendu: 'virement',
    statut: 'a_echoir',
    jours_retard: -15,
    tranche_age: '0-30',
  },
  {
    id_paiement: 2,
    id_facture: 1002,
    numero_facture: 'FAC-2026-1002',
    id_client: 13,
    nom_client: 'Hotel Marina Djerba',
    date_facture: isoDaysFromToday(-35),
    date_echeance: isoDaysFromToday(-5),
    montant_du_dt: 8200,
    montant_regle_dt: 2000,
    solde_dt: 6200,
    mode_paiement_attendu: 'traite',
    statut: 'du',
    jours_retard: 5,
    tranche_age: '0-30',
  },
  {
    id_paiement: 3,
    id_facture: 1003,
    numero_facture: 'FAC-2026-1003',
    id_client: 14,
    nom_client: 'Boutique El Menzah SARL',
    date_facture: isoDaysFromToday(-50),
    date_echeance: isoDaysFromToday(-35),
    montant_du_dt: 1240,
    montant_regle_dt: 0,
    solde_dt: 1240,
    mode_paiement_attendu: 'cheque',
    statut: 'en_retard',
    jours_retard: 35,
    tranche_age: '30-60',
  },
  {
    id_paiement: 4,
    id_facture: 1004,
    numero_facture: 'FAC-2025-0998',
    id_client: 15,
    nom_client: 'Riad Souk Marrakech',
    date_facture: isoDaysFromToday(-95),
    date_echeance: isoDaysFromToday(-80),
    montant_du_dt: 3400,
    montant_regle_dt: 0,
    solde_dt: 3400,
    mode_paiement_attendu: 'virement',
    statut: 'en_retard',
    jours_retard: 80,
    tranche_age: '60-90',
  },
  {
    id_paiement: 5,
    id_facture: 1005,
    numero_facture: 'FAC-2025-0972',
    id_client: 16,
    nom_client: 'Hammam SPA Nice',
    date_facture: isoDaysFromToday(-160),
    date_echeance: isoDaysFromToday(-130),
    montant_du_dt: 5600,
    montant_regle_dt: 0,
    solde_dt: 5600,
    mode_paiement_attendu: 'virement',
    statut: 'en_retard',
    jours_retard: 130,
    tranche_age: '90+',
  },
  {
    id_paiement: 6,
    id_facture: 1006,
    numero_facture: 'FAC-2026-1006',
    id_client: 17,
    nom_client: 'Concept Store Gammarth',
    date_facture: isoDaysFromToday(-40),
    date_echeance: isoDaysFromToday(-10),
    montant_du_dt: 780,
    montant_regle_dt: 780,
    solde_dt: 0,
    mode_paiement_attendu: 'especes',
    statut: 'solde',
    jours_retard: 0,
    tranche_age: '0-30',
    date_reglement: isoDaysFromToday(-8),
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const PaiementsEcheances: React.FC = () => {
  const [paiements, setPaiements] = useState<PaiementEcheance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | StatutPaiement>('tous');
  const [filtreTranche, setFiltreTranche] = useState<'toutes' | TrancheAge>('toutes');
  const [filtreMode, setFiltreMode] = useState<'tous' | ModePaiement>('tous');
  const [reglement, setReglement] = useState<PaiementEcheance | null>(null);
  const [dateReglement, setDateReglement] = useState('');
  const [refReglement, setRefReglement] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([paiementsService.list()]);
      if (cancelled) return;
      setPaiements(pickArray<PaiementEcheance>(res, 'paiements', MOCK_PAIEMENTS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return paiements
      .filter((p) => {
        if (filtreStatut !== 'tous' && p.statut !== filtreStatut) return false;
        if (filtreTranche !== 'toutes' && p.tranche_age !== filtreTranche) return false;
        if (filtreMode !== 'tous' && p.mode_paiement_attendu !== filtreMode) return false;
        if (!s) return true;
        return `${p.numero_facture} ${p.nom_client}`.toLowerCase().includes(s);
      })
      .sort((a, b) => b.jours_retard - a.jours_retard);
  }, [paiements, search, filtreStatut, filtreTranche, filtreMode]);

  const balance = useMemo(() => {
    const b: Record<TrancheAge, number> = { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 };
    paiements.filter((p) => p.statut !== 'solde').forEach((p) => {
      b[p.tranche_age] += p.solde_dt;
    });
    return b;
  }, [paiements]);

  const kpis = useMemo(() => {
    const nonSolde = paiements.filter((p) => p.statut !== 'solde');
    const totalDu = nonSolde.reduce((s, p) => s + p.solde_dt, 0);
    const enRetard = paiements.filter((p) => p.statut === 'en_retard').length;
    const nbEncours = nonSolde.length;
    const dso =
      nonSolde.length > 0
        ? nonSolde.reduce((s, p) => s + Math.max(p.jours_retard, 0), 0) / nonSolde.length
        : 0;
    return { totalDu, enRetard, nbEncours, dso };
  }, [paiements]);

  const marquerRegle = async () => {
    if (!reglement) return;
    await paiementsService
      .marquerRegle(reglement.id_paiement, {
        date_reglement: dateReglement || isoDaysFromToday(0),
        reference: refReglement,
      })
      .catch(() => {});
    setPaiements((prev) =>
      prev.map((p) =>
        p.id_paiement === reglement.id_paiement
          ? { ...p, statut: 'solde' as StatutPaiement, solde_dt: 0, montant_regle_dt: p.montant_du_dt, date_reglement: dateReglement || isoDaysFromToday(0), reference_bancaire: refReglement }
          : p,
      ),
    );
    setReglement(null);
    setDateReglement('');
    setRefReglement('');
  };

  const statutIcon = (s: StatutPaiement) => {
    switch (s) {
      case 'solde':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'du':
        return <Clock className="w-3.5 h-3.5" />;
      case 'en_retard':
        return <AlertTriangle className="w-3.5 h-3.5" />;
      default:
        return <CalendarIcon className="w-3.5 h-3.5" />;
    }
  };

  const statutClass = (s: StatutPaiement) => {
    switch (s) {
      case 'solde':
        return 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]';
      case 'du':
        return 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]';
      case 'en_retard':
        return 'bg-[#FBEBE4] text-[#B84A2F] border-[#B84A2F]';
      case 'a_echoir':
        return 'bg-[#EDF0F5] text-[#3B4E68] border-[#4A5D75]';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            <Wallet className="w-8 h-8 text-[#C8663D]" />
            Paiements & échéances
          </h1>
          <p className="text-sm text-[#6B4E31] mt-1">
            Suivi des paiements clients — balance âgée &middot; §8.10
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Encours total (DT)"
            value={kpis.totalDu.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            icon={<Landmark className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard label="Factures en retard" value={kpis.enRetard} icon={<AlertTriangle className="w-5 h-5" />} color="warning" />
          <KpiCard label="Encours (nb factures)" value={kpis.nbEncours} icon={<Clock className="w-5 h-5" />} color="indigo" />
          <KpiCard label="DSO moyen" value={`${Math.round(kpis.dso)}`} suffix="j" color="sage" subtitle="Délai moyen paiement" />
        </div>

        {/* Balance âgée */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-5 mb-6">
          <h3 className="text-sm font-semibold text-[#6B4E31] mb-3 uppercase tracking-wide">Balance âgée</h3>
          <div className="grid grid-cols-4 gap-3">
            {(Object.keys(balance) as TrancheAge[]).map((k) => (
              <div
                key={k}
                className={`rounded-lg p-3 border-l-4 ${
                  k === '0-30'
                    ? 'bg-[#EEF4F0] border-[#7A8C6A]'
                    : k === '30-60'
                    ? 'bg-[#FBF3E0] border-[#C89B3C]'
                    : k === '60-90'
                    ? 'bg-[#FDF2ED] border-[#C8663D]'
                    : 'bg-[#FBEBE4] border-[#B84A2F]'
                }`}
              >
                <div className="text-xs text-[#6B4E31] mb-1">
                  {k === '0-30' ? '0 - 30 jours' : k === '30-60' ? '30 - 60 j' : k === '60-90' ? '60 - 90 j' : '> 90 jours'}
                </div>
                <div className="text-2xl font-bold font-mono text-[#2F1F12]">
                  {balance[k].toLocaleString('fr-FR', { maximumFractionDigits: 0 })} <span className="text-sm">DT</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (facture, client)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as any)}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="tous">Tous statuts</option>
              <option value="a_echoir">À échoir</option>
              <option value="du">Dû</option>
              <option value="en_retard">En retard</option>
              <option value="solde">Soldé</option>
            </select>
            <select
              value={filtreTranche}
              onChange={(e) => setFiltreTranche(e.target.value as any)}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="toutes">Toutes tranches</option>
              <option value="0-30">0-30 j</option>
              <option value="30-60">30-60 j</option>
              <option value="60-90">60-90 j</option>
              <option value="90+">&gt; 90 j</option>
            </select>
            <select
              value={filtreMode}
              onChange={(e) => setFiltreMode(e.target.value as any)}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="tous">Tous modes</option>
              <option value="virement">Virement</option>
              <option value="cheque">Chèque</option>
              <option value="especes">Espèces</option>
              <option value="traite">Traite</option>
              <option value="lettre_change">Lettre de change</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">Facture</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date facture</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3 text-right">Dû (DT)</th>
                  <th className="px-4 py-3 text-right">Solde (DT)</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Âge</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-[#9B8874]">
                      Aucun paiement
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id_paiement} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                      <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">{p.numero_facture}</td>
                      <td className="px-4 py-3 font-medium">{p.nom_client}</td>
                      <td className="px-4 py-3 text-xs">{p.date_facture}</td>
                      <td className="px-4 py-3 text-xs">{p.date_echeance}</td>
                      <td className="px-4 py-3 font-mono text-right">
                        {p.montant_du_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 font-mono text-right font-bold text-[#B84A2F]">
                        {p.solde_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDF0F5] text-[#3B4E68] border border-[#4A5D75]/30">
                          {p.mode_paiement_attendu}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <AgeCreanceBadge tranche={p.tranche_age} jours={Math.max(p.jours_retard, 0)} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${statutClass(p.statut)}`}
                        >
                          {statutIcon(p.statut)}
                          {p.statut === 'a_echoir' ? 'À échoir' : p.statut === 'en_retard' ? 'En retard' : p.statut === 'du' ? 'Dû' : 'Soldé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.statut !== 'solde' && (
                          <button
                            onClick={() => {
                              setReglement(p);
                              setDateReglement(isoDaysFromToday(0));
                            }}
                            className="px-2.5 py-1 bg-[#7A8C6A] text-white rounded text-xs hover:bg-[#5F7052]"
                          >
                            Régler
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal règlement */}
      {reglement && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setReglement(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                Marquer comme réglé
              </h2>
              <button onClick={() => setReglement(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="bg-[#F5EFE5] rounded p-3">
                <div className="text-xs text-[#9B8874]">Facture</div>
                <div className="font-mono font-semibold">{reglement.numero_facture}</div>
                <div className="text-xs text-[#6B4E31]">{reglement.nom_client}</div>
                <div className="mt-2 font-bold text-lg text-[#B84A2F]">
                  {reglement.solde_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} DT
                </div>
              </div>
              <label className="block">
                <span className="text-xs text-[#6B4E31]">Date de règlement</span>
                <input
                  type="date"
                  value={dateReglement}
                  onChange={(e) => setDateReglement(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block">
                <span className="text-xs text-[#6B4E31]">Référence bancaire / chèque</span>
                <input
                  type="text"
                  value={refReglement}
                  onChange={(e) => setRefReglement(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                  placeholder="Ex : CHQ-2026-001234"
                />
              </label>
            </div>
            <div className="p-4 border-t border-[#EDE3CE] flex justify-end gap-2">
              <button onClick={() => setReglement(null)} className="px-4 py-2 border border-[#DFD3B8] rounded-lg text-sm">
                Annuler
              </button>
              <button
                onClick={marquerRegle}
                className="px-4 py-2 bg-[#7A8C6A] text-white rounded-lg hover:bg-[#5F7052] text-sm font-medium"
              >
                Confirmer règlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaiementsEcheances;
