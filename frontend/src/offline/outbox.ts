/**
 * Outbox — file d'attente des actions mutantes faites hors ligne.
 * §14ter.19 — ERP La Plume Artisanale
 *
 * Chaque entrée représente un appel axios (POST/PUT/DELETE) qui n'a pas
 * pu partir, et qui sera rejoué quand le réseau revient (voir
 * `syncWorker.ts`).
 *
 * Statuts :
 *   - pending  : en attente de synchro
 *   - syncing  : en cours de requête (évite les doubles envois)
 *   - failed   : rejeté par le serveur en 4xx (requiert intervention
 *                humaine — l'opérateur peut cliquer « Réessayer » dans
 *                la bannière)
 *   - done     : complété — gardé brièvement pour le compteur UI puis
 *                supprimé par le worker
 */
import { openDb, OUTBOX_STORE } from './db';

export type OutboxStatus = 'pending' | 'syncing' | 'failed' | 'done';

export interface OutboxEntry {
  id?: number;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;                 // chemin relatif à baseURL axios
  body?: unknown;              // sérialisable JSON
  headers?: Record<string, string>;
  metadata?: {
    label?: string;            // ex: "Démarrer OF 123"
    icon?: string;             // ex: "play"
    retryCount?: number;
  };
  status: OutboxStatus;
  reason?: string;             // raison d'échec si status=failed
  createdAt: number;
  updatedAt: number;
}

/**
 * Ajoute une entrée à l'outbox. Renvoie l'id auto-généré.
 */
export async function enqueue(entry: Omit<OutboxEntry, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const now = Date.now();
    const full: Omit<OutboxEntry, 'id'> = {
      ...entry,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const req = tx.objectStore(OUTBOX_STORE).add(full);
    req.onsuccess = () => {
      // Notifie l'UI (bannière) qu'une entrée vient d'être ajoutée.
      try { window.dispatchEvent(new Event('outbox:changed')); } catch { /* noop */ }
      resolve(req.result as number);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Liste toutes les entrées (tous statuts, triées par createdAt asc). */
export async function listAll(): Promise<OutboxEntry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const req = tx.objectStore(OUTBOX_STORE).getAll();
    req.onsuccess = () => {
      const all = (req.result as OutboxEntry[]) || [];
      all.sort((a, b) => a.createdAt - b.createdAt);
      resolve(all);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Liste uniquement les entrées pending ou failed (à retenter). */
export async function listPending(): Promise<OutboxEntry[]> {
  const all = await listAll();
  return all.filter((e) => e.status === 'pending' || e.status === 'failed');
}

/** Compte les entrées à synchroniser (pending + failed). */
export async function countPending(): Promise<number> {
  const list = await listPending();
  return list.length;
}

/** Change le statut d'une entrée. */
export async function updateStatus(id: number, status: OutboxStatus, reason?: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const os = tx.objectStore(OUTBOX_STORE);
    const getReq = os.get(id);
    getReq.onsuccess = () => {
      const entry = getReq.result as OutboxEntry | undefined;
      if (!entry) return resolve();
      entry.status = status;
      entry.updatedAt = Date.now();
      if (reason !== undefined) entry.reason = reason;
      if (status === 'failed' || status === 'pending') {
        entry.metadata = {
          ...entry.metadata,
          retryCount: (entry.metadata?.retryCount || 0) + (status === 'failed' ? 1 : 0),
        };
      }
      const putReq = os.put(entry);
      putReq.onsuccess = () => {
        try { window.dispatchEvent(new Event('outbox:changed')); } catch { /* noop */ }
        resolve();
      };
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/** Supprime une entrée (après succès définitif). */
export async function remove(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const req = tx.objectStore(OUTBOX_STORE).delete(id);
    req.onsuccess = () => {
      try { window.dispatchEvent(new Event('outbox:changed')); } catch { /* noop */ }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/** Vide complètement l'outbox (utilisé au logout). */
export async function clearAll(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    const req = tx.objectStore(OUTBOX_STORE).clear();
    req.onsuccess = () => {
      try { window.dispatchEvent(new Event('outbox:changed')); } catch { /* noop */ }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Whitelist des endpoints POST/PUT qui peuvent être enqueuedsans
 * mettre la cohérence métier en danger. Les actions non listées
 * déclenchent une erreur réseau normale si offline (comportement online
 * préservé).
 *
 * Ces URLs sont des **patterns** (regex). On ne stocke jamais de
 * mot de passe, de montant financier non confirmé par l'opérateur,
 * ou d'opération comptable qui modifie un journal validé.
 */
export const OFFLINE_WHITELIST: RegExp[] = [
  /\/v2\/fabrication\/taches\/\d+\/demarrer$/,
  /\/v2\/fabrication\/taches\/\d+\/terminer$/,
  /\/v2\/fabrication\/taches\/\d+\/pause$/,
  /\/v2\/fabrication\/of\/\d+\/demarrer$/,
  /\/v2\/fabrication\/of\/\d+\/terminer$/,
  /\/v2\/rh\/pointages\/evenements$/,
  /\/v2\/rh\/pointages$/,
  /\/v2\/qualite\/defauts$/,
  /\/v2\/sous-traitance\/bons$/,
  /\/v2\/sous-traitance\/retours$/,
  /\/stock\/mouvements$/,
  /\/v2\/comptabilite\/caisses\/\d+\/mouvements$/,
];

/** Vérifie si une URL + méthode sont éligibles au mode offline. */
export function isOfflineSafe(method: string, url: string): boolean {
  const upper = method.toUpperCase();
  if (upper !== 'POST' && upper !== 'PUT') return false;
  return OFFLINE_WHITELIST.some((rx) => rx.test(url));
}
