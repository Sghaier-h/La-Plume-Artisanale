import React, { useEffect, useState } from 'react';
import { Percent, Plus, Trash2, Save } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres Commissions commerciaux

type TypeRegle = 'pct_ca' | 'palier' | 'produit' | 'client' | 'mixte';

interface RegleCommission {
  id: number;
  nom: string;
  type: TypeRegle;
  taux_base_pct: number;
  paliers: { seuil_dt: number; taux_pct: number }[];
  produit_ciblage: string | null;
  client_ciblage: string | null;
  actif: boolean;
}

const MOCK_REGLES: RegleCommission[] = [
  {
    id: 1,
    nom: 'Standard commercial B2B',
    type: 'pct_ca',
    taux_base_pct: 3,
    paliers: [],
    produit_ciblage: null,
    client_ciblage: null,
    actif: true,
  },
  {
    id: 2,
    nom: 'Palier progressif salon export',
    type: 'palier',
    taux_base_pct: 4,
    paliers: [
      { seuil_dt: 50000, taux_pct: 4 },
      { seuil_dt: 100000, taux_pct: 5 },
      { seuil_dt: 200000, taux_pct: 6 },
    ],
    produit_ciblage: null,
    client_ciblage: 'Export UE + International',
    actif: true,
  },
  {
    id: 3,
    nom: 'Bonus produit premium (jacquard)',
    type: 'produit',
    taux_base_pct: 5,
    paliers: [],
    produit_ciblage: 'Foutas Jacquard + Jetés lin',
    client_ciblage: null,
    actif: true,
  },
  {
    id: 4,
    nom: 'Grands comptes hôteliers',
    type: 'client',
    taux_base_pct: 2.5,
    paliers: [],
    produit_ciblage: null,
    client_ciblage: 'Hôtels 4-5 étoiles Sousse/Djerba',
    actif: true,
  },
  {
    id: 5,
    nom: 'Mixte revendeurs (base + palier)',
    type: 'mixte',
    taux_base_pct: 2,
    paliers: [
      { seuil_dt: 30000, taux_pct: 3 },
      { seuil_dt: 75000, taux_pct: 4.5 },
    ],
    produit_ciblage: null,
    client_ciblage: 'Revendeurs indépendants',
    actif: false,
  },
];

const TYPE_CFG: Record<TypeRegle, { label: string; color: string; bg: string }> = {
  pct_ca: { label: '% CA', color: '#4A6C5B', bg: '#EEF4F0' },
  palier: { label: 'Palier progressif', color: '#3B4E68', bg: '#EDF0F5' },
  produit: { label: 'Ciblage produit', color: '#C8663D', bg: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))' },
  client: { label: 'Ciblage client', color: '#8A6412', bg: 'color-mix(in srgb, var(--accent-gold) 15%, var(--bg-elevated))' },
  mixte: { label: 'Mixte', color: '#B84A4A', bg: '#FBECEC' },
};

const ParamCommissions: React.FC = () => {
  const [regles, setRegles] = useState<RegleCommission[]>(MOCK_REGLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/parametres/commissions')]);
      if (cancelled) return;
      const pick = <T,>(res: PromiseSettledResult<any>, fb: T[]): T[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        return Array.isArray(d) ? d : fb;
      };
      setRegles(pick(r[0], MOCK_REGLES));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const toggleActif = (id: number) => {
    setRegles(regles.map(r => r.id === id ? { ...r, actif: !r.actif } : r));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  const h2Style: React.CSSProperties = { fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>§15 · Paramètres</div>
              <h1 className="text-3xl italic mb-1" style={h2Style}>Commissions commerciaux</h1>
              <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>Règles % CA, paliers, ciblage produit / client, mixte</p>
            </div>
            <button className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white" style={{ backgroundColor: '#C8663D' }}>
              <Plus className="w-4 h-4" /> Nouvelle règle
            </button>
          </div>

          <div className="space-y-3">
            {regles.map(r => {
              const cfg = TYPE_CFG[r.type];
              return (
                <div key={r.id} className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg italic" style={h2Style}>{r.nom}</h3>
                        <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                          <Percent className="w-3 h-3 mr-1" /> {cfg.label}
                        </span>
                        <button
                          onClick={() => toggleActif(r.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full ${r.actif ? 'bg-[#4A6C5B]' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white ${r.actif ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                        <div>
                          <div className="uppercase font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Taux de base</div>
                          <div className="font-mono font-bold text-lg" style={{ color: '#C8663D' }}>{r.taux_base_pct}%</div>
                        </div>
                        {r.produit_ciblage && (
                          <div>
                            <div className="uppercase font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Produit ciblé</div>
                            <div>{r.produit_ciblage}</div>
                          </div>
                        )}
                        {r.client_ciblage && (
                          <div>
                            <div className="uppercase font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Client ciblé</div>
                            <div>{r.client_ciblage}</div>
                          </div>
                        )}
                      </div>

                      {r.paliers.length > 0 && (
                        <div className="border rounded p-3" style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
                          <div className="text-xs font-mono uppercase mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Paliers progressifs</div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {r.paliers.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>&gt; {p.seuil_dt.toLocaleString('fr-FR')} DT :</span>
                                <span className="font-mono font-bold" style={{ color: '#C8663D' }}>{p.taux_pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button onClick={() => setRegles(regles.filter(x => x.id !== r.id))} className="p-1.5 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamCommissions;
