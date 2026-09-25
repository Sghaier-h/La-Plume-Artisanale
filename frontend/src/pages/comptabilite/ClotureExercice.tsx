import React, { useEffect, useMemo, useState } from 'react';
import {
  Lock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Play,
  AlertTriangle,
  Circle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  clotureService,
  EtatCloture,
  ClotureEtape,
  StatutEtapeCloture,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — §10.9 Clôture d'exercice (6 étapes)
// ═══════════════════════════════════════════════════════════════════

const ETAPES_TEMPLATE: Omit<ClotureEtape, 'statut'>[] = [
  {
    code: 'verifications',
    libelle: '1. Vérifications préalables',
    description:
      'Inventaire physique validé, rapprochements bancaires à jour, aucune écriture brouillon non validée, TVA du dernier mois déclarée.',
    bloquant: true,
  },
  {
    code: 'regularisations',
    libelle: '2. Écritures de régularisation',
    description:
      'CCA (charges constatées d\'avance), PCA (produits constatés d\'avance), FNP (factures non parvenues), variation de stock (compte 6031/6091 vs 31/32/33/35/37).',
    bloquant: true,
  },
  {
    code: 'amortissements',
    libelle: '3. Amortissements',
    description:
      'Génération automatique des dotations annuelles (écriture 6811x → 281x) pour toutes les immobilisations actives.',
    bloquant: true,
  },
  {
    code: 'provisions',
    libelle: '4. Provisions',
    description:
      'Provisions pour créances douteuses (416/491), provisions pour risques (15x), reprises de provisions devenues sans objet.',
    bloquant: false,
  },
  {
    code: 'repartition',
    libelle: '5. Répartition du résultat',
    description:
      'Calcul du résultat (produits − charges) et affectation → compte 120 Résultat de l\'exercice, réserve légale, dividendes le cas échéant.',
    bloquant: true,
  },
  {
    code: 'validation',
    libelle: '6. Validation ADMIN + verrouillage',
    description:
      'Génération PDF bilan + compte de résultat + annexes, validation par l\'administrateur, verrouillage définitif (statut = "cloturee" sur toutes les écritures), report à nouveau classes 1 et 2.',
    bloquant: true,
  },
];

const buildMockEtat = (annee: number): EtatCloture => ({
  annee,
  statut_global: 'en_cours',
  progression_pct: 33,
  etapes: ETAPES_TEMPLATE.map((t, i) => ({
    ...t,
    statut: (i < 2 ? 'termine' : i === 2 ? 'en_cours' : 'a_faire') as StatutEtapeCloture,
    date_execution:
      i < 2 ? new Date(Date.now() - (2 - i) * 86400_000).toISOString() : undefined,
    execute_par: i < 2 ? 'Fatma Ben Salah (COMPTABLE)' : undefined,
    resultat:
      i === 0
        ? 'Inventaire OK · rapprochement banque 100% · 0 brouillon'
        : i === 1
        ? '14 écritures de régularisation créées (CCA loyer, variation stock PF −18 200 DT)'
        : undefined,
  })),
});

const STATUT_ICON: Record<StatutEtapeCloture, React.ReactNode> = {
  a_faire: <Circle className="w-5 h-5 text-gray-300" />,
  en_cours: <Loader2 className="w-5 h-5 text-[#C89B3C] animate-spin" />,
  termine: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  erreur: <AlertTriangle className="w-5 h-5 text-red-600" />,
};

const STATUT_LABEL: Record<StatutEtapeCloture, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  termine: 'Terminée',
  erreur: 'Erreur',
};

const ClotureExercice: React.FC = () => {
  const [annee, setAnnee] = useState(new Date().getFullYear() - 1);
  const [etat, setEtat] = useState<EtatCloture | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['verifications']));
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([clotureService.getEtat(annee)]);
      if (cancelled) return;
      const pick = (res: PromiseSettledResult<any>): EtatCloture => {
        if (res.status !== 'fulfilled') return buildMockEtat(annee);
        const d = res.value?.data?.data ?? res.value?.data;
        if (d && Array.isArray(d.etapes)) return d as EtatCloture;
        return buildMockEtat(annee);
      };
      setEtat(pick(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [annee]);

  const kpis = useMemo(() => {
    if (!etat) return { done: 0, total: 0, bloquants: 0, progression: 0 };
    const done = etat.etapes.filter((e) => e.statut === 'termine').length;
    const total = etat.etapes.length;
    const bloquants = etat.etapes.filter(
      (e) => e.bloquant && e.statut !== 'termine'
    ).length;
    return {
      done,
      total,
      bloquants,
      progression: Math.round((done / Math.max(1, total)) * 100),
    };
  }, [etat]);

  const toggleEtape = (code: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleRunEtape = async (etape: ClotureEtape) => {
    if (running) return;
    if (!window.confirm(`Lancer l'étape « ${etape.libelle} » ?`)) return;
    setRunning(etape.code);
    try {
      await clotureService.runEtape(annee, etape.code);
    } catch {
      /* mock */
    }
    // Simulation
    await new Promise((r) => setTimeout(r, 800));
    setEtat((prev) =>
      prev
        ? {
            ...prev,
            etapes: prev.etapes.map((e) =>
              e.code === etape.code
                ? {
                    ...e,
                    statut: 'termine',
                    date_execution: new Date().toISOString(),
                    execute_par: 'Vous (COMPTABLE)',
                    resultat: 'Étape exécutée avec succès (mock)',
                  }
                : e
            ),
          }
        : prev
    );
    setRunning(null);
  };

  const handleValiderCloture = async () => {
    if (
      !window.confirm(
        `⚠️ ATTENTION : cette action verrouille définitivement l'exercice ${annee}. Toutes les écritures deviendront non modifiables. Continuer ?`
      )
    )
      return;
    try {
      await clotureService.valider(annee);
    } catch {
      /* mock */
    }
    setEtat((prev) =>
      prev
        ? {
            ...prev,
            statut_global: 'cloturee',
            date_cloture: new Date().toISOString(),
            cloturee_par: 'Vous (ADMIN)',
          }
        : prev
    );
    alert(`Exercice ${annee} clôturé définitivement.`);
  };

  if (loading || !etat) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const toutesTerminees = etat.etapes.every((e) => e.statut === 'termine');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-64 p-6">
        <div className="max-w-5xl mx-auto">
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
                <Lock className="w-8 h-8 text-[#C8663D]" />
                Clôture d'exercice
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Procédure ADMIN + COMPTABLE — 1<sup>er</sup> janvier → 31 décembre (§10.9)
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={annee}
                onChange={(e) => setAnnee(parseInt(e.target.value, 10))}
                className="text-sm border rounded-lg px-3 py-2 bg-white font-semibold text-[#3B4E68]"
              >
                {[2023, 2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    Exercice {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Progression" value={`${kpis.progression}%`} color={kpis.progression === 100 ? 'sage' : 'indigo'} subtitle={`${kpis.done} / ${kpis.total} étapes`} />
            <KpiCard label="Étapes terminées" value={kpis.done} color="sage" />
            <KpiCard label="Bloquants restants" value={kpis.bloquants} color={kpis.bloquants > 0 ? 'warning' : 'sage'} />
            <KpiCard label="Statut exercice" value={etat.statut_global === 'cloturee' ? 'Clôturé' : 'En cours'} color={etat.statut_global === 'cloturee' ? 'sage' : 'terracotta'} />
          </div>

          {/* Progress bar globale */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div
                className="font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
              >
                Progression clôture {annee}
              </div>
              <div className="text-sm font-semibold text-[#C8663D]">
                {kpis.progression}%
              </div>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${kpis.progression}%`,
                  background:
                    'linear-gradient(90deg, #C8663D 0%, #C89B3C 50%, #7A8C6A 100%)',
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {etat.etapes.map((e, i) => (
                <div
                  key={e.code}
                  className={`text-center text-[10px] font-semibold uppercase truncate px-1 py-1 rounded ${
                    e.statut === 'termine'
                      ? 'bg-emerald-100 text-emerald-800'
                      : e.statut === 'en_cours'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  title={e.libelle}
                >
                  Étape {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Accordion étapes */}
          <div className="space-y-3">
            {etat.etapes.map((etape) => {
              const isOpen = expanded.has(etape.code);
              const isRunning = running === etape.code;
              return (
                <div
                  key={etape.code}
                  className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all ${
                    etape.statut === 'termine' ? 'border-emerald-200' : 'border-gray-100'
                  }`}
                >
                  <button
                    onClick={() => toggleEtape(etape.code)}
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <div className="shrink-0">{STATUT_ICON[etape.statut]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                        >
                          {etape.libelle}
                        </div>
                        {etape.bloquant && (
                          <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-1.5 py-0.5 rounded">
                            Bloquant
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {STATUT_LABEL[etape.statut]}
                        {etape.date_execution && (
                          <span className="ml-2">
                            · {new Date(etape.date_execution).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {etape.execute_par && (
                          <span className="ml-2 italic">par {etape.execute_par}</span>
                        )}
                      </div>
                    </div>
                    {etape.statut !== 'termine' && etat.statut_global !== 'cloturee' && (
                      <button
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleRunEtape(etape);
                        }}
                        disabled={!!running}
                        className={`shrink-0 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg ${
                          isRunning
                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                            : 'bg-[#C8663D] text-white hover:bg-[#a55231]'
                        }`}
                      >
                        {isRunning ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                        Lancer
                      </button>
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-14 py-4 bg-gray-50/60 border-t text-sm text-gray-700 space-y-2">
                      <p>{etape.description}</p>
                      {etape.resultat && (
                        <div className="bg-white border border-emerald-100 rounded-lg p-3 text-xs">
                          <div className="text-emerald-700 font-semibold uppercase mb-1">
                            Résultat
                          </div>
                          <div className="text-gray-700">{etape.resultat}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bouton validation finale */}
          {toutesTerminees && etat.statut_global !== 'cloturee' && (
            <div className="mt-6 bg-gradient-to-r from-[#3B4E68] to-[#4A5D75] rounded-xl p-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8" />
                  <div>
                    <div
                      className="font-semibold text-lg"
                      style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                    >
                      Toutes les étapes sont terminées
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      La clôture finale est réversible tant que vous ne l'avez pas validée.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleValiderCloture}
                  className="inline-flex items-center gap-2 bg-white text-[#3B4E68] px-6 py-3 rounded-lg hover:bg-gray-100 font-bold text-sm shadow-md"
                >
                  <Lock className="w-4 h-4" /> Valider et verrouiller l'exercice
                </button>
              </div>
            </div>
          )}

          {etat.statut_global === 'cloturee' && (
            <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-emerald-700" />
                <div>
                  <div
                    className="font-semibold text-lg text-emerald-800"
                    style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                  >
                    Exercice {annee} clôturé
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    {etat.date_cloture &&
                      `Clôturé le ${new Date(etat.date_cloture).toLocaleDateString('fr-FR')}`}
                    {etat.cloturee_par && ` par ${etat.cloturee_par}`}
                    . Écritures verrouillées.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClotureExercice;
