// scheduler.js — Boucle setInterval qui déclenche les agents selon leur cadence.
//
// Deux modes de configuration :
//   1. `frequence_minutes` (int, colonne optionnelle dans agents_config.parametres.frequence_minutes)
//      → simple : "toutes les N minutes" — utilisé par cette boucle.
//   2. `cron_schedule` (colonne standard) → réservé au scheduler node-cron (sous-module scheduler/).
//
// Cette implémentation privilégie l'option (1) car elle n'ajoute aucune dépendance
// (setInterval natif, docs Node.js). Le cron avancé reste géré par le sous-module scheduler.
//
// Chaque tick :
//  - recharge la liste des agents actifs
//  - pour chaque agent : si (now - derniere_execution) >= frequence_minutes → runAgent

import { getPool } from '../../_shared/db.js';
import { runAgent } from './agent-runner.js';

const TICK_INTERVAL_MS = Number(process.env.IA_SCHEDULER_TICK_MS || 60_000); // 1 min

let ticker = null;
let running = false;
const lastRunAt = new Map(); // id_agent -> ms

async function pickAgentsToRun() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT id_agent, code, nom, parametres,
            (SELECT MAX(termine_a) FROM agents_runs WHERE id_agent = c.id_agent AND statut = 'succes') AS derniere_execution
       FROM agents_config c
      WHERE actif = TRUE`
  );
  const now = Date.now();
  const due = [];
  for (const a of rows) {
    const freqMin = Number(a.parametres?.frequence_minutes);
    if (!Number.isFinite(freqMin) || freqMin <= 0) continue; // ignoré par cette boucle
    const last = a.derniere_execution
      ? new Date(a.derniere_execution).getTime()
      : (lastRunAt.get(a.id_agent) || 0);
    if (now - last >= freqMin * 60_000) due.push(a);
  }
  return due;
}

async function tick() {
  if (running) return;
  running = true;
  try {
    const due = await pickAgentsToRun();
    for (const a of due) {
      lastRunAt.set(a.id_agent, Date.now());
      try {
        const r = await runAgent(a.id_agent, { trigger: 'cron' });
        console.log(`[ia-scheduler] ✓ ${a.code} — ${r.findings_count} findings — ${r.duree_ms} ms`);
      } catch (err) {
        console.error(`[ia-scheduler] ✗ ${a.code} — ${err.message}`);
      }
    }
  } catch (err) {
    console.error('[ia-scheduler] tick error:', err);
  } finally {
    running = false;
  }
}

export function start() {
  if (ticker) return { started: false, reason: 'déjà démarré' };
  console.log(`[ia-scheduler] démarrage — tick toutes les ${TICK_INTERVAL_MS} ms`);
  ticker = setInterval(() => { tick().catch(() => {}); }, TICK_INTERVAL_MS);
  // premier tick immédiat, non bloquant
  tick().catch(() => {});
  return { started: true, tick_ms: TICK_INTERVAL_MS };
}

export function stop() {
  if (ticker) { clearInterval(ticker); ticker = null; }
  return { stopped: true };
}

export function status() {
  return {
    running: !!ticker,
    tick_ms: TICK_INTERVAL_MS,
    tracked_agents: [...lastRunAt.keys()],
  };
}
