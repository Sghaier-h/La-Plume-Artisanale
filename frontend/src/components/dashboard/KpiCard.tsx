import React from 'react';

export type KpiTone = 'terracotta' | 'gold' | 'sage' | 'indigo' | 'rose' | 'brown';

export interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  hint?: string;
  delta?: { value: number; label?: string };  // e.g. +12% vs last month
  icon?: React.ReactNode;
  tone?: KpiTone;
  loading?: boolean;
  onClick?: () => void;
  active?: boolean;
  /** Phase F4 — classe additionnelle (ex. `la-plume-card` pour texture papier) */
  className?: string;
}

const toneVar: Record<KpiTone, string> = {
  terracotta: 'var(--accent-terracotta)',
  gold: 'var(--accent-gold)',
  sage: 'var(--accent-sage)',
  indigo: 'var(--accent-indigo)',
  rose: 'var(--accent-rose)',
  brown: 'var(--kpi-6)',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label, value, unit, hint, delta, icon, tone = 'terracotta', loading, onClick, active, className,
}) => {
  const accent = toneVar[tone];
  const positive = (delta?.value ?? 0) >= 0;
  const clickable = !!onClick;
  const borderWidth = active ? '2px' : '1px';
  const borderColorBase = active ? accent : 'var(--border-subtle)';
  const boxShadowBase = active
    ? `var(--shadow-md), 0 0 0 3px ${accent}33`
    : 'var(--shadow-sm)';
  const commonProps: any = clickable
    ? { role: 'button', tabIndex: 0, 'aria-pressed': !!active }
    : {};

  return (
    <div
      {...commonProps}
      className={className}
      onClick={onClick}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      } : undefined}
      style={{
        position: 'relative',
        background: 'var(--bg-elevated)',
        border: `${borderWidth} solid ${borderColorBase}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--s-5)',
        boxShadow: boxShadowBase,
        transition: 'transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease), border-color var(--duration) var(--ease)',
        cursor: clickable ? 'pointer' : 'default',
        overflow: 'hidden',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!clickable) return;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = active
          ? `var(--shadow-lg), 0 0 0 3px ${accent}55`
          : 'var(--shadow-md)';
        if (!active) {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)';
        }
      }}
      onMouseLeave={(e) => {
        if (!clickable) return;
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = boxShadowBase;
        (e.currentTarget as HTMLDivElement).style.borderColor = borderColorBase;
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '3px',
          width: '100%',
          background: `linear-gradient(90deg, ${accent}, ${accent}44)`,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s-3)', marginBottom: 'var(--s-3)' }}>
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--fg-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </div>
        {icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              background: `${accent}18`,
              color: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-2)', minHeight: 40 }}>
        {loading ? (
          <div
            style={{
              height: 32,
              width: 80,
              background: 'var(--bg-hover)',
              borderRadius: 'var(--radius-xs)',
              animation: 'lp-pulse 1.4s ease-in-out infinite',
            }}
          />
        ) : (
          <>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-3xl)',
                fontWeight: 700,
                color: 'var(--fg-primary)',
                lineHeight: 1,
              }}
            >
              {value}
            </div>
            {unit && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-muted)', fontWeight: 500 }}>
                {unit}
              </div>
            )}
          </>
        )}
      </div>

      {(hint || delta) && (
        <div style={{ marginTop: 'var(--s-3)', display: 'flex', alignItems: 'center', gap: 'var(--s-2)', fontSize: 'var(--text-xs)' }}>
          {delta && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: positive ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                color: positive ? 'var(--color-success)' : 'var(--color-danger)',
                fontWeight: 600,
              }}
            >
              {positive ? '↑' : '↓'} {Math.abs(delta.value)}%
              {delta.label && <span style={{ opacity: 0.75, marginLeft: 4 }}>{delta.label}</span>}
            </span>
          )}
          {hint && <span style={{ color: 'var(--fg-muted)' }}>{hint}</span>}
        </div>
      )}

      {clickable && active && (
        <div
          style={{
            marginTop: 'var(--s-2)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: accent,
            opacity: 0.9,
          }}
        >
          ● Filtre actif
        </div>
      )}

      <style>{`
        @keyframes lp-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};

export default KpiCard;
