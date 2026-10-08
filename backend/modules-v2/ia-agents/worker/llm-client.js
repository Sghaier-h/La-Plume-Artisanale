// llm-client.js — Client LLM unifié Claude (Anthropic) / OpenAI.
// Détecte la clé disponible dans les variables d'env et route la requête.
// Utilise `fetch` natif Node 18+, aucune dépendance externe.
//
// Contrat public : `askLLM({ system, user, model, provider, maxTokens, jsonMode, temperature, signal })`
//   -> { text, tokens_input, tokens_output, cout_usd, provider, model, raw }
//
// - Le budget tokens est contrôlé côté agent-runner (fail-fast si dépassement)
// - Timeout HTTP par défaut : 60 s (surchargable via `IA_LLM_TIMEOUT_MS`)
// - `jsonMode: true` demande une réponse JSON stricte (guardrails côté prompt)

const DEFAULT_TIMEOUT_MS = Number(process.env.IA_LLM_TIMEOUT_MS || 60_000);

// Tarifs indicatifs USD / 1M tokens (mis à jour manuellement — 2026-Q3)
// Cf. https://www.anthropic.com/pricing et https://openai.com/pricing
const PRICING = {
  'claude-opus-4-7':      { input: 15.00, output: 75.00 },
  'claude-opus-4':        { input: 15.00, output: 75.00 },
  'claude-sonnet-4-5':    { input:  3.00, output: 15.00 },
  'claude-sonnet-4':      { input:  3.00, output: 15.00 },
  'claude-3-5-sonnet':    { input:  3.00, output: 15.00 },
  'claude-3-5-haiku':     { input:  0.80, output:  4.00 },
  'gpt-4o':               { input:  2.50, output: 10.00 },
  'gpt-4o-mini':          { input:  0.15, output:  0.60 },
  'gpt-4-turbo':          { input: 10.00, output: 30.00 },
};

function estimateCostUsd(model, tokensIn, tokensOut) {
  const key = (model || '').toLowerCase();
  const match = Object.keys(PRICING).find(k => key.startsWith(k));
  if (!match) return 0;
  const p = PRICING[match];
  return +((tokensIn * p.input + tokensOut * p.output) / 1_000_000).toFixed(6);
}

function detectProvider(explicitProvider) {
  if (explicitProvider === 'claude' || explicitProvider === 'openai') return explicitProvider;
  if (process.env.ANTHROPIC_API_KEY) return 'claude';
  if (process.env.OPENAI_API_KEY)    return 'openai';
  throw new Error('Aucune clé LLM configurée. Définis ANTHROPIC_API_KEY ou OPENAI_API_KEY.');
}

async function callClaude({ system, user, model, maxTokens, jsonMode, temperature, signal }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY manquante');

  const modelName = model || 'claude-sonnet-4-5';
  const finalSystem = jsonMode
    ? `${system}\n\nRéponds STRICTEMENT en JSON valide, sans texte hors des accolades, sans markdown fences.`
    : system;

  const body = {
    model: modelName,
    max_tokens: maxTokens || 4096,
    temperature: temperature ?? 0.2,
    system: finalSystem,
    messages: [{ role: 'user', content: user }],
  };

  const timeout = AbortSignal.timeout(DEFAULT_TIMEOUT_MS);
  const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify(body),
    signal: combinedSignal,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Claude API ${resp.status}: ${errText.slice(0, 500)}`);
  }
  const data = await resp.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  const tokensIn  = data.usage?.input_tokens  ?? 0;
  const tokensOut = data.usage?.output_tokens ?? 0;

  return {
    text,
    tokens_input:  tokensIn,
    tokens_output: tokensOut,
    cout_usd:      estimateCostUsd(modelName, tokensIn, tokensOut),
    provider:      'claude',
    model:         modelName,
    raw:           data,
  };
}

async function callOpenAI({ system, user, model, maxTokens, jsonMode, temperature, signal }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY manquante');

  const modelName = model || 'gpt-4o-mini';
  const body = {
    model: modelName,
    max_tokens: maxTokens || 4096,
    temperature: temperature ?? 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user },
    ],
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const timeout = AbortSignal.timeout(DEFAULT_TIMEOUT_MS);
  const combinedSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${apiKey}`,
      'content-type':  'application/json',
    },
    body: JSON.stringify(body),
    signal: combinedSignal,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`OpenAI API ${resp.status}: ${errText.slice(0, 500)}`);
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  const tokensIn  = data.usage?.prompt_tokens     ?? 0;
  const tokensOut = data.usage?.completion_tokens ?? 0;

  return {
    text,
    tokens_input:  tokensIn,
    tokens_output: tokensOut,
    cout_usd:      estimateCostUsd(modelName, tokensIn, tokensOut),
    provider:      'openai',
    model:         modelName,
    raw:           data,
  };
}

/**
 * @param {object} opts
 * @param {string} opts.system       — prompt système (rôle + contraintes)
 * @param {string} opts.user         — message utilisateur (contexte data)
 * @param {string} [opts.model]      — override modèle
 * @param {'claude'|'openai'} [opts.provider] — force provider
 * @param {number} [opts.maxTokens]  — plafond réponse
 * @param {boolean} [opts.jsonMode]  — force réponse JSON
 * @param {number} [opts.temperature]
 * @param {AbortSignal} [opts.signal] — annulation externe
 */
export async function askLLM(opts) {
  if (!opts || typeof opts !== 'object') throw new Error('askLLM: options requises');
  if (!opts.system || !opts.user) throw new Error('askLLM: `system` et `user` requis');
  const provider = detectProvider(opts.provider);
  if (provider === 'claude') return callClaude(opts);
  return callOpenAI(opts);
}

/** Utile pour parser une réponse JSON même quand le LLM entoure de fences. */
export function safeJsonParse(text) {
  if (!text) return null;
  let s = String(text).trim();
  // Retire les fences markdown éventuels
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Si toujours pas propre, tente d'extraire le 1er bloc { ... }
  const first = s.indexOf('{');
  const last  = s.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  try { return JSON.parse(s); }
  catch { return null; }
}

export const _internal = { estimateCostUsd, detectProvider };
