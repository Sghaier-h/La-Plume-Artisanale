import React from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;   // e.g. tabs, filters row
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, subtitle, actions, meta }) => {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-4)',
        paddingBottom: 'var(--s-5)',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 'var(--s-6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--s-4)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--accent-terracotta)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 'var(--s-2)',
              }}
            >
              {eyebrow}
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--fg-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--fg-secondary)',
                marginTop: 'var(--s-2)',
                marginBottom: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap' }}>{actions}</div>
        )}
      </div>
      {meta}
    </header>
  );
};

export default PageHeader;
