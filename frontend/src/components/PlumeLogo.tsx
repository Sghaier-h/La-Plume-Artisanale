/**
 * PlumeLogo - Logo officiel La Plume Artisanale (image bitmap PNG servie
 * depuis `/public/logo-la-plume.png`). Garde la même API que l'ancienne
 * version SVG (size, variant, showTagline, className, style).
 *
 * Variantes :
 *  - variant="icon" : logo seul (image carrée)
 *  - variant="full" : logo + "La Plume Artisanale" en Fraunces italic
 *                     + optionnel tagline sous le nom
 */
import React from 'react';

export interface PlumeLogoProps {
  /** Taille en pixels (hauteur de l'icône). Défaut 64. */
  size?: number;
  /** `icon` = logo seul, `full` = logo + nom. Défaut `icon`. */
  variant?: 'icon' | 'full';
  /** Si vrai et variant='full', affiche la tagline sous le nom. */
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const LOGO_SRC = '/logo-la-plume.png';

const PlumeLogo: React.FC<PlumeLogoProps> = ({
  size = 64,
  variant = 'icon',
  showTagline = false,
  className,
  style,
}) => {
  const Image = (
    <img
      src={LOGO_SRC}
      alt="La Plume Artisanale"
      width={size}
      height={size}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
      }}
      draggable={false}
    />
  );

  if (variant === 'icon') {
    return (
      <span className={className} style={{ display: 'inline-flex', ...style }}>
        {Image}
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
      {Image}
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
