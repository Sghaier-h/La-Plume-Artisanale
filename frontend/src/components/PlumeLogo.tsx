/**
 * PlumeLogo — Logo officiel « La Plume Artisanale ».
 *
 * Variantes :
 *  - `icon` : plume stylée seule (dégradé or→gris→noir), format carré
 *  - `full` : plume + écriture manuscrite « La Plume Artisanale » + vague
 *             (reproduction fidèle du logo de la marque)
 *  - `wordmark` : uniquement l'écriture + vague (sans plume), pour entêtes compacts
 *
 * Palette : or chaud (#D4A017 → #8B6914), gris anthracite (#4A4845 → #2B2928)
 */
import React from 'react';

export interface PlumeLogoProps {
  size?: number;
  variant?: 'icon' | 'full' | 'wordmark';
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* ───── Plume stylée (SVG inline) — plume en flamme dorée + rachis noir ───── */
const PlumeSvg: React.FC<{ size: number; uid: string }> = ({ size, uid }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 100"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    style={{ display: 'block', flexShrink: 0 }}
  >
    <defs>
      {/* Dégradé or chaud → or sombre */}
      <linearGradient id={`plume-gold-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F4C542" />
        <stop offset="0.45" stopColor="#D4A017" />
        <stop offset="1" stopColor="#8B6914" />
      </linearGradient>
      {/* Dégradé gris anthracite pour les lignes sombres de la plume */}
      <linearGradient id={`plume-dark-${uid}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2B2928" />
        <stop offset="1" stopColor="#4A4845" />
      </linearGradient>
    </defs>

    {/* Masse principale dorée en forme de flamme / plume stylée */}
    <path
      d="M 24 95
         C 20 85, 10 65, 10 42
         C 10 25, 15 10, 24 2
         C 33 10, 38 25, 38 42
         C 38 65, 28 85, 24 95 Z"
      fill={`url(#plume-gold-${uid})`}
    />

    {/* Fines nervures sombres ondulantes (effet barbes de plume) */}
    <path
      d="M 20 85 C 16 70, 12 55, 14 40 C 15 28, 19 15, 22 6"
      stroke={`url(#plume-dark-${uid})`}
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 24 92 C 22 75, 20 55, 22 35 C 23 22, 25 10, 26 4"
      stroke={`url(#plume-dark-${uid})`}
      strokeWidth="1.2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 28 85 C 30 70, 33 55, 32 40 C 31 28, 28 15, 26 6"
      stroke={`url(#plume-dark-${uid})`}
      strokeWidth="1.1"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 16 70 C 14 60, 12 50, 13 42"
      stroke={`url(#plume-dark-${uid})`}
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M 32 70 C 34 60, 35 50, 34 42"
      stroke={`url(#plume-dark-${uid})`}
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

/* ───── Wordmark manuscrit « La Plume Artisanale » + vague ───── */
const Wordmark: React.FC<{ height: number; uid: string }> = ({ height, uid }) => {
  // viewBox calibré pour un ratio ~5:1 (largeur ~5× hauteur)
  const w = Math.round(height * 5);
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 500 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="La Plume Artisanale"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`wm-ink-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3835" />
          <stop offset="1" stopColor="#5B5955" />
        </linearGradient>
      </defs>
      {/* Texte manuscrit via la fonte Fraunces italic — fallback cursive */}
      <text
        x="250"
        y="58"
        textAnchor="middle"
        fontFamily="'Dancing Script', 'Pacifico', 'Fraunces', 'Brush Script MT', cursive"
        fontStyle="italic"
        fontWeight="500"
        fontSize="56"
        fill={`url(#wm-ink-${uid})`}
        letterSpacing="1"
      >
        La Plume Artisanale
      </text>
      {/* Vague ondulante sous le texte */}
      <path
        d="M 40 85 C 120 72, 220 95, 320 82 C 400 72, 450 90, 470 85"
        stroke={`url(#wm-ink-${uid})`}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Petit accent (apostrophe de l'ancienne version A) */}
      <circle cx="245" cy="22" r="2" fill={`url(#wm-ink-${uid})`} opacity="0.6" />
    </svg>
  );
};

const PlumeLogo: React.FC<PlumeLogoProps> = ({
  size = 64,
  variant = 'icon',
  showTagline = false,
  className,
  style,
}) => {
  const uid = React.useId().replace(/:/g, '');

  if (variant === 'icon') {
    return (
      <span className={className} style={{ display: 'inline-flex', ...style }}>
        <PlumeSvg size={size} uid={uid} />
      </span>
    );
  }

  if (variant === 'wordmark') {
    return (
      <span className={className} style={{ display: 'inline-flex', ...style }}>
        <Wordmark height={size} uid={uid} />
      </span>
    );
  }

  // variant === 'full' : plume + wordmark côte à côte
  const plumeSize = Math.round(size * 1.1);
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(size * 0.1),
        ...style,
      }}
      aria-label="La Plume Artisanale"
    >
      <PlumeSvg size={plumeSize} uid={uid} />
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
        <Wordmark height={Math.round(size * 0.85)} uid={uid} />
        {showTagline && (
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-xs)',
              color: 'var(--fg-muted)',
              marginTop: 4,
              letterSpacing: '0.04em',
              textAlign: 'center',
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
