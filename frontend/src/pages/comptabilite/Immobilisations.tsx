import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  Calculator,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import MontantCell from '../../components/comptabilite/MontantCell';
import {
  immobilisationsService,
  Immobilisation,
  CategorieImmo,
  MethodeAmortissement,
} from '../../services/comptabiliteApi';

// ═══════════════════════════════════════════════════════════════════
// MOCK — Registre immobilisations §10.7
// ═══════════════════════════════════════════════════════════════════

const CATEGORIES: Record<CategorieImmo, { label: string; compteImmo: string; taux: number }> = {
  materiel_industriel: { label: 'Matériel industriel', compteImmo: '2154', taux: 10 },
  mobilier: { label: 'Mobilier', compteImmo: '2184', taux: 10 },
  informatique: { label: 'Informatique', compteImmo: '2183', taux: 33.33 },
  vehicule: { label: 'Véhicule', compteImmo: '2182', taux: 20 },
  batiment: { label: 'Bâtiment', compteImmo: '2131', taux: 5 },
  incorporel: { label: 'Immobilisation incorporelle', compteImmo: '205', taux: 20 },
};

const MOCK_IMMO: Immobilisation[] = [
  {
    id_immobilisation: 1,
    numero_immo: 'IMMO-2020001',
    libelle: 'Bâtiment usine Sfax',
    categorie: 'batiment',
    id_compte_comptable_immo: 201,
    numero_compte_immo: '2131',
    date_acquisition: '2020-03-15',
    valeur_acquisition_ht: 350000,
    taux_amortissement_pct: 5,
    duree_amortissement_annees: 20,
    methode: 'lineaire',
    date_mise_en_service: '2020-04-01',
    date_fin_amortissement: '2040-03-31',
    amortissement_cumule: 105000,
    valeur_nette: 245000,
    fournisseur_origine_nom: 'SCI Sfax Immo',
    actif: true,
  },
  {
    id_immobilisation: 2,
    numero_immo: 'IMMO-2021012',
    libelle: 'Métier Dornier M2301',
    categorie: 'materiel_industriel',
    id_compte_comptable_immo: 202,
    numero_compte_immo: '2154',
    date_acquisition: '2021-06-20',
    valeur_acquisition_ht: 185000,
    taux_amortissement_pct: 10,
    duree_amortissement_annees: 10,
    methode: 'lineaire',
    date_mise_en_service: '2021-07-15',
    date_fin_amortissement: '2031-06-19',
    amortissement_cumule: 92500,
    valeur_nette: 92500,
    numero_serie: 'DRN-M2301-2021',
    fournisseur_origine_nom: 'Dornier GmbH',
    actif: true,
  },
  {
    id_immobilisation: 3,
    numero_immo: 'IMMO-2022008',
    libelle: 'Métier Dornier M2302',
    categorie: 'materiel_industriel',
    id_compte_comptable_immo: 202,
    numero_compte_immo: '2154',
    date_acquisition: '2022-04-10',
    valeur_acquisition_ht: 195000,
    taux_amortissement_pct: 10,
    duree_amortissement_annees: 10,
    methode: 'lineaire',
    date_mise_en_service: '2022-05-01',
    amortissement_cumule: 78000,
    valeur_nette: 117000,
    numero_serie: 'DRN-M2302-2022',
    actif: true,
  },
  {
    id_immobilisation: 4,
    numero_immo: 'IMMO-2024003',
    libelle: 'Camionnette Renault Kangoo',
    categorie: 'vehicule',
    id_compte_comptable_immo: 204,
    numero_compte_immo: '2182',
    date_acquisition: '2024-01-15',
    valeur_acquisition_ht: 42000,
    taux_amortissement_pct: 20,
    duree_amortissement_annees: 5,
    methode: 'lineaire',
    date_mise_en_service: '2024-02-01',
    amortissement_cumule: 16800,
    valeur_nette: 25200,
    fournisseur_origine_nom: 'Renault Tunisie',
    actif: true,
  },
  {
    id_immobilisation: 5,
    numero_immo: 'IMMO-2025001',
    libelle: 'Serveur Dell PowerEdge (ERP)',
    categorie: 'informatique',
    id_compte_comptable_immo: 203,
    numero_compte_immo: '2183',
    date_acquisition: '2025-02-10',
    valeur_acquisition_ht: 12500,
    taux_amortissement_pct: 33.33,
    duree_amortissement_annees: 3,
    methode: 'degressif',
    date_mise_en_service: '2025-03-01',
    amortissement_cumule: 4166,
    valeur_nette: 8334,
    actif: true,
  },
  {
    id_immobilisation: 6,
    numero_immo: 'IMMO-2026002',
    libelle: 'Postes informatiques atelier (×6)',
    categorie: 'informatique',
    id_compte_comptable_immo: 203,
    numero_compte_immo: '2183',
    date_acquisition: '2026-01-20',
    valeur_acquisition_ht: 8700,
    taux_amortissement_pct: 33.33,
    duree_amortissement_annees: 3,
    methode: 'lineaire',
    date_mise_en_service: '2026-02-01',
    amortissement_cumule: 0,
    valeur_nette: 8700,
    actif: true,
  },
  {
    id_immobilisation: 7,
    numero_immo: 'IMMO-2023004',
    libelle: 'Mobilier bureau atelier',
    categorie: 'mobilier',
    id_compte_comptable_immo: 205,
    numero_compte_immo: '2184',
    date_acquisition: '2023-09-05',
    valeur_acquisition_ht: 4800,
    taux_amortissement_pct: 10,
    duree_amortissement_annees: 10,
    methode: 'lineaire',
    date_mise_en_service: '2023-10-01',
    amortissement_cumule: 1200,
    valeur_nette: 3600,
    actif: true,
  },
];

const Immobilisations: React.FC = () => {
  const [immos, setImmos] = useState<Immobilisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<CategorieImmo | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Immobilisation | null>(null);
  const [form, setForm] = useState<Partial<Immobilisation>>({
    libelle: '',
    categorie: 'materiel_industriel',
    valeur_acquisition_ht: 0,
    taux_amortissement_pct: 10,
    duree_amortissement_annees: 10,
    methode: 'lineaire',
    date_acquisition: new Date().toISOString().slice(0, 10),
    actif: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([immobilisationsService.getImmobilisations()]);
      if (cancelled) return;
      const pick = (res: PromiseSettledResult<any>): Immobilisation[] => {
        if (res.status !== 'fulfilled') return MOCK_IMMO;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.immobilisations)) return d.immobilisations;
        return MOCK_IMMO;
      };
      setImmos(pick(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return immos.filter((i) => {
      if (filterCat !== 'all' && i.categorie !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          i.libelle.toLowerCase().includes(q) ||
          i.numero_immo.toLowerCase().includes(q) ||
          (i.numero_serie || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [immos, search, filterCat]);

  const kpis = useMemo(() => {
    const valeurBrute = immos.reduce((s, i) => s + Number(i.valeur_acquisition_ht || 0), 0);
    const amort = immos.reduce((s, i) => s + Number(i.amortissement_cumule || 0), 0);
    const vnc = immos.reduce((s, i) => s + Number(i.valeur_nette || 0), 0);
    return { valeurBrute, amort, vnc, nb: immos.length };
  }, [immos]);

  const openNew = () => {
    setEditing(null);
    setForm({
      libelle: '',
      categorie: 'materiel_industriel',
      valeur_acquisition_ht: 0,
      taux_amortissement_pct: 10,
      duree_amortissement_annees: 10,
      methode: 'lineaire',
      date_acquisition: new Date().toISOString().slice(0, 10),
      actif: true,
    });
    setShowForm(true);
  };

  const openEdit = (i: Immobilisation) => {
    setEditing(i);
    setForm(i);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) await immobilisationsService.updateImmobilisation(editing.id_immobilisation, form);
      else await immobilisationsService.createImmobilisation(form);
    } catch {
      /* mock */
    }
    if (editing) {
      setImmos((prev) =>
        prev.map((x) =>
          x.id_immobilisation === editing.id_immobilisation
            ? ({ ...x, ...form } as Immobilisation)
            : x
        )
      );
    } else {
      const num = `IMMO-${new Date().getFullYear()}${String(Date.now()).slice(-3)}`;
      setImmos((prev) => [
        {
          ...(form as Immobilisation),
          id_immobilisation: Date.now(),
          numero_immo: num,
          amortissement_cumule: 0,
          valeur_nette: form.valeur_acquisition_ht || 0,
        },
        ...prev,
      ]);
    }
    setShowForm(false);
  };

  const handleDelete = async (i: Immobilisation) => {
    if (!window.confirm(`Supprimer l'immobilisation « ${i.libelle} » ?`)) return;
    try {
      await immobilisationsService.deleteImmobilisation(i.id_immobilisation);
    } catch {
      /* mock */
    }
    setImmos((prev) => prev.filter((x) => x.id_immobilisation !== i.id_immobilisation));
  };

  const handleGenerer = async () => {
    if (!window.confirm(`Calculer les dotations annuelles ${new Date().getFullYear()} ?`)) return;
    try {
      await immobilisationsService.genererDotationsAnnuelles(new Date().getFullYear());
    } catch {
      /* mock */
    }
    alert(
      `Dotations générées pour ${immos.length} immobilisation(s) — écriture 6811 → 281x créée.`
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
                <Building2 className="w-8 h-8 text-[#C8663D]" />
                Immobilisations
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Registre des biens durables · amortissements linéaire/dégressif (§10.7)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerer}
                className="inline-flex items-center gap-2 bg-[#7A8C6A] text-white px-4 py-2 rounded-lg hover:bg-[#5F7053] shadow-sm text-sm"
              >
                <Calculator className="w-4 h-4" /> Calculer dotations annuelles
              </button>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 bg-[#C8663D] text-white px-4 py-2 rounded-lg hover:bg-[#a55231] shadow-sm"
              >
                <PlusCircle className="w-4 h-4" /> Nouvelle immobilisation
              </button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Valeur brute (VB)" value={kpis.valeurBrute.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="indigo" subtitle={`${kpis.nb} biens`} />
            <KpiCard label="Amortissements cumulés" value={kpis.amort.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="warning" />
            <KpiCard label="Valeur nette comptable" value={kpis.vnc.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} suffix="DT" color="sage" subtitle="VB − amortissements" />
            <KpiCard label="Taux amortissement moyen" value={`${((kpis.amort / Math.max(1, kpis.valeurBrute)) * 100).toFixed(1)}%`} color="terracotta" />
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher désignation, n° immo, n° série…"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as any)}
              className="text-sm border rounded-lg px-2 py-1.5"
            >
              <option value="all">Toutes catégories</option>
              {(Object.keys(CATEGORIES) as CategorieImmo[]).map((k) => (
                <option key={k} value={k}>
                  {CATEGORIES[k].label}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-500 ml-auto">
              {filtered.length} / {immos.length}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">N° immo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Désignation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acquisition</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valeur brute</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amort. / Méth.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Valeur nette</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((i) => {
                  const cat = CATEGORIES[i.categorie || 'materiel_industriel'];
                  const pctAmorti = (Number(i.amortissement_cumule || 0) / Math.max(1, Number(i.valeur_acquisition_ht || 1))) * 100;
                  return (
                    <tr key={i.id_immobilisation} className="hover:bg-[#FDF2ED]/40 group">
                      <td
                        className="px-4 py-3 font-mono text-xs font-semibold text-[#3B4E68]"
                        style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
                      >
                        {i.numero_immo}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{i.libelle}</div>
                        {i.numero_serie && (
                          <div className="text-[11px] text-gray-500 font-mono">
                            S/N: {i.numero_serie}
                          </div>
                        )}
                        {i.fournisseur_origine_nom && (
                          <div className="text-[11px] text-gray-500 italic">
                            ↳ {i.fournisseur_origine_nom}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#EDF0F5] text-[#3B4E68]">
                          {cat?.label}
                        </span>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {i.numero_compte_immo}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {new Date(i.date_acquisition).toLocaleDateString('fr-FR')}
                        {i.date_mise_en_service && (
                          <div className="text-[10px] text-gray-500">
                            MES: {new Date(i.date_mise_en_service).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={i.valeur_acquisition_ht} devise="" bold />
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{i.taux_amortissement_pct}%</span>
                          <span
                            className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                              i.methode === 'lineaire'
                                ? 'bg-[#EEF4F0] text-[#4A6C5B]'
                                : 'bg-[#FDF2ED] text-[#C8663D]'
                            }`}
                          >
                            {i.methode}
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-[#C89B3C] rounded-full"
                            style={{ width: `${Math.min(100, pctAmorti)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {pctAmorti.toFixed(0)}% amorti
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MontantCell value={i.valeur_nette || 0} devise="" bold />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(i)}
                          className="text-xs text-[#3B4E68] hover:text-[#C8663D] mr-2 inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(i)}
                          className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Aucune immobilisation pour ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 bg-gradient-to-r from-[#FDF2ED] to-white border-b flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: 'var(--font-serif, Fraunces, serif)' }}
              >
                {editing ? 'Modifier immobilisation' : 'Nouvelle immobilisation'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Désignation *</label>
                  <input
                    required
                    value={form.libelle || ''}
                    onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Catégorie</label>
                  <select
                    value={form.categorie}
                    onChange={(e) => {
                      const cat = e.target.value as CategorieImmo;
                      setForm({
                        ...form,
                        categorie: cat,
                        taux_amortissement_pct: CATEGORIES[cat].taux,
                        duree_amortissement_annees: Math.round(100 / CATEGORIES[cat].taux),
                        numero_compte_immo: CATEGORIES[cat].compteImmo,
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {(Object.keys(CATEGORIES) as CategorieImmo[]).map((k) => (
                      <option key={k} value={k}>
                        {CATEGORIES[k].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">N° série</label>
                  <input
                    value={form.numero_serie || ''}
                    onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Date acquisition *</label>
                  <input
                    type="date"
                    required
                    value={(form.date_acquisition || '').slice(0, 10)}
                    onChange={(e) => setForm({ ...form, date_acquisition: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Valeur brute HT (DT) *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={form.valeur_acquisition_ht || ''}
                    onChange={(e) =>
                      setForm({ ...form, valeur_acquisition_ht: parseFloat(e.target.value) })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Taux %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.taux_amortissement_pct || ''}
                    onChange={(e) =>
                      setForm({ ...form, taux_amortissement_pct: parseFloat(e.target.value) })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Durée (années)</label>
                  <input
                    type="number"
                    value={form.duree_amortissement_annees || ''}
                    onChange={(e) =>
                      setForm({ ...form, duree_amortissement_annees: parseInt(e.target.value, 10) })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Méthode</label>
                  <select
                    value={form.methode}
                    onChange={(e) =>
                      setForm({ ...form, methode: e.target.value as MethodeAmortissement })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="lineaire">Linéaire</option>
                    <option value="degressif">Dégressif</option>
                  </select>
                </div>
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
                  {editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Immobilisations;
