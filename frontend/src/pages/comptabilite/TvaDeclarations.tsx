import React, { useEffect, useMemo, useState } from 'react';
import {
  Percent,
  Sparkles,
  FileDown,
  CheckCircle2,
  Filter,
  Wallet,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import {
  tvaService,
  DeclarationTva,
  StatutDeclarationTva,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — Déclarations TVA §10.3
// ═══════════════════════════════════════════════════════════════════

const MOCK_DECLARATIONS: DeclarationTva[] = [
  {
    id_declaration: 202609,
    periode: '2026-09',
    tva_collectee: 31500,
    tva_deductible: 20800,
    tva_due: 10700,
    statut: 'en_preparation',
    detail: {
      collectee_19: 28500,
      collectee_13: 2100,
      collectee_7: 900,
      deductible_biens: 15400,
      deductible_services: 4200,
      deductible_immo: 1200,
    },
  },
  {
    id_declaration: 202608,
    periode: '2026-08',
    tva_collectee: 28900,
    tva_deductible: 18400,
    tva_due: 10500,
    date_declaration: '2026-09-10',
    date_paiement: '2026-09-14',
    statut: 'payee',
    pdf_url: '/pdf/tva-2026-08.pdf',
    detail: {
      collectee_19: 26200,
      collectee_13: 1900,
      collectee_7: 800,
      deductible_biens: 13500,
      deductible_services: 3800,
      deductible_immo: 1100,
    },
  },
  {
    id_declaration: 202607,
    periode: '2026-07',
    tva_collectee: 26200,
    tva_deductible: 22800,
    tva_due: 3400,
    date_declaration: '2026-08-11',
    date_paiement: '2026-08-15',
    statut: 'payee',
    detail: {
      collectee_19: 23800,
      collectee_13: 1700,
      collectee_7: 700,
      deductible_biens: 18400,
      deductible_services: 3200,
      deductible_immo: 1200,
    },
  },
  {
    id_declaration: 202606,
    periode: '2026-06',
    tva_collectee: 32100,
    tva_deductible: 24500,
    tva_due: 7600,
    date_declaration: '2026-07-12',
    date_paiement: '2026-07-14',
    statut: 'payee',
  },
  {
    id_declaration: 202605,
    periode: '2026-05',
    tva_collectee: 24800,
    tva_deductible: 20100,
    tva_due: 4700,
    date_declaration: '2026-06-10',
    date_paiement: '2026-06-15',
    statut: 'payee',
  },
  {
    id_declaration: 202610,
    periode: '2026-10',
    tva_collectee: 0,
    tva_deductible: 0,
    tva_due: 0,
    statut: 'en_preparation',
  },
];

const STATUT_CONFIG: Record<StatutDeclarationTva, { label: string; classes: string }> = {
  en_preparation: {
    label: 'En préparation',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  soumise: {
    label: 'Soumise',
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  payee: {
    label: 'Payée',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
};

const TvaDeclarations: React.FC = () => {
  const [declarations, setDeclarations] = useState<DeclarationTva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<StatutDeclarationTva | 'all'>('all');
  const [detail, setDetail] = useState<DeclarationTva | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([tvaService.getDeclarations()]);
      if (cancelled) return;
      const pick = (res: PromiseSettledResult<any>): DeclarationTva[] => {
        if (res.status !== 'fulfilled') return MOCK_DECLARATIONS;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.declarations)) return d.declarations;
        return MOCK_DECLARATIONS;
      };
      setDeclarations(pick(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (filterStatut === 'all') return declarations;
    return declarations.filter((d) => d.statut === filterStatut);
  }, [declarations, filterStatut]);

  const kpis = useMemo(() => {
    const enCours = declarations.filter((d) => d.statut === 'en_preparation').length;
    const dueTotal = declarations
      .filter((d) => d.statut !== 'payee')
      .reduce((s, d) => s + Number(d.tva_due || 0), 0);
    const collecteeYTD = declarations.reduce((s, d) => s + Number(d.tva_collectee || 0), 0);
    const deductibleYTD = declarations.reduce((s, d) => s + Number(d.tva_deductible || 0), 0);
    return { enCours, dueTotal, collecteeYTD, deductibleYTD };
  }, [declarations]);

  const periodeCourante = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const handleGenerer = async () => {
    if (!window.confirm(`Générer la déclaration TVA du mois courant (${periodeCourante}) ?`)) return;
    try {
      await tvaService.genererDeclaration(periodeCourante);
    } catch {
      /* mock */
    }
    setDeclarations((prev) => {
      const exist = prev.find((d) => d.periode === periodeCourante);
      if (exist) return prev;
      return [
        {
          id_declaration: Date.now(),
          periode: periodeCourante,
          tva_collectee: 0,
          tva_deductible: 0,
          tva_due: 0,
          statut: 'en_preparation',
        },
        ...prev,
      ];
    });
    alert('Déclaration générée. Vérifiez les montants avant soumission.');
  };

  const handleMarquerPayee = async (d: DeclarationTva) => {
    const date = window.prompt('Date de paiement (YYYY-MM-DD) :', new Date().toISOString().slice(0, 10));
    if (!date) return;
    try {
      await tvaService.marquerPayee(d.periode, date);
    } catch {
      /* mock */
    }
    setDeclarations((prev) =>
      prev.map((x) =>
        x.id_declaration === d.id_declaration
          ? { ...x, statut: 'payee', date_paiement: date }
          : x
      )
    );
  };

  if (loading) {
    return (
      <div className="ml-64 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-64 p-6">
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
                <Percent className="w-8 h-8 text-[#C8663D]" />
                Déclarations TVA
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Déclarations mensuelles TVA · formulaire tunisien standard (§10.3)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerer}
                className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Générer déclaration mois courant
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="TVA collectée YTD" value={kpis.collecteeYTD.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="terracotta" subtitle="Compte 44551" />
            <KpiCard label="TVA déductible YTD" value={kpis.deductibleYTD.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="sage" subtitle="Compte 44561" />
            <KpiCard label="TVA due à payer" value={kpis.dueTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color={kpis.dueTotal > 0 ? 'warning' : 'sage'} subtitle="Non payé" />
            <KpiCard label="Déclarations en cours" value={kpis.enCours} color="indigo" subtitle="À finaliser" />
          </div>

          {/* Filtre */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5"
            >
              <option value="all">Tous statuts</option>
              <option value="en_preparation">En préparation</option>
              <option value="soumise">Soumises</option>
              <option value="payee">Payées</option>
            </select>
            <div className="text-sm text-gray-500 ml-auto">
              {filtered.length} déclaration(s)
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Période</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">TVA collectée</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">TVA déductible</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">TVA due / crédit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Dates</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => {
                  const cfg = STATUT_CONFIG[d.statut];
                  const credit = d.tva_due < 0;
                  return (
                    <tr key={d.id_declaration} className="hover:bg-[#FDF2ED]/40">
                      <td className="px-4 py-3">
                        <div
                          className="font-mono font-semibold text-[#3B4E68] text-base"
                          style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                        >
                          {d.periode}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={d.tva_collectee} devise="" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={d.tva_deductible} devise="" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={d.tva_due} devise="" bold />
                        {credit && (
                          <div className="text-[10px] text-emerald-700 mt-0.5 font-semibold uppercase">
                            Crédit TVA
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.classes}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {d.date_declaration && (
                          <div>
                            Dépôt : {new Date(d.date_declaration).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        {d.date_paiement && (
                          <div className="text-emerald-700">
                            Payé : {new Date(d.date_paiement).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        {!d.date_declaration && (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDetail(d)}
                          className="text-xs text-[#3B4E68] hover:text-[#C8663D] mr-2 inline-flex items-center gap-1 font-medium"
                        >
                          Détail
                        </button>
                        {d.statut !== 'payee' && (
                          <button
                            onClick={() => handleMarquerPayee(d)}
                            className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 inline-flex items-center gap-1"
                          >
                            <Wallet className="w-3 h-3" /> Marquer payée
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Aucune déclaration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal détail */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gradient-to-r from-[#FDF2ED] to-white border-b">
              <h3
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
              >
                Déclaration TVA{' '}
                <span
                  className="font-mono text-[#C8663D]"
                  style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                >
                  {detail.periode}
                </span>
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FDF2ED] p-3 rounded-lg">
                  <div className="text-xs text-[#C8663D] uppercase font-semibold mb-2">
                    TVA collectée
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Taux 19%</span>
                      <MontantCell value={detail.detail?.collectee_19 || 0} devise="" />
                    </div>
                    <div className="flex justify-between">
                      <span>Taux 13%</span>
                      <MontantCell value={detail.detail?.collectee_13 || 0} devise="" />
                    </div>
                    <div className="flex justify-between">
                      <span>Taux 7%</span>
                      <MontantCell value={detail.detail?.collectee_7 || 0} devise="" />
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#C8663D]/30 font-bold">
                      <span>Total</span>
                      <MontantCell value={detail.tva_collectee} devise="" bold />
                    </div>
                  </div>
                </div>
                <div className="bg-[#EEF4F0] p-3 rounded-lg">
                  <div className="text-xs text-[#4A6C5B] uppercase font-semibold mb-2">
                    TVA déductible
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Biens (44561)</span>
                      <MontantCell value={detail.detail?.deductible_biens || 0} devise="" />
                    </div>
                    <div className="flex justify-between">
                      <span>Services</span>
                      <MontantCell value={detail.detail?.deductible_services || 0} devise="" />
                    </div>
                    <div className="flex justify-between">
                      <span>Immobilisations</span>
                      <MontantCell value={detail.detail?.deductible_immo || 0} devise="" />
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#4A6C5B]/30 font-bold">
                      <span>Total</span>
                      <MontantCell value={detail.tva_deductible} devise="" bold />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#3B4E68] to-[#4A5D75] p-4 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    TVA à payer (44571)
                  </span>
                  <span
                    className="text-2xl font-bold font-mono"
                    style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                  >
                    {Number(detail.tva_due).toLocaleString('fr-FR', {
                      minimumFractionDigits: 3,
                    })}{' '}
                    DT
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <button className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                  <FileDown className="w-4 h-4" /> Télécharger PDF déclaration
                </button>
                {detail.statut === 'en_preparation' && (
                  <button className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> Soumettre
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TvaDeclarations;
