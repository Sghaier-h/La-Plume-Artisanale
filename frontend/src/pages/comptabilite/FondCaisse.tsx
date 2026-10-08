import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  PlusCircle,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Layers,
  Filter,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import {
  caisseService,
  Caisse,
  MouvementCaisse,
  TypeMouvementCaisse,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// SEUILS LÉGAUX TUNISIE (§9.9)
// ═══════════════════════════════════════════════════════════════════
const SEUIL_ALERT_LOCAL = 50; // au-delà de 50 DT, exiger justificatif
const SEUIL_ALERT_MOYEN = 500; // seuil intermédiaire
const SEUIL_INTERDIT = 5000; // paiement espèces > 5000 DT interdit

// ═══════════════════════════════════════════════════════════════════
// MOCK
// ═══════════════════════════════════════════════════════════════════

const MOCK_CAISSES: Caisse[] = [
  {
    id_caisse: 1,
    code: 'CAISSE_SIEGE',
    libelle: 'Caisse siège Sfax',
    id_compte_comptable: 503,
    numero_compte: '5310',
    solde_theorique: 2400,
    responsable_nom: 'Fatma Ben Salah',
    actif: true,
  },
  {
    id_caisse: 2,
    code: 'CAISSE_SHOWROOM',
    libelle: 'Caisse showroom Djerba',
    id_compte_comptable: 504,
    numero_compte: '5311',
    solde_theorique: 1300,
    responsable_nom: 'Ahmed Karray',
    actif: true,
  },
];

const MOCK_MOUVEMENTS: Record<number, MouvementCaisse[]> = {
  1: [
    { id_mouvement_caisse: 501, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 2).toISOString(), type_mouvement: 'encaissement_client', montant: 480, motif: 'Vente comptoir foutas × 4', saisi_par_nom: 'Fatma B.S.', comptabilise: false },
    { id_mouvement_caisse: 502, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 6).toISOString(), type_mouvement: 'frais', montant: 45, motif: 'Fournitures bureau (Papeterie centrale)', saisi_par_nom: 'Fatma B.S.', comptabilise: false },
    { id_mouvement_caisse: 503, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 8).toISOString(), type_mouvement: 'decaissement_fournisseur', montant: 620, motif: 'Achat étiquettes tissées (bon comptant)', saisi_par_nom: 'Fatma B.S.', comptabilise: true, id_ecriture: 8034 },
    { id_mouvement_caisse: 504, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 24).toISOString(), type_mouvement: 'versement_banque', montant: 1200, motif: 'Versement BIAT bordereau #7745', saisi_par_nom: 'Fatma B.S.', comptabilise: true, id_ecriture: 8025 },
    { id_mouvement_caisse: 505, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 26).toISOString(), type_mouvement: 'encaissement_client', montant: 850, motif: 'Vente comptoir jetés + serviettes', saisi_par_nom: 'Fatma B.S.', comptabilise: true, id_ecriture: 8023 },
    { id_mouvement_caisse: 506, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 48).toISOString(), type_mouvement: 'frais', montant: 380, motif: 'Café + boissons personnel atelier (2 semaines)', saisi_par_nom: 'Fatma B.S.', comptabilise: false },
    { id_mouvement_caisse: 507, id_caisse: 1, date_mouvement: new Date(Date.now() - 3600_000 * 72).toISOString(), type_mouvement: 'salaire_liquide', montant: 480, motif: 'Prime rendement Anis (tissage)', saisi_par_nom: 'Fatma B.S.', comptabilise: false },
  ],
  2: [
    { id_mouvement_caisse: 601, id_caisse: 2, date_mouvement: new Date(Date.now() - 3600_000 * 3).toISOString(), type_mouvement: 'encaissement_client', montant: 1420, motif: 'Vente showroom touriste (5 foutas + 2 jetés)', saisi_par_nom: 'Ahmed K.', comptabilise: true, id_ecriture: 8005 },
    { id_mouvement_caisse: 602, id_caisse: 2, date_mouvement: new Date(Date.now() - 3600_000 * 30).toISOString(), type_mouvement: 'ajustement_-', montant: 8, motif: 'Écart comptage soir', saisi_par_nom: 'Ahmed K.', comptabilise: false },
  ],
};

const TYPE_CONFIG: Record<TypeMouvementCaisse, { label: string; sens: 'entree' | 'sortie'; color: string }> = {
  encaissement_client: { label: 'Encaissement client', sens: 'entree', color: '#7A8C6A' },
  decaissement_fournisseur: { label: 'Décaissement fournisseur', sens: 'sortie', color: '#C8663D' },
  salaire_liquide: { label: 'Salaire liquide', sens: 'sortie', color: '#8A6E4A' },
  frais: { label: 'Frais divers', sens: 'sortie', color: '#C89B3C' },
  versement_banque: { label: 'Versement banque', sens: 'sortie', color: '#3B4E68' },
  retrait_banque: { label: 'Retrait banque', sens: 'entree', color: '#3B4E68' },
  'ajustement_+': { label: 'Ajustement +', sens: 'entree', color: '#7A8C6A' },
  'ajustement_-': { label: 'Ajustement −', sens: 'sortie', color: '#B84A4A' },
};

const FondCaisse: React.FC = () => {
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [mouvements, setMouvements] = useState<Record<number, MouvementCaisse[]>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<TypeMouvementCaisse | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<MouvementCaisse>>({
    type_mouvement: 'encaissement_client',
    montant: 0,
    motif: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([caisseService.getCaisses()]);
      if (cancelled) return;
      const pick = (res: PromiseSettledResult<any>): Caisse[] => {
        if (res.status !== 'fulfilled') return MOCK_CAISSES;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.caisses)) return d.caisses;
        return MOCK_CAISSES;
      };
      const c = pick(r[0]);
      setCaisses(c);
      setSelected(c[0]?.id_caisse ?? null);

      // Charger mouvements pour chaque caisse
      const movs: Record<number, MouvementCaisse[]> = {};
      await Promise.all(
        c.map(async (caisse) => {
          try {
            const mv = await caisseService.getMouvements(caisse.id_caisse);
            const d = mv?.data?.data ?? mv?.data;
            movs[caisse.id_caisse] = Array.isArray(d)
              ? d
              : Array.isArray(d?.mouvements)
              ? d.mouvements
              : MOCK_MOUVEMENTS[caisse.id_caisse] || [];
          } catch {
            movs[caisse.id_caisse] = MOCK_MOUVEMENTS[caisse.id_caisse] || [];
          }
        })
      );
      setMouvements(movs);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const caisseCourante = caisses.find((c) => c.id_caisse === selected);
  const mvs = selected != null ? mouvements[selected] || [] : [];

  const filteredMvs = useMemo(() => {
    if (filterType === 'all') return mvs;
    return mvs.filter((m) => m.type_mouvement === filterType);
  }, [mvs, filterType]);

  const kpis = useMemo(() => {
    const entrees = mvs
      .filter((m) => TYPE_CONFIG[m.type_mouvement]?.sens === 'entree')
      .reduce((s, m) => s + Number(m.montant || 0), 0);
    const sorties = mvs
      .filter((m) => TYPE_CONFIG[m.type_mouvement]?.sens === 'sortie')
      .reduce((s, m) => s + Number(m.montant || 0), 0);
    const nonComptabilises = mvs.filter((m) => !m.comptabilise).length;
    const alertesInterdit = mvs.filter(
      (m) => Number(m.montant || 0) > SEUIL_INTERDIT
    ).length;
    return { entrees, sorties, nonComptabilises, alertesInterdit };
  }, [mvs]);

  const handleAdd = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (selected == null) return;
    const newMv: MouvementCaisse = {
      id_mouvement_caisse: Date.now(),
      id_caisse: selected,
      date_mouvement: new Date().toISOString(),
      type_mouvement: form.type_mouvement || 'encaissement_client',
      montant: Number(form.montant || 0),
      motif: form.motif || '',
      saisi_par_nom: 'Vous',
      comptabilise: false,
    };
    try {
      await caisseService.addMouvement(selected, newMv);
    } catch {
      /* mock */
    }
    setMouvements((prev) => ({
      ...prev,
      [selected]: [newMv, ...(prev[selected] || [])],
    }));
    setShowForm(false);
    setForm({ type_mouvement: 'encaissement_client', montant: 0, motif: '' });
  };

  const handleComptabiliserBloc = async () => {
    if (selected == null) return;
    const ids = mvs.filter((m) => !m.comptabilise).map((m) => m.id_mouvement_caisse);
    if (ids.length === 0) {
      alert('Aucun mouvement à comptabiliser.');
      return;
    }
    if (!window.confirm(`Comptabiliser en bloc ${ids.length} mouvement(s) ?`)) return;
    try {
      await caisseService.comptabiliserBloc(selected, ids);
    } catch {
      /* mock */
    }
    setMouvements((prev) => ({
      ...prev,
      [selected]: (prev[selected] || []).map((m) =>
        ids.includes(m.id_mouvement_caisse) ? { ...m, comptabilise: true } : m
      ),
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
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
                <Wallet className="w-8 h-8 text-[#C8663D]" />
                Fond de caisse
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Livre de caisse · Compte 5310/5311 · seuils légaux Tunisie (§10.4)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleComptabiliserBloc}
                className="inline-flex items-center gap-2 bg-[#7A8C6A] text-white px-4 py-2 rounded-lg hover:bg-[#5F7053] shadow-sm text-sm"
              >
                <Layers className="w-4 h-4" /> Comptabiliser en bloc
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Nouveau mouvement
              </button>
            </div>
          </div>

          {/* Sélecteur caisse (tabs) */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {caisses.map((c) => (
              <button
                key={c.id_caisse}
                onClick={() => setSelected(c.id_caisse)}
                className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${
                  selected === c.id_caisse
                    ? 'bg-[#C8663D] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Wallet className="w-4 h-4" />
                {c.libelle}
                <span className="text-[10px] opacity-80 ml-1 font-mono">{c.numero_compte}</span>
              </button>
            ))}
          </div>

          {caisseCourante && (
            <>
              {/* KPIs caisse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                  label={`Solde ${caisseCourante.libelle}`}
                  value={caisseCourante.solde_theorique.toLocaleString('fr-FR', {
                    maximumFractionDigits: 3,
                  })}
                  suffix="DT"
                  color="sage"
                  subtitle={`Responsable : ${caisseCourante.responsable_nom || '—'}`}
                />
                <KpiCard
                  label="Entrées cumulées"
                  value={kpis.entrees.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  suffix="DT"
                  color="sage"
                  icon={<ArrowUpRight className="w-5 h-5" />}
                />
                <KpiCard
                  label="Sorties cumulées"
                  value={kpis.sorties.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                  suffix="DT"
                  color="terracotta"
                  icon={<ArrowDownRight className="w-5 h-5" />}
                />
                <KpiCard
                  label="À comptabiliser"
                  value={kpis.nonComptabilises}
                  color={kpis.nonComptabilises > 0 ? 'warning' : 'sage'}
                  subtitle={`${kpis.alertesInterdit} alerte(s) seuil légal`}
                />
              </div>

              {/* Bandeau seuils */}
              <div className="bg-[#FBF3E0] border border-[#E5C67D] rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#8A6412] shrink-0 mt-0.5" />
                <div className="text-xs text-[#8A6412]">
                  <div className="font-semibold mb-1">Seuils légaux Tunisie (§9.9)</div>
                  <div className="space-y-0.5">
                    <div>&gt; <span className="font-mono font-bold">{SEUIL_ALERT_LOCAL} DT</span> — mention obligatoire du justificatif</div>
                    <div>&gt; <span className="font-mono font-bold">{SEUIL_ALERT_MOYEN} DT</span> — validation comptable requise</div>
                    <div>&gt; <span className="font-mono font-bold">{SEUIL_INTERDIT} DT</span> — <span className="font-bold text-red-700">paiement espèces INTERDIT</span> → basculer en virement</div>
                  </div>
                </div>
              </div>

              {/* Filtre */}
              <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="text-sm border rounded-lg px-2 py-1.5"
                >
                  <option value="all">Tous types</option>
                  {(Object.keys(TYPE_CONFIG) as TypeMouvementCaisse[]).map((k) => (
                    <option key={k} value={k}>
                      {TYPE_CONFIG[k].label}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-500 ml-auto">
                  {filteredMvs.length} mouvement(s)
                </div>
              </div>

              {/* Table mouvements */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Motif</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Entrée</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Sortie</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Alerte</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Compta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMvs.map((m) => {
                      const cfg = TYPE_CONFIG[m.type_mouvement];
                      const alerte =
                        Number(m.montant || 0) > SEUIL_INTERDIT
                          ? 'interdit'
                          : Number(m.montant || 0) > SEUIL_ALERT_MOYEN
                          ? 'moyen'
                          : Number(m.montant || 0) > SEUIL_ALERT_LOCAL
                          ? 'local'
                          : null;
                      return (
                        <tr key={m.id_mouvement_caisse} className="hover:bg-[#FDF2ED]/40 group">
                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                            {new Date(m.date_mouvement).toLocaleString('fr-FR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded"
                              style={{ backgroundColor: cfg.color + '22', color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            <div>{m.motif}</div>
                            {m.saisi_par_nom && (
                              <div className="text-[11px] text-gray-500 italic">
                                par {m.saisi_par_nom}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {cfg.sens === 'entree' && (
                              <MontantCell value={m.montant} devise="" bold />
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {cfg.sens === 'sortie' && (
                              <MontantCell value={m.montant} devise="" bold />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {alerte === 'interdit' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase">
                                <AlertTriangle className="w-3 h-3" /> INTERDIT
                              </span>
                            )}
                            {alerte === 'moyen' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded uppercase">
                                Validation
                              </span>
                            )}
                            {alerte === 'local' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                Justif.
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {m.comptabilise ? (
                              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                #{m.id_ecriture ?? 'OK'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                Non
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMvs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                          Aucun mouvement.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal nouveau mouvement */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <h3
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
              >
                Nouveau mouvement de caisse
              </h3>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
                <select
                  value={form.type_mouvement}
                  onChange={(e) =>
                    setForm({ ...form, type_mouvement: e.target.value as TypeMouvementCaisse })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {(Object.keys(TYPE_CONFIG) as TypeMouvementCaisse[]).map((k) => (
                    <option key={k} value={k}>
                      {TYPE_CONFIG[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Montant (DT)</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={form.montant || ''}
                  onChange={(e) => setForm({ ...form, montant: parseFloat(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                />
                {Number(form.montant || 0) > SEUIL_INTERDIT && (
                  <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Interdit &gt; {SEUIL_INTERDIT} DT en espèces
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Motif</label>
                <input
                  required
                  value={form.motif || ''}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Ex. vente comptoir foutas ×3"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#a55231] text-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FondCaisse;
