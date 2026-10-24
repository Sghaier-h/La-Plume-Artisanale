/**
 * PlumeLogo — Logo officiel La Plume Artisanale (plume stylée seule).
 *
 * Choix PO 2026-10-24 : seule la plume dessinée est utilisée (pas le
 * logo manuscrit complet). SVG inline terracotta + accents or, cohérent
 * avec la palette La Plume et scalable sans perte.
 *
 * API conservée :
 *  - variant="icon" : plume seule
 *  - variant="full" : plume + "La Plume Artisanale" en Fraunces italic
 *                     + optionnel tagline sous le nom
 */
import React from 'react';

export interface PlumeLogoProps {
  /** Taille en pixels (hauteur de l'icône). Défaut 64. */
  size?: number;
  /** `icon` = plume seule, `full` = plume + nom. Défaut `icon`. */
  variant?: 'icon' | 'full';
  /** Si vrai et variant='full', affiche la tagline sous le nom. */
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PlumeLogo: React.FC<PlumeLogoProps> = ({
  size = 64,
  variant = 'icon',
  showTagline = false,
  className,
  style,
}) => {
  const uid = React.useId().replace(/:/g, '');

  // Plume stylée en SVG — rachis courbe + barbes dégradées + pointe or.
  const Plume = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`plume-grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-terracotta, #C8663D)" />
          <stop offset="0.6" stopColor="var(--accent-gold, #C89B3C)" />
          <stop offset="1" stopColor="var(--accent-indigo, #4A5D75)" />
        </linearGradient>
      </defs>

      {/* Barbes gauche (en éventail) */}
      <path
        d="M32 54 C 20 50, 12 44, 8 36 C 14 36, 20 38, 25 40 Z"
        fill={`url(#plume-grad-${uid})`}
        opacity="0.9"
      />
      <path
        d="M32 46 C 22 44, 14 38, 11 30 C 18 30, 24 32, 28 34 Z"
        fill={`url(#plume-grad-${uid})`}
        opacity="0.8"
      />
      <path
        d="M32 38 C 24 36, 18 30, 15 23 C 22 23, 27 25, 30 27 Z"
        fill={`url(#plume-grad-${uid})`}
        opacity="0.7"
      />

      {/* Barbes droite (symétriques) */}
      <path
        d="M32 54 C 44 50, 52 44, 56 36 C 50 36, 44 38, 39 40 Z"
        fill={`url(#plume-grad-${uid})`}
        opacity="0.9"
      />
      <path
        d="M32 46 C 42 44, 50 38, 53 30 C 46 30, 40 32, 36 34 Z"
        fill={`url(#plume-grad-${uid})`}
        opacity="0.8"
      />
      <path
        d="M32 38 C 40 36, 46 30, 49 23 C 42 23, 37 25, 34 27 Z"
        fill={`url(#plume-grad-${uid})`}
        opacity="0.7"
      />

      {/* Rachis central (hampe de la plume) */}
      <path
        d="M32 58 C 31 42, 31 26, 33 10"
        stroke="var(--fg-primary, #2F1F12)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pointe or au sommet */}
      <path
        d="M33 10 C 34 8, 34 6, 33 4 C 32 6, 32 8, 33 10 Z"
        fill="var(--accent-gold, #C89B3C)"
      />
      <circle cx="33" cy="4" r="1.5" fill="var(--accent-gold, #C89B3C)" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <span className={className} style={{ display: 'inline-flex', ...style }}>
        {Plume}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
      aria-label="La Plume Artisanale"
    >
      {Plume}
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: Math.max(18, size * 0.42),
            color: 'var(--fg-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          La Plume Artisanale
        </span>
        {showTagline && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              marginTop: 2,
              letterSpacing: '0.02em',
            }}
          >
            ERP · Fabrication de foutas · Tunisie
          </span>
        )}
      </span>
    </span>
  );
};

export default PlumeLogo;
