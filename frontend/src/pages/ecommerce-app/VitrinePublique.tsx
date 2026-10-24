import React, { useEffect, useMemo, useState } from 'react';
import {
  Store,
  Image as ImageIcon,
  Layers,
  Percent,
  Save,
  Plus,
  Trash2,
  Eye,
  Layout,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';

// ─── Types ────────────────────────────────────────────────────────────
interface HeroConfig {
  titre: string;
  sous_titre: string;
  cta_label: string;
  cta_url: string;
  image_url: string;
  actif: boolean;
}

interface CategorieMiseEnAvant {
  id: number;
  libelle: string;
  slug: string;
  position: number;
  image_url: string;
  actif: boolean;
}

interface PromotionCarousel {
  id: number;
  titre: string;
  message: string;
  code_promo?: string;
  date_debut: string;
  date_fin: string;
  actif: boolean;
}

// ─── Mock ─────────────────────────────────────────────────────────────
const MOCK_HERO: HeroConfig = {
  titre: 'La Plume Artisanale',
  sous_titre: 'Foutas tissées main à Sfax — livraison mondiale',
  cta_label: 'Découvrir la collection',
  cta_url: '/collections/foutas',
  image_url: 'https://images.example.com/hero-fouta.jpg',
  actif: true,
};

const MOCK_CATEGORIES: CategorieMiseEnAvant[] = [
  { id: 1, libelle: 'Foutas classiques', slug: 'foutas-classiques', position: 1, image_url: 'https://images.example.com/foutas.jpg', actif: true },
  { id: 2, libelle: 'Jetés & plaids', slug: 'jetes-plaids', position: 2, image_url: 'https://images.example.com/jetes.jpg', actif: true },
  { id: 3, libelle: 'Serviettes de main', slug: 'serviettes', position: 3, image_url: 'https://images.example.com/serviettes.jpg', actif: true },
  { id: 4, libelle: 'Coussins', slug: 'coussins', position: 4, image_url: 'https://images.example.com/coussins.jpg', actif: false },
];

const MOCK_PROMOS: PromotionCarousel[] = [
  {
    id: 1,
    titre: 'Rentrée artisanale',
    message: '-15 % sur les jetés de canapé',
    code_promo: 'RENTREE15',
    date_debut: '2026-09-01',
    date_fin: '2026-09-30',
    actif: true,
  },
  {
    id: 2,
    titre: 'Livraison offerte',
    message: 'Livraison offerte dès 200 DT en Tunisie',
    date_debut: '2026-01-01',
    date_fin: '2026-12-31',
    actif: true,
  },
  {
    id: 3,
    titre: 'Coup de cœur automne',
    message: 'Fouta signature capsule automne',
    code_promo: 'AUTOMNE',
    date_debut: '2026-10-01',
    date_fin: '2026-11-15',
    actif: false,
  },
];

// ─── Fallback ─────────────────────────────────────────────────────────
const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const pickObj = <T,>(res: PromiseSettledResult<any>, fb: T): T => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  return d && typeof d === 'object' && !Array.isArray(d) ? (d as T) : fb;
};

// ─── Composant ────────────────────────────────────────────────────────
const VitrinePublique: React.FC = () => {
  const [hero, setHero] = useState<HeroConfig>(MOCK_HERO);
  const [categories, setCategories] = useState<CategorieMiseEnAvant[]>([]);
  const [promos, setPromos] = useState<PromotionCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [rHero, rCat, rProm] = await Promise.allSettled([
        Promise.reject(new Error('service_vitrine_hero')),
        Promise.reject(new Error('service_vitrine_categories')),
        Promise.reject(new Error('service_vitrine_promos')),
      ]);
      if (cancelled) return;
      setHero(pickObj<HeroConfig>(rHero, MOCK_HERO));
      setCategories(pickArray<CategorieMiseEnAvant>(rCat, 'categories', MOCK_CATEGORIES));
      setPromos(pickArray<PromotionCarousel>(rProm, 'promos', MOCK_PROMOS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    return {
      heroActif: hero.actif,
      nbCat: categories.filter((c) => c.actif).length,
      nbPromos: promos.filter((p) => p.actif).length,
      couverture: `${categories.filter((c) => c.actif).length} / ${categories.length}`,
    };
  }, [hero, categories, promos]);

  const save = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1800);
  };

  const addCategory = () => {
    const id = Date.now();
    setCategories((prev) => [
      ...prev,
      {
        id,
        libelle: 'Nouvelle catégorie',
        slug: `cat-${id}`,
        position: prev.length + 1,
        image_url: '',
        actif: true,
      },
    ]);
  };

  const removeCategory = (id: number) =>
    setCategories((prev) => prev.filter((c) => c.id !== id));

  const addPromo = () => {
    const id = Date.now();
    setPromos((prev) => [
      ...prev,
      {
        id,
        titre: 'Nouvelle promo',
        message: '',
        date_debut: new Date().toISOString().slice(0, 10),
        date_fin: new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10),
        actif: true,
      },
    ]);
  };

  const removePromo = (id: number) => setPromos((prev) => prev.filter((p) => p.id !== id));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--accent-terracotta)' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
            >
              §11quinquies · E-commerce
            </div>
            <h1
              className="text-3xl italic flex items-center gap-3"
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              <Store className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
              Vitrine publique
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
              Configurer la bannière hero, catégories mises en avant et carrousel promotionnel.
            </p>
          </div>
          <button
            onClick={save}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90"
            style={{ background: 'var(--accent-terracotta)' }}
          >
            <Save className="w-4 h-4" />
            {saveStatus === 'saved' ? 'Enregistré ✓' : 'Enregistrer la vitrine'}
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Hero"
            value={kpis.heroActif ? 'Actif' : 'Inactif'}
            icon={<Layout className="w-5 h-5" />}
            color={kpis.heroActif ? 'sage' : 'warning'}
          />
          <KpiCard
            label="Catégories mises en avant"
            value={kpis.couverture}
            icon={<Layers className="w-5 h-5" />}
            color="indigo"
          />
          <KpiCard
            label="Promotions actives"
            value={kpis.nbPromos}
            icon={<Percent className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="Prévisualisation"
            value="Aperçu"
            icon={<Eye className="w-5 h-5" />}
            color="warning"
            subtitle="Ouvre la vitrine dans un nouvel onglet"
          />
        </div>

        {/* Hero */}
        <div
          className="rounded-xl shadow-sm border p-5 mb-6"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
            borderLeft: '4px solid var(--accent-terracotta)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5" style={{ color: 'var(--accent-terracotta)' }} />
            <h3
              className="italic"
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              Bannière hero
            </h3>
            <label
              className="ml-auto inline-flex items-center gap-2 text-sm"
              style={{ color: 'var(--fg-primary)' }}
            >
              <input
                type="checkbox"
                checked={hero.actif}
                onChange={(e) => setHero({ ...hero, actif: e.target.checked })}
              />
              Actif
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Titre
              </span>
              <input
                type="text"
                value={hero.titre}
                onChange={(e) => setHero({ ...hero, titre: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Sous-titre
              </span>
              <input
                type="text"
                value={hero.sous_titre}
                onChange={(e) => setHero({ ...hero, sous_titre: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Libellé CTA
              </span>
              <input
                type="text"
                value={hero.cta_label}
                onChange={(e) => setHero({ ...hero, cta_label: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded text-sm"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
            <label className="block">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                URL CTA
              </span>
              <input
                type="text"
                value={hero.cta_url}
                onChange={(e) => setHero({ ...hero, cta_url: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded text-sm font-mono"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
            <label className="block md:col-span-2">
              <span
                className="text-[11px] uppercase tracking-wider"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
              >
                Image URL
              </span>
              <input
                type="text"
                value={hero.image_url}
                onChange={(e) => setHero({ ...hero, image_url: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded text-sm font-mono"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
              />
            </label>
          </div>
        </div>

        {/* Categories */}
        <div
          className="rounded-xl shadow-sm border p-5 mb-6"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
            borderLeft: '4px solid var(--accent-indigo)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
            <h3
              className="italic"
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              Catégories mises en avant
            </h3>
            <button
              onClick={addCategory}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded text-xs border"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--fg-secondary)',
              }}
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap gap-2 items-center p-2 rounded border"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                }}
              >
                <input
                  type="number"
                  min={1}
                  value={c.position}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((x) =>
                        x.id === c.id ? { ...x, position: parseInt(e.target.value) || 0 } : x,
                      ),
                    )
                  }
                  className="w-14 px-2 py-1 border rounded text-xs font-mono text-center"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <input
                  type="text"
                  value={c.libelle}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((x) => (x.id === c.id ? { ...x, libelle: e.target.value } : x)),
                    )
                  }
                  className="flex-1 min-w-[180px] px-2 py-1 border rounded text-sm"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <input
                  type="text"
                  value={c.slug}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((x) => (x.id === c.id ? { ...x, slug: e.target.value } : x)),
                    )
                  }
                  className="w-40 px-2 py-1 border rounded text-xs font-mono"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <label
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: 'var(--fg-primary)' }}
                >
                  <input
                    type="checkbox"
                    checked={c.actif}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((x) =>
                          x.id === c.id ? { ...x, actif: e.target.checked } : x,
                        ),
                      )
                    }
                  />
                  Actif
                </label>
                <button
                  onClick={() => removeCategory(c.id)}
                  className="p-1 rounded"
                  style={{
                    color: 'var(--color-danger)',
                    background: 'var(--color-danger-bg)',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Promotions carousel */}
        <div
          className="rounded-xl shadow-sm border p-5"
          style={{
            background: 'var(--bg-elevated)',
            borderColor: 'var(--border-subtle)',
            borderLeft: '4px solid var(--accent-gold)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />
            <h3
              className="italic"
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              Carrousel de promotions
            </h3>
            <button
              onClick={addPromo}
              className="ml-auto inline-flex items-center gap-1 px-3 py-1 rounded text-xs border"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--fg-secondary)',
              }}
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {promos.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center p-3 rounded border"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                }}
              >
                <input
                  type="text"
                  value={p.titre}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, titre: e.target.value } : x)),
                    )
                  }
                  className="px-2 py-1 border rounded text-sm md:col-span-2"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                  placeholder="Titre"
                />
                <input
                  type="text"
                  value={p.code_promo || ''}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, code_promo: e.target.value } : x)),
                    )
                  }
                  className="px-2 py-1 border rounded text-xs font-mono"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                  placeholder="CODE"
                />
                <input
                  type="date"
                  value={p.date_debut}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, date_debut: e.target.value } : x)),
                    )
                  }
                  className="px-2 py-1 border rounded text-xs"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <input
                  type="date"
                  value={p.date_fin}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, date_fin: e.target.value } : x)),
                    )
                  }
                  className="px-2 py-1 border rounded text-xs"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <div className="flex items-center gap-2">
                  <label
                    className="inline-flex items-center gap-1 text-xs"
                    style={{ color: 'var(--fg-primary)' }}
                  >
                    <input
                      type="checkbox"
                      checked={p.actif}
                      onChange={(e) =>
                        setPromos((prev) =>
                          prev.map((x) =>
                            x.id === p.id ? { ...x, actif: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                    Actif
                  </label>
                  <button
                    onClick={() => removePromo(p.id)}
                    className="p-1 rounded"
                    style={{
                      color: 'var(--color-danger)',
                      background: 'var(--color-danger-bg)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={p.message}
                  onChange={(e) =>
                    setPromos((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, message: e.target.value } : x)),
                    )
                  }
                  className="px-2 py-1 border rounded text-sm md:col-span-6"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                  placeholder="Message affiché sur la bannière"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitrinePublique;
