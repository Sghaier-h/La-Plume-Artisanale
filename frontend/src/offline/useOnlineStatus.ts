/**
 * useOnlineStatus — expose l'état réseau + outbox pour les composants UI.
 * §14ter.19 — ERP La Plume Artisanale
 */
import { useEffect, useState, useCallback } from 'react';
import { countPending } from './outbox';
import { getLastSyncAt, flushOutbox } from './syncWorker';

export interface OnlineStatus {
  isOnline: boolean;
  pendingCount: number;
  lastSyncAt: number; // 0 si jamais
  /** Lance une synchro manuelle (bouton « Réessayer »). */
  retry: () => Promise<void>;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [lastSyncAt, setLastSyncAt] = useState<number>(getLastSyncAt());

  const refresh = useCallback(async () => {
    try {
      const n = await countPending();
      setPendingCount(n);
      setLastSyncAt(getLastSyncAt());
    } catch {
      // IDB inaccessible → on garde l'état précédent
    }
  }, []);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); void refresh(); };
    const onOffline = () => setIsOnline(false);
    const onChanged = () => { void refresh(); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('outbox:changed', onChanged);
    void refresh();
    // Rafraîchir périodiquement pour tenir compte des flushes auto
    const t = window.setInterval(refresh, 10_000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('outbox:changed', onChanged);
      window.clearInterval(t);
    };
  }, [refresh]);

  const retry = useCallback(async () => {
    await flushOutbox();
    await refresh();
  }, [refresh]);

  return { isOnline, pendingCount, lastSyncAt, retry };
}
