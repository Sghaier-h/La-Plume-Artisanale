import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList,
  PlusCircle,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  Search,
  Filter,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  demandesAchatService,
  DemandeAchat,
  StatutDemandeAchat,
} from '../../services/achatsApi';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA — fournisseurs textile Tunisie
// ═══════════════════════════════════════════════════════════════════════

const MOCK_DEMANDES: DemandeAchat[] = [
  {
    id_demande_achat: 1,
    numero_demande: 'DA-202609001',
    demandee_par: 12,
    demandee_par_nom: 'Karim Ben Salah',
    service: 'Magasin MP',
    date_demande: new Date(Date.now() - 86400_000 * 2).toISOString(),
    motif: 'Rupture stock coton 20/1',
    designation: 'Fil coton 20/1 écru — 100 kg',
    quantite_demandee: 100,
    unite: 'kg',
    urgence: 'haute',
    date_besoin: new Date(Date.now() + 86400_000 * 5).toISOString(),
    fournisseur_suggere_nom: 'SOTUFIL',
    statut: 'en_attente',
  },
  {
    id_demande_achat: 2,
    numero_demande: 'DA-202609002',
    demandee_par: 8,
    demandee_par_nom: 'Mohamed Trabelsi',
    service: 'Maintenance',
    date_demande: new Date(Date.now() - 86400_000 * 4).toISOString(),
    motif: 'Panne métier Dornier n°4 — pièce de rechange urgente',
    designation: 'Navette Dornier LWV-C — 2 unités',
    quantite_demandee: 2,
    unite: 'unité',
    urgence: 'critique',
    date_besoin: new Date(Date.now() + 86400_000 * 1).toISOString(),
    fournisseur_suggere_nom: 'Dornier Service Tunis',
    statut: 'approuvee',
    approuvee_par_nom: 'Ali Fouti',
  },
  {
    id_demande_achat: 3,
    numero_demande: 'DA-202608014',
    demandee_par: 5,
    demandee_par_nom: 'Fatma Chaari',
    service: 'Atelier finition',
    date_demande: new Date(Date.now() - 86400_000 * 12).toISOString(),
    motif: 'Réappro fils sergé indigo',
    designation: 'Fil sergé indigo 30/2 — 50 kg',
    quantite_demandee: 50,
    unite: 'kg',
    urgence: 'normale',
    fournisseur_suggere_nom: 'MICOFIL',
    statut: 'transformee_bc',
    id_bc: 42,
  },
  {
    id_demande_achat: 4,
    numero_demande: 'DA-202608012',
    demandee_par: 12,
    demandee_par_nom: 'Karim Ben Salah',
    service: 'Magasin MP',
    date_demande: new Date(Date.now() - 86400_000 * 18).toISOString(),
    motif: 'Test échantillon nouveau fournisseur',
    designation: 'Lin brut 40/1 — 20 kg',
    quantite_demandee: 20,
    unite: 'kg',
    urgence: 'basse',
    fournisseur_suggere_nom: 'IMEXTUN',
    statut: 'refusee',
  },
  {
    id_demande_achat: 5,
    numero_demande: 'DA-202609003',
    demandee_par: 3,
    demandee_par_nom: 'Sonia Kabbaj',
    service: 'Atelier tissage',
    date_demande: new Date(Date.now() - 86400_000 * 1).toISOString(),
    motif: 'Anticipation commande client Hotel Marina',
    designation: 'Fil coton bio 24/1 — 200 kg',
    quantite_demandee: 200,
    unite: 'kg',
    urgence: 'normale',
    date_besoin: new Date(Date.now() + 86400_000 * 10).toISOString(),
    fournisseur_suggere_nom: 'SOTUFIL',
    statut: 'en_attente',
  },
];

// ═══════════════════════════════════════════════════════════════════════

const URGENCE_MAP: Record<
  NonNullable<DemandeAchat['urgence']>,
  { label: string; tone: string }
> = {
  basse: { label: 'Basse', tone: 'bg-gray-100 text-gray-700' },
  normale: { label: 'Normale', tone: 'bg-[#EDF0F5] text-[#4A5D75]' },
  haute: { label: 'Haute', tone: 'bg-[#FBF3E0] text-[#8A6412]' },
  critique: { label: 'Critique', tone: 'bg-red-50 text-red-700' },
};

const STATUT_MAP: Record<
  StatutDemandeAchat,
  { label: string; tone: string }
> = {
  en_attente: { label: 'En attente', tone: 'bg-[#FBF3E0] text-[#8A6412]' },
  approuvee: { label: 'Approuvée', tone: 'bg-[#EEF4F0] text-[#4A6C5B]' },
  transformee_bc: {
    label: 'Transformée BC',
    tone: 'bg-emerald-50 text-emerald-700',
  },
  refusee: { label: 'Refusée', tone: 'bg-red-50 text-red-700' },
  annulee: { label: 'Annulée', tone: 'bg-gray-100 text-gray-500' },
};

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.demandes)) return d.demandes;
  return fallback;
};

const DemandesAchat: React.FC = () => {
  const [demandes, setDemandes] = useState<DemandeAchat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutDemandeAchat | 'all'>(
    'all',
  );
  const [urgenceFilter, setUrgenceFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        demandesAchatService.getDemandes(),
      ]);
      if (cancelled) return;
      setDemandes(pickArray<DemandeAchat>(res, MOCK_DEMANDES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const enAttente = demandes.filter((d) => d.statut === 'en_attente').length;
    const critiques = demandes.filter(
      (d) => d.urgence === 'critique' && d.statut !== 'transformee_bc',
    ).length;
    const transformees = demandes.filter(
      (d) => d.statut === 'transformee_bc',
    ).length;
    return {
      total: demandes.length,
      enAttente,
      critiques,
      transformees,
    };
  }, [demandes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return demandes.filter((d) => {
      if (statutFilter !== 'all' && d.statut !== statutFilter) return false;
      if (urgenceFilter !== 'all' && d.urgence !== urgenceFilter) return false;
      if (
        q &&
        !`${d.numero_demande} ${d.designation ?? ''} ${d.demandee_par_nom ?? ''} ${d.motif}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [demandes, search, statutFilter, urgenceFilter]);

  const handleApprouver = async (d: DemandeAchat) => {
    try {
      await demandesAchatService.approuver(d.id_demande_achat);
    } catch {
      /* fallback local */
    }
    setDemandes((prev) =>
      prev.map((x) =>
        x.id_demande_achat === d.id_demande_achat
          ? { ...x, statut: 'approuvee' }
          : x,
      ),
    );
  };
  const handleRefuser = async (d: DemandeAchat) => {
    try {
      await demandesAchatService.refuser(d.id_demande_achat);
    } catch {
      /* noop */
    }
    setDemandes((prev) =>
      prev.map((x) =>
        x.id_demande_achat === d.id_demande_achat
          ? { ...x, statut: 'refusee' }
          : x,
      ),
    );
  };
  const handleTransformer = async (d: DemandeAchat) => {
    try {
      await demandesAchatService.transformerEnBc(d.id_demande_achat);
    } catch {
      /* noop */
    }
    setDemandes((prev) =>
      prev.map((x) =>
        x.id_demande_achat === d.id_demande_achat
          ? { ...x, statut: 'transformee_bc', id_bc: Math.floor(Math.random() * 1000) }
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
                <ClipboardList className="w-8 h-8 text-[#C8663D]" />
                Demandes d'achat
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Demandes internes émises par magasin, maintenance et ateliers · §9.2
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
              type="button"
            >
              <PlusCircle className="w-4 h-4" />
              Nouvelle demande
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Total demandes"
              value={kpis.total}
              icon={<ClipboardList className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="En attente"
              value={kpis.enAttente}
              icon={<Clock className="w-5 h-5" />}
              color="warning"
            />
            <KpiCard
              label="Critiques ouvertes"
              value={kpis.critiques}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={kpis.critiques > 0 ? 'terracotta' : 'sage'}
            />
            <KpiCard
              label="Transformées en BC"
              value={kpis.transformees}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="sage"
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
                  placeholder="Rechercher n°, article, demandeur…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statutFilter}
                  onChange={(e) =>
                    setStatutFilter(e.target.value as StatutDemandeAchat | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="en_attente">En attente</option>
                  <option value="approuvee">Approuvée</option>
                  <option value="transformee_bc">Transformée BC</option>
                  <option value="refusee">Refusée</option>
                </select>
                <select
                  value={urgenceFilter}
                  onChange={(e) => setUrgenceFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Toutes urgences</option>
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">N° DA</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      Demandeur / service
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Article</th>
                    <th className="text-right px-4 py-3 font-semibold">Qté</th>
                    <th className="text-left px-4 py-3 font-semibold">Urgence</th>
                    <th className="text-left px-4 py-3 font-semibold">Fournisseur suggéré</th>
                    <th className="text-left px-4 py-3 font-semibold">Statut</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const urg = URGENCE_MAP[d.urgence || 'normale'];
                    const stat = STATUT_MAP[d.statut];
                    return (
                      <tr
                        key={d.id_demande_achat}
                        className="border-b border-gray-100 hover:bg-[#FBF8F3]/60 group"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">
                          {d.numero_demande}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">
                            {d.demandee_par_nom || `Utilisateur ${d.demandee_par}`}
                          </div>
                          <div className="text-xs text-gray-500">{d.service}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800 truncate max-w-xs">
                            {d.designation}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {d.motif}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                          {d.quantite_demandee}
                          <span className="text-xs text-gray-500 ml-1">
                            {d.unite}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${urg.tone}`}
                          >
                            {urg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {d.fournisseur_suggere_nom || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${stat.tone}`}
                          >
                            {stat.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {d.statut === 'en_attente' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprouver(d)}
                                  title="Approuver"
                                  className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRefuser(d)}
                                  title="Refuser"
                                  className="p-1.5 rounded hover:bg-red-100 text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {d.statut === 'approuvee' && (
                              <button
                                type="button"
                                onClick={() => handleTransformer(d)}
                                title="Transformer en BC"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#C8663D] hover:bg-[#B4562F] text-white text-xs font-semibold"
                              >
                                <ArrowRightCircle className="w-3.5 h-3.5" />
                                BC
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        Aucune demande trouvée pour ces filtres.
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

export default DemandesAchat;
