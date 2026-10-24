import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, Zap, TrendingDown, Activity } from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// §11ter — Suivi coûts LLM (tokens & USD)
// ═══════════════════════════════════════════════════════════════════

interface CoutAgent {
  id_agent: number;
  agent_nom: string;
  tokens_mois: number;
  cout_mois_usd: number;
  runs_mois: number;
  cout_moyen_par_run: number;
  budget_mensuel_usd: number;
}

interface CoutMois {
  mois: string;
  tokens: number;
  cout_usd: number;
}

const MOCK_COUT_AGENTS: CoutAgent[] = [
  { id_agent: 1, agent_nom: 'Sentinelle Stock', tokens_mois: 1_240_000, cout_mois_usd: 18.6, runs_mois: 720, cout_moyen_par_run: 0.026, budget_mensuel_usd: 30 },
  { id_agent: 2, agent_nom: 'Suivi Production', tokens_mois: 2_100_000, cout_mois_usd: 31.5, runs_mois: 720, cout_moyen_par_run: 0.044, budget_mensuel_usd: 50 },
  { id_agent: 3, agent_nom: 'Contrôle Qualité', tokens_mois: 480_000, cout_mois_usd: 12.4, runs_mois: 30, cout_moyen_par_run: 0.413, budget_mensuel_usd: 20 },
  { id_agent: 4, agent_nom: 'Vigilance Finance', tokens_mois: 620_000, cout_mois_usd: 15.8, runs_mois: 30, cout_moyen_par_run: 0.527, budget_mensuel_usd: 25 },
  { id_agent: 5, agent_nom: 'Radar Commercial', tokens_mois: 540_000, cout_mois_usd: 13.2, runs_mois: 30, cout_moyen_par_run: 0.44, budget_mensuel_usd: 25 },
  { id_agent: 6, agent_nom: 'Analyse Fournisseurs', tokens_mois: 180_000, cout_mois_usd: 4.8, runs_mois: 4, cout_moyen_par_run: 1.2, budget_mensuel_usd: 15 },
  { id_agent: 7, agent_nom: 'Vigilance RH', tokens_mois: 90_000, cout_mois_usd: 2.4, runs_mois: 12, cout_moyen_par_run: 0.2, budget_mensuel_usd: 15 },
  { id_agent: 8, agent_nom: 'Rapport Quotidien', tokens_mois: 890_000, cout_mois_usd: 22.5, runs_mois: 30, cout_moyen_par_run: 0.75, budget_mensuel_usd: 35 },
  { id_agent: 9, agent_nom: 'Rapport Hebdomadaire', tokens_mois: 320_000, cout_mois_usd: 8.5, runs_mois: 4, cout_moyen_par_run: 2.125, budget_mensuel_usd: 20 },
  { id_agent: 10, agent_nom: 'Rapport Mensuel', tokens_mois: 210_000, cout_mois_usd: 6.3, runs_mois: 1, cout_moyen_par_run: 6.3, budget_mensuel_usd: 15 },
];

const MOCK_HISTORIQUE: CoutMois[] = (() => {
  const arr: CoutMois[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const growth = 1 + (11 - i) * 0.05;
    arr.push({
      mois: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      tokens: Math.round((4_500_000 + Math.random() * 1_500_000) * growth),
      cout_usd: Math.round((90 + Math.random() * 45) * growth),
    });
  }
  return arr;
})();

const CoutsLLM: React.FC = () => {
  const [agents, setAgents] = useState<CoutAgent[]>([]);
  const [historique, setHistorique] = useState<CoutMois[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([
        api.get('/api/v2/ia-agents/couts'),
        api.get('/api/v2/ia-agents/couts/historique'),
      ]);
      if (cancelled) return;
      const pickArray = (res: PromiseSettledResult<any>, fb: any[]): any[] => {
        if (res.status !== 'fulfilled') return fb;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        return fb;
      };
      setAgents(pickArray(r[0], MOCK_COUT_AGENTS));
      setHistorique(pickArray(r[1], MOCK_HISTORIQUE));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalTokens = agents.reduce((s, a) => s + a.tokens_mois, 0);
    const totalCout = agents.reduce((s, a) => s + a.cout_mois_usd, 0);
    const totalRuns = agents.reduce((s, a) => s + a.runs_mois, 0);
    const coutMoyenRun = totalRuns > 0 ? totalCout / totalRuns : 0;
    const economieEstimeeVsManuel = totalRuns * 15;
    return { totalTokens, totalCout, totalRuns, coutMoyenRun, economieEstimeeVsManuel };
  }, [agents]);

  const maxCoutAgent = Math.max(...agents.map((a) => a.cout_mois_usd), 1);
  const maxCoutHist = Math.max(...historique.map((h) => h.cout_usd), 1);

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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
              §11ter · Intelligence Artificielle
            </div>
            <h1
              className="text-3xl italic mb-1"
              style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}
            >
              Coûts LLM
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
              Suivi des tokens et coûts USD par agent · Historique 12 mois
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard label="Tokens ce mois" value={(kpis.totalTokens / 1_000_000).toFixed(2)} suffix="M" color="indigo" icon={<Zap className="w-5 h-5" />} />
            <KpiCard label="Coût ce mois" value={kpis.totalCout.toFixed(1)} suffix="USD" color="terracotta" icon={<DollarSign className="w-5 h-5" />} />
            <KpiCard label="Coût moyen / run" value={kpis.coutMoyenRun.toFixed(3)} suffix="USD" color="sage" icon={<Activity className="w-5 h-5" />} />
            <KpiCard label="Économie vs manuel" value={kpis.economieEstimeeVsManuel.toLocaleString('fr-FR')} suffix="USD" color="sage" icon={<TrendingDown className="w-5 h-5" />} subtitle="~15 USD/run évité en RH" />
          </div>

          {/* Bar chart par agent */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-[#E8DCC8]">
            <h3 className="text-lg italic mb-4" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
              Coûts par agent
            </h3>
            <div className="space-y-2">
              {agents.map((a) => (
                <div key={a.id_agent} className="flex items-center gap-3">
                  <div className="w-40 text-xs truncate" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                    {a.agent_nom}
                  </div>
                  <div className="flex-1 relative h-6 rounded" style={{ backgroundColor: '#F5EFE4' }}>
                    <div
                      className="absolute inset-y-0 left-0 rounded transition-all"
                      style={{
                        width: `${(a.cout_mois_usd / maxCoutAgent) * 100}%`,
                        backgroundColor: a.cout_mois_usd > a.budget_mensuel_usd * 0.9 ? '#B84A4A' : '#C8663D',
                      }}
                    />
                    <div
                      className="absolute inset-y-0 border-l-2 border-dashed"
                      style={{
                        left: `${(a.budget_mensuel_usd / maxCoutAgent) * 100}%`,
                        borderColor: '#8A6E4A',
                      }}
                      title={`Budget ${a.budget_mensuel_usd}$`}
                    />
                  </div>
                  <div className="w-32 text-right text-xs font-mono" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                    ${a.cout_mois_usd.toFixed(1)} / ${a.budget_mensuel_usd}
                  </div>
                  <div className="w-20 text-right text-[10px] font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                    {(a.tokens_mois / 1000).toFixed(0)}k tk
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historique 12 mois */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-[#E8DCC8]">
            <h3 className="text-lg italic mb-4" style={{ fontFamily: 'var(--font-serif, Fraunces, serif)', fontWeight: 500, color: 'var(--fg-primary, #2F2A26)' }}>
              Historique 12 derniers mois
            </h3>
            <div className="flex items-end gap-2 h-48 pt-4 border-t" style={{ borderColor: '#E8DCC8' }}>
              {historique.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-mono font-semibold" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                    ${h.cout_usd}
                  </div>
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${(h.cout_usd / maxCoutHist) * 140}px`,
                      backgroundColor: '#C8663D',
                    }}
                    title={`${(h.tokens / 1_000_000).toFixed(2)}M tokens`}
                  />
                  <div className="text-[10px]" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                    {h.mois}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoutsLLM;
