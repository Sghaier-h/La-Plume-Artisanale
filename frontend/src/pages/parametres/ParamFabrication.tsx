import React, { useEffect, useState } from 'react';
import { Factory, Save, Plus, Trash2, Wrench, DollarSign } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Fabrication

interface GammeType { id: number; code: string; libelle: string; nb_etapes: number; duree_min: number; }
interface Poste { id: number; code: string; libelle: string; taux_horaire_dt: number; capacite_par_jour: number; }

const MOCK_GAMMES: GammeType[] = [
  { id: 1, code: 'FOUTA_STD', libelle: 'Fouta standard 100x180', nb_etapes: 5, duree_min: 90 },
  { id: 2, code: 'FOUTA_JQ', libelle: 'Fouta jacquard', nb_etapes: 7, duree_min: 180 },
  { id: 3, code: 'JETE_LIT', libelle: 'Jeté de lit 240x260', nb_etapes: 6, duree_min: 150 },
  { id: 4, code: 'SERVIETTE', libelle: 'Serviette 50x100', nb_etapes: 4, duree_min: 60 },
];

const MOCK_POSTES: Poste[] = [
  { id: 1, code: 'TISS', libelle: 'Tissage', taux_horaire_dt: 12, capacite_par_jour: 8 },
  { id: 2, code: 'COUPE', libelle: 'Coupe', taux_horaire_dt: 10, capacite_par_jour: 8 },
  { id: 3, code: 'FRAN', libelle: 'Frangeage / franges', taux_horaire_dt: 11, capacite_par_jour: 7 },
  { id: 4, code: 'FINITION', libelle: 'Finition / ourlets', taux_horaire_dt: 10, capacite_par_jour: 8 },
  { id: 5, code: 'CTRL', libelle: 'Contrôle qualité', taux_horaire_dt: 13, capacite_par_jour: 8 },
  { id: 6, code: 'EMB', libelle: 'Emballage', taux_horaire_dt: 9, capacite_par_jour: 8 },
];

const ParamFabrication: React.FC = () => {
  const [gammes, setGammes] = useState<GammeType[]>(MOCK_GAMMES);
  const [postes, setPostes] = useState<Poste[]>(MOCK_POSTES);
  const [fraisFixes, setFraisFixes] = useState({ loyer_atelier_mois: 4500, energie_mois: 1800, admin_mois: 3200, amortissements_mois: 2500 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/parametres/fabrication/gammes'),
        api.get('/api/v2/parametres/fabrication/postes'),
      ]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setGammes(pick(r[0], MOCK_GAMMES));
      setPostes(pick(r[1], MOCK_POSTES));
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
  const thStyle: React.CSSProperties = { color: 'var(--fg-muted, #8A6E4A)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
            <h1 className="text-3xl italic mb-1" style={h2Style}>Fabrication</h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Gammes, postes de travail, taux MO, frais fixes</p>
          </div>

          <div className="space-y-4">
            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Factory className="w-5 h-5" style={{ color: '#C8663D' }} /> Gammes types</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Libellé</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Étapes</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Durée (min)</th>
                  <th></th>
                </tr></thead>
                <tbody>{gammes.map(g => (
                  <tr key={g.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono text-xs">{g.code}</td>
                    <td className="py-2">{g.libelle}</td>
                    <td className="py-2 font-mono">{g.nb_etapes}</td>
                    <td className="py-2 font-mono">{g.duree_min}</td>
                    <td className="py-2 text-right"><button onClick={() => setGammes(gammes.filter(x => x.id !== g.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouvelle gamme</button>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><Wrench className="w-5 h-5" style={{ color: '#C8663D' }} /> Postes de travail & taux MO</h2>
              <table className="min-w-full text-sm">
                <thead><tr>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Code</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Poste</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Taux DT/h</th>
                  <th className="text-left pb-2 text-xs font-mono uppercase" style={thStyle}>Capacité h/jour</th>
                  <th></th>
                </tr></thead>
                <tbody>{postes.map(p => (
                  <tr key={p.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                    <td className="py-2 font-mono text-xs">{p.code}</td>
                    <td className="py-2">{p.libelle}</td>
                    <td className="py-2">
                      <input type="number" step="0.5" value={p.taux_horaire_dt} onChange={e => setPostes(postes.map(x => x.id === p.id ? { ...x, taux_horaire_dt: Number(e.target.value) } : x))} className="border rounded px-2 py-1 text-sm font-mono w-20" style={inputStyle} />
                    </td>
                    <td className="py-2">
                      <input type="number" value={p.capacite_par_jour} onChange={e => setPostes(postes.map(x => x.id === p.id ? { ...x, capacite_par_jour: Number(e.target.value) } : x))} className="border rounded px-2 py-1 text-sm font-mono w-20" style={inputStyle} />
                    </td>
                    <td className="py-2 text-right"><button onClick={() => setPostes(postes.filter(x => x.id !== p.id))} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              <div className="mt-3 flex gap-2">
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Plus className="w-4 h-4" /> Nouveau poste</button>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}><Save className="w-4 h-4" /> Enregistrer taux</button>
              </div>
            </div>

            <div className={cardCls}>
              <h2 className="text-lg italic mb-4 flex items-center gap-2" style={h2Style}><DollarSign className="w-5 h-5" style={{ color: '#C8663D' }} /> Frais fixes atelier (DT / mois)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Loyer</label>
                  <input type="number" value={fraisFixes.loyer_atelier_mois} onChange={e => setFraisFixes({ ...fraisFixes, loyer_atelier_mois: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Énergie</label>
                  <input type="number" value={fraisFixes.energie_mois} onChange={e => setFraisFixes({ ...fraisFixes, energie_mois: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Administratif</label>
                  <input type="number" value={fraisFixes.admin_mois} onChange={e => setFraisFixes({ ...fraisFixes, admin_mois: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Amortissements</label>
                  <input type="number" value={fraisFixes.amortissements_mois} onChange={e => setFraisFixes({ ...fraisFixes, amortissements_mois: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm font-mono" style={inputStyle} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E8DCC8' }}>
                <div className="text-sm">
                  Total <span className="font-mono font-bold ml-2" style={{ color: '#C8663D' }}>{(fraisFixes.loyer_atelier_mois + fraisFixes.energie_mois + fraisFixes.admin_mois + fraisFixes.amortissements_mois).toLocaleString('fr-FR')} DT / mois</span>
                </div>
                <button className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}><Save className="w-4 h-4" /> Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamFabrication;
