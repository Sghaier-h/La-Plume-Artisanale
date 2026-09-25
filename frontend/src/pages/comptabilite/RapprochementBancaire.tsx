import React, { useEffect, useMemo, useState } from 'react';
import {
  Landmark,
  Link2,
  Unlink,
  Upload,
  Search,
  Wand2,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import {
  rapprochementService,
  LigneReleveBancaire,
  EcritureBanque,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — 5121 Banque BIAT TND
// ═══════════════════════════════════════════════════════════════════

const MOCK_LIGNES_RELEVE: LigneReleveBancaire[] = [
  {
    id_ligne_releve: 1,
    id_releve: 1,
    date_operation: '2026-09-22',
    libelle_bancaire: 'VIR SEPA HOTEL MARINA DJERBA FACT 0128',
    montant_credit: 8420,
    reference_operation: 'VIR-89452',
    statut: 'rapprochee',
    id_ecriture_rapprochee: 8003,
  },
  {
    id_ligne_releve: 2,
    id_releve: 1,
    date_operation: '2026-09-21',
    libelle_bancaire: 'PRLV FILATURE TUNISIE FCT 892',
    montant_debit: 14875,
    reference_operation: 'PRLV-77812',
    statut: 'non_rapprochee',
  },
  {
    id_ligne_releve: 3,
    id_releve: 1,
    date_operation: '2026-09-20',
    libelle_bancaire: 'VIR SEPA BOUTIQUE EL MENZAH',
    montant_credit: 4760,
    reference_operation: 'VIR-89320',
    statut: 'non_rapprochee',
  },
  {
    id_ligne_releve: 4,
    id_releve: 1,
    date_operation: '2026-09-19',
    libelle_bancaire: 'FRAIS TENUE COMPTE',
    montant_debit: 45,
    reference_operation: 'FRAIS-091926',
    statut: 'non_rapprochee',
  },
  {
    id_ligne_releve: 5,
    id_releve: 1,
    date_operation: '2026-09-18',
    libelle_bancaire: 'CHQ 4562123 STEG ÉLECTRICITÉ',
    montant_debit: 3200,
    reference_operation: 'CHQ-4562123',
    statut: 'en_litige',
    notes: 'Montant divergent (facture 3145 DT)',
  },
  {
    id_ligne_releve: 6,
    id_releve: 1,
    date_operation: '2026-09-15',
    libelle_bancaire: 'VIR SEPA HAMMAM PARIS',
    montant_credit: 12480,
    reference_operation: 'VIR-88901',
    statut: 'rapprochee',
    id_ecriture_rapprochee: 8010,
  },
];

const MOCK_ECRITURES_BANQUE: EcritureBanque[] = [
  {
    id_ligne: 101,
    id_ecriture: 8003,
    date_ecriture: '2026-09-22',
    libelle: 'Encaissement Marina Djerba — solde VE-0128',
    debit: 8420,
    credit: 0,
    numero_compte: '5111',
    rapprochee: true,
    id_ligne_releve: 1,
  },
  {
    id_ligne: 102,
    id_ecriture: 8020,
    date_ecriture: '2026-09-21',
    libelle: 'Paiement Filature Tunisie — FCT 892',
    debit: 0,
    credit: 14875,
    numero_compte: '5111',
    rapprochee: false,
  },
  {
    id_ligne: 103,
    id_ecriture: 8021,
    date_ecriture: '2026-09-20',
    libelle: 'Encaissement Boutique El Menzah',
    debit: 4760,
    credit: 0,
    numero_compte: '5111',
    rapprochee: false,
  },
  {
    id_ligne: 104,
    id_ecriture: 8010,
    date_ecriture: '2026-09-15',
    libelle: 'Encaissement Hammam Paris',
    debit: 12480,
    credit: 0,
    numero_compte: '5111',
    rapprochee: true,
    id_ligne_releve: 6,
  },
  {
    id_ligne: 105,
    id_ecriture: 8022,
    date_ecriture: '2026-09-19',
    libelle: 'Commission bancaire tenue de compte',
    debit: 0,
    credit: 45,
    numero_compte: '5111',
    rapprochee: false,
  },
];

const RapprochementBancaire: React.FC = () => {
  const [lignesReleve, setLignesReleve] = useState<LigneReleveBancaire[]>([]);
  const [ecritures, setEcritures] = useState<EcritureBanque[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReleve, setSelectedReleve] = useState<LigneReleveBancaire | null>(null);
  const [selectedEcriture, setSelectedEcriture] = useState<EcritureBanque | null>(null);
  const [dragOverRef, setDragOverRef] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        rapprochementService.getLignesNonRapprochees(1),
        rapprochementService.getEcrituresBanque({ compte: '5111' }),
      ]);
      if (cancelled) return;
      const pickReleve = (res: PromiseSettledResult<any>): LigneReleveBancaire[] => {
        if (res.status !== 'fulfilled') return MOCK_LIGNES_RELEVE;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.lignes)) return d.lignes;
        return MOCK_LIGNES_RELEVE;
      };
      const pickEcr = (res: PromiseSettledResult<any>): EcritureBanque[] => {
        if (res.status !== 'fulfilled') return MOCK_ECRITURES_BANQUE;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.ecritures)) return d.ecritures;
        return MOCK_ECRITURES_BANQUE;
      };
      setLignesReleve(pickReleve(r[0]));
      setEcritures(pickEcr(r[1]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const nonRappr = lignesReleve.filter((l) => l.statut === 'non_rapprochee');
    const montantNonRappr = nonRappr.reduce(
      (s, l) => s + (Number(l.montant_credit || 0) - Number(l.montant_debit || 0)),
      0
    );
    const soldeReleve = lignesReleve.reduce(
      (s, l) => s + (Number(l.montant_credit || 0) - Number(l.montant_debit || 0)),
      0
    );
    const soldeErp = ecritures.reduce(
      (s, e) => s + (Number(e.debit || 0) - Number(e.credit || 0)),
      0
    );
    return {
      nonRappr: nonRappr.length,
      total: lignesReleve.length,
      montantNonRappr,
      ecart: soldeReleve - soldeErp,
    };
  }, [lignesReleve, ecritures]);

  const handleMatcher = async (
    ligne: LigneReleveBancaire,
    ecriture: EcritureBanque
  ) => {
    try {
      await rapprochementService.matcher({
        id_ligne_releve: ligne.id_ligne_releve,
        id_ecriture: ecriture.id_ecriture,
      });
    } catch {
      /* mock */
    }
    setLignesReleve((prev) =>
      prev.map((l) =>
        l.id_ligne_releve === ligne.id_ligne_releve
          ? { ...l, statut: 'rapprochee', id_ecriture_rapprochee: ecriture.id_ecriture }
          : l
      )
    );
    setEcritures((prev) =>
      prev.map((e) =>
        e.id_ecriture === ecriture.id_ecriture
          ? { ...e, rapprochee: true, id_ligne_releve: ligne.id_ligne_releve }
          : e
      )
    );
    setSelectedReleve(null);
    setSelectedEcriture(null);
  };

  const handleDemarcher = async (ligne: LigneReleveBancaire) => {
    if (!window.confirm('Défaire ce rapprochement ?')) return;
    try {
      await rapprochementService.demarcher(ligne.id_ligne_releve);
    } catch {
      /* mock */
    }
    const idEcr = ligne.id_ecriture_rapprochee;
    setLignesReleve((prev) =>
      prev.map((l) =>
        l.id_ligne_releve === ligne.id_ligne_releve
          ? { ...l, statut: 'non_rapprochee', id_ecriture_rapprochee: undefined }
          : l
      )
    );
    if (idEcr) {
      setEcritures((prev) =>
        prev.map((e) =>
          e.id_ecriture === idEcr ? { ...e, rapprochee: false, id_ligne_releve: undefined } : e
        )
      );
    }
  };

  const handleAutoMatch = () => {
    // Auto-match : montant + tolérance de date ±3 jours
    let matched = 0;
    lignesReleve
      .filter((l) => l.statut === 'non_rapprochee')
      .forEach((ligne) => {
        const cible = Number(ligne.montant_credit || 0) - Number(ligne.montant_debit || 0);
        const candidat = ecritures.find((e) => {
          if (e.rapprochee) return false;
          const solde = Number(e.debit || 0) - Number(e.credit || 0);
          const ecart = Math.abs(cible - solde);
          const dj = Math.abs(
            new Date(e.date_ecriture).getTime() - new Date(ligne.date_operation).getTime()
          );
          return ecart < 0.01 && dj <= 3 * 86400000;
        });
        if (candidat) {
          handleMatcher(ligne, candidat);
          matched++;
        }
      });
    alert(`Auto-match : ${matched} ligne(s) rapprochée(s).`);
  };

  const filteredReleve = useMemo(() => {
    if (!search) return lignesReleve;
    const q = search.toLowerCase();
    return lignesReleve.filter(
      (l) =>
        l.libelle_bancaire.toLowerCase().includes(q) ||
        (l.reference_operation || '').toLowerCase().includes(q)
    );
  }, [lignesReleve, search]);

  const filteredEcr = useMemo(() => {
    if (!search) return ecritures;
    const q = search.toLowerCase();
    return ecritures.filter((e) => e.libelle.toLowerCase().includes(q));
  }, [ecritures, search]);

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
                <Landmark className="w-8 h-8 text-[#C8663D]" />
                Rapprochement bancaire
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Banque BIAT TND · Compte 5111 · Septembre 2026 (§10.5)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAutoMatch}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Wand2 className="w-4 h-4 text-[#7A8C6A]" /> Auto-match
              </button>
              <button className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] shadow-sm">
                <Upload className="w-4 h-4" /> Importer relevé PDF/CSV
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Lignes non rapprochées"
              value={kpis.nonRappr}
              color={kpis.nonRappr > 0 ? 'warning' : 'sage'}
              subtitle={`sur ${kpis.total} au total`}
            />
            <KpiCard
              label="Montant en attente"
              value={kpis.montantNonRappr.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              color="terracotta"
            />
            <KpiCard
              label="Écart banque / ERP"
              value={kpis.ecart.toLocaleString('fr-FR', { maximumFractionDigits: 3 })}
              suffix="DT"
              color={Math.abs(kpis.ecart) < 0.01 ? 'sage' : 'warning'}
            />
            <KpiCard
              label="Progression"
              value={`${Math.round(
                ((kpis.total - kpis.nonRappr) / Math.max(1, kpis.total)) * 100
              )}%`}
              color="indigo"
            />
          </div>

          {/* Barre recherche */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher libellé, référence…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="text-xs text-gray-500">
              Astuce : sélectionnez une ligne à gauche <span className="mx-1">↔</span> une écriture à droite → bouton{' '}
              <span className="inline-flex items-center gap-1 bg-[#C8663D] text-white px-2 py-0.5 rounded text-[10px]">
                <Link2 className="w-3 h-3" /> Matcher
              </span>
            </div>
          </div>

          {/* Split view */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gauche · Relevé bancaire */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-[#EDF0F5] border-b flex items-center justify-between">
                <div>
                  <div
                    className="font-semibold text-[#3B4E68] flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                  >
                    <Landmark className="w-4 h-4" /> Relevé bancaire BIAT
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {filteredReleve.length} ligne(s)
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredReleve.map((l) => {
                  const isCredit = (l.montant_credit || 0) > 0;
                  const isRappr = l.statut === 'rapprochee';
                  const isLitige = l.statut === 'en_litige';
                  const isSelected = selectedReleve?.id_ligne_releve === l.id_ligne_releve;
                  return (
                    <div
                      key={l.id_ligne_releve}
                      onClick={() => !isRappr && setSelectedReleve(l)}
                      onDragOver={(e) => {
                        if (!isRappr) {
                          e.preventDefault();
                          setDragOverRef(l.id_ligne_releve);
                        }
                      }}
                      onDragLeave={() => setDragOverRef(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverRef(null);
                        const idEcr = parseInt(e.dataTransfer.getData('text/plain'), 10);
                        const ecr = ecritures.find((x) => x.id_ecriture === idEcr);
                        if (ecr && !isRappr) handleMatcher(l, ecr);
                      }}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        isRappr
                          ? 'bg-emerald-50/40 opacity-70'
                          : isLitige
                          ? 'bg-red-50/40'
                          : isSelected
                          ? 'bg-[#FDF2ED] border-l-4 border-[#C8663D]'
                          : dragOverRef === l.id_ligne_releve
                          ? 'bg-[#EEF4F0] border-l-4 border-[#7A8C6A]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-500">
                            {new Date(l.date_operation).toLocaleDateString('fr-FR')} · {l.reference_operation}
                          </div>
                          <div className="text-sm text-gray-900 mt-0.5 truncate">
                            {l.libelle_bancaire}
                          </div>
                          {l.notes && (
                            <div className="text-xs text-red-600 italic mt-1">↳ {l.notes}</div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <MontantCell
                            value={isCredit ? l.montant_credit : -(l.montant_debit || 0)}
                            devise=""
                            bold
                          />
                          <div className="mt-1">
                            {isRappr ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDemarcher(l);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-red-600"
                              >
                                <Unlink className="w-3 h-3" /> Défaire
                              </button>
                            ) : isLitige ? (
                              <span className="text-[10px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                                LITIGE
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                À rapprocher
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredReleve.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Aucune ligne de relevé.</div>
                )}
              </div>
            </div>

            {/* Droite · Écritures ERP compte 5111 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-[#EEF4F0] border-b flex items-center justify-between">
                <div>
                  <div
                    className="font-semibold text-[#4A6C5B] flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
                  >
                    Écritures ERP · Compte 5111
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {filteredEcr.length} écriture(s)
                  </div>
                </div>
                {selectedReleve && selectedEcriture && (
                  <button
                    onClick={() => handleMatcher(selectedReleve, selectedEcriture)}
                    className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-3 py-1.5 rounded-lg hover:bg-[#a55231] text-sm font-semibold"
                  >
                    <Link2 className="w-4 h-4" /> Matcher
                  </button>
                )}
              </div>
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {filteredEcr.map((e) => {
                  const isRappr = e.rapprochee;
                  const isSelected = selectedEcriture?.id_ecriture === e.id_ecriture;
                  const solde = Number(e.debit || 0) - Number(e.credit || 0);
                  return (
                    <div
                      key={e.id_ligne}
                      draggable={!isRappr}
                      onDragStart={(ev) => {
                        ev.dataTransfer.setData('text/plain', String(e.id_ecriture));
                      }}
                      onClick={() => !isRappr && setSelectedEcriture(e)}
                      className={`px-4 py-3 transition-colors ${
                        isRappr
                          ? 'bg-emerald-50/40 opacity-70 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#EEF4F0] border-l-4 border-[#7A8C6A] cursor-move'
                          : 'hover:bg-gray-50 cursor-move'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-500">
                            {new Date(e.date_ecriture).toLocaleDateString('fr-FR')} · Écriture #{e.id_ecriture}
                          </div>
                          <div className="text-sm text-gray-900 mt-0.5 truncate">{e.libelle}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <MontantCell value={solde} devise="" bold />
                          <div className="mt-1">
                            {isRappr ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                <Link2 className="w-3 h-3" /> Rapprochée
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">glisser →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredEcr.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">Aucune écriture 5111.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapprochementBancaire;
