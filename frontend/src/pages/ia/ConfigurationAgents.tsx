import React, { useEffect, useState } from 'react';
import {
  Sliders,
  Bot,
  ChevronDown,
  Save,
  X,
  Bell,
  DollarSign,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

// ═══════════════════════════════════════════════════════════════════
// §11ter — Configuration avancée des agents IA
// ═══════════════════════════════════════════════════════════════════

type ModeleLLM = 'claude-haiku-4' | 'claude-sonnet-4' | 'claude-opus-4' | 'gpt-4o' | 'gpt-4o-mini';

interface ConfigAgent {
  id_agent: number;
  code: string;
  nom: string;
  domaine: string;
  seuils: {
    key: string;
    label: string;
    value: number;
    unit: string;
  }[];
  destinataires: string[];
  cron: string;
  budget_tokens_mois: number;
  budget_usd_mois: number;
  model_llm: ModeleLLM;
  temperature: number;
  actif: boolean;
}

const MOCK_CONFIGS: ConfigAgent[] = [
  {
    id_agent: 1,
    code: 'STOCK',
    nom: 'Sentinelle Stock',
    domaine: 'Stock & Approvisionnement',
    seuils: [
      { key: 'seuil_rupture_j', label: 'Seuil alerte rupture (jours)', value: 3, unit: 'j' },
      { key: 'seuil_surstock_pct', label: 'Seuil surstock (% vs rotation)', value: 180, unit: '%' },
      { key: 'quantite_reappro_mp', label: 'Qté minimum réappro MP', value: 500, unit: 'kg' },
    ],
    destinataires: ['h.sghaier@laplumeartisanale.tn', 'stock@laplumeartisanale.tn'],
    cron: '0 * * * *',
    budget_tokens_mois: 1_500_000,
    budget_usd_mois: 30,
    model_llm: 'claude-haiku-4',
    temperature: 0.2,
    actif: true,
  },
  {
    id_agent: 2,
    code: 'PROD',
    nom: 'Suivi Production',
    domaine: 'Fabrication & OF',
    seuils: [
      { key: 'seuil_retard_j', label: 'Retard OF critique', value: 2, unit: 'j' },
      { key: 'seuil_rendement_pct', label: 'Rendement mini attendu', value: 92, unit: '%' },
    ],
    destinataires: ['h.sghaier@laplumeartisanale.tn', 'production@laplumeartisanale.tn'],
    cron: '15 * * * *',
    budget_tokens_mois: 2_500_000,
    budget_usd_mois: 50,
    model_llm: 'claude-sonnet-4',
    temperature: 0.2,
    actif: true,
  },
  {
    id_agent: 3,
    code: 'QUAL',
    nom: 'Contrôle Qualité',
    domaine: 'Qualité',
    seuils: [
      { key: 'seuil_defauts_points', label: 'Seuil défauts (points 4-pt)', value: 20, unit: 'pts' },
      { key: 'seuil_variance_pct', label: 'Variance qualité alerte', value: 150, unit: '%' },
    ],
    destinataires: ['qualite@laplumeartisanale.tn'],
    cron: '0 6 * * *',
    budget_tokens_mois: 800_000,
    budget_usd_mois: 20,
    model_llm: 'claude-sonnet-4',
    temperature: 0.3,
    actif: true,
  },
  {
    id_agent: 4,
    code: 'FIN',
    nom: 'Vigilance Finance',
    domaine: 'Comptabilité & Trésorerie',
    seuils: [
      { key: 'seuil_relance_j', label: 'Seuil relance facture (jours)', value: 30, unit: 'j' },
      { key: 'seuil_contentieux_j', label: 'Seuil contentieux', value: 60, unit: 'j' },
      { key: 'ecart_caisse_dt', label: 'Écart caisse tolérable', value: 20, unit: 'DT' },
    ],
    destinataires: ['compta@laplumeartisanale.tn', 'direction@laplumeartisanale.tn'],
    cron: '0 5 * * *',
    budget_tokens_mois: 1_000_000,
    budget_usd_mois: 25,
    model_llm: 'claude-sonnet-4',
    temperature: 0.1,
    actif: true,
  },
];

const MODELS: { value: ModeleLLM; label: string; cout: string }[] = [
  { value: 'claude-haiku-4', label: 'Claude Haiku 4', cout: '$0.25 / 1M in' },
  { value: 'claude-sonnet-4', label: 'Claude Sonnet 4', cout: '$3 / 1M in' },
  { value: 'claude-opus-4', label: 'Claude Opus 4', cout: '$15 / 1M in' },
  { value: 'gpt-4o-mini', label: 'GPT-4o mini', cout: '$0.15 / 1M in' },
  { value: 'gpt-4o', label: 'GPT-4o', cout: '$2.50 / 1M in' },
];

const ConfigurationAgents: React.FC = () => {
  const [configs, setConfigs] = useState<ConfigAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(1);
  const [dirty, setDirty] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await Promise.allSettled([api.get('/api/v2/ia-agents/config')]);
      if (cancelled) return;
      const pickArray = (res: PromiseSettledResult<any>): ConfigAgent[] => {
        if (res.status !== 'fulfilled') return MOCK_CONFIGS;
        const d = res.value?.data?.data ?? res.value?.data;
        if (Array.isArray(d)) return d;
        if (d && Array.isArray(d.configs)) return d.configs;
        return MOCK_CONFIGS;
      };
      setConfigs(pickArray(r[0]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patchConfig = (id: number, patch: Partial<ConfigAgent>) => {
    setConfigs((prev) => prev.map((c) => (c.id_agent === id ? { ...c, ...patch } : c)));
    setDirty((prev) => new Set(prev).add(id));
  };

  const patchSeuil = (id: number, key: string, value: number) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id_agent === id
          ? { ...c, seuils: c.seuils.map((s) => (s.key === key ? { ...s, value } : s)) }
          : c
      )
    );
    setDirty((prev) => new Set(prev).add(id));
  };

  const save = (id: number) => {
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const cancel = (id: number) => {
    setDirty((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
              Configuration agents
            </h1>
            <p className="text-sm" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
              Seuils, destinataires, fréquences, budgets, modèles LLM
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {configs.map((c) => {
              const isOpen = expanded === c.id_agent;
              const isDirty = dirty.has(c.id_agent);
              return (
                <div
                  key={c.id_agent}
                  className="bg-white rounded-xl shadow-sm border border-[#E8DCC8] overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : c.id_agent)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#FDF2ED]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-lg p-2"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--accent-terracotta) 15%, var(--bg-elevated))', color: '#C8663D' }}
                      >
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold" style={{ color: 'var(--fg-primary, #2F2A26)' }}>{c.nom}</div>
                        <div className="text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{c.domaine}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          c.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {c.actif ? 'Actif' : 'Inactif'}
                      </span>
                      {isDirty && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 uppercase">
                          Non enregistré
                        </span>
                      )}
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        style={{ color: 'var(--fg-muted, #8A6E4A)' }}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 border-t space-y-5" style={{ borderColor: '#E8DCC8' }}>
                      {/* Actif toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--fg-primary, #2F2A26)' }}>
                            Agent actif
                          </div>
                          <div className="text-xs" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            Désactive complètement l'exécution planifiée
                          </div>
                        </div>
                        <button
                          onClick={() => patchConfig(c.id_agent, { actif: !c.actif })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            c.actif ? 'bg-[#4A6C5B]' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              c.actif ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Seuils */}
                      <div>
                        <div className="text-xs font-mono uppercase mb-3 flex items-center gap-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                          <Sliders className="w-3 h-3" /> Seuils de détection
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {c.seuils.map((s) => (
                            <div key={s.key} className="flex items-center gap-2">
                              <label className="flex-1 text-xs" style={{ color: 'var(--fg-secondary, #5D4E42)' }}>
                                {s.label}
                              </label>
                              <input
                                type="number"
                                value={s.value}
                                onChange={(e) => patchSeuil(c.id_agent, s.key, Number(e.target.value))}
                                className="w-24 border rounded px-2 py-1 text-sm font-mono text-right"
                                style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                              />
                              <span className="text-xs font-mono w-8" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>{s.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fréquence & LLM */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-mono uppercase mb-1 flex items-center gap-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            <Clock className="w-3 h-3" /> Fréquence (cron)
                          </label>
                          <input
                            value={c.cron}
                            onChange={(e) => patchConfig(c.id_agent, { cron: e.target.value })}
                            className="w-full border rounded px-3 py-2 text-sm font-mono"
                            style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            Modèle LLM
                          </label>
                          <select
                            value={c.model_llm}
                            onChange={(e) => patchConfig(c.id_agent, { model_llm: e.target.value as ModeleLLM })}
                            className="w-full border rounded px-3 py-2 text-sm"
                            style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                          >
                            {MODELS.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label} — {m.cout}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            Budget tokens/mois
                          </label>
                          <input
                            type="number"
                            value={c.budget_tokens_mois}
                            onChange={(e) => patchConfig(c.id_agent, { budget_tokens_mois: Number(e.target.value) })}
                            className="w-full border rounded px-3 py-2 text-sm font-mono"
                            style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono uppercase mb-1 flex items-center gap-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            <DollarSign className="w-3 h-3" /> Budget USD/mois
                          </label>
                          <input
                            type="number"
                            value={c.budget_usd_mois}
                            onChange={(e) => patchConfig(c.id_agent, { budget_usd_mois: Number(e.target.value) })}
                            className="w-full border rounded px-3 py-2 text-sm font-mono"
                            style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-mono uppercase mb-1 block" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                            Température (0-1)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={c.temperature}
                            onChange={(e) => patchConfig(c.id_agent, { temperature: Number(e.target.value) })}
                            className="w-full border rounded px-3 py-2 text-sm font-mono"
                            style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                          />
                        </div>
                      </div>

                      {/* Destinataires */}
                      <div>
                        <label className="text-xs font-mono uppercase mb-1 flex items-center gap-1" style={{ color: 'var(--fg-muted, #8A6E4A)' }}>
                          <Bell className="w-3 h-3" /> Destinataires notifications
                        </label>
                        <textarea
                          value={c.destinataires.join('\n')}
                          onChange={(e) =>
                            patchConfig(c.id_agent, {
                              destinataires: e.target.value.split('\n').filter((l) => l.trim()),
                            })
                          }
                          rows={3}
                          className="w-full border rounded px-3 py-2 text-sm font-mono"
                          style={{ borderColor: '#E8DCC8', backgroundColor: 'var(--bg-app, #FBF8F3)' }}
                          placeholder="Un email par ligne"
                        />
                      </div>

                      {/* Actions */}
                      {isDirty && (
                        <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: '#E8DCC8' }}>
                          <button
                            onClick={() => cancel(c.id_agent)}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm border"
                            style={{ backgroundColor: 'var(--bg-app, #FBF8F3)', borderColor: '#E8DCC8', color: 'var(--fg-secondary, #5D4E42)' }}
                          >
                            <X className="w-4 h-4" /> Annuler
                          </button>
                          <button
                            onClick={() => save(c.id_agent)}
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm text-white"
                            style={{ backgroundColor: '#C8663D' }}
                          >
                            <Save className="w-4 h-4" /> Enregistrer
                          </button>
                        </div>
                      )}
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

export default ConfigurationAgents;
