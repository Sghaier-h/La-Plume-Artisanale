#!/usr/bin/env node
// start-scheduler.js — Entrypoint standalone du worker IA.
//
// Lancement :
//   node backend/modules-v2/ia-agents/worker/start-scheduler.js
//
// Variables d'env requises (voir README.md) :
//   - ANTHROPIC_API_KEY ou OPENAI_API_KEY
//   - IA_READONLY_DATABASE_URL         (rôle ia_readonly_bot, SELECT only)
//   - IA_CORRECTION_DATABASE_URL       (rôle ia_correction_bot, UPDATE/INSERT granulaires)
//   - DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME (pool applicatif standard)
//
// SIGINT / SIGTERM → arrêt propre.

import { start, stop } from './scheduler.js';
import { shutdown as shutdownRO } from './db-readonly-client.js';
import { shutdown as shutdownCorr } from './db-correction-client.js';

function requireEnv(...names) {
  const missing = names.filter(n => !process.env[n]);
  if (missing.length) {
    console.error('[worker-ia] variables env manquantes :', missing.join(', '));
    process.exit(2);
  }
}

async function main() {
  // On accepte OpenAI OU Anthropic — au moins l'un des deux.
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error('[worker-ia] ANTHROPIC_API_KEY ou OPENAI_API_KEY requis.');
    process.exit(2);
  }
  requireEnv('IA_READONLY_DATABASE_URL');
  // IA_CORRECTION_DATABASE_URL n'est nécessaire qu'au moment d'appliquer une correction ;
  // on ne bloque pas le worker si elle est absente (les propositions restent stockées).

  const s = start();
  console.log('[worker-ia] scheduler', s);

  const shutdown = async (sig) => {
    console.log(`[worker-ia] ${sig} — arrêt`);
    stop();
    await Promise.allSettled([shutdownRO(), shutdownCorr()]);
    process.exit(0);
  };
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(err => {
  console.error('[worker-ia] fatal:', err);
  process.exit(1);
});
