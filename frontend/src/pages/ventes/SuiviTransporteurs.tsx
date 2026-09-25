import React, { useEffect, useMemo, useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Package,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import { transporteursService, Transporteur } from '../../services/ventesComplementsApi';

const MOCK_TRANSPORTEURS: Transporteur[] = [
  {
    id_transporteur: 1,
    nom: 'DHL Express',
    code: 'DHL',
    contact_nom: 'Karim Slama',
    contact_email: 'karim.slama@dhl.com',
    contact_telephone: '+216 71 900 100',
    tarif_base_dt: 25,
    tarif_par_kg: 1.8,
    zones_desservies: ['France', 'Belgique', 'Allemagne', 'Espagne'],
    taux_ponctualite_pct: 96.5,
    nb_expeditions_en_cours: 12,
    nb_livraisons_30j: 48,
    actif: true,
  },
  {
    id_transporteur: 2,
    nom: 'Aramex',
    code: 'ARX',
    contact_nom: 'Fatma Riahi',
    contact_email: 'fatma.riahi@aramex.tn',
    contact_telephone: '+216 71 234 890',
    tarif_base_dt: 18,
    tarif_par_kg: 1.4,
    zones_desservies: ['Tunisie', 'Algérie', 'Libye', 'Maroc'],
    taux_ponctualite_pct: 92.3,
    nb_expeditions_en_cours: 8,
    nb_livraisons_30j: 32,
    actif: true,
  },
  {
    id_transporteur: 3,
    nom: 'Fedex',
    code: 'FDX',
    contact_nom: 'Ahmed Ben Salah',
    contact_email: 'a.bensalah@fedex.com',
    contact_telephone: '+216 71 555 400',
    tarif_base_dt: 32,
    tarif_par_kg: 2.2,
    zones_desservies: ['Monde entier'],
    taux_ponctualite_pct: 98.1,
    nb_expeditions_en_cours: 5,
    nb_livraisons_30j: 19,
    actif: true,
  },
  {
    id_transporteur: 4,
    nom: 'Rapid Post Tunisie',
    code: 'RPT',
    contact_nom: 'Ines Hamdi',
    contact_email: 'contact@rapidpost.tn',
    contact_telephone: '+216 71 100 200',
    tarif_base_dt: 12,
    tarif_par_kg: 0.9,
    zones_desservies: ['Tunisie'],
    taux_ponctualite_pct: 88.7,
    nb_expeditions_en_cours: 22,
    nb_livraisons_30j: 96,
    actif: true,
  },
  {
    id_transporteur: 5,
    nom: 'STF International',
    code: 'STF',
    contact_nom: 'Sami Khemiri',
    contact_email: 'sami@stf-intl.tn',
    contact_telephone: '+216 71 700 300',
    tarif_base_dt: 45,
    tarif_par_kg: 2.5,
    zones_desservies: ['France', 'Italie', 'Espagne', 'Algérie'],
    taux_ponctualite_pct: 84.2,
    nb_expeditions_en_cours: 3,
    nb_livraisons_30j: 12,
    actif: false,
  },
];

const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const SuiviTransporteurs: React.FC = () => {
  const [transporteurs, setTransporteurs] = useState<Transporteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Transporteur | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([transporteursService.list()]);
      if (cancelled) return;
      setTransporteurs(pickArray<Transporteur>(res, 'transporteurs', MOCK_TRANSPORTEURS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return transporteurs.filter((t) => {
      if (!s) return true;
      return `${t.nom} ${t.code || ''} ${t.contact_nom || ''} ${(t.zones_desservies || []).join(' ')}`
        .toLowerCase()
        .includes(s);
    });
  }, [transporteurs, search]);

  const kpis = useMemo(() => {
    const actifs = transporteurs.filter((t) => t.actif).length;
    const totalExpeditions = transporteurs.reduce((s, t) => s + (t.nb_expeditions_en_cours || 0), 0);
    const totalLivraisons = transporteurs.reduce((s, t) => s + (t.nb_livraisons_30j || 0), 0);
    const ponctualiteMoyenne =
      transporteurs.length > 0
        ? transporteurs.reduce((s, t) => s + (t.taux_ponctualite_pct || 0), 0) / transporteurs.length
        : 0;
    return { actifs, totalExpeditions, totalLivraisons, ponctualiteMoyenne };
  }, [transporteurs]);

  const openNew = () => {
    setEditing({
      id_transporteur: 0,
      nom: '',
      tarif_base_dt: 0,
      actif: true,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!editing) return;
    if (editing.id_transporteur) {
      await transporteursService.update(editing.id_transporteur, editing).catch(() => {});
      setTransporteurs((prev) =>
        prev.map((t) => (t.id_transporteur === editing.id_transporteur ? editing : t)),
      );
    } else {
      const created = { ...editing, id_transporteur: Math.max(0, ...transporteurs.map((t) => t.id_transporteur)) + 1 };
      await transporteursService.create(created).catch(() => {});
      setTransporteurs((prev) => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer ce transporteur ?')) return;
    await transporteursService.remove(id).catch(() => {});
    setTransporteurs((prev) => prev.filter((t) => t.id_transporteur !== id));
  };

  const ponctualiteBadge = (p?: number) => {
    if (p == null) return null;
    const cls =
      p >= 95
        ? 'bg-[#EEF4F0] text-[#4A6C5B] border-[#7A8C6A]'
        : p >= 90
        ? 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]'
        : 'bg-[#FBEBE4] text-[#B84A2F] border-[#B84A2F]';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${cls}`}>
        <TrendingUp className="w-3 h-3" />
        {p.toFixed(1)}%
      </span>
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
    <div className="min-h-screen bg-[#FBF8F3] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#2F1F12] flex items-center gap-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              <Truck className="w-8 h-8 text-[#C8663D]" />
              Suivi transporteurs
            </h1>
            <p className="text-sm text-[#6B4E31] mt-1">
              Transporteurs, expéditions en cours & performance &middot; §8.7
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C8663D] text-white rounded-lg hover:bg-[#B85528] font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau transporteur
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard label="Transporteurs actifs" value={kpis.actifs} icon={<Truck className="w-5 h-5" />} color="terracotta" />
          <KpiCard label="Expéditions en cours" value={kpis.totalExpeditions} icon={<Package className="w-5 h-5" />} color="indigo" />
          <KpiCard label="Livraisons 30 j" value={kpis.totalLivraisons} color="sage" />
          <KpiCard
            label="Ponctualité moyenne"
            value={`${kpis.ponctualiteMoyenne.toFixed(1)}`}
            suffix="%"
            icon={<TrendingUp className="w-5 h-5" />}
            color={kpis.ponctualiteMoyenne >= 92 ? 'sage' : 'warning'}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-4 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8874]" />
            <input
              type="text"
              placeholder="Rechercher (nom, contact, zone)"
              className="pl-9 pr-3 py-2 w-full border border-[#DFD3B8] rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8663D]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id_transporteur}
              className={`bg-white rounded-xl shadow-sm border border-[#EDE3CE] p-5 ${!t.actif ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xs text-[#9B8874] uppercase tracking-wide font-mono">
                    {t.code || '—'}
                  </div>
                  <div className="text-lg font-semibold text-[#C8663D]" style={{ fontFamily: 'Fraunces, serif' }}>
                    {t.nom}
                  </div>
                </div>
                {ponctualiteBadge(t.taux_ponctualite_pct)}
              </div>

              <div className="space-y-1.5 text-sm mb-3">
                {t.contact_nom && (
                  <div className="text-[#6B4E31]">👤 {t.contact_nom}</div>
                )}
                {t.contact_telephone && (
                  <div className="text-[#6B4E31] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {t.contact_telephone}
                  </div>
                )}
                {t.contact_email && (
                  <div className="text-[#6B4E31] flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> <span className="truncate">{t.contact_email}</span>
                  </div>
                )}
                {t.zones_desservies && t.zones_desservies.length > 0 && (
                  <div className="text-[#6B4E31] flex items-start gap-1 text-xs">
                    <MapPin className="w-3.5 h-3.5 mt-0.5" />
                    <span>{t.zones_desservies.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div className="bg-[#EDF0F5] rounded p-2">
                  <div className="text-[10px] text-[#3B4E68]">Tarif base</div>
                  <div className="font-mono font-bold text-[#4A5D75]">{t.tarif_base_dt} DT</div>
                </div>
                <div className="bg-[#EEF4F0] rounded p-2">
                  <div className="text-[10px] text-[#4A6C5B]">Tarif / kg</div>
                  <div className="font-mono font-bold text-[#4A6C5B]">
                    {t.tarif_par_kg ? `${t.tarif_par_kg} DT` : '—'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-[#9B8874]">En cours</div>
                  <div className="font-bold text-[#C8663D]">{t.nb_expeditions_en_cours || 0}</div>
                </div>
                <div>
                  <div className="text-[#9B8874]">Livraisons 30 j</div>
                  <div className="font-bold text-[#4A6C5B]">{t.nb_livraisons_30j || 0}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#EDE3CE] flex justify-end gap-1">
                <button
                  onClick={() => {
                    setEditing(t);
                    setShowForm(true);
                  }}
                  className="p-1.5 rounded hover:bg-[#FDF2ED]"
                >
                  <Pencil className="w-4 h-4 text-[#C8663D]" />
                </button>
                <button onClick={() => remove(t.id_transporteur)} className="p-1.5 rounded hover:bg-[#FBEBE4]">
                  <Trash2 className="w-4 h-4 text-[#B84A2F]" />
                </button>
              </div>
            </div>
          ))}
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
                {editing.id_transporteur ? 'Modifier' : 'Nouveau'} transporteur
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <label className="col-span-2">
                <span className="text-xs text-[#6B4E31]">Nom</span>
                <input
                  type="text"
                  value={editing.nom}
                  onChange={(e) => setEditing({ ...editing, nom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Code</span>
                <input
                  type="text"
                  value={editing.code || ''}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Contact — nom</span>
                <input
                  type="text"
                  value={editing.contact_nom || ''}
                  onChange={(e) => setEditing({ ...editing, contact_nom: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Email</span>
                <input
                  type="email"
                  value={editing.contact_email || ''}
                  onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Téléphone</span>
                <input
                  type="tel"
                  value={editing.contact_telephone || ''}
                  onChange={(e) => setEditing({ ...editing, contact_telephone: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Tarif base (DT)</span>
                <input
                  type="number"
                  step="0.01"
                  value={editing.tarif_base_dt}
                  onChange={(e) => setEditing({ ...editing, tarif_base_dt: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label>
                <span className="text-xs text-[#6B4E31]">Tarif par kg (DT)</span>
                <input
                  type="number"
                  step="0.01"
                  value={editing.tarif_par_kg || 0}
                  onChange={(e) => setEditing({ ...editing, tarif_par_kg: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="col-span-2">
                <span className="text-xs text-[#6B4E31]">Zones desservies (séparées par virgule)</span>
                <input
                  type="text"
                  value={(editing.zones_desservies || []).join(', ')}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      zones_desservies: e.target.value.split(',').map((z) => z.trim()).filter(Boolean),
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border border-[#DFD3B8] rounded"
                />
              </label>
              <label className="col-span-2 inline-flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={editing.actif}
                  onChange={(e) => setEditing({ ...editing, actif: e.target.checked })}
                />
                <span className="text-sm">Actif</span>
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

export default SuiviTransporteurs;
