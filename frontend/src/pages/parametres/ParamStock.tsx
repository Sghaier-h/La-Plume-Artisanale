import React, { useEffect, useState } from 'react';
import { Warehouse, Save, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Stock

interface SeuilCat { id: number; categorie: string; seuil_min: number; seuil_max: number; unite: string; }

const MOCK_SEUILS: SeuilCat[] = [
  { id: 1, categorie: 'Matières premières coton', seuil_min: 500, seuil_max: 5000, unite: 'kg' },
  { id: 2, categorie: 'Matières premières lin', seuil_min: 200, seuil_max: 2000, unite: 'kg' },
  { id: 3, categorie: 'Fils tissage', seuil_min: 50, seuil_max: 800, unite: 'cônes' },
  { id: 4, categorie: 'Produits finis foutas', seuil_min: 100, seuil_max: 1500, unite: 'unités' },
  { id: 5, categorie: 'Consommables emballage', seuil_min: 50, seuil_max: 500, unite: 'unités' },
];

const ParamStock: React.FC = () => {
  const [seuils, setSeuils] = useState<SeuilCat[]>(MOCK_SEUILS);
  const [methode, setMethode] = useState<'PMP' | 'FIFO' | 'LIFO'>('PMP');
  const [inventaireTournant, setInventaireTournant] = useState({
    frequence_jours: 30,
    pct_articles_par_periode: 10,
    priorite_forte_rotation: true,
    alertes_ecart_pct: 5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/parametres/stock/seuils')]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setSeuils(pick(r[0], MOCK_SEUILS));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const cardCls = 'bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]';
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };
  const inputStyle: React.CSSProperties = { borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
            <h1 className="text-3xl italic mb-1" style={h2Style}>Stock</h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Seuils alerte, méthode de valorisation, inventaire tournant</p>
          </div>

          <div className="space-y-4">
            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><AlertTriangle className="w-5 h-5" style={{ color: '#C8663D' }} /> Seuils d'alerte par catégorie</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Catégorie</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Seuil min.</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Seuil max.</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Unité</th>
                </tr></thead>
                <tbody>{seuils.map(s => (
                  <tr key={s.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2">{s.categorie}</td>
                    <td className="py-2">
                      <input type="number" value={s.seuil_min} onChange={e => setSeuils(seuils.map(x => x.id === s.id ? { ...x, seuil_min: Number(e.target.value) } : x))} className="border rounded px-2 py-1 text-sm font-mono w-24" style={inputStyle} />
                    </td>
                    <td className="py-2">
                      <input type="number" value={s.seuil_max} onChange={e => setSeuils(seuils.map(x => x.id === s.id ? { ...x, seuil_max: Number(e.target.value) } : x))} className="border rounded px-2 py-1 text-sm font-mono w-24" style={inputStyle} />
                    </td>
                    <td className="py-2 text-xs font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{s.unite}</td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Save className="w-4 h-4" /> Enregistrer</button>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Package className="w-5 h-5" style={{ color: '#C8663D' }} /> Méthode de valorisation</h2>
              <div className="flex gap-3">
                {(['PMP', 'FIFO', 'LIFO'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setMethode(m)}
                    className={`px-4 py-3 rounded-lg text-sm font-semibold border ${methode === m ? 'text-white' : ''}`}
                    style={methode === m ? { backgroundColor: '#C8663D', borderColor: '#C8663D' } : { backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}
                  >
                    {m}
                    <div className="text-[10px] font-normal mt-1 opacity-80">
                      {m === 'PMP' && 'Prix moyen pondéré'}
                      {m === 'FIFO' && 'Premier entré premier sorti'}
                      {m === 'LIFO' && 'Dernier entré premier sorti'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs italic" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                Recommandation Tunisie : PMP (méthode acceptée par le fisc)
              </div>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><RefreshCw className="w-5 h-5" style={{ color: '#C8663D' }} /> Inventaire tournant</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Fréquence (jours)</label>
                  <input type="number" value={inventaireTournant.frequence_jours} onChange={e => setInventaireTournant({ ...inventaireTournant, frequence_jours: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>% articles / période</label>
                  <input type="number" value={inventaireTournant.pct_articles_par_periode} onChange={e => setInventaireTournant({ ...inventaireTournant, pct_articles_par_periode: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Alerte écart (%)</label>
                  <input type="number" value={inventaireTournant.alertes_ecart_pct} onChange={e => setInventaireTournant({ ...inventaireTournant, alertes_ecart_pct: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input type="checkbox" checked={inventaireTournant.priorite_forte_rotation} onChange={e => setInventaireTournant({ ...inventaireTournant, priorite_forte_rotation: e.target.checked })} id="rotchk" className="w-4 h-4" />
                  <label htmlFor="rotchk" className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Priorité forte rotation ABC</label>
                </div>
              </div>
              <button className="mt-4 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamStock;
