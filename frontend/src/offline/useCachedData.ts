/**
 * useCachedData — hook GET avec fallback cache IndexedDB.
 * §14ter.19 — ERP La Plume Artisanale
 *
 * Comportement :
 *   1. Au mount, retourne la valeur cachée (si présente et non expirée)
 *      en marquant `fromCache: true` pour permettre un affichage immédiat.
 *   2. Lance en parallèle un fetch réseau. Si succès → met à jour l'état
 *      et le cache. Si échec réseau → garde la valeur cachée + marque
 *      `fromCache: true`.
 *   3. Expose `refresh()` pour forcer un re-fetch (bouton pull-to-refresh).
 *
 * Note : ce hook ne passe PAS par axios — il utilise `fetch` natif pour
 * ne pas déclencher les intercepteurs offline (évite les boucles).
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { cacheGet, cacheSet, type CacheStore } from './db';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://fabrication.laplume-artisanale.tn/api'
    : 'http://localhost:5000/api');

export interface UseCachedDataOptions {
  /** Store IDB cible (par défaut 'generic'). */
  store?: CacheStore;
  /** Clé de cache (par défaut = url). */
  key?: string;
  /** TTL en ms (par défaut 24 h). */
  ttlMs?: number;
  /** Désactive le fetch réseau (ex: test). */
  disabled?: boolean;
}

export interface UseCachedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fromCache: boolean;
  cachedAt: number;
  refresh: () => Promise<void>;
}

export function useCachedData<T = unknown>(
  url: string,
  opts: UseCachedDataOptions = {},
): UseCachedDataResult<T> {
  const { store = 'generic', key = url, ttlMs = 24 * 60 * 60 * 1000, disabled = false } = opts;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<number>(0);
  const mounted = useRef(true);

  const fetchFresh = useCallback(async () => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const activeCompanyStr = localStorage.getItem('app_active_company');
    if (activeCompanyStr) {
      try {
        const c = JSON.parse(activeCompanyStr);
        if (c?.id_societe) headers['X-Active-Company-Id'] = String(c.id_societe);
      } catch { /* noop */ }
    }
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    const res = await fetch(fullUrl, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as T;
    await cacheSet(store, key, json, ttlMs);
    return json;
  }, [url, store, key, ttlMs]);

  const run = useCallback(async () => {
    if (disabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // 1. Lire le cache en premier
    try {
      const cached = await cacheGet<T>(store, key);
      if (cached && mounted.current) {
        setData(cached.value);
        setFromCache(true);
        setCachedAt(cached.cachedAt);
      }
    } catch { /* cache KO → fallback réseau pur */ }
    // 2. Essayer un fetch frais
    try {
      const fresh = await fetchFresh();
      if (mounted.current) {
        setData(fresh);
        setFromCache(false);
        setCachedAt(Date.now());
        setError(null);
      }
    } catch (err: any) {
      if (mounted.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [disabled, store, key, fetchFresh]);

  useEffect(() => {
    mounted.current = true;
    void run();
    return () => { mounted.current = false; };
  }, [run]);

  return { data, loading, error, fromCache, cachedAt, refresh: run };
}
