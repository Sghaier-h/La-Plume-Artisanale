import React, { useState, useEffect, useMemo } from 'react';
import {
  PackageCheck,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Truck,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  receptionsService,
  ReceptionFf,
  StatutReception,
} from '../../services/achatsApi';

const MOCK_RECEPTIONS: ReceptionFf[] = [
  {
    id_reception: 701,
    numero_reception: 'REC-202609015',
    id_bc: 42,
    numero_bc: 'BC-202609042',
    id_fournisseur: 1,
    fournisseur_nom: 'SOTUFIL',
    id_entrepot_reception: 1,
    entrepot_nom: 'Magasin MP Ksar Hellal',
    date_reception: new Date(Date.now() - 86400_000 * 2).toISOString(),
    numero_bl_fournisseur: 'BL-SF-9821',
    receptionne_par_nom: 'Karim Ben Salah',
    statut: 'valide',
    ecart_detecte: false,
    lignes: [
      {
        id_ligne_reception: 1,
        id_reception: 701,
        designation: 'Fil coton 20/1 écru — 100 kg',
        quantite_recue: 100,
        quantite_conforme: 100,
        quantite_rebut: 0,
        numero_lot_fournisseur: 'SF-2609-A',
      },
    ],
  },
  {
    id_reception: 702,
    numero_reception: 'REC-202609016',
    id_bc: 43,
    numero_bc: 'BC-202609043',
    id_fournisseur: 2,
    fournisseur_nom: 'MICOFIL',
    id_entrepot_reception: 1,
    entrepot_nom: 'Magasin MP Ksar Hellal',
    date_reception: new Date(Date.now() - 86400_000 * 1).toISOString(),
    numero_bl_fournisseur: 'BL-MC-4457',
    receptionne_par_nom: 'Karim Ben Salah',
    statut: 'en_cours',
    ecart_detecte: true,
    lignes: [
      {
        id_ligne_reception: 2,
        id_reception: 702,
        designation: 'Fil sergé indigo 30/2 — 50 kg',
        quantite_recue: 30,
        quantite_conforme: 28,
        quantite_rebut: 2,
        notes_qualite: 'Balles humides — 2 kg abîmés',
      },
    ],
  },
  {
    id_reception: 703,
    numero_reception: 'REC-202609017',
    id_fournisseur: 3,
    fournisseur_nom: 'Dornier Service Tunis',
    id_bc: 44,
    numero_bc: 'BC-202609044',
    id_entrepot_reception: 2,
    entrepot_nom: 'Atelier maintenance',
    date_reception: new Date(Date.now() - 3600_000 * 4).toISOString(),
    numero_bl_fournisseur: 'DST-2609-01',
    receptionne_par_nom: 'Mohamed Trabelsi',
    statut: 'litige',
    ecart_detecte: true,
    lignes: [
      {
        id_ligne_reception: 3,
        id_reception: 703,
        designation: 'Navette Dornier LWV-C',
        quantite_recue: 1,
        quantite_conforme: 1,
        quantite_rebut: 0,
        notes_qualite: 'Livraison partielle — 1/2 unités seulement',
      },
    ],
  },
  {
    id_reception: 704,
    numero_reception: 'REC-202608045',
    id_bc: 46,
    numero_bc: 'BC-202608040',
    id_fournisseur: 1,
    fournisseur_nom: 'SOTUFIL',
    id_entrepot_reception: 1,
    entrepot_nom: 'Magasin MP Ksar Hellal',
    date_reception: new Date(Date.now() - 86400_000 * 20).toISOString(),
    numero_bl_fournisseur: 'BL-SF-9788',
    receptionne_par_nom: 'Karim Ben Salah',
    statut: 'valide',
    ecart_detecte: false,
  },
];

const STATUT_TONE: Record<
  StatutReception,
  { label: string; tone: string; icon: React.ReactNode }
> = {
  en_cours: {
    label: 'En cours',
    tone: 'bg-[#FBF3E0] text-[#8A6412]',
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  valide: {
    label: 'Validée',
    tone: 'bg-emerald-50 text-emerald-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  litige: {
    label: 'Litige / écart',
    tone: 'bg-red-50 text-red-700',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.receptions)) return d.receptions;
  return fallback;
};

const ReceptionsFF: React.FC = () => {
  const [receptions, setReceptions] = useState<ReceptionFf[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutReception | 'all'>(
    'all',
  );
  const [selected, setSelected] = useState<ReceptionFf | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([receptionsService.getReceptions()]);
      if (cancelled) return;
      setReceptions(pickArray<ReceptionFf>(res, MOCK_RECEPTIONS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const enCours = receptions.filter((r) => r.statut === 'en_cours').length;
    const litiges = receptions.filter((r) => r.statut === 'litige').length;
    const validees = receptions.filter((r) => r.statut === 'valide').length;
    return { total: receptions.length, enCours, litiges, validees };
  }, [receptions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return receptions.filter((r) => {
      if (statutFilter !== 'all' && r.statut !== statutFilter) return false;
      if (
        q &&
        !`${r.numero_reception} ${r.fournisseur_nom ?? ''} ${r.numero_bc ?? ''} ${
          r.numero_bl_fournisseur ?? ''
        }`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [receptions, search, statutFilter]);

  const handleValider = async (r: ReceptionFf) => {
    try {
      await receptionsService.valider(r.id_reception);
    } catch {
      /* noop */
    }
    setReceptions((prev) =>
      prev.map((x) =>
        x.id_reception === r.id_reception ? { ...x, statut: 'valide' } : x,
      ),
    );
  };
  const handleLitige = async (r: ReceptionFf) => {
    const motif = window.prompt('Motif de l\'écart / litige :');
    if (!motif) return;
    try {
      await receptionsService.signalerEcart(r.id_reception, { motif });
    } catch {
      /* noop */
    }
    setReceptions((prev) =>
      prev.map((x) =>
        x.id_reception === r.id_reception
          ? { ...x, statut: 'litige', notes: motif, ecart_detecte: true }
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
                <PackageCheck className="w-8 h-8 text-[#C8663D]" />
                Réceptions fournisseur
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Bons de livraison entrants et contrôle qualité · §9.4
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Nouvelle réception
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Réceptions totales"
              value={kpis.total}
              icon={<PackageCheck className="w-5 h-5" />}
              color="indigo"
            />
            <KpiCard
              label="En cours"
              value={kpis.enCours}
              icon={<Truck className="w-5 h-5" />}
              color="warning"
            />
            <KpiCard
              label="Litiges"
              value={kpis.litiges}
              icon={<AlertTriangle className="w-5 h-5" />}
              color={kpis.litiges > 0 ? 'terracotta' : 'sage'}
            />
            <KpiCard
              label="Validées"
              value={kpis.validees}
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
                  placeholder="Rechercher n° réception, BC, fournisseur…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statutFilter}
                  onChange={(e) =>
                    setStatutFilter(e.target.value as StatutReception | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="en_cours">En cours</option>
                  <option value="valide">Validée</option>
                  <option value="litige">Litige</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">
                      N° réception
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">Fournisseur</th>
                    <th className="text-left px-4 py-3 font-semibold">BC lié</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">
                      BL fournisseur
                    </th>
                    <th className="text-left px-4 py-3 font-semibold">État</th>
                    <th className="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const st = STATUT_TONE[r.statut];
                    return (
                      <tr
                        key={r.id_reception}
                        className="border-b border-gray-100 hover:bg-[#FBF8F3]/60 group"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">
                          {r.numero_reception}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {r.fournisseur_nom}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {r.numero_bc || '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {new Date(r.date_reception).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {r.numero_bl_fournisseur || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.tone}`}
                          >
                            {st.icon}
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelected(r)}
                              className="p-1.5 rounded hover:bg-[#EDF0F5] text-[#4A5D75]"
                              title="Détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {r.statut === 'en_cours' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleValider(r)}
                                  className="p-1.5 rounded hover:bg-emerald-100 text-emerald-700"
                                  title="Valider réception"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLitige(r)}
                                  className="p-1.5 rounded hover:bg-red-100 text-red-700"
                                  title="Signaler écart"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        Aucune réception pour ces filtres.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selected && (
            <div
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-3xl shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-200">
                  <div className="font-mono text-xs text-[#4A5D75]">
                    {selected.numero_reception} · BL{' '}
                    {selected.numero_bl_fournisseur || 'n/c'}
                  </div>
                  <div className="font-bold text-gray-800">
                    {selected.fournisseur_nom}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Reçu le{' '}
                    {new Date(selected.date_reception).toLocaleDateString('fr-FR')}{' '}
                    par {selected.receptionne_par_nom} — {selected.entrepot_nom}
                  </div>
                </div>
                <div className="p-5">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">
                          Article
                        </th>
                        <th className="text-right px-3 py-2 font-semibold">
                          Reçu
                        </th>
                        <th className="text-right px-3 py-2 font-semibold">
                          Conforme
                        </th>
                        <th className="text-right px-3 py-2 font-semibold">
                          Rebut
                        </th>
                        <th className="text-left px-3 py-2 font-semibold">
                          Notes qualité
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.lignes || []).map((l) => (
                        <tr
                          key={l.id_ligne_reception}
                          className="border-b border-gray-100"
                        >
                          <td className="px-3 py-2">{l.designation}</td>
                          <td className="px-3 py-2 text-right">
                            {l.quantite_recue}
                          </td>
                          <td className="px-3 py-2 text-right text-emerald-700">
                            {l.quantite_conforme}
                          </td>
                          <td className="px-3 py-2 text-right text-red-700">
                            {l.quantite_rebut}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500">
                            {l.notes_qualite || '—'}
                          </td>
                        </tr>
                      ))}
                      {(selected.lignes || []).length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-3 py-6 text-center text-gray-500"
                          >
                            Aucune ligne de détail disponible.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceptionsFF;
