import React, { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Printer,
  X,
  CheckCircle2,
  Boxes,
  Weight,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import EtiquetteColis from '../../components/ventes/EtiquetteColis';
import { colisageService, Colis, StatutColis } from '../../services/ventesComplementsApi';

const iso = (d: Date) => d.toISOString().slice(0, 10);

const MOCK_COLIS: Colis[] = [
  {
    id_colis: 1,
    numero_colis: 'C001-2026-001',
    id_commande: 501,
    numero_commande: 'CMD-2026-0501',
    id_client: 12,
    nom_client: 'Hammam Boutique Paris',
    poids_kg: 8.5,
    longueur_cm: 60,
    largeur_cm: 40,
    hauteur_cm: 25,
    nb_articles: 24,
    id_transporteur: 1,
    transporteur_nom: 'DHL Express',
    statut: 'expedie',
    date_expedition: iso(new Date(Date.now() - 3 * 86400_000)),
    numero_suivi: '9821345612',
  },
  {
    id_colis: 2,
    numero_colis: 'C001-2026-002',
    id_commande: 501,
    numero_commande: 'CMD-2026-0501',
    nom_client: 'Hammam Boutique Paris',
    poids_kg: 6.2,
    longueur_cm: 60,
    largeur_cm: 40,
    hauteur_cm: 20,
    nb_articles: 18,
    transporteur_nom: 'DHL Express',
    statut: 'valide',
  },
  {
    id_colis: 3,
    numero_colis: 'C002-2026-001',
    id_commande: 502,
    numero_commande: 'CMD-2026-0502',
    nom_client: 'Hotel Marina Djerba',
    poids_kg: 12.4,
    longueur_cm: 80,
    largeur_cm: 50,
    hauteur_cm: 30,
    nb_articles: 40,
    transporteur_nom: 'Aramex',
    statut: 'brouillon',
  },
  {
    id_colis: 4,
    numero_colis: 'C003-2026-001',
    id_commande: 503,
    numero_commande: 'CMD-2026-0503',
    nom_client: 'Boutique El Menzah',
    poids_kg: 4.8,
    longueur_cm: 45,
    largeur_cm: 35,
    hauteur_cm: 20,
    nb_articles: 12,
    transporteur_nom: 'Fedex',
    statut: 'livre',
    date_expedition: iso(new Date(Date.now() - 7 * 86400_000)),
    numero_suivi: '7712334455',
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const ListeColisage: React.FC = () => {
  const [colis, setColis] = useState<Colis[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | StatutColis>('tous');
  const [editing, setEditing] = useState<Colis | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Colis | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([colisageService.list()]);
      if (cancelled) return;
      setColis(pickArray<Colis>(res, 'colis', MOCK_COLIS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return colis.filter((c) => {
      if (filtreStatut !== 'tous' && c.statut !== filtreStatut) return false;
      if (!s) return true;
      return `${c.numero_colis} ${c.numero_commande || ''} ${c.nom_client || ''}`.toLowerCase().includes(s);
    });
  }, [colis, search, filtreStatut]);

  const kpis = useMemo(() => {
    const total = colis.length;
    const poidsTotal = colis.reduce((s, c) => s + c.poids_kg, 0);
    const expedies = colis.filter((c) => c.statut === 'expedie' || c.statut === 'livre').length;
    const enAttente = colis.filter((c) => c.statut === 'brouillon' || c.statut === 'valide').length;
    return { total, poidsTotal, expedies, enAttente };
  }, [colis]);

  const openNew = () => {
    setEditing({
      id_colis: 0,
      numero_colis: `C${String(colis.length + 1).padStart(3, '0')}-${String(new Date().getFullYear()).slice(2)}-001`,
      poids_kg: 0,
      statut: 'brouillon',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id_colis) {
      await colisageService.update(editing.id_colis, editing).catch(() => {});
      setColis((prev) => prev.map((c) => (c.id_colis === editing.id_colis ? editing : c)));
    } else {
      const created = { ...editing, id_colis: Math.max(0, ...colis.map((c) => c.id_colis)) + 1 };
      await colisageService.create(created).catch(() => {});
      setColis((prev) => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const valider = async (id: number) => {
    await colisageService.valider(id).catch(() => {});
    setColis((prev) => prev.map((c) => (c.id_colis === id ? { ...c, statut: 'valide' as StatutColis } : c)));
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer ce colis ?')) return;
    await colisageService.remove(id).catch(() => {});
    setColis((prev) => prev.filter((c) => c.id_colis !== id));
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
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <Package className="w-8 h-8 text-[#C8663D]" />
              Liste de colisage
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Colis d'une commande — format C{'{XXX}'}-{'{YYY}'}-{'{NNN}'} &middot; §8.6
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau colis
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Colis totaux" value={kpis.total} icon={<Boxes className="w-5 h-5" />} color="terracotta" />
          <KpiCard
            label="Poids total (kg)"
            value={kpis.poidsTotal.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
            icon={<Weight className="w-5 h-5" />}
            color="indigo"
          />
          <KpiCard label="Expédiés / Livrés" value={kpis.expedies} icon={<CheckCircle2 className="w-5 h-5" />} color="sage" />
          <KpiCard label="En attente" value={kpis.enAttente} color="warning" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
              <input
                type="text"
                placeholder="Rechercher (n° colis, commande, client)"
                className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as any)}
              className="px-3 py-2 border border-[#DFD3B8] rounded-lg text-sm bg-white"
            >
              <option value="tous">Tous statuts</option>
              <option value="brouillon">Brouillon</option>
              <option value="valide">Validé</option>
              <option value="expedie">Expédié</option>
              <option value="livre">Livré</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">N° colis</th>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3 text-right">Poids (kg)</th>
                  <th className="px-4 py-3">Dimensions (L×l×H cm)</th>
                  <th className="px-4 py-3 text-right">Articles</th>
                  <th className="px-4 py-3">Transporteur</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[#9B8874]">
                      Aucun colis
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id_colis} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                      <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">{c.numero_colis}</td>
                      <td className="px-4 py-3 font-mono text-xs">{c.numero_commande || '—'}</td>
                      <td className="px-4 py-3">{c.nom_client || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono">{c.poids_kg}</td>
                      <td className="px-4 py-3 text-xs">
                        {c.longueur_cm || '—'} × {c.largeur_cm || '—'} × {c.hauteur_cm || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{c.nb_articles || '—'}</td>
                      <td className="px-4 py-3 text-xs">{c.transporteur_nom || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            c.statut === 'livre'
                              ? 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]'
                              : c.statut === 'expedie'
                              ? 'bg-[#EDF0F5] text-[#3B4E68] border-[#4A5D75]'
                              : c.statut === 'valide'
                              ? 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]'
                              : 'bg-gray-100 text-gray-600 border-gray-400'
                          }`}
                        >
                          {c.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setPreview(c)}
                            title="Générer étiquette"
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                          >
                            <Printer className="w-4 h-4 text-[#C8663D]" />
                          </button>
                          {c.statut === 'brouillon' && (
                            <button
                              onClick={() => valider(c.id_colis)}
                              title="Valider"
                              className="p-1.5 rounded hover:bg-[#EEF4F0]"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#4A6C5B]" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditing(c);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded hover:bg-[#EDF0F5]"
                          >
                            <Pencil className="w-4 h-4 text-[#3B4E68]" />
                          </button>
                          <button
                            onClick={() => remove(c.id_colis)}
                            className="p-1.5 rounded hover:bg-[#FBEBE4]"
                          >
                            <Trash2 className="w-4 h-4 text-[#B84A2F]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {editing.id_colis ? 'Modifier' : 'Nouveau'} colis
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <label>
                <span className="text-xs text-[#6B4E31]">N° colis</span>
                <input
                  type="text"
                  value={editing.numero_colis}
                  onChange={(e) => setEditing({ ...editing, numero_colis: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">N° commande</span>
                <input
                  type="text"
                  value={editing.numero_commande || ''}
                  onChange={(e) => setEditing({ ...editing, numero_commande: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="col-span-2">
                <span className="text-xs text-[#6B4E31]">Client</span>
                <input
                  type="text"
                  value={editing.nom_client || ''}
                  onChange={(e) => setEditing({ ...editing, nom_client: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Poids (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  value={editing.poids_kg}
                  onChange={(e) => setEditing({ ...editing, poids_kg: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Articles</span>
                <input
                  type="number"
                  value={editing.nb_articles || 0}
                  onChange={(e) => setEditing({ ...editing, nb_articles: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Long. (cm)</span>
                <input
                  type="number"
                  value={editing.longueur_cm || 0}
                  onChange={(e) => setEditing({ ...editing, longueur_cm: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Larg. (cm)</span>
                <input
                  type="number"
                  value={editing.largeur_cm || 0}
                  onChange={(e) => setEditing({ ...editing, largeur_cm: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Haut. (cm)</span>
                <input
                  type="number"
                  value={editing.hauteur_cm || 0}
                  onChange={(e) => setEditing({ ...editing, hauteur_cm: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Transporteur</span>
                <input
                  type="text"
                  value={editing.transporteur_nom || ''}
                  onChange={(e) => setEditing({ ...editing, transporteur_nom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Statut</span>
                <select
                  value={editing.statut}
                  onChange={(e) => setEditing({ ...editing, statut: e.target.value as StatutColis })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="brouillon">Brouillon</option>
                  <option value="valide">Validé</option>
                  <option value="expedie">Expédié</option>
                  <option value="livre">Livré</option>
                </select>
              </label>
            </div>
            <div className="p-4 border-t border-[#EDE3CE] flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#DFD3B8] rounded-lg text-sm">
                Annuler
              </button>
              <button onClick={save} className="px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] text-sm font-medium">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal étiquette */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="relative">
            <div className="absolute -top-12 right-0 flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white text-[#C8663D] rounded shadow inline-flex items-center gap-1 text-sm"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
              <button
                onClick={() => setPreview(null)}
                className="px-3 py-1.5 bg-white rounded shadow inline-flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" /> Fermer
              </button>
            </div>
            <EtiquetteColis colis={preview} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeColisage;
