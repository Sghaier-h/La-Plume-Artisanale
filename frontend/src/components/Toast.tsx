/**
 * Toast - Modern toast queue system for La Plume Artisanale.
 * Uses design tokens (design-system.css). Fixed bottom-right, slide-in,
 * auto-dismiss after 4s. Wrap the app in <ToastProvider>, then call
 * useToast() to obtain { success, error, info, warning }.
 */
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  message: string;
  title?: string;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  push: (kind: ToastKind, message: string, title?: string) => void;
  remove: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 4000;

function kindColor(kind: ToastKind): { fg: string; bg: string; icon: React.ReactNode } {
  switch (kind) {
    case 'success':
      return {
        fg: 'var(--color-success)',
        bg: 'var(--color-success-bg)',
        icon: <CheckCircle2 size={18} />,
      };
    case 'error':
      return {
        fg: 'var(--color-danger)',
        bg: 'var(--color-danger-bg)',
        icon: <AlertCircle size={18} />,
      };
    case 'warning':
      return {
        fg: 'var(--color-warning)',
        bg: 'var(--color-warning-bg)',
        icon: <AlertTriangle size={18} />,
      };
    default:
      return {
        fg: 'var(--color-info)',
        bg: 'var(--color-info-bg)',
        icon: <Info size={18} />,
      };
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current[id];
    if (tm) {
      clearTimeout(tm);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string, title?: string) => {
      const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setToasts((t) => [...t, { id, kind, message, title }]);
      timers.current[id] = setTimeout(() => remove(id), DURATION_MS);
    },
    [remove]
  );

  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ toasts, push, remove }), [toasts, push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
      <style>{`
        @keyframes lp-toast-in {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
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
      style={{
        position: 'fixed',
        right: 'var(--s-6)',
        bottom: 'var(--s-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-2)',
        zIndex: 1100,
        pointerEvents: 'none',
        maxWidth: 380,
      }}
    >
      {toasts.map((t) => {
        const c = kindColor(t.kind);
        return (
          <div
            key={t.id}
            role="status"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--s-3)',
              padding: 'var(--s-3) var(--s-4)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderLeft: `4px solid ${c.fg}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--fg-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              minWidth: 280,
              animation: 'lp-toast-in var(--duration-slow) var(--ease)',
            }}
          >
            <div style={{ color: c.fg, flexShrink: 0, marginTop: 2 }}>{c.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {t.title && (
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.title}</div>
              )}
              <div style={{ color: 'var(--fg-secondary)', lineHeight: 'var(--leading-snug)' }}>
                {t.message}
              </div>
            </div>
            <button
              onClick={() => onClose(t.id)}
              aria-label="Fermer"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--fg-muted)',
                cursor: 'pointer',
                padding: 2,
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastProvider;
