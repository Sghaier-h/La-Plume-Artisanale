import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Gift,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import {
  sanctionsPrimesService,
  SanctionPrime,
  TypeSanctionPrime,
  CategorieSanction,
  CategoriePrime,
} from '../../services/rhApi';

const CATEGORIES_SANCTION: { key: CategorieSanction; label: string; gravite: 1 | 2 | 3 | 4 }[] = [
  { key: 'rappel_oral', label: 'Rappel oral', gravite: 1 },
  { key: 'avertissement_ecrit', label: 'Avertissement écrit', gravite: 2 },
  { key: 'blame', label: 'Blâme', gravite: 2 },
  { key: 'mise_a_pied_1j', label: 'Mise à pied 1 j', gravite: 3 },
  { key: 'mise_a_pied_3j', label: 'Mise à pied 3 j', gravite: 3 },
  { key: 'derniere_mise_en_demeure', label: 'Dernière mise en demeure', gravite: 4 },
  { key: 'licenciement', label: 'Licenciement', gravite: 4 },
];

const CATEGORIES_PRIME: { key: CategoriePrime; label: string }[] = [
  { key: 'anciennete', label: 'Prime d\'ancienneté' },
  { key: 'rendement', label: 'Prime de rendement' },
  { key: '13e_mois', label: '13ᵉ mois' },
  { key: 'panier', label: 'Panier' },
  { key: 'transport', label: 'Transport' },
  { key: 'mariage', label: 'Mariage' },
  { key: 'naissance', label: 'Naissance' },
  { key: 'deces', label: 'Décès' },
  { key: 'exceptionnelle', label: 'Exceptionnelle' },
];

const MOCK_LIGNES: SanctionPrime[] = [
  {
    id_ligne: 1,
    type_ligne: 'prime',
    id_employe: 1002,
    employe_prenom: 'Hedi',
    employe_nom: 'Sghaier',
    date_evenement: new Date(Date.now() - 5 * 86400_000).toISOString().slice(0, 10),
    categorie: 'anciennete',
    libelle: 'Prime ancienneté 5 ans',
    montant_dt: 350,
  },
  {
    id_ligne: 2,
    type_ligne: 'sanction',
    id_employe: 1007,
    employe_prenom: 'Sami',
    employe_nom: 'Khemiri',
    date_evenement: new Date(Date.now() - 12 * 86400_000).toISOString().slice(0, 10),
    categorie: 'avertissement_ecrit',
    libelle: 'Retards répétés (3 en un mois)',
    motif: 'Non-respect des horaires atelier',
  },
  {
    id_ligne: 3,
    type_ligne: 'prime',
    id_employe: 1003,
    employe_prenom: 'Fatma',
    employe_nom: 'Trabelsi',
    date_evenement: new Date(Date.now() - 20 * 86400_000).toISOString().slice(0, 10),
    categorie: 'naissance',
    libelle: 'Prime naissance 2ᵉ enfant',
    montant_dt: 200,
  },
  {
    id_ligne: 4,
    type_ligne: 'sanction',
    id_employe: 1004,
    employe_prenom: 'Karim',
    employe_nom: 'Bouazizi',
    date_evenement: new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10),
    categorie: 'mise_a_pied_1j',
    libelle: 'Négligence machine',
    motif: 'Machine 3 arrêtée sans procédure',
    duree_jours: 1,
  },
  {
    id_ligne: 5,
    type_ligne: 'prime',
    id_employe: 1001,
    employe_prenom: 'Salima',
    employe_nom: 'Guelbi',
    date_evenement: new Date(Date.now() - 45 * 86400_000).toISOString().slice(0, 10),
    categorie: '13e_mois',
    libelle: '13ᵉ mois — direction',
    montant_dt: 2450,
  },
  {
    id_ligne: 6,
    type_ligne: 'prime',
    id_employe: 1006,
    employe_prenom: 'Amel',
    employe_nom: 'Ferchichi',
    date_evenement: new Date(Date.now() - 55 * 86400_000).toISOString().slice(0, 10),
    categorie: 'panier',
    libelle: 'Panier mensuel',
    montant_dt: 100,
  },
  {
    id_ligne: 7,
    type_ligne: 'sanction',
    id_employe: 1008,
    employe_prenom: 'Ines',
    employe_nom: 'Hamdi',
    date_evenement: new Date(Date.now() - 62 * 86400_000).toISOString().slice(0, 10),
    categorie: 'rappel_oral',
    libelle: 'Manipulation tissus non conforme',
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const SanctionsPrimes: React.FC = () => {
  const [items, setItems] = useState<SanctionPrime[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tous' | TypeSanctionPrime>('tous');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<SanctionPrime | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([sanctionsPrimesService.list()]);
      if (cancelled) return;
      setItems(pickArray<SanctionPrime>(res, 'lignes', MOCK_LIGNES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items
      .filter((i) => {
        if (tab !== 'tous' && i.type_ligne !== tab) return false;
        if (!s) return true;
        return `${i.libelle} ${i.employe_nom || ''} ${i.employe_prenom || ''}`.toLowerCase().includes(s);
      })
      .sort((a, b) => (b.date_evenement > a.date_evenement ? 1 : -1));
  }, [items, tab, search]);

  const kpis = useMemo(() => {
    const sanctions = items.filter((i) => i.type_ligne === 'sanction').length;
    const primes = items.filter((i) => i.type_ligne === 'prime').length;
    const montantPrimes = items
      .filter((i) => i.type_ligne === 'prime')
      .reduce((s, i) => s + Number(i.montant_dt || 0), 0);
    const graves = items.filter((i) => {
      if (i.type_ligne !== 'sanction') return false;
      const cat = CATEGORIES_SANCTION.find((c) => c.key === (i.categorie as CategorieSanction));
      return cat && cat.gravite >= 3;
    }).length;
    return { sanctions, primes, montantPrimes, graves };
  }, [items]);

  const openNew = (type: TypeSanctionPrime) => {
    setEditing({
      id_ligne: 0,
      type_ligne: type,
      id_employe: 0,
      date_evenement: new Date().toISOString().slice(0, 10),
      categorie: type === 'sanction' ? 'rappel_oral' : 'exceptionnelle',
      libelle: '',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id_ligne) {
      await sanctionsPrimesService.update(editing.id_ligne, editing).catch(() => {});
      setItems((prev) => prev.map((i) => (i.id_ligne === editing.id_ligne ? editing : i)));
    } else {
      const created = { ...editing, id_ligne: Math.max(0, ...items.map((i) => i.id_ligne)) + 1 };
      await sanctionsPrimesService.create(created).catch(() => {});
      setItems((prev) => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette entrée ?')) return;
    await sanctionsPrimesService.remove(id).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id_ligne !== id));
  };

  const labelCategorie = (l: SanctionPrime): string => {
    if (l.type_ligne === 'sanction') {
      return CATEGORIES_SANCTION.find((c) => c.key === l.categorie)?.label || String(l.categorie);
    }
    return CATEGORIES_PRIME.find((c) => c.key === l.categorie)?.label || String(l.categorie);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <ShieldAlert className="w-8 h-8 text-[#C8663D]" />
              Sanctions & Primes
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Registre des sanctions disciplinaires et primes ponctuelles &middot; §11bis.7
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openNew('prime')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7A8C6A] text-white rounded-lg hover:bg-[#5F7052] font-medium text-sm"
            >
              <Gift className="w-4 h-4" />
              Nouvelle prime
            </button>
            <button
              onClick={() => openNew('sanction')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#B84A2F] text-white rounded-lg hover:bg-[#932B18] font-medium text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Nouvelle sanction
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Sanctions" value={kpis.sanctions} icon={<AlertTriangle className="w-5 h-5" />} color="warning" />
          <KpiCard
            label="Sanctions graves"
            value={kpis.graves}
            icon={<ShieldAlert className="w-5 h-5" />}
            color={kpis.graves > 0 ? 'warning' : 'neutral'}
            subtitle="Mise à pied ou plus"
          />
          <KpiCard label="Primes accordées" value={kpis.primes} icon={<Gift className="w-5 h-5" />} color="sage" />
          <KpiCard
            label="Montant primes (DT)"
            value={kpis.montantPrimes.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            color="terracotta"
          />
        </div>

        {/* Onglets & recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1 bg-[#F5EFE5] rounded-lg p-1">
              {(['tous', 'sanction', 'prime'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    tab === k ? 'bg-white shadow text-[#C8663D]' : 'text-[#6B4E31]'
                  }`}
                >
                  {k === 'tous' ? 'Tous' : k === 'sanction' ? 'Sanctions' : 'Primes'}
                </button>
              ))}
            </div>
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (employé, libellé...)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Libellé / Motif</th>
                  <th className="px-4 py-3 text-right">Montant (DT)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[#9B8874]">
                      Aucune entrée
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => {
                    const isSanction = l.type_ligne === 'sanction';
                    return (
                      <tr key={l.id_ligne} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                        <td className="px-4 py-3 text-xs">{l.date_evenement}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              isSanction
                                ? 'bg-[#FBEBE4] text-[#B84A2F] border-[#B84A2F]'
                                : 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]'
                            }`}
                          >
                            {isSanction ? 'Sanction' : 'Prime'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {l.employe_prenom} {l.employe_nom}
                        </td>
                        <td className="px-4 py-3 text-[#6B4E31]">{labelCategorie(l)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{l.libelle}</div>
                          {l.motif && (
                            <div className="text-xs text-[#9B8874] mt-0.5">{l.motif}</div>
                          )}
                          {l.duree_jours && (
                            <div className="text-xs text-[#B84A2F] mt-0.5">
                              Durée : {l.duree_jours} j
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-right text-[#4A6C5B] font-semibold">
                          {l.montant_dt
                            ? l.montant_dt.toLocaleString('fr-FR', { minimumFractionDigits: 3 })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditing(l);
                                setShowForm(true);
                              }}
                              className="p-1.5 rounded hover:bg-[#FDF2ED]"
                            >
                              <Pencil className="w-4 h-4 text-[#C8663D]" />
                            </button>
                            {l.pdf_url && (
                              <a
                                href={l.pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded hover:bg-[#EDF0F5]"
                              >
                                <FileText className="w-4 h-4 text-[#3B4E68]" />
                              </a>
                            )}
                            <button
                              onClick={() => remove(l.id_ligne)}
                              className="p-1.5 rounded hover:bg-[#FBEBE4]"
                            >
                              <Trash2 className="w-4 h-4 text-[#B84A2F]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showForm && editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {editing.type_ligne === 'sanction' ? 'Sanction' : 'Prime'} —{' '}
                {editing.id_ligne ? 'modification' : 'création'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Date</span>
                <input
                  type="date"
                  value={editing.date_evenement}
                  onChange={(e) => setEditing({ ...editing, date_evenement: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Catégorie</span>
                <select
                  value={editing.categorie as string}
                  onChange={(e) => setEditing({ ...editing, categorie: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  {editing.type_ligne === 'sanction'
                    ? CATEGORIES_SANCTION.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))
                    : CATEGORIES_PRIME.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                </select>
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Prénom</span>
                <input
                  type="text"
                  value={editing.employe_prenom || ''}
                  onChange={(e) => setEditing({ ...editing, employe_prenom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-1">
                <span className="text-xs text-[#6B4E31]">Nom</span>
                <input
                  type="text"
                  value={editing.employe_nom || ''}
                  onChange={(e) => setEditing({ ...editing, employe_nom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-2">
                <span className="text-xs text-[#6B4E31]">Libellé</span>
                <input
                  type="text"
                  value={editing.libelle}
                  onChange={(e) => setEditing({ ...editing, libelle: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="block col-span-2">
                <span className="text-xs text-[#6B4E31]">Motif / Commentaire</span>
                <textarea
                  value={editing.motif || ''}
                  onChange={(e) => setEditing({ ...editing, motif: e.target.value })}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              {editing.type_ligne === 'prime' && (
                <label className="block col-span-1">
                  <span className="text-xs text-[#6B4E31]">Montant (DT)</span>
                  <input
                    type="number"
                    step="0.001"
                    value={editing.montant_dt || 0}
                    onChange={(e) => setEditing({ ...editing, montant_dt: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                  />
                </label>
              )}
              {editing.type_ligne === 'sanction' && (
                <label className="block col-span-1">
                  <span className="text-xs text-[#6B4E31]">Durée (jours)</span>
                  <input
                    type="number"
                    value={editing.duree_jours || 0}
                    onChange={(e) => setEditing({ ...editing, duree_jours: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                  />
                </label>
              )}
            </div>
            <div className="p-4 border-t border-[#EDE3CE] flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#DFD3B8] rounded-lg text-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] text-sm font-medium"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SanctionsPrimes;
