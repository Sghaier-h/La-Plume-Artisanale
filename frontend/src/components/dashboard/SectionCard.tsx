import React from 'react';

export interface SectionCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  padded?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title, subtitle, actions, icon, padded = true, children, className,
}) => {
  return (
    <section
      className={className}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--s-3)',
          padding: 'var(--s-4) var(--s-5)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', minWidth: 0 }}>
          {icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'color-mix(in srgb, var(--accent-terracotta) 12%, transparent)',
                color: 'var(--accent-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-md)',
                fontWeight: 600,
                color: 'var(--fg-primary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--fg-muted)',
                  marginTop: 2,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {actions && <div style={{ display: 'flex', gap: 'var(--s-2)', flexShrink: 0 }}>{actions}</div>}
      </header>
      <div style={{ padding: padded ? 'var(--s-5)' : 0, flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </section>
  );
};

export default SectionCard;
