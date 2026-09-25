import React, { useEffect, useMemo, useState } from 'react';
import {
  Target,
  Search,
  PlusCircle,
  Pencil,
  Trash2,
  Users,
  Activity,
  BarChart3,
  X,
  Filter as FilterIcon,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';

// ─── Types ────────────────────────────────────────────────────────────
type OperateurRegle = 'egal' | 'contient' | 'sup' | 'inf' | 'entre' | 'in';

interface RegleSegment {
  champ: string;
  operateur: OperateurRegle;
  valeur: string | number | string[];
}

interface SegmentClient {
  id_segment: number;
  code: string;
  libelle: string;
  description?: string;
  regles: RegleSegment[];
  taille: number;
  actif: boolean;
  derniere_campagne?: string;
  date_derniere_campagne?: string;
  date_creation: string;
}

// ─── Mock data ────────────────────────────────────────────────────────
const MOCK_SEGMENTS: SegmentClient[] = [
  {
    id_segment: 1,
    code: 'HORECA_FR',
    libelle: 'Hôtellerie & Riads — France',
    description: 'Clients HoReCa (hôtels, riads, hammams) situés en France.',
    regles: [
      { champ: 'pays', operateur: 'egal', valeur: 'France' },
      { champ: 'secteur', operateur: 'in', valeur: ['hotel', 'riad', 'hammam'] },
      { champ: 'ca_annuel_dt', operateur: 'sup', valeur: 5000 },
    ],
    taille: 128,
    actif: true,
    derniere_campagne: 'Été 2026 — Nouveautés fouta lin',
    date_derniere_campagne: '2026-06-12',
    date_creation: '2025-02-10',
  },
  {
    id_segment: 2,
    code: 'BOUTIQUES_TN',
    libelle: 'Boutiques concept — Tunisie',
    description: 'Petits détaillants indépendants tunisiens à panier moyen élevé.',
    regles: [
      { champ: 'pays', operateur: 'egal', valeur: 'Tunisie' },
      { champ: 'panier_moyen_dt', operateur: 'sup', valeur: 300 },
      { champ: 'nb_commandes_12m', operateur: 'sup', valeur: 3 },
    ],
    taille: 46,
    actif: true,
    derniere_campagne: 'Ramadan 2026 — Collection artisanale',
    date_derniere_campagne: '2026-02-28',
    date_creation: '2025-04-02',
  },
  {
    id_segment: 3,
    code: 'INACTIFS_90J',
    libelle: 'Clients dormants > 90j',
    description: 'Clients sans commande depuis 90 jours pour reconquête.',
    regles: [
      { champ: 'dernier_achat_j', operateur: 'sup', valeur: 90 },
      { champ: 'ca_total_dt', operateur: 'sup', valeur: 1000 },
    ],
    taille: 214,
    actif: true,
    derniere_campagne: 'Reconquête -15% code WELCOME_BACK',
    date_derniere_campagne: '2026-08-05',
    date_creation: '2024-11-18',
  },
  {
    id_segment: 4,
    code: 'VIP_HAUT_PANIER',
    libelle: 'VIP — panier > 1000 DT',
    description: 'Top clients à valeur vie élevée.',
    regles: [
      { champ: 'ca_total_dt', operateur: 'sup', valeur: 50000 },
      { champ: 'nb_commandes_12m', operateur: 'sup', valeur: 8 },
    ],
    taille: 22,
    actif: true,
    derniere_campagne: 'Preview capsule automne',
    date_derniere_campagne: '2026-09-01',
    date_creation: '2025-01-05',
  },
  {
    id_segment: 5,
    code: 'NEWSLETTER_ONLY',
    libelle: 'Contacts newsletter (jamais commandé)',
    description: 'Prospects inscrits, aucune commande enregistrée.',
    regles: [
      { champ: 'nb_commandes_total', operateur: 'egal', valeur: 0 },
      { champ: 'newsletter_optin', operateur: 'egal', valeur: 'true' },
    ],
    taille: 587,
    actif: false,
    date_creation: '2024-09-24',
  },
];

// ─── Fallback helper ──────────────────────────────────────────────────
const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

const formatRegles = (regles: RegleSegment[]): string =>
  JSON.stringify(regles, null, 2);

// ─── Composant principal ──────────────────────────────────────────────
const SegmentsClients: React.FC = () => {
  const [segments, setSegments] = useState<SegmentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<'tous' | 'actifs' | 'inactifs'>('tous');
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState<SegmentClient | null>(null);
  const [detail, setDetail] = useState<SegmentClient | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Fallback pattern — no service yet, always resolves rejected to use mock
      const [res] = await Promise.allSettled([
        Promise.reject(new Error('service_marketing_segments non branché')),
      ]);
      if (cancelled) return;
      setSegments(pickArray<SegmentClient>(res, 'segments', MOCK_SEGMENTS));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return segments.filter((seg) => {
      if (filtreStatut === 'actifs' && !seg.actif) return false;
      if (filtreStatut === 'inactifs' && seg.actif) return false;
      if (!s) return true;
      return `${seg.code} ${seg.libelle} ${seg.description || ''}`.toLowerCase().includes(s);
    });
  }, [segments, search, filtreStatut]);

  const kpis = useMemo(() => {
    const nbSegments = segments.length;
    const nbClientsSegmentes = segments
      .filter((s) => s.actif)
      .reduce((sum, s) => sum + s.taille, 0);
    const plusLarge = segments.reduce(
      (max, s) => (s.taille > (max?.taille ?? 0) ? s : max),
      null as SegmentClient | null,
    );
    const plusActif = segments
      .filter((s) => s.date_derniere_campagne)
      .sort((a, b) =>
        (b.date_derniere_campagne || '').localeCompare(a.date_derniere_campagne || ''),
      )[0];
    return { nbSegments, nbClientsSegmentes, plusLarge, plusActif };
  }, [segments]);

  const openCreate = () => {
    setCurrent({
      id_segment: 0,
      code: '',
      libelle: '',
      description: '',
      regles: [{ champ: '', operateur: 'egal', valeur: '' }],
      taille: 0,
      actif: true,
      date_creation: new Date().toISOString().slice(0, 10),
    });
    setShowModal(true);
  };

  const save = () => {
    if (!current) return;
    if (current.id_segment === 0) {
      setSegments((prev) => [
        {
          ...current,
          id_segment: Date.now(),
        },
        ...prev,
      ]);
    } else {
      setSegments((prev) => prev.map((s) => (s.id_segment === current.id_segment ? current : s)));
    }
    setShowModal(false);
    setCurrent(null);
  };

  const remove = (id: number) => {
    if (!window.confirm('Supprimer ce segment ?')) return;
    setSegments((prev) => prev.filter((s) => s.id_segment !== id));
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
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div
              className="text-[11px] uppercase tracking-widest mb-2"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
            >
              §11.3 · Marketing
            </div>
            <h1
              className="text-3xl italic flex items-center gap-3"
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              <Target className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
              Segments clients
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
              Définir des groupes ciblés (règles JSON) pour campagnes email &amp; WhatsApp.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90"
            style={{ background: 'var(--accent-terracotta)' }}
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau segment
          </button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Nb segments"
            value={kpis.nbSegments}
            icon={<Target className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="Clients segmentés"
            value={kpis.nbClientsSegmentes.toLocaleString('fr-FR')}
            icon={<Users className="w-5 h-5" />}
            color="indigo"
            subtitle="Cumul segments actifs"
          />
          <KpiCard
            label="Segment plus large"
            value={kpis.plusLarge?.taille?.toLocaleString('fr-FR') ?? '—'}
            icon={<BarChart3 className="w-5 h-5" />}
            color="sage"
            subtitle={kpis.plusLarge?.libelle ?? '—'}
          />
          <KpiCard
            label="Segment plus actif"
            value={kpis.plusActif?.libelle ?? '—'}
            icon={<Activity className="w-5 h-5" />}
            color="warning"
            subtitle={
              kpis.plusActif?.date_derniere_campagne
                ? `Dernière campagne ${kpis.plusActif.date_derniere_campagne}`
                : '—'
            }
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
                placeholder="Rechercher un segment (code, libellé)"
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
              <option value="actifs">Actifs</option>
              <option value="inactifs">Inactifs</option>
            </select>
            <div
              className="inline-flex items-center gap-1 text-xs"
              style={{ color: 'var(--fg-muted)' }}
            >
              <FilterIcon className="w-3.5 h-3.5" />
              {filtered.length} segment(s)
            </div>
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
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Libellé</th>
                  <th className="px-4 py-3">Règles (JSON)</th>
                  <th className="px-4 py-3 text-right">Taille</th>
                  <th className="px-4 py-3">Dernière campagne</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10" style={{ color: 'var(--fg-muted)' }}>
                      Aucun segment
                    </td>
                  </tr>
                ) : (
                  filtered.map((seg) => (
                    <tr
                      key={seg.id_segment}
                      className="border-t hover:bg-[var(--bg-hover)]"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <td
                        className="px-4 py-3 font-mono text-xs font-semibold"
                        style={{ color: 'var(--accent-indigo)' }}
                      >
                        {seg.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--fg-primary)' }}>
                          {seg.libelle}
                        </div>
                        {seg.description && (
                          <div
                            className="text-xs mt-0.5 max-w-md truncate"
                            style={{ color: 'var(--fg-muted)' }}
                          >
                            {seg.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetail(seg)}
                          className="text-xs font-mono px-2 py-1 rounded border"
                          style={{
                            borderColor: 'var(--border-default)',
                            color: 'var(--fg-secondary)',
                            background: 'var(--bg-app)',
                          }}
                        >
                          {seg.regles.length} règle(s) →
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-right font-bold" style={{ color: 'var(--fg-primary)' }}>
                        {seg.taille.toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {seg.derniere_campagne ? (
                          <>
                            <div className="font-medium" style={{ color: 'var(--fg-primary)' }}>
                              {seg.derniere_campagne}
                            </div>
                            <div style={{ color: 'var(--fg-muted)' }}>
                              {seg.date_derniere_campagne}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: 'var(--fg-muted)' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border"
                          style={
                            seg.actif
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
                          {seg.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setCurrent(seg);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border mr-1"
                          style={{
                            borderColor: 'var(--border-default)',
                            color: 'var(--fg-secondary)',
                          }}
                        >
                          <Pencil className="w-3 h-3" /> Éditer
                        </button>
                        <button
                          onClick={() => remove(seg.id_segment)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                          style={{
                            color: 'var(--color-danger)',
                            background: 'var(--color-danger-bg)',
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal détail règles */}
      {detail && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="rounded-xl shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div
              className="flex justify-between items-center p-4 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h2
                className="text-lg italic"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--fg-primary)' }}
              >
                Règles — {detail.libelle}
              </h2>
              <button onClick={() => setDetail(null)}>
                <X className="w-5 h-5" style={{ color: 'var(--fg-muted)' }} />
              </button>
            </div>
            <div className="p-4">
              <pre
                className="rounded p-3 text-xs overflow-x-auto"
                style={{
                  background: 'var(--bg-canvas)',
                  color: 'var(--fg-primary)',
                  fontFamily: 'JetBrains Mono, monospace',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {formatRegles(detail.regles)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal edition */}
      {showModal && current && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowModal(false);
            setCurrent(null);
          }}
        >
          <div
            className="rounded-xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div
              className="flex justify-between items-center p-4 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <h2
                className="text-lg italic"
                style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, color: 'var(--fg-primary)' }}
              >
                {current.id_segment === 0 ? 'Nouveau segment' : 'Éditer segment'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrent(null);
                }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--fg-muted)' }} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="block">
                <span
                  className="text-[11px] uppercase tracking-wider"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-secondary)' }}
                >
                  Code segment
                </span>
                <input
                  type="text"
                  value={current.code}
                  onChange={(e) => setCurrent({ ...current, code: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded text-sm font-mono"
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
                  Libellé
                </span>
                <input
                  type="text"
                  value={current.libelle}
                  onChange={(e) => setCurrent({ ...current, libelle: e.target.value })}
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
                  Description
                </span>
                <textarea
                  rows={2}
                  value={current.description || ''}
                  onChange={(e) => setCurrent({ ...current, description: e.target.value })}
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
                  Règles (JSON)
                </span>
                <textarea
                  rows={6}
                  value={JSON.stringify(current.regles, null, 2)}
                  onChange={(e) => {
                    try {
                      setCurrent({ ...current, regles: JSON.parse(e.target.value) });
                    } catch {
                      /* keep invalid draft */
                    }
                  }}
                  className="w-full mt-1 px-3 py-2 border rounded text-xs font-mono"
                  style={{
                    background: 'var(--bg-app)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--fg-primary)',
                  }}
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--fg-primary)' }}>
                <input
                  type="checkbox"
                  checked={current.actif}
                  onChange={(e) => setCurrent({ ...current, actif: e.target.checked })}
                />
                Segment actif
              </label>
            </div>
            <div
              className="p-4 border-t flex justify-end gap-2"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrent(null);
                }}
                className="px-4 py-2 border rounded-lg text-sm"
                style={{
                  borderColor: 'var(--border-default)',
                  color: 'var(--fg-secondary)',
                }}
              >
                Annuler
              </button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90"
                style={{ background: 'var(--accent-terracotta)' }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentsClients;
