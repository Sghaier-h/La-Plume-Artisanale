import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  Settings2,
  Clock,
  AlertCircle,
  DollarSign,
  Zap,
  RefreshCw,
} from 'lucide-react';
import KpiCard from '../../components/ecommerce/KpiCard';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// §11ter — Agents IA Actifs (10 agents)
// Backend : ia-agents/config, ia-agents/runs, ia-agents/findings
// ═══════════════════════════════════════════════════════════════════

type StatutAgent = 'actif' | 'pause' | 'erreur';
type FrequenceCron = 'horaire' | 'quotidien' | 'hebdomadaire' | 'mensuel';

interface AgentIA {
  id_agent: number;
  code: string;
  nom: string;
  domaine: string;
  description: string;
  statut: StatutAgent;
  frequence: FrequenceCron;
  cron_expression: string;
  derniere_execution: string | null;
  prochaine_execution: string | null;
  findings_ouverts: number;
  runs_mois: number;
  tokens_mois: number;
  cout_mois_usd: number;
  budget_mensuel_usd: number;
  model_llm: string;
}

const MOCK_AGENTS: AgentIA[] = [
  {
    id_agent: 1,
    code: 'STOCK',
    nom: 'Sentinelle Stock',
    domaine: 'Stock & Approvisionnement',
    description: 'Détection ruptures, sur-stocks, seuils alerte MP et PF',
    statut: 'actif',
    frequence: 'horaire',
    cron_expression: '0 * * * *',
    derniere_execution: new Date(Date.now() - 3600_000 * 0.5).toISOString(),
    prochaine_execution: new Date(Date.now() + 3600_000 * 0.5).toISOString(),
    findings_ouverts: 7,
    runs_mois: 720,
    tokens_mois: 1_240_000,
    cout_mois_usd: 18.6,
    budget_mensuel_usd: 30,
    model_llm: 'claude-haiku-4',
  },
  {
    id_agent: 2,
    code: 'PROD',
    nom: 'Suivi Production',
    domaine: 'Fabrication & OF',
    description: 'Retards OF, écarts rendement, alertes machines',
    statut: 'actif',
    frequence: 'horaire',
    cron_expression: '15 * * * *',
    derniere_execution: new Date(Date.now() - 3600_000 * 0.7).toISOString(),
    prochaine_execution: new Date(Date.now() + 3600_000 * 0.3).toISOString(),
    findings_ouverts: 12,
    runs_mois: 720,
    tokens_mois: 2_100_000,
    cout_mois_usd: 31.5,
    budget_mensuel_usd: 50,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 3,
    code: 'QUAL',
    nom: 'Contrôle Qualité',
    domaine: 'Qualité',
    description: 'Anomalies contrôles 4-points, tendances défauts',
    statut: 'actif',
    frequence: 'quotidien',
    cron_expression: '0 6 * * *',
    derniere_execution: new Date(Date.now() - 3600_000 * 20).toISOString(),
    prochaine_execution: new Date(Date.now() + 3600_000 * 4).toISOString(),
    findings_ouverts: 3,
    runs_mois: 30,
    tokens_mois: 480_000,
    cout_mois_usd: 12.4,
    budget_mensuel_usd: 20,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 4,
    code: 'FIN',
    nom: 'Vigilance Finance',
    domaine: 'Comptabilité & Trésorerie',
    description: 'Écarts caisse, factures échues, anomalies OD',
    statut: 'actif',
    frequence: 'quotidien',
    cron_expression: '0 5 * * *',
    derniere_execution: new Date(Date.now() - 3600_000 * 21).toISOString(),
    prochaine_execution: new Date(Date.now() + 3600_000 * 3).toISOString(),
    findings_ouverts: 5,
    runs_mois: 30,
    tokens_mois: 620_000,
    cout_mois_usd: 15.8,
    budget_mensuel_usd: 25,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 5,
    code: 'COM',
    nom: 'Radar Commercial',
    domaine: 'CRM & Ventes',
    description: 'Leads froids, opportunités bloquées, forecasts',
    statut: 'actif',
    frequence: 'quotidien',
    cron_expression: '0 7 * * *',
    derniere_execution: new Date(Date.now() - 3600_000 * 19).toISOString(),
    prochaine_execution: new Date(Date.now() + 3600_000 * 5).toISOString(),
    findings_ouverts: 8,
    runs_mois: 30,
    tokens_mois: 540_000,
    cout_mois_usd: 13.2,
    budget_mensuel_usd: 25,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 6,
    code: 'FOUR',
    nom: 'Analyse Fournisseurs',
    domaine: 'Achats',
    description: 'Scoring fournisseurs, retards livraisons, prix anormaux',
    statut: 'actif',
    frequence: 'hebdomadaire',
    cron_expression: '0 6 * * 1',
    derniere_execution: new Date(Date.now() - 86400_000 * 3).toISOString(),
    prochaine_execution: new Date(Date.now() + 86400_000 * 4).toISOString(),
    findings_ouverts: 2,
    runs_mois: 4,
    tokens_mois: 180_000,
    cout_mois_usd: 4.8,
    budget_mensuel_usd: 15,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 7,
    code: 'RH',
    nom: 'Vigilance RH',
    domaine: 'Ressources Humaines',
    description: 'Retards pointage, écarts primes, échéances contrats',
    statut: 'pause',
    frequence: 'quotidien',
    cron_expression: '0 8 * * *',
    derniere_execution: new Date(Date.now() - 86400_000 * 2).toISOString(),
    prochaine_execution: null,
    findings_ouverts: 0,
    runs_mois: 12,
    tokens_mois: 90_000,
    cout_mois_usd: 2.4,
    budget_mensuel_usd: 15,
    model_llm: 'claude-haiku-4',
  },
  {
    id_agent: 8,
    code: 'RAP_Q',
    nom: 'Rapport Quotidien',
    domaine: 'Rapports Q/H/M',
    description: 'Digest exécutif quotidien tous domaines',
    statut: 'actif',
    frequence: 'quotidien',
    cron_expression: '30 18 * * *',
    derniere_execution: new Date(Date.now() - 3600_000 * 6).toISOString(),
    prochaine_execution: new Date(Date.now() + 3600_000 * 18).toISOString(),
    findings_ouverts: 0,
    runs_mois: 30,
    tokens_mois: 890_000,
    cout_mois_usd: 22.5,
    budget_mensuel_usd: 35,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 9,
    code: 'RAP_H',
    nom: 'Rapport Hebdomadaire',
    domaine: 'Rapports Q/H/M',
    description: 'Synthèse hebdo pour le comité de direction',
    statut: 'actif',
    frequence: 'hebdomadaire',
    cron_expression: '0 9 * * 1',
    derniere_execution: new Date(Date.now() - 86400_000 * 6).toISOString(),
    prochaine_execution: new Date(Date.now() + 86400_000 * 1).toISOString(),
    findings_ouverts: 0,
    runs_mois: 4,
    tokens_mois: 320_000,
    cout_mois_usd: 8.5,
    budget_mensuel_usd: 20,
    model_llm: 'claude-sonnet-4',
  },
  {
    id_agent: 10,
    code: 'RAP_M',
    nom: 'Rapport Mensuel',
    domaine: 'Rapports Q/H/M',
    description: 'Bilan mensuel + tendances 12 mois + recommandations',
    statut: 'actif',
    frequence: 'mensuel',
    cron_expression: '0 10 1 * *',
    derniere_execution: new Date(Date.now() - 86400_000 * 24).toISOString(),
    prochaine_execution: new Date(Date.now() + 86400_000 * 6).toISOString(),
    findings_ouverts: 0,
    runs_mois: 1,
    tokens_mois: 210_000,
    cout_mois_usd: 6.3,
    budget_mensuel_usd: 15,
    model_llm: 'claude-opus-4',
  },
];

const STATUT_CFG: Record<StatutAgent, { label: string; color: string; bg: string }> = {
  actif: { label: 'Actif', color: '#4A6C5B', bg: '#EEF4F0' },
  pause: { label: 'En pause', color: '#8A6412', bg: '#FBF3E0' },
  erreur: { label: 'Erreur', color: '#B84A4A', bg: '#FBECEC' },
};

const AgentsActifs: React.FC = () => {
  const [agents, setAgents] = useState<AgentIA[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/ia-agents/config')]);
      if (cancelled) return;
      const pickArray = (res: PromiseSettledResult<any>): AgentIA[] => {
        if (res.status !== 'fulfilled') return MOCK_AGENTS;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.agents)) return d.agents;
        return MOCK_AGENTS;
      };
      setAgents(pickArray(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalActifs = agents.filter((a) => a.statut === 'actif').length;
    const totalFindings = agents.reduce((s, a) => s + a.findings_ouverts, 0);
    const totalCout = agents.reduce((s, a) => s + a.cout_mois_usd, 0);
    const totalTokens = agents.reduce((s, a) => s + a.tokens_mois, 0);
    return { totalActifs, totalFindings, totalCout, totalTokens };
  }, [agents]);

  const toggleStatut = (id: number) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id_agent === id
          ? { ...a, statut: a.statut === 'actif' ? 'pause' : 'actif' }
          : a
      )
    );
  };

  const runNow = (id: number) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id_agent === id ? { ...a, derniere_execution: new Date().toISOString() } : a
      )
    );
  };

  if (loading) {
    return (
      <div className="ml-72 p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C8663D]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app, #FBF8F3)' }}>
      <div className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div
              className="text-xs uppercase tracking-widest font-mono mb-2"
              style={{ color: 'var(--fg-muted, #8A6E4A)' }}
            >
              §11ter · Intelligence Artificielle
            </div>
            <h1
              className="text-3xl italic mb-1"
              style={{
                fontFamily: 'var(--font-serif, Fraunces, serif)',
                fontWeight: 500,
                color: 'var(--fg-primary, #2F2A26)',
              }}
            >
              Agents actifs
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
              10 agents IA autonomes — surveillance, analyse, rapports
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              label="Agents actifs"
              value={kpis.totalActifs}
              suffix={`/ ${agents.length}`}
              color="sage"
              icon={<Bot className="w-5 h-5" />}
            />
            <KpiCard
              label="Constats ouverts"
              value={kpis.totalFindings}
              color={kpis.totalFindings > 20 ? 'warning' : 'indigo'}
              icon={<AlertCircle className="w-5 h-5" />}
            />
            <KpiCard
              label="Tokens ce mois"
              value={(kpis.totalTokens / 1_000_000).toFixed(2)}
              suffix="M"
              color="indigo"
              icon={<Zap className="w-5 h-5" />}
            />
            <KpiCard
              label="Coût LLM mois"
              value={kpis.totalCout.toFixed(1)}
              suffix="USD"
              color="terracotta"
              icon={<DollarSign className="w-5 h-5" />}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#E8DCC8]">
            <table className="min-w-full divide-y divide-[#E8DCC8] text-sm">
              <thead style={{ backgroundColor: 'var(--bg-subtle, #F5EFE4)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Fréquence</th>
                  <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Dernière exéc.</th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Constats</th>
                  <th className="px-4 py-3 text-right text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Tokens / Coût</th>
                  <th className="px-4 py-3 text-center text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0E7D4]">
                {agents.map((a) => {
                  const st = STATUT_CFG[a.statut];
                  const budgetPct = (a.cout_mois_usd / a.budget_mensuel_usd) * 100;
                  return (
                    <tr key={a.id_agent} className="hover:bg-[#FDF2ED]/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{a.nom}</div>
                        <div className="text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{a.domaine}</div>
                        <div className="text-[10px] italic mt-0.5" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{a.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded uppercase"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {a.statut === 'actif' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs capitalize" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>{a.frequence}</div>
                        <div className="text-[10px] font-mono" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{a.cron_expression}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                          {a.derniere_execution ? new Date(a.derniere_execution).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </div>
                        <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                          <Clock className="w-3 h-3" /> Prochaine : {a.prochaine_execution ? new Date(a.prochaine_execution).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono text-xs font-semibold ${
                            a.findings_ouverts === 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : a.findings_ouverts >= 8
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {a.findings_ouverts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-xs font-mono" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                          {(a.tokens_mois / 1000).toFixed(0)}k tk
                        </div>
                        <div className="text-xs font-mono" style={{ color: budgetPct > 90 ? '#B84A4A' : 'var(--fg-muted, #8A6E4A)' }}>
                          ${a.cout_mois_usd.toFixed(1)} / ${a.budget_mensuel_usd}
                        </div>
                        <div className="w-20 h-1 mt-0.5 ml-auto rounded" style={{ backgroundColor: '#F0E7D4' }}>
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${Math.min(100, budgetPct)}%`,
                              backgroundColor: budgetPct > 90 ? '#B84A4A' : '#C8663D',
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => runNow(a.id_agent)}
                            title="Lancer maintenant"
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                            style={{ color: '#C8663D' }}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStatut(a.id_agent)}
                            title={a.statut === 'actif' ? 'Mettre en pause' : 'Activer'}
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                            style={{ color: 'var(--fg-secondary, #5D4E42)' }}
                          >
                            {a.statut === 'actif' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            title="Configuration"
                            className="p-1.5 rounded hover:bg-[#FDF2ED]"
                            style={{ color: 'var(--fg-secondary, #5D4E42)' }}
                          >
                            <Settings2 className="w-4 h-4" />
                          </button>
                        </div>
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

export default AgentsActifs;
