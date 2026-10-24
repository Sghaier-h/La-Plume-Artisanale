import * as model from './model.js';

// Boucle d'orchestration
let _timer = null;
let _running = false;

export const INTERVAL_MS = 5 * 60 * 1000;   // 5 minutes (§7.18)

export async function rafraichirMaintenant() {
  const inseres = await model.rafraichirSnapshotOFsTissage();
  await model.purger(24);
  return { inseres, horodatage: new Date().toISOString() };
}

/** Démarre le service background (idempotent). */
export function demarrerService({ intervalMs = INTERVAL_MS, logger = console } = {}) {
  if (_timer) return { deja_actif: true };
  const tick = async () => {
    if (_running) return;
    _running = true;
    try {
      const res = await rafraichirMaintenant();
      logger.log?.(`[snapshots] ${res.inseres} lignes @ ${res.horodatage}`);
    } catch (e) {
      logger.error?.('[snapshots] erreur :', e);
    } finally { _running = false; }
  };
  _timer = setInterval(tick, intervalMs);
  tick(); // premier passage immédiat
  return { demarre: true, intervalMs };
}

export function arreterService() {
  if (!_timer) return { deja_arrete: true };
  clearInterval(_timer); _timer = null;
  return { arrete: true };
}

export const dernierParMachine = (id_machine) => model.dernierSnapshotParMachine(id_machine);
