import React, { useEffect, useMemo, useState } from 'react';
import {
  Gift,
  Award,
  Users,
  Sparkles,
  Star,
  Trophy,
  Edit2,
  Save,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';

// ─── Types ────────────────────────────────────────────────────────────
type NiveauId = 'bronze' | 'argent' | 'or';

interface NiveauFidelite {
  id: NiveauId;
  libelle: string;
  seuil_points: number;
  seuil_ca_dt: number;
  remise_pct: number;
  avantages: string[];
  couleur_var: string;
  membres: number;
}

interface RecompenseCatalogue {
  id: number;
  libelle: string;
  cout_points: number;
  actif: boolean;
  type: 'remise' | 'produit' | 'experience';
}

interface MembreActif {
  id_client: number;
  nom: string;
  niveau: NiveauId;
  points: number;
  ca_dt: number;
}

// ─── Mock ─────────────────────────────────────────────────────────────
const MOCK_NIVEAUX: NiveauFidelite[] = [
  {
    id: 'bronze',
    libelle: 'Bronze',
    seuil_points: 0,
    seuil_ca_dt: 0,
    remise_pct: 5,
    avantages: ['-5 % remise permanente', 'Livraison offerte dès 200 DT'],
    couleur_var: '#8B6F47',
    membres: 342,
  },
  {
    id: 'argent',
    libelle: 'Argent',
    seuil_points: 500,
    seuil_ca_dt: 1500,
    remise_pct: 10,
    avantages: [
      '-10 % remise permanente',
      'Livraison offerte sans minimum',
      'Accès aventes privées',
    ],
    couleur_var: '#9B8874',
    membres: 128,
  },
  {
    id: 'or',
    libelle: 'Or',
    seuil_points: 2000,
    seuil_ca_dt: 6000,
    remise_pct: 15,
    avantages: [
      '-15 % remise permanente',
      'Livraison express offerte',
      'Cadeau anniversaire artisanal',
      'Concierge dédié',
    ],
    couleur_var: '#C89B3C',
    membres: 42,
  },
];

const MOCK_RECOMPENSES: RecompenseCatalogue[] = [
  { id: 1, libelle: 'Bon de -10 DT', cout_points: 100, actif: true, type: 'remise' },
  { id: 2, libelle: 'Serviette artisanale offerte', cout_points: 500, actif: true, type: 'produit' },
  { id: 3, libelle: 'Fouta signature offerte', cout_points: 1200, actif: true, type: 'produit' },
  { id: 4, libelle: 'Atelier tissage à Sfax', cout_points: 3000, actif: false, type: 'experience' },
];

const MOCK_MEMBRES: MembreActif[] = [
  { id_client: 1, nom: 'Sophie Martin', niveau: 'or', points: 2480, ca_dt: 7420 },
  { id_client: 2, nom: 'Hammam Boutique Paris', niveau: 'or', points: 3120, ca_dt: 9840 },
  { id_client: 3, nom: 'Anne Laforêt', niveau: 'argent', points: 820, ca_dt: 2140 },
  { id_client: 4, nom: 'Riad Souk Marrakech', niveau: 'argent', points: 640, ca_dt: 1980 },
  { id_client: 5, nom: 'Marc Dubois', niveau: 'bronze', points: 210, ca_dt: 480 },
];

// ─── Fallback ─────────────────────────────────────────────────────────
const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

// ─── Composant ────────────────────────────────────────────────────────
const Fidelite: React.FC = () => {
  const [niveaux, setNiveaux] = useState<NiveauFidelite[]>([]);
  const [recompenses, setRecompenses] = useState<RecompenseCatalogue[]>([]);
  const [membres, setMembres] = useState<MembreActif[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNiveau, setEditingNiveau] = useState<NiveauId | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [n, r, m] = await Promise.allSettled([
        Promise.reject(new Error('service_fidelite_niveaux')),
        Promise.reject(new Error('service_fidelite_recompenses')),
        Promise.reject(new Error('service_fidelite_membres')),
      ]);
      if (cancelled) return;
      setNiveaux(pickArray<NiveauFidelite>(n, 'niveaux', MOCK_NIVEAUX));
      setRecompenses(pickArray<RecompenseCatalogue>(r, 'recompenses', MOCK_RECOMPENSES));
      setMembres(pickArray<MembreActif>(m, 'membres', MOCK_MEMBRES));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalMembres = useMemo(() => niveaux.reduce((s, n) => s + n.membres, 0), [niveaux]);
  const pctOr = useMemo(() => {
    const or = niveaux.find((n) => n.id === 'or');
    return totalMembres ? ((or?.membres ?? 0) / totalMembres) * 100 : 0;
  }, [niveaux, totalMembres]);

  const updateNiveau = (id: NiveauId, patch: Partial<NiveauFidelite>) => {
    setNiveaux((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const toggleRecompense = (id: number) => {
    setRecompenses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, actif: !r.actif } : r)),
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
            <Gift className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Programme de fidélité
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Configuration des niveaux, catalogue de récompenses et suivi des membres actifs.
          </p>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Membres totaux"
            value={totalMembres}
            icon={<Users className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="Niveaux actifs"
            value={niveaux.length}
            icon={<Award className="w-5 h-5" />}
            color="indigo"
          />
          <KpiCard
            label="Récompenses catalogue"
            value={recompenses.filter((r) => r.actif).length}
            icon={<Sparkles className="w-5 h-5" />}
            color="sage"
            subtitle={`${recompenses.length} au total`}
          />
          <KpiCard
            label="% Membres Or"
            value={pctOr.toFixed(1)}
            suffix="%"
            icon={<Trophy className="w-5 h-5" />}
            color="warning"
          />
        </div>

        {/* Niveaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {niveaux.map((n) => {
            const editing = editingNiveau === n.id;
            return (
              <div
                key={n.id}
                className="rounded-xl shadow-sm border p-5"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  borderLeft: `4px solid ${n.couleur_var}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" style={{ color: n.couleur_var }} />
                    <h3
                      className="text-lg italic"
                      style={{
                        fontFamily: 'Fraunces, serif',
                        fontWeight: 500,
                        color: 'var(--fg-primary)',
                      }}
                    >
                      Niveau {n.libelle}
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingNiveau(editing ? null : n.id)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 border rounded"
                    style={{
                      borderColor: 'var(--border-default)',
                      color: 'var(--fg-secondary)',
                    }}
                  >
                    {editing ? <Save className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
                    {editing ? 'Enregistrer' : 'Éditer'}
                  </button>
                </div>

                <div className="text-3xl font-mono font-bold mb-2" style={{ color: n.couleur_var }}>
                  {n.membres}
                  <span className="text-sm font-sans font-normal ml-1" style={{ color: 'var(--fg-muted)' }}>
                    membres
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Seuil points
                    </span>
                    {editing ? (
                      <input
                        type="number"
                        value={n.seuil_points}
                        onChange={(e) =>
                          updateNiveau(n.id, { seuil_points: parseInt(e.target.value) || 0 })
                        }
                        className="w-full mt-0.5 px-2 py-1 border rounded text-sm font-mono"
                        style={{
                          background: 'var(--bg-app)',
                          borderColor: 'var(--border-default)',
                          color: 'var(--fg-primary)',
                        }}
                      />
                    ) : (
                      <div className="font-mono font-bold" style={{ color: 'var(--fg-primary)' }}>
                        {n.seuil_points.toLocaleString('fr-FR')} pts
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Seuil CA
                    </span>
                    {editing ? (
                      <input
                        type="number"
                        value={n.seuil_ca_dt}
                        onChange={(e) =>
                          updateNiveau(n.id, { seuil_ca_dt: parseInt(e.target.value) || 0 })
                        }
                        className="w-full mt-0.5 px-2 py-1 border rounded text-sm font-mono"
                        style={{
                          background: 'var(--bg-app)',
                          borderColor: 'var(--border-default)',
                          color: 'var(--fg-primary)',
                        }}
                      />
                    ) : (
                      <div className="font-mono font-bold" style={{ color: 'var(--fg-primary)' }}>
                        {n.seuil_ca_dt.toLocaleString('fr-FR')} DT
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Remise
                    </span>
                    {editing ? (
                      <input
                        type="number"
                        value={n.remise_pct}
                        onChange={(e) =>
                          updateNiveau(n.id, { remise_pct: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full mt-0.5 px-2 py-1 border rounded text-sm font-mono"
                        style={{
                          background: 'var(--bg-app)',
                          borderColor: 'var(--border-default)',
                          color: 'var(--fg-primary)',
                        }}
                      />
                    ) : (
                      <div className="font-mono font-bold" style={{ color: 'var(--accent-terracotta)' }}>
                        -{n.remise_pct}%
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>
                      Avantages
                    </div>
                    <ul className="text-xs space-y-0.5 pl-3 list-disc" style={{ color: 'var(--fg-primary)' }}>
                      {n.avantages.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Récompenses + membres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Récompenses */}
          <div
            className="rounded-xl shadow-sm border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              className="p-4 flex items-center gap-2 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-terracotta)' }} />
              <h3
                className="italic"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 500,
                  color: 'var(--fg-primary)',
                }}
              >
                Catalogue de récompenses
              </h3>
            </div>
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
                  <th className="px-4 py-2">Libellé</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2 text-right">Points</th>
                  <th className="px-4 py-2 text-right">Actif</th>
                </tr>
              </thead>
              <tbody>
                {recompenses.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td className="px-4 py-2" style={{ color: 'var(--fg-primary)' }}>
                      {r.libelle}
                    </td>
                    <td className="px-4 py-2 text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {r.type}
                    </td>
                    <td
                      className="px-4 py-2 text-right font-mono font-bold"
                      style={{ color: 'var(--accent-terracotta)' }}
                    >
                      {r.cout_points}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => toggleRecompense(r.id)}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={
                          r.actif
                            ? {
                                color: 'var(--color-success)',
                                background: 'var(--color-success-bg)',
                                borderColor: 'var(--color-success)',
                              }
                            : {
                                color: 'var(--fg-muted)',
                                background: 'var(--bg-sunken)',
                                borderColor: 'var(--border-default)',
                              }
                        }
                      >
                        {r.actif ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Membres actifs */}
          <div
            className="rounded-xl shadow-sm border overflow-hidden"
            style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              className="p-4 flex items-center gap-2 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <Users className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
              <h3
                className="italic"
                style={{
                  fontFamily: 'Fraunces, serif',
                  fontWeight: 500,
                  color: 'var(--fg-primary)',
                }}
              >
                Membres actifs (Top)
              </h3>
            </div>
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
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Niveau</th>
                  <th className="px-4 py-2 text-right">Points</th>
                  <th className="px-4 py-2 text-right">CA (DT)</th>
                </tr>
              </thead>
              <tbody>
                {membres.map((m) => {
                  const nvMeta = niveaux.find((n) => n.id === m.niveau);
                  return (
                    <tr
                      key={m.id_client}
                      className="border-t"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td className="px-4 py-2" style={{ color: 'var(--fg-primary)' }}>
                        {m.nom}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase"
                          style={{ color: nvMeta?.couleur_var || 'var(--fg-muted)' }}
                        >
                          <Star className="w-3 h-3" />
                          {nvMeta?.libelle}
                        </span>
                      </td>
                      <td
                        className="px-4 py-2 text-right font-mono font-bold"
                        style={{ color: 'var(--fg-primary)' }}
                      >
                        {m.points.toLocaleString('fr-FR')}
                      </td>
                      <td
                        className="px-4 py-2 text-right font-mono"
                        style={{ color: 'var(--accent-terracotta)' }}
                      >
                        {m.ca_dt.toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fidelite;
