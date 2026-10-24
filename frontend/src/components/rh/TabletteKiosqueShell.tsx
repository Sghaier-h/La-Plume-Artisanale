/**
 * TabletteKiosqueShell — layout kiosque strict pour les tablettes RH
 * (§14quater.14). Zéro UserBar transversale, zéro menu §15. Juste :
 *   - un bandeau titre + horloge temps réel
 *   - bouton "quitter" qui vide la session tablette
 *
 * S'utilise dans les routes publiques `/tablette/*` sans authentification
 * applicative — la session y est portée par le PIN tablette.
 */
import React, { useEffect, useState } from 'react';
import { LogOut, Clock } from 'lucide-react';
import OfflineBanner from '../OfflineBanner';

export interface TabletteKiosqueShellProps {
  title: string;
  subtitle?: string;
  onExit?: () => void;
  children: React.ReactNode;
  accent?: 'terracotta' | 'indigo' | 'sage' | 'gold';
}

const TabletteKiosqueShell: React.FC<TabletteKiosqueShellProps> = ({
  title, subtitle, onExit, children, accent = 'terracotta',
}) => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-app)',
        color: 'var(--fg-primary)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* §14ter.19 — bannière connexion offline (sticky top) */}
      <OfflineBanner />
      {/* En-tête kiosque */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'clamp(12px, 2vw, 24px)',
          padding: 'clamp(12px, 2vw, 20px) clamp(16px, 3vw, 32px)',
          background: 'var(--bg-elevated)',
          borderBottom: `2px solid var(--accent-${accent})`,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
              fontWeight: 500,
              color: 'var(--fg-primary)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
                color: 'var(--fg-muted)',
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'clamp(12px, 2vw, 20px)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 20px)',
              background: 'var(--bg-canvas)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              minHeight: 44,
            }}
          >
            <Clock size={16} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                fontWeight: 700,
              }}
            >
              {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
                color: 'var(--fg-muted)',
              }}
            >
              {now.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 20px)',
                minHeight: 44,
                background: 'transparent',
                color: 'var(--color-danger)',
                border: '1px solid var(--color-danger)',
                borderRadius: 999,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              Quitter
            </button>
          )}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          padding: 'clamp(16px, 3vw, 40px)',
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default TabletteKiosqueShell;
