/**
 * Sync worker — vide l'outbox dès que le réseau revient.
 * §14ter.19 — ERP La Plume Artisanale
 *
 * Stratégies de déclenchement :
 *   1. Événement `online` du navigateur → `flushOutbox()`
 *   2. Polling toutes les 30 s (couvre les reconnexions WiFi silencieuses
 *      où `navigator.onLine` reste bloqué sur `true`)
 *   3. Événement interne `outbox:changed` quand on ajoute une entrée
 *      en ligne par erreur de timing
 *
 * N'importe PAS `services/api.ts` pour éviter une boucle d'import —
 * fait des `fetch()` natifs sur `window.location.origin + API baseURL`.
 */
import { listPending, updateStatus, remove, type OutboxEntry } from './outbox';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://fabrication.laplume-artisanale.tn/api'
    : 'http://localhost:5000/api');

let pollTimer: number | null = null;
let flushing = false;
let lastSyncAt = 0;

/** Dernière synchro réussie (timestamp ms, 0 si jamais). */
export function getLastSyncAt(): number {
  return lastSyncAt;
}

/** Essaie de vider l'outbox — safe à appeler même offline. */
export async function flushOutbox(): Promise<{ ok: number; failed: number }> {
  if (flushing) return { ok: 0, failed: 0 };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok: 0, failed: 0 };
  flushing = true;
  let ok = 0;
  let failed = 0;
  try {
    const pending = await listPending();
    for (const entry of pending) {
      if (entry.id == null) continue;
      const result = await sendEntry(entry);
      if (result === 'ok') ok += 1;
      else if (result === 'failed') failed += 1;
      // 'retry' → on laisse en pending, on retentera au prochain tick
    }
    if (ok > 0) {
      lastSyncAt = Date.now();
      try { window.dispatchEvent(new Event('outbox:changed')); } catch { /* noop */ }
    }
  } finally {
    flushing = false;
  }
  return { ok, failed };
}

async function sendEntry(entry: OutboxEntry): Promise<'ok' | 'failed' | 'retry'> {
  const id = entry.id!;
  await updateStatus(id, 'syncing');
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(entry.headers || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const activeCompanyStr = localStorage.getItem('app_active_company');
    if (activeCompanyStr) {
      try {
        const c = JSON.parse(activeCompanyStr);
        if (c?.id_societe) headers['X-Active-Company-Id'] = String(c.id_societe);
      } catch { /* noop */ }
    }
    const url = entry.url.startsWith('http') ? entry.url : `${API_URL}${entry.url}`;
    const res = await fetch(url, {
      method: entry.method,
      headers,
      body: entry.body != null ? JSON.stringify(entry.body) : undefined,
    });
    if (res.ok) {
      await remove(id);
      return 'ok';
    }
    if (res.status >= 400 && res.status < 500) {
      let reason = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        reason = data?.error?.message || data?.message || reason;
      } catch { /* noop */ }
      await updateStatus(id, 'failed', reason);
      return 'failed';
    }
    // 5xx → on retentera
    await updateStatus(id, 'pending', `HTTP ${res.status}`);
    return 'retry';
  } catch (err: any) {
    // Réseau KO — on remet en pending pour un prochain tick.
    await updateStatus(id, 'pending', err?.message || 'Erreur réseau');
    return 'retry';
  }
}

/**
 * Démarre le worker. Idempotent : appeler plusieurs fois n'a pas d'effet.
 * À appeler au boot (index.tsx).
 */
export function startSyncWorker(): void {
  if (pollTimer != null) return;
  const trigger = () => { void flushOutbox(); };
  window.addEventListener('online', trigger);
  window.addEventListener('outbox:changed', trigger);
  // Polling tolérant aux reconnexions silencieuses
  pollTimer = window.setInterval(() => { void flushOutbox(); }, 30_000);
  // Flush immédiat au boot si on est en ligne
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    setTimeout(trigger, 2_000);
  }
}

/** Arrête le worker (tests, logout). */
export function stopSyncWorker(): void {
  if (pollTimer != null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
}
