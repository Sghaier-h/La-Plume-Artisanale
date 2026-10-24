/**
 * Avatar — Phase F2
 * Rend l'avatar d'un collaborateur :
 *   • si `photoUrl` fourni ET valide → <img>
 *   • sinon → cercle avec initiales + couleur dérivée du hash du nom
 *     (palette terracotta / sage / indigo / gold / brown / rose)
 *
 * Zero dépendance réseau (plus de ui-avatars.com). Fallback propre si
 * l'image <img> échoue à charger (onError → initiales).
 */
import React from 'react';

type AvatarProps = {
  nom?: string;
  prenom?: string;
  photoUrl?: string | null;
  size?: number;             // px, default 36
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  rounded?: boolean;         // true = circle (default), false = square radius
};

// Palette La Plume Artisanale
const PALETTE = [
  'var(--accent-terracotta)',
  'var(--accent-sage)',
  'var(--accent-indigo)',
  'var(--accent-gold)',
  'var(--accent-brown)',
  'var(--accent-rose)',
];

/** Hash DJB2-light : stable, pas crypto, sert juste à colorier. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsOf(nom?: string, prenom?: string): string {
  const n = (nom || '').trim();
  const p = (prenom || '').trim();
  if (p && n) return (p[0] + n[0]).toUpperCase();
  if (n) return n.slice(0, 2).toUpperCase();
  if (p) return p.slice(0, 2).toUpperCase();
  return '??';
}

const Avatar: React.FC<AvatarProps> = ({
  nom,
  prenom,
  photoUrl,
  size = 36,
  title,
  className,
  style,
  rounded = true,
}) => {
  const [failed, setFailed] = React.useState(false);
  const label = `${prenom || ''} ${nom || ''}`.trim() || 'Utilisateur';
  const initials = initialsOf(nom, prenom);
  const bg = PALETTE[hashString(label) % PALETTE.length];

  const base: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: rounded ? '50%' : 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (photoUrl && !failed) {
    return (
      <img
        src={photoUrl}
        alt={label}
        title={title ?? label}
        className={className}
        style={{ ...base, objectFit: 'cover' }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        ...base,
        background: `color-mix(in srgb, ${bg} 18%, transparent)`,
        color: bg,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: Math.max(10, Math.floor(size * 0.4)),
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
      title={title ?? label}
      aria-label={label}
    >
      {initials}
    </div>
  );
};

export default Avatar;
