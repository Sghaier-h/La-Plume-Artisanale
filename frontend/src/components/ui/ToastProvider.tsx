/**
 * ToastProvider — Phase F2 UX unifiée (La Plume Artisanale)
 *
 * Provider React pour le système de toasts. Monté dans App.tsx (dans AppProvider).
 *
 * Caractéristiques :
 *  - position : fixed bottom-right (z-index 1100)
 *  - max 4 toasts affichés simultanément (le plus ancien est éjecté)
 *  - auto-dismiss : 3500ms (6000ms pour les erreurs)
 *  - bouton X pour fermer manuellement
 *  - animation slide-in-right + fade-out via @keyframes injectés localement
 *  - installe `window.showToast(type, title, desc?)` pour usage global
 *    (axios interceptor, code hors React).
 */
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Toast, ToastItem, ToastKind } from './Toast';

const DURATION_SUCCESS = 3500;
const DURATION_ERROR = 6000;
const MAX_VISIBLE = 4;

export interface ToastApi {
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  push:    (kind: ToastKind, title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

export interface ToastContextValue extends ToastApi {
  toasts: ToastItem[];
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    /**
     * Fonction globale pour émettre un toast depuis du code hors React
     * (axios interceptor, utilitaires, offline queue, …).
     * Installée au montage de ToastProvider ; no-op si le provider n'est pas monté.
     */
    showToast?: (kind: ToastKind, title: string, description?: string) => void;
    /**
     * Flag de configuration : si `false`, désactive l'auto-toast « Enregistré »
     * sur réponse 2xx POST/PUT/DELETE côté axios interceptor.
     * Défaut : true (quand undefined).
     */
    __toastOnSuccess?: boolean;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current[id];
    if (tm) {
      clearTimeout(tm);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (kind: ToastKind, title: string, description?: string) => {
      const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = Date.now();
      setToasts((t) => {
        const next = [...t, { id, kind, title, description, createdAt }];
        // Max 4 toasts visibles : on éjecte le plus ancien.
        if (next.length > MAX_VISIBLE) {
          const dropped = next.slice(0, next.length - MAX_VISIBLE);
          dropped.forEach((d) => {
            const tm = timers.current[d.id];
            if (tm) {
              clearTimeout(tm);
              delete timers.current[d.id];
            }
          });
          return next.slice(-MAX_VISIBLE);
        }
        return next;
      });
      const duration = kind === 'error' ? DURATION_ERROR : DURATION_SUCCESS;
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (t, d) => push('success', t, d),
      error:   (t, d) => push('error',   t, d),
      info:    (t, d) => push('info',    t, d),
      warning: (t, d) => push('warning', t, d),
      push,
      dismiss,
    }),
    [push, dismiss]
  );

  // Installe la fonction globale window.showToast pour usage hors React.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.showToast = (kind, title, description) => push(kind, title, description);
    }
    return () => {
      if (typeof window !== 'undefined' && window.showToast) {
        delete window.showToast;
      }
    };
  }, [push]);

  // Nettoyage global des timers au démontage.
  useEffect(() => {
    const t = timers.current;
    return () => {
      Object.values(t).forEach(clearTimeout);
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, ...api }),
    [toasts, api]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={dismiss} />
      <style>{`
        .lp-toast-enter {
          animation: lp-toast-slide-in var(--duration-slow, 240ms) var(--ease, cubic-bezier(.2,.8,.2,1));
        }
        @keyframes lp-toast-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes lp-toast-fade-out {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(20%);  opacity: 0; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

const ToastViewport: React.FC<{ toasts: ToastItem[]; onClose: (id: string) => void }> = ({
  toasts,
  onClose,
}) => {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        right: 'var(--s-6, 24px)',
        bottom: 'var(--s-6, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-2, 8px)',
        zIndex: 100,
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 2 * var(--s-6, 24px))',
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastProvider;
