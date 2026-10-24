import React, { useEffect, useState } from 'react';
import { ShoppingCart, Save, Plus, Trash2, Percent, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Vente

interface Grille { id: number; nom: string; type: 'grossiste' | 'detail' | 'export' | 'promo'; remise_pct: number; }
interface Condition { id: number; code: string; libelle: string; jours: number; }
interface SeuilRelance { niveau: number; jours: number; canal: string; action: string; }

const MOCK_GRILLES: Grille[] = [
  { id: 1, nom: 'Grossiste B2B', type: 'grossiste', remise_pct: 25 },
  { id: 2, nom: 'Détail boutique', type: 'detail', remise_pct: 0 },
  { id: 3, nom: 'Export UE', type: 'export', remise_pct: 15 },
  { id: 4, nom: 'Promo saison', type: 'promo', remise_pct: 20 },
];

const MOCK_CONDITIONS: Condition[] = [
  { id: 1, code: 'COMPTANT', libelle: 'Comptant', jours: 0 },
  { id: 2, code: '30J', libelle: '30 jours net', jours: 30 },
  { id: 3, code: '45J_FIN_MOIS', libelle: '45j fin de mois', jours: 45 },
  { id: 4, code: '60J', libelle: '60 jours net', jours: 60 },
  { id: 5, code: 'ACOMPTE_30', libelle: '30% acompte + solde 30j', jours: 30 },
];

const MOCK_RELANCES: SeuilRelance[] = [
  { niveau: 1, jours: 7, canal: 'email', action: 'Rappel courtois' },
  { niveau: 2, jours: 30, canal: 'email + SMS', action: 'Relance ferme' },
  { niveau: 3, jours: 60, canal: 'appel + email', action: 'Mise en demeure' },
  { niveau: 4, jours: 90, canal: 'huissier', action: 'Contentieux' },
];

const ParamVente: React.FC = () => {
  const [grilles, setGrilles] = useState<Grille[]>(MOCK_GRILLES);
  const [conditions, setConditions] = useState<Condition[]>(MOCK_CONDITIONS);
  const [relances, setRelances] = useState<SeuilRelance[]>(MOCK_RELANCES);
  const [commission, setCommission] = useState({ base: 3, palier1: { seuil: 50000, taux: 4 }, palier2: { seuil: 100000, taux: 5 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/parametres/vente/grilles'),
        api.get('/api/v2/parametres/vente/conditions'),
        api.get('/api/v2/parametres/vente/relances'),
      ]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setGrilles(pick(r[0], MOCK_GRILLES));
      setConditions(pick(r[1], MOCK_CONDITIONS));
      setRelances(pick(r[2], MOCK_RELANCES));
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

  const inputCls = 'border rounded px-2 py-1.5 text-sm';
  const inputStyle: React.CSSProperties = { borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' };
  const cardCls = 'bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]';
  const h2Cls = 'text-lg italic mb-4 flex items-center gap-2';
  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };
  const thCls = 'text-left pb-2 text-xs font-mono uppercase';
  const thStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
            <h1 className="text-3xl italic mb-1" style={h2Style}>Vente</h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Grilles tarifaires, conditions paiement, relances, commissions</p>
          </div>

          <div className="space-y-4">
            {/* Grilles */}
            <div className={cardCls}>
              <h2 className={h2Cls} style={h2Style}><ShoppingCart className="w-5 h-5" style={{ color: '#C8663D' }} /> Grilles tarifaires</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className={thCls} style={thStyle}>Nom</th>
                  <th className={thCls} style={thStyle}>Type</th>
                  <th className={thCls} style={thStyle}>Remise</th>
                  <th></th>
                </tr></thead>
                <tbody>{grilles.map(g => (
                  <tr key={g.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2">{g.nom}</td>
                    <td className="py-2 capitalize text-xs font-mono">{g.type}</td>
                    <td className="py-2 font-mono">{g.remise_pct}%</td>
                    <td className="py-2 text-right"><button onClick={() => setGrilles(grilles.filter(x => x.id !== g.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouvelle grille</button>
            </div>

            {/* Conditions paiement */}
            <div className={cardCls}>
              <h2 className={h2Cls} style={h2Style}><Clock className="w-5 h-5" style={{ color: '#C8663D' }} /> Conditions de paiement</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className={thCls} style={thStyle}>Code</th>
                  <th className={thCls} style={thStyle}>Libellé</th>
                  <th className={thCls} style={thStyle}>Jours</th>
                  <th></th>
                </tr></thead>
                <tbody>{conditions.map(c => (
                  <tr key={c.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono text-xs">{c.code}</td>
                    <td className="py-2">{c.libelle}</td>
                    <td className="py-2 font-mono">{c.jours} j</td>
                    <td className="py-2 text-right"><button onClick={() => setConditions(conditions.filter(x => x.id !== c.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouvelle condition</button>
            </div>

            {/* Relances */}
            <div className={cardCls}>
              <h2 className={h2Cls} style={h2Style}><AlertTriangle className="w-5 h-5" style={{ color: '#C8663D' }} /> Seuils de relance</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className={thCls} style={thStyle}>Niveau</th>
                  <th className={thCls} style={thStyle}>Après (jours)</th>
                  <th className={thCls} style={thStyle}>Canal</th>
                  <th className={thCls} style={thStyle}>Action</th>
                </tr></thead>
                <tbody>{relances.map(r => (
                  <tr key={r.niveau} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2"><span className="inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))', color: '#C8663D' }}>{r.niveau}</span></td>
                    <td className="py-2 font-mono">J+{r.jours}</td>
                    <td className="py-2 text-xs">{r.canal}</td>
                    <td className="py-2">{r.action}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            {/* Commissions */}
            <div className={cardCls}>
              <h2 className={h2Cls} style={h2Style}><Percent className="w-5 h-5" style={{ color: '#C8663D' }} /> Commissions commerciaux (%)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Taux base</label>
                  <input type="number" step="0.1" value={commission.base} onChange={e => setCommission({ ...commission, base: Number(e.target.value) })} className={`${inputCls} font-mono w-full`} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Palier 1 &gt; {commission.palier1.seuil} DT</label>
                  <input type="number" step="0.1" value={commission.palier1.taux} onChange={e => setCommission({ ...commission, palier1: { ...commission.palier1, taux: Number(e.target.value) } })} className={`${inputCls} font-mono w-full`} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Palier 2 &gt; {commission.palier2.seuil} DT</label>
                  <input type="number" step="0.1" value={commission.palier2.taux} onChange={e => setCommission({ ...commission, palier2: { ...commission.palier2, taux: Number(e.target.value) } })} className={`${inputCls} font-mono w-full`} style={inputStyle} />
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

export default ParamVente;
