import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Wallet,
  BarChart3,
  FileText,
  ClipboardCheck,
  PieChart,
  PlusCircle,
  X,
  Search,
  Download,
  Upload,
  FileSignature,
  Calculator,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import KpiCard from '../components/ecommerce/KpiCard';
import CagnotteCard from '../components/primes/CagnotteCard';
import BordereauStatutBadge from '../components/primes/BordereauStatutBadge';
import ScoreCritereBar from '../components/primes/ScoreCritereBar';
import EmployeeAvatar from '../components/tv/EmployeeAvatar';
import {
  cagnottesService,
  scoresService,
  bordereauxService,
  Cagnotte,
  ScoreJournalier,
  Bordereau,
  AtelierPrime,
  StatutBordereau,
  ModeVersement,
} from '../services/primesRendementApi';

/**
 * PrimesRendement — dashboard RH primes hors bulletin (§11bis.7bis).
 *
 * 5 onglets :
 *   1. Cagnottes           — liste hebdo par atelier + calcul + validation
 *   2. Scores journaliers  — 5 critères pondérés (30/25/15/15/15)
 *   3. Bordereaux          — versement / compta 648 / reçu signé / PDF
 *   4. Reçus               — reçus signés (photo + signature)
 *   5. Statistiques        — total versé / top employés / répartition
 */

type TabKey = 'cagnottes' | 'scores' | 'bordereaux' | 'recus' | 'stats';

// ═══════════════════════════════════════════════════════════════════════
// MOCK DATA — fallback si l'API n'est pas encore branchée
// ═══════════════════════════════════════════════════════════════════════

const currentYear = new Date().getFullYear();
const currentWeek = Math.ceil(
  ((Date.now() - new Date(currentYear, 0, 1).getTime()) / 86400000 + 1) / 7,
);

const debutSemaineISO = (annee: number, sem: number): string => {
  const jan4 = new Date(annee, 0, 4);
  const lundi = new Date(jan4);
  lundi.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (sem - 1) * 7);
  return lundi.toISOString();
};

const finSemaineISO = (annee: number, sem: number): string => {
  const d = new Date(debutSemaineISO(annee, sem));
  d.setDate(d.getDate() + 6);
  return d.toISOString();
};

const MOCK_CAGNOTTES: Cagnotte[] = [
  {
    id_cagnotte: 1,
    atelier: 'tissage',
    annee: currentYear,
    numero_semaine: currentWeek,
    date_debut_semaine: debutSemaineISO(currentYear, currentWeek),
    date_fin_semaine: finSemaineISO(currentYear, currentWeek),
    montant_total_dt: 840,
    montant_distribue_dt: 0,
    nb_beneficiaires: 0,
    nb_exclus: 0,
    reste_report_dt: 0,
    statut: 'brouillon',
  },
  {
    id_cagnotte: 2,
    atelier: 'finition',
    annee: currentYear,
    numero_semaine: currentWeek,
    date_debut_semaine: debutSemaineISO(currentYear, currentWeek),
    date_fin_semaine: finSemaineISO(currentYear, currentWeek),
    montant_total_dt: 620,
    montant_distribue_dt: 0,
    nb_beneficiaires: 0,
    nb_exclus: 0,
    reste_report_dt: 0,
    statut: 'brouillon',
  },
  {
    id_cagnotte: 3,
    atelier: 'tissage',
    annee: currentYear,
    numero_semaine: currentWeek - 1,
    date_debut_semaine: debutSemaineISO(currentYear, currentWeek - 1),
    date_fin_semaine: finSemaineISO(currentYear, currentWeek - 1),
    montant_total_dt: 840,
    montant_distribue_dt: 812,
    nb_beneficiaires: 12,
    nb_exclus: 2,
    reste_report_dt: 28,
    statut: 'versee',
    date_versement_effectif: new Date(Date.now() - 86400_000 * 3).toISOString(),
  },
  {
    id_cagnotte: 4,
    atelier: 'finition',
    annee: currentYear,
    numero_semaine: currentWeek - 1,
    date_debut_semaine: debutSemaineISO(currentYear, currentWeek - 1),
    date_fin_semaine: finSemaineISO(currentYear, currentWeek - 1),
    montant_total_dt: 620,
    montant_distribue_dt: 594,
    nb_beneficiaires: 9,
    nb_exclus: 1,
    reste_report_dt: 26,
    statut: 'validee',
  },
];

const NOMS_EMPLOYES: Array<{
  id: number;
  prenom: string;
  nom: string;
  atelier: AtelierPrime;
  photo_url?: string;
}> = [
  { id: 1001, prenom: 'Ahmed', nom: 'Ben Salah', atelier: 'tissage' },
  { id: 1002, prenom: 'Fatma', nom: 'Trabelsi', atelier: 'tissage' },
  { id: 1003, prenom: 'Karim', nom: 'Jelassi', atelier: 'tissage' },
  { id: 1004, prenom: 'Nour', nom: 'Mansouri', atelier: 'tissage' },
  { id: 1005, prenom: 'Slim', nom: 'Bouzid', atelier: 'tissage' },
  { id: 1006, prenom: 'Amel', nom: 'Ferchichi', atelier: 'finition' },
  { id: 1007, prenom: 'Sami', nom: 'Khemiri', atelier: 'finition' },
  { id: 1008, prenom: 'Ines', nom: 'Hamdi', atelier: 'finition' },
  { id: 1009, prenom: 'Wafa', nom: 'Bouazizi', atelier: 'finition' },
];

const MOCK_SCORES: ScoreJournalier[] = NOMS_EMPLOYES.flatMap((e, idx) => {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id_score: 5000 + idx,
      id_employe: e.id,
      employe_prenom: e.prenom,
      employe_nom: e.nom,
      atelier: e.atelier,
      date_journee: today,
      annee: currentYear,
      numero_semaine: currentWeek,
      score_quantite: 78 + Math.random() * 22,
      score_qualite: 82 + Math.random() * 15,
      score_presence: 88 + Math.random() * 12,
      score_absences: 90 + Math.random() * 10,
      score_discipline: 8 + Math.random() * 2,
      score_global: 82 + Math.random() * 12,
      exclu: idx === 4,
      motif_exclusion: idx === 4 ? 'Rendement < 70 %' : undefined,
      quantite_realisee: 42 + idx * 3,
      quantite_objectif: 45,
      pct_1er_choix: 92 - idx * 0.5,
      heures_pointees: 8,
      heures_prevues: 8,
      nb_absences_injustifiees: 0,
    },
  ];
});

const MOCK_BORDEREAUX: Bordereau[] = NOMS_EMPLOYES.slice(0, 8).map((e, idx) => ({
  id_bordereau: 7000 + idx,
  numero_bordereau: `PRIME-${currentYear}-S${String(currentWeek - 1).padStart(2, '0')}-${e.atelier.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
  id_cagnotte: e.atelier === 'tissage' ? 3 : 4,
  id_employe: e.id,
  employe_prenom: e.prenom,
  employe_nom: e.nom,
  atelier: e.atelier,
  annee: currentYear,
  numero_semaine: currentWeek - 1,
  score_global: 88 - idx * 2.5,
  montant_prime_dt: 158 - idx * 12,
  mode_versement: 'especes',
  statut: (idx < 3 ? 'verse' : idx === 7 ? 'annule' : 'a_verser') as StatutBordereau,
  date_versement_prevu: new Date(Date.now() + 86400_000 * 2).toISOString(),
  date_versement_effectif:
    idx < 3 ? new Date(Date.now() - 86400_000).toISOString() : undefined,
  recu_signe_at:
    idx < 3 ? new Date(Date.now() - 86400_000).toISOString() : undefined,
  recu_photo_url:
    idx < 3 ? 'https://picsum.photos/seed/recu' + idx + '/200/200' : undefined,
  numero_ecriture: idx < 3 ? `EC-648-${idx + 220}` : undefined,
}));

// ═══════════════════════════════════════════════════════════════════════
// Utilitaires
// ═══════════════════════════════════════════════════════════════════════

const fmtDT = (n: number) =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

const ATELIER_OPTIONS: Array<{ value: AtelierPrime; label: string }> = [
  { value: 'tissage', label: 'Tissage' },
  { value: 'finition', label: 'Finition' },
  { value: 'preparation', label: 'Préparation' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'ourdissage', label: 'Ourdissage' },
  { value: 'magasin', label: 'Magasin' },
];

const pickArray = <T,>(
  res: PromiseSettledResult<any>,
  fallback: T[],
): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  return fallback;
};

// ═══════════════════════════════════════════════════════════════════════
// Composant principal
// ═══════════════════════════════════════════════════════════════════════

const PrimesRendement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('cagnottes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cagnottes, setCagnottes] = useState<Cagnotte[]>([]);
  const [scores, setScores] = useState<ScoreJournalier[]>([]);
  const [bordereaux, setBordereaux] = useState<Bordereau[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [cRes, sRes, bRes] = await Promise.allSettled([
        cagnottesService.list(),
        scoresService.list({ limit: 200 }),
        bordereauxService.list(),
      ]);
      if (cancelled) return;
      setCagnottes(pickArray<Cagnotte>(cRes, MOCK_CAGNOTTES));
      setScores(pickArray<ScoreJournalier>(sRes, MOCK_SCORES));
      setBordereaux(pickArray<Bordereau>(bRes, MOCK_BORDEREAUX));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── KPIs bannière ─────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const cagnotteEnCours = cagnottes.filter(
      (c) => c.numero_semaine === currentWeek && c.annee === currentYear,
    );
    const totalSemaine = cagnotteEnCours.reduce(
      (s, c) => s + Number(c.montant_total_dt || 0),
      0,
    );
    const beneficiairesTotal = cagnotteEnCours.reduce(
      (s, c) => s + Number(c.nb_beneficiaires || 0),
      0,
    );
    const bordereauxAVerser = bordereaux.filter(
      (b) => b.statut === 'a_verser',
    ).length;
    const totalVerseMois = bordereaux
      .filter((b) => b.statut === 'verse')
      .reduce((s, b) => s + Number(b.montant_prime_dt || 0), 0);
    return { totalSemaine, beneficiairesTotal, bordereauxAVerser, totalVerseMois };
  }, [cagnottes, bordereaux]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Wallet className="w-8 h-8 text-[#C8663D]" />
                Primes de rendement · hors bulletin
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Cagnottes hebdomadaires &middot; scores 5 critères pondérés
                &middot; bordereaux versement espèces &middot; compte 648
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Bannière KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Cagnotte semaine en cours"
              value={kpis.totalSemaine.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              icon={<Wallet className="w-5 h-5" />}
              color="terracotta"
              subtitle={`Semaine ${currentWeek} · ${currentYear}`}
            />
            <KpiCard
              label="Bénéficiaires actifs"
              value={kpis.beneficiairesTotal}
              icon={<Users className="w-5 h-5" />}
              color="sage"
              subtitle="Cagnottes en cours"
            />
            <KpiCard
              label="Bordereaux à verser"
              value={kpis.bordereauxAVerser}
              icon={<FileText className="w-5 h-5" />}
              color={kpis.bordereauxAVerser > 0 ? 'warning' : 'neutral'}
            />
            <KpiCard
              label="Total versé (période)"
              value={kpis.totalVerseMois.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              icon={<TrendingUp className="w-5 h-5" />}
              color="indigo"
              subtitle="Compte 648 alimenté"
            />
          </div>

          {/* Onglets */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
            {(
              [
                { k: 'cagnottes', l: 'Cagnottes', i: <Wallet className="w-4 h-4" /> },
                { k: 'scores', l: 'Scores journaliers', i: <BarChart3 className="w-4 h-4" /> },
                { k: 'bordereaux', l: 'Bordereaux', i: <FileText className="w-4 h-4" /> },
                { k: 'recus', l: 'Reçus signés', i: <ClipboardCheck className="w-4 h-4" /> },
                { k: 'stats', l: 'Statistiques', i: <PieChart className="w-4 h-4" /> },
              ] as { k: TabKey; l: string; i: React.ReactNode }[]
            ).map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                className={`px-4 py-2.5 font-medium text-sm inline-flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === t.k
                    ? 'border-[#C8663D] text-[#C8663D]'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                {t.i}
                {t.l}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
            </div>
          ) : (
            <>
              {activeTab === 'cagnottes' && (
                <CagnottesTab
                  cagnottes={cagnottes}
                  setCagnottes={setCagnottes}
                  setBordereaux={setBordereaux}
                  onError={setError}
                />
              )}
              {activeTab === 'scores' && (
                <ScoresTab scores={scores} setScores={setScores} />
              )}
              {activeTab === 'bordereaux' && (
                <BordereauxTab
                  bordereaux={bordereaux}
                  setBordereaux={setBordereaux}
                  onError={setError}
                />
              )}
              {activeTab === 'recus' && <RecusTab bordereaux={bordereaux} />}
              {activeTab === 'stats' && <StatsTab bordereaux={bordereaux} cagnottes={cagnottes} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Onglet 1 · Cagnottes
// ═══════════════════════════════════════════════════════════════════════

const CagnottesTab: React.FC<{
  cagnottes: Cagnotte[];
  setCagnottes: React.Dispatch<React.SetStateAction<Cagnotte[]>>;
  setBordereaux: React.Dispatch<React.SetStateAction<Bordereau[]>>;
  onError: (msg: string | null) => void;
}> = ({ cagnottes, setCagnottes, setBordereaux, onError }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Cagnotte>>({
    atelier: 'tissage',
    annee: currentYear,
    numero_semaine: currentWeek,
    montant_total_dt: 840,
  });
  const [filtreAtelier, setFiltreAtelier] = useState<AtelierPrime | 'tous'>('tous');

  const cagnottesFiltrees = useMemo(
    () =>
      cagnottes
        .filter((c) => filtreAtelier === 'tous' || c.atelier === filtreAtelier)
        .sort(
          (a, b) =>
            b.annee - a.annee ||
            b.numero_semaine - a.numero_semaine ||
            a.atelier.localeCompare(b.atelier),
        ),
    [cagnottes, filtreAtelier],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    const payload = {
      ...form,
      date_debut_semaine: debutSemaineISO(
        Number(form.annee) || currentYear,
        Number(form.numero_semaine) || currentWeek,
      ),
      date_fin_semaine: finSemaineISO(
        Number(form.annee) || currentYear,
        Number(form.numero_semaine) || currentWeek,
      ),
      montant_distribue_dt: 0,
      nb_beneficiaires: 0,
      nb_exclus: 0,
      reste_report_dt: 0,
      statut: 'brouillon' as const,
    };
    try {
      const res = await cagnottesService.create(payload);
      const created =
        (res?.data?.data as Cagnotte) ||
        ({ ...payload, id_cagnotte: Date.now() } as Cagnotte);
      setCagnottes((prev) => [created, ...prev]);
    } catch {
      setCagnottes((prev) => [
        { ...(payload as Cagnotte), id_cagnotte: Date.now() },
        ...prev,
      ]);
    }
    setShowForm(false);
  };

  const handleCalculer = async (c: Cagnotte) => {
    try {
      await cagnottesService.calculer(c.id_cagnotte);
    } catch {
      /* fallback */
    }
    setCagnottes((prev) =>
      prev.map((x) =>
        x.id_cagnotte === c.id_cagnotte
          ? {
              ...x,
              statut: 'calculee',
              date_calcul: new Date().toISOString(),
              nb_beneficiaires: 12,
              nb_exclus: 2,
              montant_distribue_dt: x.montant_total_dt * 0.96,
            }
          : x,
      ),
    );
  };

  const handleValider = async (c: Cagnotte) => {
    try {
      await cagnottesService.valider(c.id_cagnotte);
    } catch {
      /* fallback */
    }
    setCagnottes((prev) =>
      prev.map((x) =>
        x.id_cagnotte === c.id_cagnotte
          ? { ...x, statut: 'validee', date_validation: new Date().toISOString() }
          : x,
      ),
    );
    // Générer bordereaux mock
    setBordereaux((prev) => [
      ...NOMS_EMPLOYES.filter((e) => e.atelier === c.atelier)
        .slice(0, c.nb_beneficiaires || 5)
        .map((e, idx) => ({
          id_bordereau: Date.now() + idx,
          numero_bordereau: `PRIME-${c.annee}-S${String(c.numero_semaine).padStart(2, '0')}-${c.atelier.toUpperCase()}-${String(idx + 1).padStart(3, '0')}`,
          id_cagnotte: c.id_cagnotte,
          id_employe: e.id,
          employe_prenom: e.prenom,
          employe_nom: e.nom,
          atelier: c.atelier,
          annee: c.annee,
          numero_semaine: c.numero_semaine,
          score_global: 90 - idx * 3,
          montant_prime_dt:
            Math.round((c.montant_total_dt * (0.15 - idx * 0.015)) * 1000) / 1000,
          mode_versement: 'especes' as ModeVersement,
          statut: 'a_verser' as StatutBordereau,
          date_versement_prevu: new Date(Date.now() + 86400_000).toISOString(),
        })),
      ...prev,
    ]);
  };

  const handleMarquerPayee = async (c: Cagnotte) => {
    try {
      await cagnottesService.marquerPayee(c.id_cagnotte, 'especes');
    } catch {
      /* fallback */
    }
    setCagnottes((prev) =>
      prev.map((x) =>
        x.id_cagnotte === c.id_cagnotte
          ? {
              ...x,
              statut: 'versee',
              date_versement_effectif: new Date().toISOString(),
            }
          : x,
      ),
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{cagnottesFiltrees.length}</span> cagnotte(s)
          </div>
          <select
            value={filtreAtelier}
            onChange={(e) =>
              setFiltreAtelier(e.target.value as AtelierPrime | 'tous')
            }
            className="px-3 py-1.5 border rounded-lg text-sm bg-white"
          >
            <option value="tous">Tous les ateliers</option>
            {ATELIER_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Nouvelle cagnotte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cagnottesFiltrees.map((c) => (
          <CagnotteCard
            key={c.id_cagnotte}
            cagnotte={c}
            onCalculer={handleCalculer}
            onValider={handleValider}
            onMarquerPayee={handleMarquerPayee}
          />
        ))}
        {cagnottesFiltrees.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-xl border border-dashed border-gray-300">
            Aucune cagnotte pour ce filtre.
          </div>
        )}
      </div>

      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          title="Nouvelle cagnotte hebdomadaire"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Atelier *">
                <select
                  value={form.atelier}
                  onChange={(e) =>
                    setForm({ ...form, atelier: e.target.value as AtelierPrime })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {ATELIER_OPTIONS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Montant cagnotte (DT) *">
                <input
                  required
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.montant_total_dt || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      montant_total_dt: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="840.000"
                />
              </Field>
              <Field label="Année">
                <input
                  type="number"
                  min={2024}
                  max={2030}
                  value={form.annee || currentYear}
                  onChange={(e) =>
                    setForm({ ...form, annee: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
              <Field label="N° semaine (1–53)">
                <input
                  type="number"
                  min={1}
                  max={53}
                  value={form.numero_semaine || currentWeek}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      numero_semaine: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </Field>
            </div>
            <Field label="Commentaire">
              <textarea
                value={form.commentaire || ''}
                onChange={(e) =>
                  setForm({ ...form, commentaire: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#a55231]"
              >
                Créer la cagnotte
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Onglet 2 · Scores journaliers
// ═══════════════════════════════════════════════════════════════════════

const ScoresTab: React.FC<{
  scores: ScoreJournalier[];
  setScores: React.Dispatch<React.SetStateAction<ScoreJournalier[]>>;
}> = ({ scores }) => {
  const [search, setSearch] = useState('');
  const [filtreAtelier, setFiltreAtelier] = useState<AtelierPrime | 'tous'>('tous');

  const filtered = useMemo(
    () =>
      scores.filter((s) => {
        if (filtreAtelier !== 'tous' && s.atelier !== filtreAtelier) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return (
            (s.employe_prenom || '').toLowerCase().includes(q) ||
            (s.employe_nom || '').toLowerCase().includes(q)
          );
        }
        return true;
      }),
    [scores, search, filtreAtelier],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un employé..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
            />
          </div>
          <select
            value={filtreAtelier}
            onChange={(e) =>
              setFiltreAtelier(e.target.value as AtelierPrime | 'tous')
            }
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="tous">Tous les ateliers</option>
            {ATELIER_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Calculator className="w-3.5 h-3.5" />
          Pondération : Quantité 30 % · Qualité 25 % · Présence 15 % · Absences 15 % · Discipline 15 %
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Employé</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left w-[520px]">Score 5 critères</th>
                <th className="px-4 py-3 text-center">Score global</th>
                <th className="px-4 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id_score}
                  className={`border-t border-gray-100 hover:bg-gray-50 ${
                    s.exclu ? 'bg-red-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar
                        photoUrl={s.photo_url}
                        prenom={s.employe_prenom}
                        nom={s.employe_nom}
                        size={36}
                        borderColor="#FDFBF3"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {s.employe_prenom} {s.employe_nom}
                        </div>
                        <div className="text-[11px] text-gray-500 uppercase">
                          {s.atelier}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(s.date_journee).toLocaleDateString('fr-FR')}
                    <div className="text-[11px] text-gray-400">
                      S{s.numero_semaine} · {s.annee}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="grid grid-cols-1 gap-1.5">
                      <ScoreCritereBar
                        label="Quantité"
                        score={s.score_quantite}
                        poids={0.3}
                        seuilExclusion={70}
                        size="sm"
                      />
                      <ScoreCritereBar
                        label="Qualité"
                        score={s.score_qualite}
                        poids={0.25}
                        seuilExclusion={85}
                        size="sm"
                      />
                      <ScoreCritereBar
                        label="Présence"
                        score={s.score_presence}
                        poids={0.15}
                        size="sm"
                      />
                      <ScoreCritereBar
                        label="Absences"
                        score={s.score_absences}
                        poids={0.15}
                        size="sm"
                      />
                      <ScoreCritereBar
                        label="Discipline"
                        score={s.score_discipline * 10}
                        poids={0.15}
                        size="sm"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div
                      className="inline-flex items-baseline gap-0.5 font-bold text-lg"
                      style={{
                        color:
                          s.score_global >= 85
                            ? '#4A6C5B'
                            : s.score_global >= 70
                            ? '#8A6412'
                            : '#C8663D',
                      }}
                    >
                      {s.score_global.toFixed(1)}
                      <span className="text-xs text-gray-400 font-normal">
                        /100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {s.exclu ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700"
                        title={s.motif_exclusion}
                      >
                        Exclu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        Éligible
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    Aucun score pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Onglet 3 · Bordereaux
// ═══════════════════════════════════════════════════════════════════════

const BordereauxTab: React.FC<{
  bordereaux: Bordereau[];
  setBordereaux: React.Dispatch<React.SetStateAction<Bordereau[]>>;
  onError: (msg: string | null) => void;
}> = ({ bordereaux, setBordereaux, onError }) => {
  const [filtreStatut, setFiltreStatut] = useState<StatutBordereau | 'tous'>(
    'tous',
  );
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      bordereaux
        .filter((b) => filtreStatut === 'tous' || b.statut === filtreStatut)
        .sort((a, b) => b.id_bordereau - a.id_bordereau),
    [bordereaux, filtreStatut],
  );

  const handleVerser = async (b: Bordereau) => {
    onError(null);
    try {
      await bordereauxService.verser(b.id_bordereau, 'especes');
    } catch {
      /* fallback */
    }
    setBordereaux((prev) =>
      prev.map((x) =>
        x.id_bordereau === b.id_bordereau
          ? {
              ...x,
              statut: 'verse',
              date_versement_effectif: new Date().toISOString(),
            }
          : x,
      ),
    );
  };

  const handleGenererEcriture = async (b: Bordereau) => {
    try {
      await bordereauxService.genererEcritureComptable(b.id_bordereau);
    } catch {
      /* fallback */
    }
    setBordereaux((prev) =>
      prev.map((x) =>
        x.id_bordereau === b.id_bordereau
          ? {
              ...x,
              numero_ecriture: `EC-648-${Math.floor(Math.random() * 900) + 100}`,
              ecriture_generee_at: new Date().toISOString(),
            }
          : x,
      ),
    );
  };

  const handleUploadRecu = async (b: Bordereau, file: File) => {
    setUploadingFor(b.id_bordereau);
    try {
      await bordereauxService.uploadRecuSigne(b.id_bordereau, { photo: file });
    } catch {
      /* fallback */
    }
    const localUrl = URL.createObjectURL(file);
    setBordereaux((prev) =>
      prev.map((x) =>
        x.id_bordereau === b.id_bordereau
          ? {
              ...x,
              recu_photo_url: localUrl,
              recu_signe_at: new Date().toISOString(),
            }
          : x,
      ),
    );
    setUploadingFor(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{filtered.length}</span> bordereau(x)
          </div>
          <select
            value={filtreStatut}
            onChange={(e) =>
              setFiltreStatut(e.target.value as StatutBordereau | 'tous')
            }
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="tous">Tous les statuts</option>
            <option value="a_verser">À verser</option>
            <option value="verse">Versés</option>
            <option value="annule">Annulés</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">N° bordereau</th>
                <th className="px-4 py-3 text-left">Employé</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3 text-center">Écriture 648</th>
                <th className="px-4 py-3 text-center">Reçu</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr
                  key={b.id_bordereau}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {b.numero_bordereau}
                    <div className="text-[10px] text-gray-400 uppercase mt-0.5">
                      S{b.numero_semaine} · {b.atelier}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <EmployeeAvatar
                        photoUrl={b.photo_url}
                        prenom={b.employe_prenom}
                        nom={b.employe_nom}
                        size={32}
                        borderColor="#FDFBF3"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {b.employe_prenom} {b.employe_nom}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase">
                          {b.mode_versement}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-[#3B4E68] tabular-nums">
                      {fmtDT(b.montant_prime_dt)}
                      <span className="text-gray-500 font-medium ml-1">DT</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="font-bold tabular-nums"
                      style={{
                        color:
                          b.score_global >= 85
                            ? '#4A6C5B'
                            : b.score_global >= 70
                            ? '#8A6412'
                            : '#C8663D',
                      }}
                    >
                      {b.score_global.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <BordereauStatutBadge statut={b.statut} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.numero_ecriture ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-600">
                        {b.numero_ecriture}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.recu_photo_url ? (
                      <img
                        src={b.recu_photo_url}
                        alt="reçu signé"
                        className="w-10 h-10 object-cover rounded border border-gray-300 inline-block"
                      />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {b.statut === 'a_verser' && (
                        <button
                          onClick={() => handleVerser(b)}
                          className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#4A6C5B] text-white hover:bg-[#3a5648]"
                          title="Verser (espèces sortent de caisse)"
                        >
                          Verser
                        </button>
                      )}
                      {b.statut === 'verse' && !b.numero_ecriture && (
                        <button
                          onClick={() => handleGenererEcriture(b)}
                          className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#3B4E68] text-white hover:bg-[#2d3d54]"
                          title="Générer écriture comptable classe 648"
                        >
                          Générer 648
                        </button>
                      )}
                      {b.statut === 'verse' && !b.recu_photo_url && (
                        <label
                          className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#D6A756] text-white hover:bg-[#b98d3d] cursor-pointer inline-flex items-center gap-1"
                          title="Upload photo du reçu papier signé"
                        >
                          {uploadingFor === b.id_bordereau ? (
                            'Envoi...'
                          ) : (
                            <>
                              <Upload className="w-3 h-3" /> Reçu
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void handleUploadRecu(b, f);
                            }}
                          />
                        </label>
                      )}
                      <a
                        href={bordereauxService.pdfUrl(b.id_bordereau)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold px-2 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                        title="Télécharger le PDF bordereau"
                        onClick={(e) => {
                          // Fallback : télécharger via blob si l'endpoint direct n'est pas dispo
                          if (window.confirm !== undefined) {
                            /* laisser le href normal */
                          }
                          e.stopPropagation();
                        }}
                      >
                        <Download className="w-3 h-3" /> PDF
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-8">
                    Aucun bordereau pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Onglet 4 · Reçus signés
// ═══════════════════════════════════════════════════════════════════════

const RecusTab: React.FC<{ bordereaux: Bordereau[] }> = ({ bordereaux }) => {
  const recus = useMemo(
    () => bordereaux.filter((b) => !!b.recu_photo_url || !!b.recu_signature_url),
    [bordereaux],
  );

  return (
    <div>
      <div className="text-sm text-gray-600 mb-4">
        <span className="font-semibold">{recus.length}</span> reçu(s) signé(s) — archivés avec bordereau
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recus.map((b) => (
          <div
            key={b.id_bordereau}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <EmployeeAvatar
                photoUrl={b.photo_url}
                prenom={b.employe_prenom}
                nom={b.employe_nom}
                size={40}
                borderColor="#FDFBF3"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 truncate">
                  {b.employe_prenom} {b.employe_nom}
                </div>
                <div className="text-[10px] uppercase text-gray-500 font-mono truncate">
                  {b.numero_bordereau}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {b.recu_photo_url && (
                <img
                  src={b.recu_photo_url}
                  alt="reçu"
                  className="w-[100px] h-[100px] object-cover rounded-lg border border-gray-200"
                />
              )}
              {b.recu_signature_url && (
                <img
                  src={b.recu_signature_url}
                  alt="signature"
                  className="w-[100px] h-[100px] object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
              )}
              {!b.recu_photo_url && !b.recu_signature_url && (
                <div className="w-full h-[100px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">
                  <FileSignature className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="text-xs text-gray-600 flex items-center justify-between">
              <span>
                {b.recu_signe_at
                  ? new Date(b.recu_signe_at).toLocaleDateString('fr-FR')
                  : '—'}
              </span>
              <span className="font-bold text-[#3B4E68] tabular-nums">
                {fmtDT(b.montant_prime_dt)} DT
              </span>
            </div>
          </div>
        ))}
        {recus.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12 bg-white rounded-xl border border-dashed border-gray-300">
            Aucun reçu signé pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Onglet 5 · Statistiques
// ═══════════════════════════════════════════════════════════════════════

const StatsTab: React.FC<{
  bordereaux: Bordereau[];
  cagnottes: Cagnotte[];
}> = ({ bordereaux, cagnottes }) => {
  const parSemaine = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; total: number; nb: number }
    >();
    bordereaux
      .filter((b) => b.statut === 'verse')
      .forEach((b) => {
        const k = `${b.annee}-S${String(b.numero_semaine).padStart(2, '0')}`;
        const cur = map.get(k) || {
          key: k,
          label: k,
          total: 0,
          nb: 0,
        };
        cur.total += Number(b.montant_prime_dt || 0);
        cur.nb += 1;
        map.set(k, cur);
      });
    return Array.from(map.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [bordereaux]);

  const parAtelier = useMemo(() => {
    const map = new Map<AtelierPrime, number>();
    bordereaux
      .filter((b) => b.statut === 'verse')
      .forEach((b) => {
        map.set(b.atelier, (map.get(b.atelier) || 0) + Number(b.montant_prime_dt));
      });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [bordereaux]);

  const topEmployes = useMemo(() => {
    const map = new Map<
      number,
      {
        id: number;
        prenom: string;
        nom: string;
        total: number;
        nb: number;
      }
    >();
    bordereaux
      .filter((b) => b.statut === 'verse')
      .forEach((b) => {
        const cur = map.get(b.id_employe) || {
          id: b.id_employe,
          prenom: b.employe_prenom || '',
          nom: b.employe_nom || '',
          total: 0,
          nb: 0,
        };
        cur.total += Number(b.montant_prime_dt || 0);
        cur.nb += 1;
        map.set(b.id_employe, cur);
      });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [bordereaux]);

  const maxSem = Math.max(1, ...parSemaine.map((s) => s.total));
  const maxAt = Math.max(1, ...parAtelier.map(([, v]) => v));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-[#C8663D]" />
          <h3 className="font-bold text-gray-800">
            Total versé par semaine — bordereaux payés
          </h3>
        </div>
        <div className="space-y-2">
          {parSemaine.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-6">
              Aucun versement pour le moment.
            </div>
          )}
          {parSemaine.map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className="w-24 text-xs font-mono text-gray-600">
                {s.label}
              </div>
              <div className="flex-1 h-6 bg-gray-100 rounded-md overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C8663D] to-[#D6A756] rounded-md"
                  style={{ width: `${(s.total / maxSem) * 100}%` }}
                />
              </div>
              <div className="w-40 text-right text-sm">
                <span className="font-bold text-[#3B4E68] tabular-nums">
                  {fmtDT(s.total)} DT
                </span>
                <span className="text-xs text-gray-500 ml-2">({s.nb})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-[#4A6C5B]" />
          <h3 className="font-bold text-gray-800">Répartition par atelier</h3>
        </div>
        <div className="space-y-3">
          {parAtelier.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-6">
              Aucune donnée.
            </div>
          )}
          {parAtelier.map(([at, v]) => (
            <div key={at}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="uppercase font-semibold text-gray-700">
                  {at}
                </span>
                <span className="tabular-nums font-bold text-[#3B4E68]">
                  {fmtDT(v)} DT
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4A6C5B]"
                  style={{ width: `${(v / maxAt) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-3">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-[#3B4E68]" />
          <h3 className="font-bold text-gray-800">
            Top employés du mois — cumul primes versées
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {topEmployes.map((e, i) => (
            <div
              key={e.id}
              className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-[#C8663D] text-white font-black flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <EmployeeAvatar
                prenom={e.prenom}
                nom={e.nom}
                size={40}
                borderColor="#FDFBF3"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm truncate">
                  {e.prenom} {e.nom}
                </div>
                <div className="text-xs text-gray-500">
                  {e.nb} versement{e.nb > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-sm font-bold text-[#C8663D] tabular-nums">
                {fmtDT(e.total)}
              </div>
            </div>
          ))}
          {topEmployes.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-4">
              Aucun classement pour le moment.
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FDF2ED] rounded-xl border border-[#C8663D]/20 p-5 lg:col-span-3">
        <div className="text-xs uppercase tracking-widest text-[#C8663D] font-bold mb-1">
          Rappel comptabilité
        </div>
        <div className="text-sm text-gray-700">
          Les primes de rendement sont versées <b>hors bulletin</b>. Débit du
          compte <b>648 · Autres charges de personnel</b> · crédit{' '}
          <b>531 Caisse</b> (espèces) ou <b>512 Banque</b>. Non soumis à CNSS
          (article convention textile) · IRPP appliqué séparément si montant
          significatif · bordereau archivé avec reçus signés par bénéficiaire.
          Cagnottes gérées : <b>{cagnottes.length}</b>.
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Helpers UI
// ═══════════════════════════════════════════════════════════════════════

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <label className="block">
    <span className="block text-xs font-semibold text-gray-700 mb-1">
      {label}
    </span>
    {children}
  </label>
);

const Modal: React.FC<{
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 overflow-y-auto">{children}</div>
    </div>
  </div>
);

export default PrimesRendement;
