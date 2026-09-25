import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  Search,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Package,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';

// ─── Types ────────────────────────────────────────────────────────────
type StatutPanier = 'relance' | 'recupere' | 'perdu' | 'nouveau';

interface ProduitPanier {
  ref: string;
  designation: string;
  qte: number;
}

interface PanierAbandonneItem {
  id_panier: number;
  email: string;
  produits: ProduitPanier[];
  montant_dt: number;
  date_abandon: string;
  nb_relances: number;
  statut: StatutPanier;
  derniere_relance?: string;
}

// ─── Mock ─────────────────────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000).toISOString();

const MOCK: PanierAbandonneItem[] = [
  {
    id_panier: 1,
    email: 'sophie.martin@email.fr',
    produits: [
      { ref: 'FT-CLA-TERRA-95', designation: 'Fouta classique terracotta', qte: 2 },
      { ref: 'FT-CLA-BLANC-95', designation: 'Fouta classique blanche', qte: 1 },
    ],
    montant_dt: 148,
    date_abandon: daysAgo(1),
    nb_relances: 0,
    statut: 'nouveau',
  },
  {
    id_panier: 2,
    email: 'a.laforet@hotmail.com',
    produits: [{ ref: 'FT-JET-INDIGO-200', designation: 'Jeté canapé indigo', qte: 1 }],
    montant_dt: 189,
    date_abandon: daysAgo(2),
    nb_relances: 1,
    derniere_relance: daysAgo(1),
    statut: 'relance',
  },
  {
    id_panier: 3,
    email: 'marc.dubois@gmail.com',
    produits: [
      { ref: 'FT-SERV-KRAFT-70', designation: 'Serviette kraft', qte: 4 },
      { ref: 'FT-CUS-SAGE-45', designation: 'Coussin décoratif sage', qte: 2 },
    ],
    montant_dt: 268,
    date_abandon: daysAgo(3),
    nb_relances: 2,
    derniere_relance: daysAgo(1),
    statut: 'relance',
  },
  {
    id_panier: 4,
    email: 'julie.wagner@yahoo.fr',
    produits: [{ ref: 'FT-KIM-LIN-M', designation: 'Kimono lin taille M', qte: 1 }],
    montant_dt: 210,
    date_abandon: daysAgo(5),
    nb_relances: 2,
    derniere_relance: daysAgo(3),
    statut: 'recupere',
  },
  {
    id_panier: 5,
    email: 'contact@boutique-menzah.tn',
    produits: [
      { ref: 'FT-CLA-BLANC-95', designation: 'Fouta classique blanche', qte: 12 },
    ],
    montant_dt: 720,
    date_abandon: daysAgo(9),
    nb_relances: 3,
    derniere_relance: daysAgo(5),
    statut: 'perdu',
  },
  {
    id_panier: 6,
    email: 'delphine.claire@email.fr',
    produits: [
      { ref: 'FT-CLA-OR-95', designation: 'Fouta classique or', qte: 3 },
      { ref: 'FT-SERV-KRAFT-70', designation: 'Serviette kraft', qte: 2 },
    ],
    montant_dt: 218,
    date_abandon: daysAgo(1),
    nb_relances: 0,
    statut: 'nouveau',
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

const statutMeta: Record<StatutPanier, { label: string; bg: string; fg: string; border: string; Icon: React.FC<{ className?: string }> }> = {
  nouveau: {
    label: 'Nouveau',
    bg: 'var(--color-info-bg)',
    fg: 'var(--color-info)',
    border: 'var(--color-info)',
    Icon: Clock,
  },
  relance: {
    label: 'Relancé',
    bg: 'var(--color-warning-bg)',
    fg: 'var(--color-warning)',
    border: 'var(--color-warning)',
    Icon: Send,
  },
  recupere: {
    label: 'Récupéré',
    bg: 'var(--color-success-bg)',
    fg: 'var(--color-success)',
    border: 'var(--color-success)',
    Icon: CheckCircle2,
  },
  perdu: {
    label: 'Perdu',
    bg: 'var(--color-danger-bg)',
    fg: 'var(--color-danger)',
    border: 'var(--color-danger)',
    Icon: XCircle,
  },
};

// ─── Composant ────────────────────────────────────────────────────────
const PanierAbandonne: React.FC = () => {
  const [items, setItems] = useState<PanierAbandonneItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | StatutPanier>('tous');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [res] = await Promise.allSettled([
        Promise.reject(new Error('service_panier_abandonne_v2')),
      ]);
      if (cancelled) return;
      setItems(pickArray<PanierAbandonneItem>(res, 'paniers', MOCK));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items
      .filter((p) => {
        if (filtreStatut !== 'tous' && p.statut !== filtreStatut) return false;
        if (!s) return true;
        return (
          p.email.toLowerCase().includes(s) ||
          p.produits.some((pr) => pr.ref.toLowerCase().includes(s) || pr.designation.toLowerCase().includes(s))
        );
      })
      .sort((a, b) => (b.date_abandon > a.date_abandon ? 1 : -1));
  }, [items, search, filtreStatut]);

  const kpis = useMemo(() => {
    const totalMontant = items
      .filter((p) => p.statut !== 'recupere')
      .reduce((s, p) => s + p.montant_dt, 0);
    const recuperes = items.filter((p) => p.statut === 'recupere').length;
    const perdus = items.filter((p) => p.statut === 'perdu').length;
    const tauxRecup =
      items.length > 0 ? (recuperes / items.length) * 100 : 0;
    return { nb: items.length, totalMontant, recuperes, perdus, tauxRecup };
  }, [items]);

  const relancer = (id: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id_panier === id
          ? {
              ...p,
              nb_relances: p.nb_relances + 1,
              derniere_relance: new Date().toISOString(),
              statut: p.statut === 'nouveau' || p.statut === 'relance' ? 'relance' : p.statut,
            }
          : p,
      ),
    );
  };

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
        <div className="mb-6">
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
            <ShoppingCart className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Paniers abandonnés
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Relance automatisée par email — récupération de chiffre d&apos;affaires.
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Paniers en cours"
            value={kpis.nb}
            icon={<ShoppingCart className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="Montant à récupérer"
            value={kpis.totalMontant.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            icon={<Package className="w-5 h-5" />}
            color="warning"
          />
          <KpiCard
            label="Récupérés"
            value={kpis.recuperes}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="sage"
          />
          <KpiCard
            label="Taux récupération"
            value={kpis.tauxRecup.toFixed(1)}
            suffix="%"
            icon={<Send className="w-5 h-5" />}
            color="indigo"
            subtitle={`${kpis.perdus} perdu(s)`}
          />
        </div>

        {/* Filtres */}
        <div
          className="rounded-xl shadow-sm border p-4 mb-4"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--fg-muted)' }}
              />
              <input
                type="text"
                placeholder="Rechercher (email, produit)"
                className="pl-9 pr-3 py-2 w-full border rounded-lg text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-app)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-primary)',
                }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
              style={{
                background: 'var(--bg-app)',
                borderColor: 'var(--border-default)',
                color: 'var(--fg-primary)',
              }}
            >
              <option value="tous">Tous statuts</option>
              <option value="nouveau">Nouveau</option>
              <option value="relance">Relancé</option>
              <option value="recupere">Récupéré</option>
              <option value="perdu">Perdu</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-left text-[11px] uppercase tracking-wider"
                  style={{
                    background: 'var(--bg-canvas)',
                    color: 'var(--fg-secondary)',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Produits</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3">Date abandon</th>
                  <th className="px-4 py-3 text-center">Relances</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10" style={{ color: 'var(--fg-muted)' }}>
                      Aucun panier abandonné
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const meta = statutMeta[p.statut];
                    return (
                      <tr
                        key={p.id_panier}
                        className="border-t hover:bg-[var(--bg-hover)]"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <td className="px-4 py-3">
                          <div
                            className="inline-flex items-center gap-1 font-mono text-xs"
                            style={{ color: 'var(--fg-primary)' }}
                          >
                            <Mail className="w-3 h-3" style={{ color: 'var(--fg-muted)' }} />
                            {p.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <ul className="space-y-0.5">
                            {p.produits.map((pr, i) => (
                              <li key={i}>
                                <span
                                  className="font-mono"
                                  style={{ color: 'var(--accent-indigo)' }}
                                >
                                  {pr.ref}
                                </span>
                                <span style={{ color: 'var(--fg-muted)' }}> × {pr.qte}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td
                          className="px-4 py-3 font-mono text-right font-bold"
                          style={{ color: 'var(--accent-terracotta)' }}
                        >
                          {p.montant_dt.toLocaleString('fr-FR')} DT
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted)' }}>
                          {new Date(p.date_abandon).toLocaleDateString('fr-FR')}
                        </td>
                        <td
                          className="px-4 py-3 text-center font-mono font-semibold"
                          style={{ color: 'var(--fg-primary)' }}
                        >
                          {p.nb_relances}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                            style={{
                              color: meta.fg,
                              background: meta.bg,
                              borderColor: meta.border,
                            }}
                          >
                            <meta.Icon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {(p.statut === 'nouveau' || p.statut === 'relance') && (
                            <button
                              onClick={() => relancer(p.id_panier)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs text-white hover:opacity-90"
                              style={{ background: 'var(--accent-terracotta)' }}
                            >
                              <Send className="w-3 h-3" />
                              Relancer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanierAbandonne;
