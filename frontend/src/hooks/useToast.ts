/**
 * useToast — compat Phase F2.
 *
 * Depuis la Phase F2, l'implémentation du système toasts vit dans
 * `components/ui/`. Ce fichier reste comme ré-export pour ne pas casser
 * les anciens imports (`from '../hooks/useToast'`).
 *
 * Nouvelle signature : `method(title: string, description?: string)`.
 */
export { useToast, type UseToastReturn } from '../components/ui/useToast';
export type { ToastKind } from '../components/ui/Toast';
export { useToast as default } from '../components/ui/useToast';
