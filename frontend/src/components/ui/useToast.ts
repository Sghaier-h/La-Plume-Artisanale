/**
 * useToast — hook principal du système toasts unifié (Phase F2).
 *
 * Deux styles d'usage supportés :
 *
 *   // Destructuration directe
 *   const { success, error, info, warning } = useToast();
 *   success('Enregistré');
 *   error('Erreur', 'Détail…');
 *
 *   // Namespace (compat libs populaires)
 *   const { toast } = useToast();
 *   toast.success('Enregistré');
 *
 * Signature : `method(title: string, description?: string)` — titre en gras,
 * description en second (optionnelle).
 */
import { useContext, useMemo } from 'react';
import { ToastContext, ToastApi } from './ToastProvider';
import type { ToastKind } from './Toast';

export interface UseToastReturn extends ToastApi {
  /** API groupée (compat `toast.success(...)`). */
  toast: ToastApi;
}

const noop = () => {};
const noopApi: ToastApi = {
  success: noop,
  error:   noop,
  info:    noop,
  warning: noop,
  push:    noop,
  dismiss: noop,
};

export function useToast(): UseToastReturn {
  const ctx = useContext(ToastContext);
  const api: ToastApi = ctx
    ? {
        success: ctx.success,
        error:   ctx.error,
        info:    ctx.info,
        warning: ctx.warning,
        push:    ctx.push,
        dismiss: ctx.dismiss,
      }
    : noopApi;

  return useMemo<UseToastReturn>(
    () => ({ ...api, toast: api }),
    // L'identité de `api` dépend uniquement de ctx (stable au sein du provider).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx]
  );
}

export type { ToastKind };
export default useToast;
