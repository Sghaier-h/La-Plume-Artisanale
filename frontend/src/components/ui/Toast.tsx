/**
 * Toast — Phase F2 UX unifiée (La Plume Artisanale)
 *
 * Composant d'affichage d'une entrée toast unique. Monté via ToastViewport
 * (voir ToastProvider.tsx). Styles alignés sur les tokens design-system.css.
 *
 *  - success → sage (var(--color-success))
 *  - error   → rouge (var(--color-danger))      · durée 6s
 *  - info    → indigo (var(--color-info))
 *  - warning → gold (var(--color-warning))
 *
 * API : voir hook useToast dans ../ui/useToast ou le re-export legacy
 * dans hooks/useToast.ts.
 */
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  kind: ToastKind;
  /** Ligne principale (gras). */
  title: string;
  /** Description complémentaire (optionnelle). */
  description?: string;
  /** Timestamp (ms) utilisé par la stack pour l'ordre et l'animation. */
  createdAt: number;
}

interface ToastViewProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

function kindStyle(kind: ToastKind): { fg: string; icon: React.ReactNode; label: string } {
  switch (kind) {
    case 'success':
      return { fg: 'var(--color-success)', icon: <CheckCircle2 size={18} />, label: 'Succès' };
    case 'error':
      return { fg: 'var(--color-danger)',  icon: <AlertCircle size={18} />, label: 'Erreur' };
    case 'warning':
      return { fg: 'var(--color-warning)', icon: <AlertTriangle size={18} />, label: 'Attention' };
    case 'info':
    default:
      return { fg: 'var(--color-info)',    icon: <Info size={18} />, label: 'Info' };
  }
}

/**
 * Carte toast individuelle. Dimensions fixes, animation slide-in-right +
 * fade-out via classes CSS définies dans ToastProvider.
 */
export const Toast: React.FC<ToastViewProps> = ({ toast, onClose }) => {
  const s = kindStyle(toast.kind);
  return (
    <div
      role={toast.kind === 'error' ? 'alert' : 'status'}
      aria-label={`${s.label} : ${toast.title}`}
      className="lp-toast lp-toast-enter"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--s-3)',
        padding: 'var(--s-3) var(--s-4)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `4px solid ${s.fg}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--fg-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        minWidth: 280,
        maxWidth: 380,
      }}
    >
      <div style={{ color: s.fg, flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: 'var(--fg-primary)' }}>{toast.title}</div>
        {toast.description && (
          <div
            style={{
              color: 'var(--fg-secondary)',
              lineHeight: 'var(--leading-snug)',
              marginTop: 2,
              wordBreak: 'break-word',
            }}
          >
            {toast.description}
          </div>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        aria-label="Fermer la notification"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--fg-muted)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
