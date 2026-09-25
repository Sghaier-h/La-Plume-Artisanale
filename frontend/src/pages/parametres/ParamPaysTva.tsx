import React, { useEffect, useState } from 'react';
import { Globe, Plus, Trash2, Pencil, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Pays & TVA

interface Pays {
  id: number;
  code_iso2: string;
  nom: string;
  devise: string;
  ue: boolean;
  taux_tva_standard_pct: number;
  taux_tva_reduit_pct: number | null;
  autoliquidation_ue: boolean;
  note_conformite: string;
}

const MOCK_PAYS: Pays[] = [
  { id: 1, code_iso2: 'TN', nom: 'Tunisie', devise: 'DT', ue: false, taux_tva_standard_pct: 19, taux_tva_reduit_pct: 7, autoliquidation_ue: false, note_conformite: 'Taux normal 19%, réduit 7% et 13%. Export exonéré.' },
  { id: 2, code_iso2: 'FR', nom: 'France', devise: 'EUR', ue: true, taux_tva_standard_pct: 20, taux_tva_reduit_pct: 5.5, autoliquidation_ue: true, note_conformite: 'Autoliquidation TVA intra-UE si N° TVA client fourni.' },
  { id: 3, code_iso2: 'DE', nom: 'Allemagne', devise: 'EUR', ue: true, taux_tva_standard_pct: 19, taux_tva_reduit_pct: 7, autoliquidation_ue: true, note_conformite: 'Autoliquidation intra-UE. USt-IdNr obligatoire.' },
  { id: 4, code_iso2: 'IT', nom: 'Italie', devise: 'EUR', ue: true, taux_tva_standard_pct: 22, taux_tva_reduit_pct: 10, autoliquidation_ue: true, note_conformite: 'Autoliquidation intra-UE.' },
  { id: 5, code_iso2: 'ES', nom: 'Espagne', devise: 'EUR', ue: true, taux_tva_standard_pct: 21, taux_tva_reduit_pct: 10, autoliquidation_ue: true, note_conformite: 'Autoliquidation intra-UE.' },
  { id: 6, code_iso2: 'MA', nom: 'Maroc', devise: 'MAD', ue: false, taux_tva_standard_pct: 20, taux_tva_reduit_pct: 10, autoliquidation_ue: false, note_conformite: 'Export vers Maroc : régime hors TVA.' },
  { id: 7, code_iso2: 'DZ', nom: 'Algérie', devise: 'DZD', ue: false, taux_tva_standard_pct: 19, taux_tva_reduit_pct: 9, autoliquidation_ue: false, note_conformite: 'Vérifier accord commercial Maghreb.' },
  { id: 8, code_iso2: 'US', nom: 'États-Unis', devise: 'USD', ue: false, taux_tva_standard_pct: 0, taux_tva_reduit_pct: null, autoliquidation_ue: false, note_conformite: 'Sales tax État par État — souvent hors TVA à l\'export.' },
];

const ParamPaysTva: React.FC = () => {
  const [items, setItems] = useState<Pays[]>(MOCK_PAYS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Pays | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/parametres/pays-tva')]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setItems(pick(r[0], MOCK_PAYS));
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
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const inputStyle: React.CSSProperties = { borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' };
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };
  const thStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
              <h1 className="text-3xl italic mb-1" style={h2Style}>Pays & TVA</h1>
              <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Pays clients, taux TVA, autoliquidation intra-UE, notes conformité</p>
            </div>
            <button
              onClick={() => setEditing({ id: 0, code_iso2: '', nom: '', devise: 'EUR', ue: false, taux_tva_standard_pct: 0, taux_tva_reduit_pct: null, autoliquidation_ue: false, note_conformite: '' })}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: '#C8663D' }}
            >
              <Plus className="w-4 h-4" /> Nouveau pays
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E8DCC8]">
            <table className="min-w-full text-sm divide-y divide-[#E8DCC8]">
              <thead style={{ backgroundColor: 'var(--bg-subtle, #F5EFE4)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Pays</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Devise</th>
                  <th className="px-4 py-3 text-center text-xs font-mono uppercase" style={thStyle}>UE</th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase" style={thStyle}>TVA std.</th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase" style={thStyle}>TVA réd.</th>
                  <th className="px-4 py-3 text-center text-xs font-mono uppercase" style={thStyle}>Autoliq. UE</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase" style={thStyle}>Note conformité</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E7D4]">
                {items.map(p => (
                  <tr key={p.id} className="hover:bg-[#FDF2ED]/40 group">
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" style={{ color: '#C8663D' }} /> {p.code_iso2}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.nom}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.devise}</td>
                    <td className="px-4 py-3 text-center">
                      {p.ue && <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-700">UE</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold" style={{ color: '#C8663D' }}>{p.taux_tva_standard_pct}%</td>
                    <td className="px-4 py-3 text-right font-mono">{p.taux_tva_reduit_pct !== null ? `${p.taux_tva_reduit_pct}%` : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {p.autoliquidation_ue && <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700">Oui</span>}
                    </td>
                    <td className="px-4 py-3 text-xs italic" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{p.note_conformite}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditing(p)} className="p-1 rounded hover:bg-[#FDF2ED]" style={{ color: 'var(--fg-secondary, #5D4E42)' }}><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setItems(items.filter(x => x.id !== p.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-lg p-4 border flex items-start gap-3" style={{ borderColor: '#E5C67D', backgroundColor: '#FBF3E0' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#8A6412' }} />
            <div className="text-xs" style={{ color: '#8A6412' }}>
              <div className="font-semibold mb-1">Rappel réglementaire</div>
              L'autoliquidation TVA intra-UE nécessite un N° TVA valide côté client (VIES) et une mention explicite sur la facture : <span className="font-mono">« TVA due par le preneur — Article 196 Directive 2006/112/CE »</span>.
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="rounded-xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl italic" style={h2Style}>{editing.id === 0 ? 'Nouveau pays' : 'Modifier pays'}</h3>
                <button onClick={() => setEditing(null)}><X className="w-5 h-5" style={{ color: 'var(--fg-muted, #8A6E4A)' }} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Code ISO2</label>
                  <input value={editing.code_iso2} onChange={e => setEditing({ ...editing, code_iso2: e.target.value.toUpperCase() })} maxLength={2} className="w-full border rounded px-3 py-2 text-sm font-mono uppercase" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Devise</label>
                  <input value={editing.devise} onChange={e => setEditing({ ...editing, devise: e.target.value })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Nom</label>
                  <input value={editing.nom} onChange={e => setEditing({ ...editing, nom: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>TVA standard (%)</label>
                  <input type="number" step="0.1" value={editing.taux_tva_standard_pct} onChange={e => setEditing({ ...editing, taux_tva_standard_pct: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>TVA réduit (%)</label>
                  <input type="number" step="0.1" value={editing.taux_tva_reduit_pct ?? ''} onChange={e => setEditing({ ...editing, taux_tva_reduit_pct: e.target.value ? Number(e.target.value) : null })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="uechk" checked={editing.ue} onChange={e => setEditing({ ...editing, ue: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="uechk" className="text-sm">Membre UE</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="autolchk" checked={editing.autoliquidation_ue} onChange={e => setEditing({ ...editing, autoliquidation_ue: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="autolchk" className="text-sm">Autoliquidation UE</label>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Note conformité</label>
                  <textarea value={editing.note_conformite} onChange={e => setEditing({ ...editing, note_conformite: e.target.value })} rows={3} className="w-full border rounded px-3 py-2 text-sm" style={inputStyle} />
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

export default ParamPaysTva;
