import React from 'react';

export interface DashboardShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * DashboardShell — page-level wrapper for every role dashboard.
 * Ensures consistent padding, background, max-width, and vertical rhythm.
 */
export const DashboardShell: React.FC<DashboardShellProps> = ({
  eyebrow, title, subtitle, headerRight, children,
}) => {
  return (
    <div
      style={{
        background: 'var(--bg-app)',
        minHeight: '100vh',
        color: 'var(--fg-primary)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: 'var(--s-6) var(--content-gutter) var(--s-12)',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 'var(--s-4)',
            flexWrap: 'wrap',
            paddingBottom: 'var(--s-5)',
            marginBottom: 'var(--s-6)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            {eyebrow && (
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: 'var(--accent-terracotta)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--s-2)',
                }}
              >
                {eyebrow}
              </div>
            )}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--fg-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
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
                  maxWidth: 640,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && (
            <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center', flexWrap: 'wrap' }}>
              {headerRight}
            </div>
          )}
        </header>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
