import React, { useEffect, useState } from 'react';
import { Truck, Plus, Trash2, Pencil, X } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Transporteurs

interface Transporteur {
  id: number;
  nom: string;
  type: 'local' | 'national' | 'international';
  contact: string;
  telephone: string;
  zones: string;
  tarif_kg_dt: number;
  tarif_forfait_dt: number;
  delai_jours: number;
  actif: boolean;
}

const MOCK_TRANSPORTEURS: Transporteur[] = [
  { id: 1, nom: 'Aramex Tunisie', type: 'national', contact: 'Rachid Belhaj', telephone: '+216 71 234 567', zones: 'Tunisie entière', tarif_kg_dt: 1.8, tarif_forfait_dt: 12, delai_jours: 2, actif: true },
  { id: 2, nom: 'First Delivery', type: 'local', contact: 'Sonia Chebbi', telephone: '+216 74 123 456', zones: 'Grand Sfax', tarif_kg_dt: 0.9, tarif_forfait_dt: 6, delai_jours: 1, actif: true },
  { id: 3, nom: 'DHL Express', type: 'international', contact: 'Mohamed Ktari', telephone: '+216 71 998 877', zones: 'Europe / Monde', tarif_kg_dt: 28, tarif_forfait_dt: 65, delai_jours: 4, actif: true },
  { id: 4, nom: 'Poste tunisienne — Colis Plus', type: 'national', contact: 'Poste bureau Sfax', telephone: '+216 71 500 500', zones: 'Tunisie entière', tarif_kg_dt: 0.6, tarif_forfait_dt: 4, delai_jours: 5, actif: true },
  { id: 5, nom: 'UPS Tunisie', type: 'international', contact: 'Karim Ben Ali', telephone: '+216 71 776 655', zones: 'UE + Amérique du Nord', tarif_kg_dt: 32, tarif_forfait_dt: 75, delai_jours: 5, actif: false },
];

const TYPE_CFG = {
  local: { color: '#4A6C5B', bg: '#EEF4F0', label: 'Local' },
  national: { color: '#3B4E68', bg: '#EDF0F5', label: 'National' },
  international: { color: '#C8663D', bg: '#FDF2ED', label: 'International' },
} as const;

const ParamTransporteurs: React.FC = () => {
  const [items, setItems] = useState<Transporteur[]>(MOCK_TRANSPORTEURS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Transporteur | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/parametres/transporteurs')]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setItems(pick(r[0], MOCK_TRANSPORTEURS));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const saveItem = () => {
    if (!editing) return;
    if (editing.id === 0) {
      setItems([...items, { ...editing, id: Date.now() }]);
    } else {
      setItems(items.map(i => i.id === editing.id ? editing : i));
    }
    setEditing(null);
  };

  if (loading) {
    return (
      <div className="ml-72 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = { borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' };
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };
  const thStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
              <h1 className="text-3xl italic mb-1" style={h2Style}>Transporteurs</h1>
              <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Prestataires livraison, tarifs, zones, délais</p>
            </div>
            <button
              onClick={() => setEditing({ id: 0, nom: '', type: 'local', contact: '', telephone: '', zones: '', tarif_kg_dt: 0, tarif_forfait_dt: 0, delai_jours: 1, actif: true })}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: '#C8663D' }}
            >
              <Plus className="w-4 h-4" /> Nouveau transporteur
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E8DCC8]">
            <table className="min-w-full text-sm divide-y divide-[#E8DCC8]">
              <thead style={{ backgroundColor: 'var(--bg-subtle, #F5EFE4)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Transporteur</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Type</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Zones</th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase" style={thStyle}>Tarif</th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase" style={thStyle}>Délai</th>
                  <th className="px-4 py-3 text-center text-xs font-mono uppercase" style={thStyle}>Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E7D4]">
                {items.map(t => {
                  const cfg = TYPE_CFG[t.type];
                  return (
                    <tr key={t.id} className="hover:bg-[#FDF2ED]/40">
                      <td className="px-4 py-3 font-semibold">{t.nom}</td>
                      <td className="px-4 py-3"><span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span></td>
                      <td className="px-4 py-3 text-xs">
                        <div>{t.contact}</div>
                        <div className="font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{t.telephone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">{t.zones}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        <div>{t.tarif_kg_dt} DT/kg</div>
                        <div style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Forfait {t.tarif_forfait_dt} DT</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{t.delai_jours}j</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${t.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setEditing(t)} className="p-1 rounded hover:bg-[#FDF2ED]" style={{ color: 'var(--fg-secondary, #5D4E42)' }}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setItems(items.filter(x => x.id !== t.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="rounded-xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl italic" style={h2Style}>{editing.id === 0 ? 'Nouveau transporteur' : 'Modifier transporteur'}</h3>
                <button onClick={() => setEditing(null)}><X className="w-5 h-5" style={{ color: 'var(--fg-muted, #8A6E4A)' }} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Nom</label>
                  <input value={editing.nom} onChange={e => setEditing({ ...editing, nom: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Type</label>
                  <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value as any })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle}>
                    <option value="local">Local</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Délai (jours)</label>
                  <input type="number" value={editing.delai_jours} onChange={e => setEditing({ ...editing, delai_jours: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Contact</label>
                  <input value={editing.contact} onChange={e => setEditing({ ...editing, contact: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Téléphone</label>
                  <input value={editing.telephone} onChange={e => setEditing({ ...editing, telephone: e.target.value })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Zones desservies</label>
                  <input value={editing.zones} onChange={e => setEditing({ ...editing, zones: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Tarif DT / kg</label>
                  <input type="number" step="0.1" value={editing.tarif_kg_dt} onChange={e => setEditing({ ...editing, tarif_kg_dt: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Forfait (DT)</label>
                  <input type="number" step="0.5" value={editing.tarif_forfait_dt} onChange={e => setEditing({ ...editing, tarif_forfait_dt: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="actifchk" checked={editing.actif} onChange={e => setEditing({ ...editing, actif: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="actifchk" className="text-sm">Transporteur actif</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}>Annuler</button>
                <button onClick={saveItem} className="px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParamTransporteurs;
