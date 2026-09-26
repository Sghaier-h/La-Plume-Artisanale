/**
 * PlumeLogo - Logo SVG artisanal La Plume Artisanale.
 *
 * Une navette de tissage stylisee avec une plume et des rayures fouta,
 * en terracotta + indigo sur fond creme. Deux variantes :
 * - variant="icon" : logo seul
 * - variant="full" : logo + nom "La Plume Artisanale" en Fraunces italic
 */
import React from 'react';

export interface PlumeLogoProps {
  size?: number;
  variant?: 'icon' | 'full';
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
  const iconSize = size;
  const stripe = 'var(--accent-terracotta)';
  const stripeAlt = 'var(--accent-indigo)';
  const stripeGold = 'var(--accent-gold)';
  const parchment = 'var(--bg-app)';
  const stroke = 'var(--fg-primary)';
  const uid = React.useId().replace(/:/g, '');

  const IconSvg = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={`shuttle-clip-${uid}`}>
          {/* Navette de tissage (forme lenticulaire) */}
          <path d="M4 32 C 16 12, 48 12, 60 32 C 48 52, 16 52, 4 32 Z" />
        </clipPath>
        <linearGradient id={`plume-grad-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-terracotta)" />
          <stop offset="1" stopColor="var(--accent-gold)" />
        </linearGradient>
      </defs>

      {/* Corps de la navette : fond parchemin */}
      <path
        d="M4 32 C 16 12, 48 12, 60 32 C 48 52, 16 52, 4 32 Z"
        fill={parchment}
        stroke={stroke}
        strokeWidth="1.5"
      />

      {/* Rayures fouta a l'interieur (clippees a la navette) */}
      <g clipPath={`url(#shuttle-clip-${uid})`}>
        <rect x="0" y="22" width="64" height="1.8" fill={stripe} opacity="0.85" />
        <rect x="0" y="26" width="64" height="1.2" fill={stripeAlt} opacity="0.75" />
        <rect x="0" y="30" width="64" height="0.9" fill={stripeGold} opacity="0.8" />
        <rect x="0" y="34" width="64" height="1.2" fill={stripeAlt} opacity="0.75" />
        <rect x="0" y="38" width="64" height="1.8" fill={stripe} opacity="0.85" />
        <rect x="0" y="42" width="64" height="0.7" fill={stripeAlt} opacity="0.5" />
      </g>

      {/* Contour navette au dessus des rayures pour proprete */}
      <path
        d="M4 32 C 16 12, 48 12, 60 32 C 48 52, 16 52, 4 32 Z"
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
      />

      {/* Plume stylisee (rachis + barbes) */}
      <g transform="translate(20 12) rotate(28)">
        {/* Rachis */}
        <line
          x1="12"
          y1="0"
          x2="12"
          y2="34"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Feuillage plume (deux moities) */}
        <path
          d="M12 3 C 3 8, 4 20, 12 26 L 12 3 Z"
          fill={`url(#plume-grad-${uid})`}
          opacity="0.95"
        />
        <path
          d="M12 3 C 21 8, 20 20, 12 26 L 12 3 Z"
          fill={stripeAlt}
          opacity="0.9"
        />
        {/* Barbes */}
        <g stroke={stroke} strokeWidth="0.5" opacity="0.4">
          <line x1="12" y1="7" x2="6" y2="9" />
          <line x1="12" y1="11" x2="5" y2="13" />
          <line x1="12" y1="15" x2="5" y2="17" />
          <line x1="12" y1="19" x2="6" y2="21" />
          <line x1="12" y1="7" x2="18" y2="9" />
          <line x1="12" y1="11" x2="19" y2="13" />
          <line x1="12" y1="15" x2="19" y2="17" />
          <line x1="12" y1="19" x2="18" y2="21" />
        </g>
        {/* Pointe plume */}
        <line
          x1="12"
          y1="30"
          x2="12"
          y2="34"
          stroke={stripe}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return (
      <span className={className} style={{ display: 'inline-flex', ...style }} aria-label="La Plume Artisanale">
        {IconSvg}
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
      {IconSvg}
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
