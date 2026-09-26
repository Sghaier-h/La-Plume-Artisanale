/**
 * useToast - Hook for the toast notification system
 * Provides success, error, info, warning helpers.
 * Backed by ToastContext (see components/Toast.tsx).
 */
import { useContext } from 'react';
import { ToastContext, type ToastKind } from '../components/Toast';

export interface ToastApi {
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  push: (kind: ToastKind, message: string, title?: string) => void;
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback no-op API so hook is safe to call outside provider
    const noop = () => {};
    return { success: noop, error: noop, info: noop, warning: noop, push: noop };
  }
  return {
    success: (m, t) => ctx.push('success', m, t),
    error: (m, t) => ctx.push('error', m, t),
    info: (m, t) => ctx.push('info', m, t),
    warning: (m, t) => ctx.push('warning', m, t),
    push: ctx.push,
  };
}

export default useToast;
