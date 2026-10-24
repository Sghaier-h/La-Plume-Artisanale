/**
 * Offline IndexedDB helper — §14ter.19
 *
 * Fournit un cache persistant pour les tablettes atelier :
 *   - GET cachés (OF, taches, sous-traitants, machines, articles, lots, pointages)
 *   - Outbox (actions mutantes faites hors ligne, synchronisées quand le
 *     réseau revient)
 *   - PIN tablette hashé pour authentification offline 8h
 *
 * Utilise l'API IndexedDB native (pas de dépendance externe) pour éviter
 * les problèmes ESM/CJS avec le bundler CRA.
 *
 * Les helpers sont tous asynchrones. En cas d'erreur IDB (navigation
 * privée, quota, etc.) ils rejettent la Promise — l'appelant doit
 * try/catch et retomber sur un comportement sans cache.
 */

export const DB_NAME = 'laplume-offline';
export const DB_VERSION = 1;

/** Stores GET cachés (lecture seule, TTL 24h-7j). */
export const CACHE_STORES = [
  'of',               // Ordres de fabrication
  'taches',           // Tâches opérateur
  'sous_traitants',   // Sous-traitants + bons
  'machines',         // Catalogue machines
  'articles',         // Catalogue articles
  'lots',             // Lots de traçabilité
  'pointages_recents', // Derniers pointages RH
  'generic',          // Autre endpoint caché via useCachedData
] as const;

/** Store Outbox (actions mutantes en attente de sync). */
export const OUTBOX_STORE = 'outbox';

/** Store méta (PIN tablette hashé, dernière session, etc.). */
export const META_STORE = 'meta';

export type CacheStore = (typeof CACHE_STORES)[number];

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  cachedAt: number; // timestamp ms
  expiresAt: number; // timestamp ms (0 = jamais)
}

/**
 * Ouvre (et crée si besoin) la base IndexedDB.
 * À la première ouverture, crée tous les stores nécessaires.
 */
export function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB non disponible'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of CACHE_STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'key' });
        }
      }
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const outbox = db.createObjectStore(OUTBOX_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        outbox.createIndex('status', 'status', { unique: false });
        outbox.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Enregistre une valeur dans un store de cache avec un TTL (ms).
 * TTL par défaut : 24h. Mettre `0` pour pas d'expiration.
 */
export async function cacheSet<T>(
  store: CacheStore,
  key: string,
  value: T,
  ttlMs: number = 24 * 60 * 60 * 1000,
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const now = Date.now();
    const entry: CacheEntry<T> = {
      key,
      value,
      cachedAt: now,
      expiresAt: ttlMs > 0 ? now + ttlMs : 0,
    };
    const req = os.put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Lit une valeur depuis un store. Renvoie `null` si absente ou expirée.
 * `cachedAt` est également exposé pour l'affichage « dernière synchro il y a X ».
 */
export async function cacheGet<T>(
  store: CacheStore,
  key: string,
): Promise<{ value: T; cachedAt: number } | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = os.get(key);
    req.onsuccess = () => {
      const entry = req.result as CacheEntry<T> | undefined;
      if (!entry) return resolve(null);
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        return resolve(null);
      }
      resolve({ value: entry.value, cachedAt: entry.cachedAt });
    };
    req.onerror = () => reject(req.error);
  });
}

/** Liste toutes les entrées d'un store (sans vérifier le TTL). */
export async function cacheList<T>(store: CacheStore): Promise<CacheEntry<T>[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = os.getAll();
    req.onsuccess = () => resolve((req.result as CacheEntry<T>[]) || []);
    req.onerror = () => reject(req.error);
  });
}

/** Supprime une entrée. */
export async function cacheDelete(store: CacheStore, key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Vide tous les stores (utilisé au logout explicite). */
export async function purgeAll(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const allStores: string[] = [...CACHE_STORES, OUTBOX_STORE, META_STORE];
    const tx = db.transaction(allStores, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    for (const name of allStores) {
      tx.objectStore(name).clear();
    }
  });
}

/** Lit une valeur du store meta. */
export async function metaGet<T = unknown>(key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly');
    const req = tx.objectStore(META_STORE).get(key);
    req.onsuccess = () => {
      const r = req.result as { key: string; value: T } | undefined;
      resolve(r ? r.value : null);
    };
    req.onerror = () => reject(req.error);
  });
}

/** Écrit une valeur dans le store meta. */
export async function metaSet<T = unknown>(key: string, value: T): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    const req = tx.objectStore(META_STORE).put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Supprime une clé meta. */
export async function metaDelete(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    const req = tx.objectStore(META_STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
