import React, { useState, useEffect, useMemo } from 'react';
import {
  GitMerge,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import Match3Way from '../../components/achats/Match3Way';
import {
  rapprochementService,
  Match3wayLigne,
} from '../../services/achatsApi';

const MOCK_MATCHES: Match3wayLigne[] = [
  {
    id_ligne: 'M-1',
    id_bc: 42,
    numero_bc: 'BC-202609042',
    fournisseur_nom: 'SOTUFIL',
    id_fournisseur: 1,
    date_bc: new Date(Date.now() - 86400_000 * 6).toISOString(),
    designation: 'Fil coton 20/1 écru — 100 kg',
    qte_bc: 100,
    qte_recue: 100,
    qte_facturee: 100,
    montant_bc: 1850,
    montant_ff: 1850,
    numero_reception: 'REC-202609015',
    numero_ff: 'FF-2026090012',
    statut_bc: 'conforme',
    statut_reception: 'conforme',
    statut_facture: 'conforme',
    ecart_pct: 0,
  },
  {
    id_ligne: 'M-2',
    id_bc: 43,
    numero_bc: 'BC-202609043',
    fournisseur_nom: 'MICOFIL',
    id_fournisseur: 2,
    date_bc: new Date(Date.now() - 86400_000 * 3).toISOString(),
    designation: 'Fil sergé indigo 30/2 — 50 kg',
    qte_bc: 50,
    qte_recue: 30,
    qte_facturee: 50,
    montant_bc: 1420,
    montant_ff: 1420,
    numero_reception: 'REC-202609016',
    numero_ff: 'FF-2026090010',
    statut_bc: 'conforme',
    statut_reception: 'ecart',
    statut_facture: 'ecart',
    ecart_pct: 40,
    justification: 'Reste livrable prévu +7j',
  },
  {
    id_ligne: 'M-3',
    id_bc: 44,
    numero_bc: 'BC-202609044',
    fournisseur_nom: 'Dornier Service Tunis',
    id_fournisseur: 3,
    date_bc: new Date(Date.now() - 86400_000 * 1).toISOString(),
    designation: 'Navette Dornier LWV-C',
    qte_bc: 2,
    qte_recue: 1,
    qte_facturee: 2,
    montant_bc: 1490,
    montant_ff: 1810,
    numero_reception: 'REC-202609017',
    numero_ff: 'FF-2026090013',
    statut_bc: 'conforme',
    statut_reception: 'ecart',
    statut_facture: 'ecart',
    ecart_pct: 21.5,
  },
  {
    id_ligne: 'M-4',
    id_bc: 45,
    numero_bc: 'BC-202609045',
    fournisseur_nom: 'IMEXTUN',
    id_fournisseur: 4,
    date_bc: new Date(Date.now() - 86400_000 * 12).toISOString(),
    designation: 'Lin brut 40/1 — 20 kg',
    qte_bc: 20,
    qte_recue: 0,
    qte_facturee: 20,
    montant_bc: 850,
    montant_ff: 850,
    numero_reception: undefined,
    numero_ff: 'FF-2026090015',
    statut_bc: 'conforme',
    statut_reception: 'manquant',
    statut_facture: 'conforme',
    ecart_pct: 100,
  },
  {
    id_ligne: 'M-5',
    id_bc: 46,
    numero_bc: 'BC-202608040',
    fournisseur_nom: 'SOTUFIL',
    id_fournisseur: 1,
    date_bc: new Date(Date.now() - 86400_000 * 22).toISOString(),
    designation: 'Fil coton bio 24/1 — 200 kg',
    qte_bc: 200,
    qte_recue: 200,
    qte_facturee: 200,
    montant_bc: 4350,
    montant_ff: 4350,
    numero_reception: 'REC-202608045',
    numero_ff: 'FF-2026080108',
    statut_bc: 'conforme',
    statut_reception: 'conforme',
    statut_facture: 'conforme',
    ecart_pct: 0,
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.matches)) return d.matches;
  return fallback;
};

type FiltreEtat = 'all' | 'conforme' | 'ecart' | 'manquant';

const RapprochementBcBlFf: React.FC = () => {
  const [matches, setMatches] = useState<Match3wayLigne[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fournisseurFilter, setFournisseurFilter] = useState<string>('all');
  const [etatFilter, setEtatFilter] = useState<FiltreEtat>('all');
  const [periodeDebut, setPeriodeDebut] = useState<string>('');
  const [periodeFin, setPeriodeFin] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        rapprochementService.getRapprochement(),
      ]);
      if (cancelled) return;
      setMatches(pickArray<Match3wayLigne>(res, MOCK_MATCHES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const globalEtat = (m: Match3wayLigne): 'conforme' | 'ecart' | 'manquant' => {
    if (
      m.statut_bc === 'manquant' ||
      m.statut_reception === 'manquant' ||
      m.statut_facture === 'manquant'
    )
      return 'manquant';
    if (
      m.statut_bc === 'ecart' ||
      m.statut_reception === 'ecart' ||
      m.statut_facture === 'ecart'
    )
      return 'ecart';
    return 'conforme';
  };

  const fournisseurs = useMemo(
    () =>
      Array.from(new Set(matches.map((m) => m.fournisseur_nom))).sort(),
    [matches],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const tsDeb = periodeDebut ? new Date(periodeDebut).getTime() : -Infinity;
    const tsFin = periodeFin
      ? new Date(periodeFin).getTime() + 86400_000
      : Infinity;
    return matches.filter((m) => {
      if (fournisseurFilter !== 'all' && m.fournisseur_nom !== fournisseurFilter)
        return false;
      if (etatFilter !== 'all' && globalEtat(m) !== etatFilter) return false;
      const ts = new Date(m.date_bc).getTime();
      if (ts < tsDeb || ts > tsFin) return false;
      if (
        q &&
        !`${m.numero_bc} ${m.designation} ${m.fournisseur_nom} ${
          m.numero_reception ?? ''
        } ${m.numero_ff ?? ''}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [matches, search, fournisseurFilter, etatFilter, periodeDebut, periodeFin]);

  const kpis = useMemo(() => {
    const conformes = matches.filter((m) => globalEtat(m) === 'conforme').length;
    const ecarts = matches.filter((m) => globalEtat(m) === 'ecart').length;
    const manquants = matches.filter((m) => globalEtat(m) === 'manquant').length;
    return {
      total: matches.length,
      conformes,
      ecarts,
      manquants,
    };
  }, [matches]);

  const handleJustifier = async (m: Match3wayLigne) => {
    const j = window.prompt('Justification de l\'écart :', m.justification ?? '');
    if (!j) return;
    try {
      await rapprochementService.justifierEcart(m.id_ligne, { justification: j });
    } catch {
      /* noop */
    }
    setMatches((prev) =>
      prev.map((x) =>
        x.id_ligne === m.id_ligne ? { ...x, justification: j } : x,
      ),
    );
  };

  const handleValiderMatch = async (m: Match3wayLigne) => {
    try {
      await rapprochementService.validerMatch(m.id_ligne);
    } catch {
      /* noop */
    }
    setMatches((prev) =>
      prev.map((x) =>
        x.id_ligne === m.id_ligne
          ? {
              ...x,
              statut_bc: 'conforme',
              statut_reception: 'conforme',
              statut_facture: 'conforme',
              ecart_pct: 0,
            }
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
                <GitMerge className="w-8 h-8 text-[#C8663D]" />
                Rapprochement BC ↔ Réception ↔ FF
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Contrôle 3-way par ligne BC · §9.6 · Alerte écart ≥ 2 %
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Lignes rapprochées"
              value={kpis.total}
              icon={<GitMerge className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="Conformes"
              value={kpis.conformes}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="sage"
            />
            <KpiCard
              label="Écarts"
              value={kpis.ecarts}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="warning"
            />
            <KpiCard
              label="Manquants"
              value={kpis.manquants}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={kpis.manquants > 0 ? 'terracotta' : 'sage'}
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
                  placeholder="Rechercher BC, article, fournisseur…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={fournisseurFilter}
                  onChange={(e) => setFournisseurFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous fournisseurs</option>
                  {fournisseurs.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <select
                  value={etatFilter}
                  onChange={(e) => setEtatFilter(e.target.value as FiltreEtat)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous états</option>
                  <option value="conforme">Conforme</option>
                  <option value="ecart">Écart</option>
                  <option value="manquant">Manquant</option>
                </select>
                <div className="flex items-center gap-1 border border-gray-300 rounded-lg px-2 py-1.5 bg-white">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="date"
                    value={periodeDebut}
                    onChange={(e) => setPeriodeDebut(e.target.value)}
                    className="text-xs outline-none"
                  />
                  <span className="text-gray-400 text-xs">→</span>
                  <input
                    type="date"
                    value={periodeFin}
                    onChange={(e) => setPeriodeFin(e.target.value)}
                    className="text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">N° BC</th>
                    <th className="text-left px-4 py-3 font-semibold">Fournisseur</th>
                    <th className="text-left px-4 py-3 font-semibold">Article</th>
                    <th className="text-center px-4 py-3 font-semibold">
                      BC (qté / mt)
                    </th>
                    <th className="text-center px-4 py-3 font-semibold">
                      Réception
                    </th>
                    <th className="text-center px-4 py-3 font-semibold">
                      Facture
                    </th>
                    <th className="text-right px-4 py-3 font-semibold">Écart %</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const etat = globalEtat(m);
                    return (
                      <tr
                        key={m.id_ligne}
                        className={`border-b border-gray-100 hover:bg-[#FBF8F3]/60 ${
                          etat !== 'conforme'
                            ? etat === 'manquant'
                              ? 'bg-red-50/30'
                              : 'bg-[#FBF3E0]/30'
                            : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">
                          {m.numero_bc}
                          <div className="text-[10px] text-gray-500 font-normal">
                            {new Date(m.date_bc).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {m.fournisseur_nom}
                        </td>
                        <td className="px-4 py-3 text-gray-700 truncate max-w-xs">
                          {m.designation}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Match3Way statut={m.statut_bc} />
                            <div className="text-xs">
                              <div className="font-semibold">{m.qte_bc}</div>
                              <div className="text-[10px] text-gray-500">
                                {m.montant_bc?.toFixed(0)} DT
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Match3Way statut={m.statut_reception} />
                            <div className="text-xs">
                              <div className="font-semibold">
                                {m.qte_recue ?? '—'}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                {m.numero_reception || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Match3Way statut={m.statut_facture} />
                            <div className="text-xs">
                              <div className="font-semibold">
                                {m.qte_facturee ?? '—'}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                {m.numero_ff || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              (m.ecart_pct ?? 0) >= 2
                                ? 'font-bold text-red-700'
                                : 'text-gray-700'
                            }
                          >
                            {(m.ecart_pct ?? 0).toFixed(1)}%
                          </span>
                          {m.justification && (
                            <div
                              className="text-[10px] text-gray-500 italic truncate max-w-[140px]"
                              title={m.justification}
                            >
                              « {m.justification} »
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {etat !== 'conforme' && (
                              <button
                                type="button"
                                onClick={() => handleJustifier(m)}
                                className="p-1.5 rounded hover:bg-[#FBF3E0] text-[#8A6412]"
                                title="Justifier l'écart"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleValiderMatch(m)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#7A8C6A] hover:bg-[#6B7C5B] text-white text-xs font-semibold"
                              title="Valider ce match"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              OK
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        Aucun rapprochement pour ces filtres.
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

export default RapprochementBcBlFf;
