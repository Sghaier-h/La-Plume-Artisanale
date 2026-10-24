import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  PlusCircle,
  Send,
  Download,
  Search,
  Filter,
  Package,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import StatutBcBadge from '../../components/achats/StatutBcBadge';
import { PageSkeleton, EmptyState } from '../../components/ui';
import { DataTable, Column } from '../../components/ui/DataTable';
import {
  bcService,
  BonCommande,
  LigneBc,
  StatutBc,
} from '../../services/achatsApi';

const TVA_STD = 0.19; // 19% Tunisie

const mkLignes = (partial: Partial<LigneBc>[], id_bc: number): LigneBc[] =>
  partial.map((p, idx) => {
    const qte = Number(p.quantite_commandee ?? 0);
    const pu = Number(p.prix_unitaire_ht ?? 0);
    const remise = Number(p.remise_pct ?? 0);
    const brutHt = qte * pu * (1 - remise / 100);
    return {
      id_ligne_bc: (id_bc * 100) + idx + 1,
      id_bc,
      designation_snapshot: p.designation_snapshot ?? 'Article',
      quantite_commandee: qte,
      quantite_recue: Number(p.quantite_recue ?? 0),
      prix_unitaire_ht: pu,
      remise_pct: remise,
      taux_tva: p.taux_tva ?? 19,
      montant_ht: Number(brutHt.toFixed(3)),
    };
  });

const totalize = (lignes: LigneBc[]) => {
  const ht = lignes.reduce((s, l) => s + l.montant_ht, 0);
  const tva = ht * TVA_STD;
  return {
    montant_ht: Number(ht.toFixed(3)),
    montant_tva: Number(tva.toFixed(3)),
    montant_ttc: Number((ht + tva).toFixed(3)),
  };
};

const MOCK_BCS_RAW: Omit<BonCommande, 'montant_ht' | 'montant_tva' | 'montant_ttc' | 'lignes'>[] & {
  __lignes: Partial<LigneBc>[];
}[] = [] as any;

const buildMockBc = (
  id: number,
  numero: string,
  fournisseur: string,
  date: string,
  statut: StatutBc,
  lignes: Partial<LigneBc>[],
): BonCommande => {
  const ll = mkLignes(lignes, id);
  const totals = totalize(ll);
  return {
    id_bc: id,
    numero_bc: numero,
    id_fournisseur: id,
    fournisseur_nom: fournisseur,
    date_commande: date,
    date_livraison_prevue: new Date(
      new Date(date).getTime() + 86400_000 * 14,
    ).toISOString(),
    conditions_paiement: '30j fin de mois',
    statut,
    lignes: ll,
    ...totals,
  };
};

const MOCK_BCS: BonCommande[] = [
  buildMockBc(
    42,
    'BC-202609042',
    'SOTUFIL',
    new Date(Date.now() - 86400_000 * 6).toISOString(),
    'livre',
    [
      {
        designation_snapshot: 'Fil coton 20/1 écru — 100 kg',
        quantite_commandee: 100,
        quantite_recue: 100,
        prix_unitaire_ht: 18.5,
        remise_pct: 0,
      },
      {
        designation_snapshot: 'Fil coton 30/1 blanc — 50 kg',
        quantite_commandee: 50,
        quantite_recue: 50,
        prix_unitaire_ht: 22.0,
        remise_pct: 3,
      },
    ],
  ),
  buildMockBc(
    43,
    'BC-202609043',
    'MICOFIL',
    new Date(Date.now() - 86400_000 * 3).toISOString(),
    'partiel',
    [
      {
        designation_snapshot: 'Fil sergé indigo 30/2 — 50 kg',
        quantite_commandee: 50,
        quantite_recue: 30,
        prix_unitaire_ht: 28.4,
      },
    ],
  ),
  buildMockBc(
    44,
    'BC-202609044',
    'Dornier Service Tunis',
    new Date(Date.now() - 86400_000 * 1).toISOString(),
    'envoye',
    [
      {
        designation_snapshot: 'Navette Dornier LWV-C',
        quantite_commandee: 2,
        prix_unitaire_ht: 745,
        taux_tva: 19,
      },
      {
        designation_snapshot: 'Kit courroie transmission métier',
        quantite_commandee: 1,
        prix_unitaire_ht: 320,
      },
    ],
  ),
  buildMockBc(
    45,
    'BC-202609045',
    'IMEXTUN',
    new Date(Date.now() - 86400_000 * 12).toISOString(),
    'brouillon',
    [
      {
        designation_snapshot: 'Lin brut 40/1 — 20 kg',
        quantite_commandee: 20,
        prix_unitaire_ht: 42.5,
      },
    ],
  ),
  buildMockBc(
    46,
    'BC-202608040',
    'SOTUFIL',
    new Date(Date.now() - 86400_000 * 22).toISOString(),
    'livre',
    [
      {
        designation_snapshot: 'Fil coton bio 24/1 — 200 kg',
        quantite_commandee: 200,
        quantite_recue: 200,
        prix_unitaire_ht: 21.75,
      },
    ],
  ),
];

const pickArray = <T,>(res: PromiseSettledResult<any>, fallback: T[]): T[] => {
  if (res.status !== 'fulfilled') return fallback;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.bcs)) return d.bcs;
  return fallback;
};

const BonsCommande: React.FC = () => {
  const [bcs, setBcs] = useState<BonCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutBc | 'all'>('all');
  const [selected, setSelected] = useState<BonCommande | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([bcService.getBcs()]);
      if (cancelled) return;
      setBcs(pickArray<BonCommande>(res, MOCK_BCS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const encours = bcs.filter((b) =>
      ['envoye', 'confirme', 'partiel'].includes(b.statut),
    ).length;
    const totalMtHt = bcs.reduce((s, b) => s + Number(b.montant_ht || 0), 0);
    const nbLivres = bcs.filter((b) => b.statut === 'livre').length;
    return {
      total: bcs.length,
      encours,
      totalMtHt,
      nbLivres,
    };
  }, [bcs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bcs.filter((b) => {
      if (statutFilter !== 'all' && b.statut !== statutFilter) return false;
      if (
        q &&
        !`${b.numero_bc} ${b.fournisseur_nom ?? ''}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [bcs, search, statutFilter]);

  const handleEnvoyer = async (b: BonCommande) => {
    try {
      await bcService.envoyer(b.id_bc);
    } catch {
      /* noop */
    }
    setBcs((prev) =>
      prev.map((x) => (x.id_bc === b.id_bc ? { ...x, statut: 'envoye' } : x)),
    );
  };

  const handleDownload = async (b: BonCommande) => {
    try {
      await bcService.downloadPdf(b.id_bc);
    } catch {
      /* fallback silencieux */
      window.showToast?.('info', 'Information', String(`Génération PDF ${b.numero_bc} (mock — endpoint à brancher)`));
    }
  };

  if (loading) {
    return <PageSkeleton kpiCount={4} rows={8} cols={7} />;
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3]">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-8 h-8 text-[#C8663D]" />
                Bons de commande fournisseur
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Émission, envoi et suivi des BC · §9.3
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8663D] hover:bg-[#B4562F] text-white px-4 py-2 text-sm font-semibold shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau BC
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="BC total"
              value={kpis.total}
              icon={<FileText className="w-5 h-5" />}
              color="indigo"
              active={statutFilter === 'all'}
              onClick={() => setStatutFilter('all')}
            />
            <KpiCard
              label="En cours (envoyé/partiel)"
              value={kpis.encours}
              icon={<Package className="w-5 h-5" />}
              color="warning"
              active={statutFilter === 'envoye'}
              onClick={() => setStatutFilter((prev) => prev === 'envoye' ? 'all' : 'envoye')}
            />
            <KpiCard
              label="Montant HT engagé"
              value={kpis.totalMtHt.toLocaleString('fr-FR', {
                maximumFractionDigits: 0,
              })}
              suffix="DT"
              icon={<TrendingUp className="w-5 h-5" />}
              color="terracotta"
              active={statutFilter === 'confirme'}
              onClick={() => setStatutFilter((prev) => prev === 'confirme' ? 'all' : 'confirme')}
            />
            <KpiCard
              label="BC livrés"
              value={kpis.nbLivres}
              icon={<CheckCircle2 className="w-5 h-5" />}
              color="sage"
              active={statutFilter === 'livre'}
              onClick={() => setStatutFilter((prev) => prev === 'livre' ? 'all' : 'livre')}
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
                  placeholder="Rechercher n° BC, fournisseur…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statutFilter}
                  onChange={(e) =>
                    setStatutFilter(e.target.value as StatutBc | 'all')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C8663D]/30 focus:border-[#C8663D] outline-none"
                >
                  <option value="all">Tous statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="envoye">Envoyé</option>
                  <option value="confirme">Confirmé</option>
                  <option value="partiel">Partiellement reçu</option>
                  <option value="livre">Reçu</option>
                  <option value="annule">Annulé</option>
                </select>
              </div>
            </div>

            <DataTable<any>
              columns={[
                { key: 'numero_bc', label: 'N° BC', sortable: true, render: (b: any) => <span className="font-mono text-xs text-[#4A5D75] font-semibold">{b.numero_bc}</span> },
                { key: 'fournisseur_nom', label: 'Fournisseur', sortable: true, render: (b: any) => <span className="font-medium text-gray-800">{b.fournisseur_nom}</span> },
                { key: 'date_commande', label: 'Date', sortable: true, value: (b: any) => b.date_commande, render: (b: any) => new Date(b.date_commande).toLocaleDateString('fr-FR') },
                { key: 'montant_ht', label: 'HT (DT)', sortable: true, align: 'right', value: (b: any) => Number(b.montant_ht) || 0, render: (b: any) => <span className="font-semibold text-gray-800">{b.montant_ht.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> },
                { key: 'montant_tva', label: 'TVA', sortable: true, align: 'right', value: (b: any) => Number(b.montant_tva) || 0, render: (b: any) => <span className="text-gray-600">{b.montant_tva.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}</span> },
                { key: 'montant_ttc', label: 'TTC (DT)', sortable: true, align: 'right', value: (b: any) => Number(b.montant_ttc) || 0, render: (b: any) => <span className="font-bold text-[#C8663D]">{b.montant_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> },
                { key: 'statut', label: 'Statut', sortable: true, render: (b: any) => <StatutBcBadge statut={b.statut} /> },
                { key: '_actions', label: 'Actions', sortable: false, exportable: false, align: 'right', render: (b: any) => (
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {b.statut === 'brouillon' && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleEnvoyer(b); }} title="Envoyer au fournisseur" className="p-1.5 rounded hover:bg-[#EEF4F0] text-[#4A6C5B]">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDownload(b); }} title="Télécharger PDF" className="p-1.5 rounded hover:bg-[#FBF3E0] text-[#8A6412]">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) },
              ] as Column<any>[]}
              data={filtered}
              rowKey={(b: any) => b.id_bc}
              onRowClick={(b: any) => setSelected(b)}
              pageSize={25}
              exportable
              exportFilename="bons_commande"
              emptyState={
                <EmptyState
                  variant={search || statutFilter !== 'all' ? 'search-no-result' : 'default'}
                  title={search || statutFilter !== 'all' ? 'Aucun bon de commande ne correspond' : 'Aucun bon de commande'}
                  description={search || statutFilter !== 'all' ? 'Réinitialisez vos filtres ou votre recherche.' : 'Créez votre premier BC fournisseur.'}
                  cta={search || statutFilter !== 'all'
                    ? { label: 'Réinitialiser', onClick: () => { setSearch(''); setStatutFilter('all'); } }
                    : undefined}
                />
              }
              loading={loading}
            />
          </div>

          {selected && (
            <div
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setSelected(null)}
            >
              <div
                className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs text-[#4A5D75]">
                      {selected.numero_bc}
                    </div>
                    <div className="font-bold text-gray-800">
                      {selected.fournisseur_nom}
                    </div>
                  </div>
                  <StatutBcBadge statut={selected.statut} />
                </div>
                <div className="p-5">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold">Article</th>
                        <th className="text-right px-3 py-2 font-semibold">Qté</th>
                        <th className="text-right px-3 py-2 font-semibold">Reçu</th>
                        <th className="text-right px-3 py-2 font-semibold">PU HT</th>
                        <th className="text-right px-3 py-2 font-semibold">Remise</th>
                        <th className="text-right px-3 py-2 font-semibold">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.lignes || []).map((l) => (
                        <tr
                          key={l.id_ligne_bc}
                          className="border-b border-gray-100"
                        >
                          <td className="px-3 py-2">{l.designation_snapshot}</td>
                          <td className="px-3 py-2 text-right">
                            {l.quantite_commandee}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {l.quantite_recue}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {l.prix_unitaire_ht.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {l.remise_pct.toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">
                            {l.montant_ht.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-5 border-t border-gray-200 flex justify-end gap-4 text-sm">
                  <div className="text-gray-500">
                    HT :{' '}
                    <span className="font-semibold text-gray-800">
                      {selected.montant_ht.toFixed(2)} DT
                    </span>
                  </div>
                  <div className="text-gray-500">
                    TVA :{' '}
                    <span className="font-semibold text-gray-800">
                      {selected.montant_tva.toFixed(2)} DT
                    </span>
                  </div>
                  <div className="text-[#C8663D] font-bold">
                    TTC : {selected.montant_ttc.toFixed(2)} DT
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

export default BonsCommande;
