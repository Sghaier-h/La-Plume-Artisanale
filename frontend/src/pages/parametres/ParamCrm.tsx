import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Tag, Target, XCircle, ChevronDown } from 'lucide-react';
import api from '../../services/api';

// §15 — Paramètres CRM

interface Item {
  id: number;
  code: string;
  libelle: string;
  couleur?: string;
  ordre?: number;
}

const MOCK_SOURCES: Item[] = [
  { id: 1, code: 'SITE_WEB', libelle: 'Site web', ordre: 1 },
  { id: 2, code: 'SALON', libelle: 'Salon professionnel', ordre: 2 },
  { id: 3, code: 'RECOMMANDATION', libelle: 'Recommandation client', ordre: 3 },
  { id: 4, code: 'INSTAGRAM', libelle: 'Instagram', ordre: 4 },
  { id: 5, code: 'FACEBOOK', libelle: 'Facebook Ads', ordre: 5 },
  { id: 6, code: 'CALL_ENTRANT', libelle: 'Appel entrant', ordre: 6 },
];

const MOCK_STATUTS: Item[] = [
  { id: 1, code: 'NOUVEAU', libelle: 'Nouveau', couleur: '#3B4E68', ordre: 1 },
  { id: 2, code: 'CONTACT', libelle: 'Contact établi', couleur: '#4A6C5B', ordre: 2 },
  { id: 3, code: 'QUALIFIE', libelle: 'Qualifié', couleur: '#8A6412', ordre: 3 },
  { id: 4, code: 'DEVIS', libelle: 'Devis envoyé', couleur: '#C8663D', ordre: 4 },
  { id: 5, code: 'NEGOCIATION', libelle: 'En négociation', couleur: '#B84A4A', ordre: 5 },
  { id: 6, code: 'GAGNE', libelle: 'Gagné', couleur: '#4A6C5B', ordre: 6 },
  { id: 7, code: 'PERDU', libelle: 'Perdu', couleur: '#8A6E4A', ordre: 7 },
];

const MOCK_MOTIFS_PERDU: Item[] = [
  { id: 1, code: 'PRIX', libelle: 'Prix trop élevé' },
  { id: 2, code: 'DELAI', libelle: 'Délai de livraison' },
  { id: 3, code: 'CONCURRENT', libelle: 'Choix concurrent' },
  { id: 4, code: 'PAS_BESOIN', libelle: 'Besoin non confirmé' },
  { id: 5, code: 'NO_REPLY', libelle: 'Sans réponse' },
];

const MOCK_TAGS: Item[] = [
  { id: 1, code: 'VIP', libelle: 'VIP', couleur: '#C8663D' },
  { id: 2, code: 'EXPORT', libelle: 'Export UE', couleur: '#3B4E68' },
  { id: 3, code: 'B2B', libelle: 'B2B', couleur: '#4A6C5B' },
  { id: 4, code: 'HOTEL', libelle: 'Hôtellerie', couleur: '#8A6412' },
  { id: 5, code: 'REVENDEUR', libelle: 'Revendeur', couleur: '#B84A4A' },
];

type Section = 'sources' | 'statuts' | 'motifs' | 'tags';

const SECTIONS: { key: Section; label: string; icon: React.ReactNode }[] = [
  { key: 'sources', label: 'Sources de leads', icon: <Target className="w-5 h-5" /> },
  { key: 'statuts', label: 'Statuts pipeline', icon: <ChevronDown className="w-5 h-5" /> },
  { key: 'motifs', label: 'Motifs perdu', icon: <XCircle className="w-5 h-5" /> },
  { key: 'tags', label: 'Tags contacts', icon: <Tag className="w-5 h-5" /> },
];

const ParamCrm: React.FC = () => {
  const [data, setData] = useState<Record<Section, Item[]>>({
    sources: MOCK_SOURCES,
    statuts: MOCK_STATUTS,
    motifs: MOCK_MOTIFS_PERDU,
    tags: MOCK_TAGS,
  });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Section>('sources');
  const [newItem, setNewItem] = useState<Partial<Item>>({ libelle: '', code: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/parametres/crm/sources'),
        api.get('/api/v2/parametres/crm/statuts'),
        api.get('/api/v2/parametres/crm/motifs-perdu'),
        api.get('/api/v2/parametres/crm/tags'),
      ]);
      if (cancelled) return;
      const pick = (res: PromiseSettledResult<any>, fb: Item[]): Item[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        return fb;
      };
      setData({
        sources: pick(r[0], MOCK_SOURCES),
        statuts: pick(r[1], MOCK_STATUTS),
        motifs: pick(r[2], MOCK_MOTIFS_PERDU),
        tags: pick(r[3], MOCK_TAGS),
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const add = (section: Section) => {
    const lib = newItem.libelle;
    if (!lib) return;
    const id = Date.now();
    setData((prev) => ({
      ...prev,
      [section]: [...prev[section], { id, code: newItem.code || lib.toUpperCase().replace(/\s+/g, '_'), libelle: lib, couleur: newItem.couleur }],
    }));
    setNewItem({ libelle: '', code: '' });
  };

  const remove = (section: Section, id: number) => {
    setData((prev) => ({ ...prev, [section]: prev[section].filter((i) => i.id !== id) }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
              §15 · Paramètres
            </div>
            <h1
              className="text-3xl italic mb-1"
              style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}
            >
              CRM
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
              Sources leads, statuts pipeline, motifs perdu, tags
            </p>
          </div>

          <div className="space-y-3">
            {SECTIONS.map((sec) => {
              const isOpen = expanded === sec.key;
              const items = data[sec.key];
              return (
                <div key={sec.key} className="bg-white rounded-xl shadow-sm border border-[#E8DCC8] overflow-hidden">
                  <button
                    onClick={() => setExpanded(sec.key)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#FDF2ED]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2" style={{ backgroundColor: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))', color: '#C8663D' }}>
                        {sec.icon}
                      </div>
                      <div className="text-left font-semibold" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                        {sec.label}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#F5EFE4', color: 'var(--fg-muted, #8A6E4A)' }}>
                        {items.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--fg-muted, #8A6E4A)' }} />
                  </button>
                  {isOpen && (
                    <div className="p-5 border-t space-y-3" style={{ borderColor: '#E8DCC8' }}>
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left">
                            <th className="pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Code</th>
                            <th className="pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Libellé</th>
                            {(sec.key === 'statuts' || sec.key === 'tags') && (
                              <th className="pb-2 text-xs font-mono uppercase" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Couleur</th>
                            )}
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it) => (
                            <tr key={it.id} className="border-t" style={{ borderColor: '#F0E7D4' }}>
                              <td className="py-2 pr-4 font-mono text-xs" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{it.code}</td>
                              <td className="py-2 pr-4" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{it.libelle}</td>
                              {(sec.key === 'statuts' || sec.key === 'tags') && (
                                <td className="py-2 pr-4">
                                  {it.couleur && (
                                    <span className="inline-flex items-center gap-1">
                                      <span className="w-4 h-4 rounded" style={{ backgroundColor: it.couleur }} />
                                      <span className="font-mono text-[10px]">{it.couleur}</span>
                                    </span>
                                  )}
                                </td>
                              )}
                              <td className="py-2 text-right">
                                <button onClick={() => remove(sec.key, it.id)} className="p-1 rounded hover:bg-red-50" style={{ color: '#B84A4A' }}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex gap-2 pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                        <input
                          placeholder="Code (auto)"
                          value={newItem.code || ''}
                          onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                          className="border rounded px-2 py-1.5 text-sm font-mono w-32"
                          style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                        />
                        <input
                          placeholder="Libellé"
                          value={newItem.libelle || ''}
                          onChange={(e) => setNewItem({ ...newItem, libelle: e.target.value })}
                          className="border rounded px-2 py-1.5 text-sm flex-1"
                          style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                        />
                        {(sec.key === 'statuts' || sec.key === 'tags') && (
                          <input
                            type="color"
                            value={newItem.couleur || '#C8663D'}
                            onChange={(e) => setNewItem({ ...newItem, couleur: e.target.value })}
                            className="border rounded w-12 h-9"
                            style={{ borderColor: '#E8DCC8' }}
                          />
                        )}
                        <button
                          onClick={() => add(sec.key)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-white"
                          style={{ backgroundColor: '#C8663D' }}
                        >
                          <Plus className="w-4 h-4" /> Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParamCrm;
