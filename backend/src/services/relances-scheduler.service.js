/**
 * Relances Scheduler — job quotidien d'envoi automatique des relances.
 * Lit `parametrage.relances.*` pour l'heure du cron / l'activation.
 */
import { pool } from '../utils/db.js';

let cronLib = null;
let job = null;

const loadCron = async () => {
  if (cronLib) return cronLib;
  try {
    cronLib = (await import('node-cron')).default;
  } catch {
    console.warn('[relances] node-cron indisponible — scheduler désactivé');
    cronLib = null;
  }
  return cronLib;
};

const readConfig = async () => {
  const r = await pool
    .query(`SELECT cle, valeur FROM parametrage WHERE cle LIKE 'relances.%'`)
    .catch(() => ({ rows: [] }));
  const cfg = { enabled: true, cron_hour: 9 };
  r.rows.forEach((row) => {
    const key = row.cle.replace('relances.', '');
    if (key === 'enabled') cfg[key] = row.valeur === 'true';
    else if (key === 'cron_hour') cfg[key] = parseInt(row.valeur, 10) || 9;
  });
  return cfg;
};

export const startRelancesScheduler = async () => {
  const cron = await loadCron();
  if (!cron) return;

  const cfg = await readConfig();
  if (!cfg.enabled) {
    console.log('[relances] Scheduler désactivé via parametrage (relances.enabled=false)');
    return;
  }

  const hour = Number.isFinite(cfg.cron_hour) ? cfg.cron_hour : 9;
  const pattern = `0 ${hour} * * *`;

  if (job) job.stop();
  job = cron.schedule(pattern, async () => {
    console.log('[relances] Running daily reminder job at', new Date().toISOString());
    try {
      const { genererRelancesJob } = await import('../../modules/relances/controllers/relances.controller.js');
      const result = await genererRelancesJob();
      console.log('[relances] Job result:', result);
    } catch (e) {
      console.error('[relances] Job failed:', e.message);
    }
  }, { timezone: 'Africa/Tunis' });

  console.log(`[relances] Scheduler démarré — cron "${pattern}" (Africa/Tunis)`);
};

export const stopRelancesScheduler = () => {
  if (job) { job.stop(); job = null; }
};
