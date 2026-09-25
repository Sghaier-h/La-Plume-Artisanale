import React, { useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Boxes,
  Ruler,
  Truck,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import { palettesService, Palette } from '../../services/ventesComplementsApi';

const MOCK_PALETTES: Palette[] = [
  {
    id_palette: 1,
    numero_palette: 'PAL26-001',
    id_commande: 501,
    numero_commande: 'CMD-2026-0501',
    nb_colis: 8,
    poids_total_kg: 78.5,
    hauteur_cm: 145,
    destination: 'Paris — France',
    id_transporteur: 1,
    transporteur_nom: 'DHL Freight',
    type_palette: 'EUR',
    statut: 'expediee',
    date_expedition: new Date(Date.now() - 5 * 86400_000).toISOString().slice(0, 10),
  },
  {
    id_palette: 2,
    numero_palette: 'PAL26-002',
    id_commande: 502,
    numero_commande: 'CMD-2026-0502',
    nb_colis: 12,
    poids_total_kg: 124.2,
    hauteur_cm: 168,
    destination: 'Djerba — Tunisie',
    transporteur_nom: 'Rapid Post',
    type_palette: 'EUR',
    statut: 'preparee',
  },
  {
    id_palette: 3,
    numero_palette: 'PAL26-003',
    id_commande: 504,
    numero_commande: 'CMD-2026-0504',
    nb_colis: 6,
    poids_total_kg: 62.8,
    hauteur_cm: 120,
    destination: 'Alger — Algérie',
    transporteur_nom: 'STF International',
    type_palette: 'US',
    statut: 'preparee',
  },
  {
    id_palette: 4,
    numero_palette: 'PAL25-289',
    id_commande: 498,
    numero_commande: 'CMD-2025-0498',
    nb_colis: 15,
    poids_total_kg: 195.4,
    hauteur_cm: 180,
    destination: 'Marseille — France',
    transporteur_nom: 'DHL Freight',
    type_palette: 'EUR',
    statut: 'livree',
    date_expedition: new Date(Date.now() - 25 * 86400_000).toISOString().slice(0, 10),
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const ListePalettes: React.FC = () => {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Palette | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([palettesService.list()]);
      if (cancelled) return;
      setPalettes(pickArray<Palette>(res, 'palettes', MOCK_PALETTES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return palettes.filter((p) => {
      if (!s) return true;
      return `${p.numero_palette} ${p.numero_commande || ''} ${p.destination || ''} ${p.transporteur_nom || ''}`
        .toLowerCase()
        .includes(s);
    });
  }, [palettes, search]);

  const kpis = useMemo(() => {
    const total = palettes.length;
    const colisTotal = palettes.reduce((s, p) => s + p.nb_colis, 0);
    const poidsTotal = palettes.reduce((s, p) => s + p.poids_total_kg, 0);
    const enPrep = palettes.filter((p) => p.statut === 'preparee').length;
    return { total, colisTotal, poidsTotal, enPrep };
  }, [palettes]);

  const openNew = () => {
    setEditing({
      id_palette: 0,
      numero_palette: `PAL${String(new Date().getFullYear()).slice(2)}-${String(palettes.length + 1).padStart(3, '0')}`,
      nb_colis: 0,
      poids_total_kg: 0,
      hauteur_cm: 0,
      type_palette: 'EUR',
      statut: 'preparee',
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id_palette) {
      await palettesService.update(editing.id_palette, editing).catch(() => {});
      setPalettes((prev) => prev.map((p) => (p.id_palette === editing.id_palette ? editing : p)));
    } else {
      const created = { ...editing, id_palette: Math.max(0, ...palettes.map((p) => p.id_palette)) + 1 };
      await palettesService.create(created).catch(() => {});
      setPalettes((prev) => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette palette ?')) return;
    await palettesService.remove(id).catch(() => {});
    setPalettes((prev) => prev.filter((p) => p.id_palette !== id));
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
              <Layers className="w-8 h-8 text-[#C8663D]" />
              Palettes
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Palettes groupant colis — format PAL{'{YY}'}-{'{seq}'} &middot; §8.7
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle palette
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Palettes totales" value={kpis.total} icon={<Layers className="w-5 h-5" />} color="terracotta" />
          <KpiCard label="Colis groupés" value={kpis.colisTotal} icon={<Boxes className="w-5 h-5" />} color="indigo" />
          <KpiCard
            label="Poids total (kg)"
            value={kpis.poidsTotal.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
            icon={<Ruler className="w-5 h-5" />}
            color="sage"
          />
          <KpiCard label="En préparation" value={kpis.enPrep} color="warning" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
            <input
              type="text"
              placeholder="Rechercher (n° palette, commande, destination, transporteur)"
              className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F5EFE5] text-left text-[11px] font-semibold text-[#6B4E31] uppercase tracking-wide">
                  <th className="px-4 py-3">N° palette</th>
                  <th className="px-4 py-3">Commande</th>
                  <th className="px-4 py-3 text-right">Colis</th>
                  <th className="px-4 py-3 text-right">Poids (kg)</th>
                  <th className="px-4 py-3 text-right">Hauteur (cm)</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Transporteur</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-10 text-[#9B8874]">
                      Aucune palette
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id_palette} className="border-t border-[#EDE3CE] hover:bg-[#FBF8F3]">
                      <td className="px-4 py-3 font-mono text-xs text-[#4A5D75] font-semibold">{p.numero_palette}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.numero_commande || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono">{p.nb_colis}</td>
                      <td className="px-4 py-3 text-right font-mono">{p.poids_total_kg}</td>
                      <td className="px-4 py-3 text-right font-mono">{p.hauteur_cm}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EDF0F5] text-[#3B4E68] border border-[#4A5D75]/30">
                          {p.type_palette}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#6B4E31] text-xs">{p.destination || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Truck className="w-3 h-3 text-[#C8663D]" />
                          {p.transporteur_nom || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            p.statut === 'livree'
                              ? 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]'
                              : p.statut === 'expediee'
                              ? 'bg-[#EDF0F5] text-[#3B4E68] border-[#4A5D75]'
                              : 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]'
                          }`}
                        >
                          {p.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditing(p);
                              setShowForm(true);
                            }}
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                          >
                            <Pencil className="w-4 h-4 text-[#C8663D]" />
                          </button>
                          <button onClick={() => remove(p.id_palette)} className="p-1.5 rounded hover:bg-[#FBEBE4]">
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

      {showForm && editing && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#EDE3CE]">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif' }}>
                {editing.id_palette ? 'Modifier' : 'Nouvelle'} palette
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <label>
                <span className="text-xs text-[#6B4E31]">N° palette</span>
                <input
                  type="text"
                  value={editing.numero_palette}
                  onChange={(e) => setEditing({ ...editing, numero_palette: e.target.value })}
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
              <label>
                <span className="text-xs text-[#6B4E31]">Nb colis</span>
                <input
                  type="number"
                  value={editing.nb_colis}
                  onChange={(e) => setEditing({ ...editing, nb_colis: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Poids total (kg)</span>
                <input
                  type="number"
                  step="0.1"
                  value={editing.poids_total_kg}
                  onChange={(e) => setEditing({ ...editing, poids_total_kg: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Hauteur (cm)</span>
                <input
                  type="number"
                  value={editing.hauteur_cm}
                  onChange={(e) => setEditing({ ...editing, hauteur_cm: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Type palette</span>
                <select
                  value={editing.type_palette}
                  onChange={(e) => setEditing({ ...editing, type_palette: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="EUR">EUR (europalette)</option>
                  <option value="US">US (industrielle)</option>
                  <option value="perdue">Perdue</option>
                </select>
              </label>
              <label className="col-span-2">
                <span className="text-xs text-[#6B4E31]">Destination</span>
                <input
                  type="text"
                  value={editing.destination || ''}
                  onChange={(e) => setEditing({ ...editing, destination: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="col-span-2">
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
                  onChange={(e) => setEditing({ ...editing, statut: e.target.value as any })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                >
                  <option value="preparee">Préparée</option>
                  <option value="expediee">Expédiée</option>
                  <option value="livree">Livrée</option>
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
    </div>
  );
};

export default ListePalettes;
