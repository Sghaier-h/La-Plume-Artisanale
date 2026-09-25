import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Mail,
  MessageCircle,
  MousePointerClick,
  Eye,
  ShoppingBag,
  DollarSign,
  Send,
  TrendingUp,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import CampagnePerfChart from '../../components/ecommerce/CampagnePerfChart';

// ─── Types ────────────────────────────────────────────────────────────
type CanalCampagne = 'email' | 'whatsapp';

interface StatsCanal {
  canal: CanalCampagne;
  envois: number;
  ouvertures: number;
  clics: number;
  conversions: number;
  ca_dt: number;
  serie_ouverture: number[];
  serie_clic: number[];
}

interface CampagneTop {
  id: number;
  libelle: string;
  canal: CanalCampagne;
  date: string;
  segment: string;
  envois: number;
  taux_ouverture: number;
  taux_clic: number;
  conversions: number;
  ca_dt: number;
}

// ─── Mock ────────────────────────────────────────────────────────────
const MOCK_STATS: StatsCanal[] = [
  {
    canal: 'email',
    envois: 12480,
    ouvertures: 4560,
    clics: 812,
    conversions: 98,
    ca_dt: 24800,
    serie_ouverture: [32, 35, 34, 36, 38, 37, 36, 38, 40, 42, 41, 40, 43, 44],
    serie_clic: [5, 6, 6, 7, 6, 7, 6, 7, 8, 8, 8, 9, 8, 9],
  },
  {
    canal: 'whatsapp',
    envois: 3480,
    ouvertures: 3050,
    clics: 620,
    conversions: 145,
    ca_dt: 36200,
    serie_ouverture: [85, 88, 86, 90, 87, 89, 88, 90, 92, 91, 90, 92, 93, 94],
    serie_clic: [15, 17, 16, 18, 17, 18, 17, 18, 19, 19, 20, 20, 21, 21],
  },
];

const MOCK_TOP: CampagneTop[] = [
  {
    id: 1,
    libelle: 'Ramadan 2026 — Nouveautés fouta',
    canal: 'whatsapp',
    date: '2026-02-28',
    segment: 'HORECA_FR',
    envois: 1240,
    taux_ouverture: 92.5,
    taux_clic: 24.8,
    conversions: 68,
    ca_dt: 18400,
  },
  {
    id: 2,
    libelle: 'Été — Collection lin/coton',
    canal: 'email',
    date: '2026-06-12',
    segment: 'BOUTIQUES_TN',
    envois: 4680,
    taux_ouverture: 38.4,
    taux_clic: 8.2,
    conversions: 42,
    ca_dt: 12600,
  },
  {
    id: 3,
    libelle: 'Reconquête -15% WELCOME_BACK',
    canal: 'email',
    date: '2026-08-05',
    segment: 'INACTIFS_90J',
    envois: 3200,
    taux_ouverture: 42.8,
    taux_clic: 12.1,
    conversions: 74,
    ca_dt: 9800,
  },
  {
    id: 4,
    libelle: 'Preview capsule automne',
    canal: 'whatsapp',
    date: '2026-09-01',
    segment: 'VIP_HAUT_PANIER',
    envois: 22,
    taux_ouverture: 100,
    taux_clic: 68.2,
    conversions: 11,
    ca_dt: 15400,
  },
  {
    id: 5,
    libelle: 'Newsletter septembre',
    canal: 'email',
    date: '2026-09-10',
    segment: 'NEWSLETTER_ONLY',
    envois: 587,
    taux_ouverture: 24.5,
    taux_clic: 3.4,
    conversions: 6,
    ca_dt: 1240,
  },
];

// ─── Fallback ────────────────────────────────────────────────────────
const pickArray = <T,>(res: PromiseSettledResult<any>, key: string, fb: T[]): T[] => {
  if (res.status !== 'fulfilled') return fb;
  const d = res.value?.data?.data ?? res.value?.data;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d[key])) return d[key];
  return fb;
};

// ─── Composant ───────────────────────────────────────────────────────
const StatsPerformance: React.FC = () => {
  const [stats, setStats] = useState<StatsCanal[]>([]);
  const [top, setTop] = useState<CampagneTop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [r1, r2] = await Promise.allSettled([
        Promise.reject(new Error('service_marketing_stats')),
        Promise.reject(new Error('service_marketing_top')),
      ]);
      if (cancelled) return;
      setStats(pickArray<StatsCanal>(r1, 'stats', MOCK_STATS));
      setTop(pickArray<CampagneTop>(r2, 'top', MOCK_TOP));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpisGlobaux = useMemo(() => {
    const totEnvois = stats.reduce((s, c) => s + c.envois, 0);
    const totOuv = stats.reduce((s, c) => s + c.ouvertures, 0);
    const totClic = stats.reduce((s, c) => s + c.clics, 0);
    const totConv = stats.reduce((s, c) => s + c.conversions, 0);
    const totCA = stats.reduce((s, c) => s + c.ca_dt, 0);
    return {
      tauxOuverture: totEnvois ? (totOuv / totEnvois) * 100 : 0,
      tauxClic: totOuv ? (totClic / totOuv) * 100 : 0,
      conversions: totConv,
      ca: totCA,
    };
  }, [stats]);

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
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-widest mb-2"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
          >
            §11.4 · Marketing
          </div>
          <h1
            className="text-3xl italic flex items-center gap-3"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontWeight: 500,
              color: 'var(--fg-primary)',
            }}
          >
            <BarChart3 className="w-8 h-8" style={{ color: 'var(--accent-terracotta)' }} />
            Stats &amp; performance campagnes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-secondary)' }}>
            Suivi taux d&apos;ouverture, clic, conversions par canal email &amp; WhatsApp.
          </p>
        </div>

        {/* KPI globaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Taux d'ouverture"
            value={`${kpisGlobaux.tauxOuverture.toFixed(1)}`}
            suffix="%"
            icon={<Eye className="w-5 h-5" />}
            color="terracotta"
          />
          <KpiCard
            label="Taux de clic"
            value={`${kpisGlobaux.tauxClic.toFixed(1)}`}
            suffix="%"
            icon={<MousePointerClick className="w-5 h-5" />}
            color="indigo"
          />
          <KpiCard
            label="Conversions"
            value={kpisGlobaux.conversions.toLocaleString('fr-FR')}
            icon={<ShoppingBag className="w-5 h-5" />}
            color="sage"
          />
          <KpiCard
            label="CA généré"
            value={kpisGlobaux.ca.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
            suffix="DT"
            icon={<DollarSign className="w-5 h-5" />}
            color="warning"
          />
        </div>

        {/* Par canal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {stats.map((c) => {
            const tauxOuv = c.envois ? (c.ouvertures / c.envois) * 100 : 0;
            const tauxClic = c.ouvertures ? (c.clics / c.ouvertures) * 100 : 0;
            const isEmail = c.canal === 'email';
            const accent = isEmail ? 'var(--accent-indigo)' : 'var(--accent-sage)';
            return (
              <div
                key={c.canal}
                className="rounded-xl shadow-sm border p-5"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-subtle)',
                  borderLeft: `4px solid ${accent}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {isEmail ? (
                      <Mail className="w-5 h-5" style={{ color: accent }} />
                    ) : (
                      <MessageCircle className="w-5 h-5" style={{ color: accent }} />
                    )}
                    <div>
                      <div
                        className="text-[11px] uppercase tracking-wider"
                        style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--fg-muted)' }}
                      >
                        Canal
                      </div>
                      <div
                        className="text-lg italic"
                        style={{
                          fontFamily: 'Fraunces, serif',
                          fontWeight: 500,
                          color: 'var(--fg-primary)',
                        }}
                      >
                        {isEmail ? 'Email' : 'WhatsApp Business'}
                      </div>
                    </div>
                  </div>
                  <Send className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Envois
                    </div>
                    <div
                      className="text-xl font-mono font-bold"
                      style={{ color: 'var(--fg-primary)' }}
                    >
                      {c.envois.toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Conversions
                    </div>
                    <div
                      className="text-xl font-mono font-bold"
                      style={{ color: 'var(--accent-terracotta)' }}
                    >
                      {c.conversions}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Ouverture
                    </div>
                    <div className="flex items-baseline gap-1">
                      <div
                        className="text-xl font-mono font-bold"
                        style={{ color: 'var(--fg-primary)' }}
                      >
                        {tauxOuv.toFixed(1)}%
                      </div>
                      <CampagnePerfChart
                        data={c.serie_ouverture}
                        color={accent as string}
                        width={80}
                        height={26}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      Clic
                    </div>
                    <div className="flex items-baseline gap-1">
                      <div
                        className="text-xl font-mono font-bold"
                        style={{ color: 'var(--fg-primary)' }}
                      >
                        {tauxClic.toFixed(1)}%
                      </div>
                      <CampagnePerfChart
                        data={c.serie_clic}
                        color={accent as string}
                        width={80}
                        height={26}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="border-t pt-3 flex items-center justify-between text-xs"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--fg-muted)' }}>CA généré</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--fg-primary)' }}>
                    {c.ca_dt.toLocaleString('fr-FR')} DT
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top campagnes */}
        <div
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="p-4 flex items-center gap-2 border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-terracotta)' }} />
            <h3
              className="italic"
              style={{
                fontFamily: 'Fraunces, serif',
                fontWeight: 500,
                color: 'var(--fg-primary)',
              }}
            >
              Top campagnes
            </h3>
          </div>
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
                  <th className="px-4 py-3">Campagne</th>
                  <th className="px-4 py-3">Canal</th>
                  <th className="px-4 py-3">Segment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Envois</th>
                  <th className="px-4 py-3 text-right">% Ouv.</th>
                  <th className="px-4 py-3 text-right">% Clic</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                  <th className="px-4 py-3 text-right">CA (DT)</th>
                </tr>
              </thead>
              <tbody>
                {top.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t hover:bg-[var(--bg-hover)]"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--fg-primary)' }}>
                      {t.libelle}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={
                          t.canal === 'email'
                            ? {
                                color: 'var(--accent-indigo)',
                                background: 'var(--color-info-bg)',
                                borderColor: 'var(--accent-indigo)',
                              }
                            : {
                                color: 'var(--color-success)',
                                background: 'var(--color-success-bg)',
                                borderColor: 'var(--color-success)',
                              }
                        }
                      >
                        {t.canal === 'email' ? (
                          <Mail className="w-3 h-3" />
                        ) : (
                          <MessageCircle className="w-3 h-3" />
                        )}
                        {t.canal}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-xs font-mono"
                      style={{ color: 'var(--accent-indigo)' }}
                    >
                      {t.segment}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {t.date}
                    </td>
                    <td className="px-4 py-3 font-mono text-right">
                      {t.envois.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 font-mono text-right">{t.taux_ouverture.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-right">{t.taux_clic.toFixed(1)}</td>
                    <td className="px-4 py-3 font-mono text-right font-semibold">
                      {t.conversions}
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-right font-bold"
                      style={{ color: 'var(--accent-terracotta)' }}
                    >
                      {t.ca_dt.toLocaleString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPerformance;
