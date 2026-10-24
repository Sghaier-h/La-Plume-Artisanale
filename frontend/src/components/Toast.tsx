/**
 * Toast — compat Phase F2.
 *
 * L'implémentation vit maintenant dans `./ui/Toast.tsx` et
 * `./ui/ToastProvider.tsx`. Ce fichier reste comme ré-export pour les
 * imports historiques (`from '../components/Toast'`).
 */
export { Toast, type ToastItem, type ToastKind } from './ui/Toast';
export { ToastProvider, ToastContext, type ToastContextValue, type ToastApi } from './ui/ToastProvider';
export { ToastProvider as default } from './ui/ToastProvider';
