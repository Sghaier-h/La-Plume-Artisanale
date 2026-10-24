/**
 * EmptyState - La Plume Artisanale design system
 * Affiche un état vide convivial (illustration + CTA).
 */
import React from 'react';
import { Inbox, SearchX, AlertTriangle } from 'lucide-react';

export type EmptyStateVariant = 'default' | 'search-no-result' | 'error';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  cta?: { label: string; onClick: () => void };
  variant?: EmptyStateVariant;
  className?: string;
}

const defaultIconForVariant: Record<EmptyStateVariant, React.ReactNode> = {
  default: <Inbox size={32} />,
  'search-no-result': <SearchX size={32} />,
  error: <AlertTriangle size={32} />,
};

const toneForVariant: Record<EmptyStateVariant, { bg: string; fg: string; border: string }> = {
  default: {
    bg: 'color-mix(in srgb, var(--accent-terracotta) 10%, transparent)',
    fg: 'var(--accent-terracotta)',
    border: 'color-mix(in srgb, var(--accent-terracotta) 20%, transparent)',
  },
  'search-no-result': {
    bg: 'color-mix(in srgb, var(--accent-indigo) 10%, transparent)',
    fg: 'var(--accent-indigo)',
    border: 'color-mix(in srgb, var(--accent-indigo) 20%, transparent)',
  },
  error: {
    bg: 'var(--color-danger-bg)',
    fg: 'var(--color-danger)',
    border: 'color-mix(in srgb, var(--color-danger) 20%, transparent)',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  cta,
  variant = 'default',
  className = '',
}) => {
  const tone = toneForVariant[variant];
  const displayedIcon = icon ?? defaultIconForVariant[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`}
      style={{
        padding: 'var(--s-10) var(--s-6)',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
      }}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <div
        className="flex items-center justify-center mb-4"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: tone.bg,
          color: tone.fg,
          border: `1px solid ${tone.border}`,
        }}
        aria-hidden="true"
      >
        {displayedIcon}
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'var(--text-xl)',
          color: 'var(--fg-primary)',
          marginBottom: description ? 'var(--s-2)' : 'var(--s-4)',
          lineHeight: 'var(--leading-tight)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            color: 'var(--fg-muted)',
            fontSize: 'var(--text-sm)',
            maxWidth: '420px',
            marginBottom: 'var(--s-6)',
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {description}
        </p>
      )}

      {cta && (
        <button
          type="button"
          onClick={cta.onClick}
          className="inline-flex items-center gap-2 transition-shadow hover:opacity-95"
          style={{
            background: variant === 'error' ? 'var(--color-danger)' : 'var(--accent-terracotta)',
            color: 'var(--fg-inverse)',
            padding: '0.6rem 1.3rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-md)',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
