import React, { useMemo } from 'react';

/**
 * EmployeeAvatar — portrait rond bordé.
 *
 * Si `photoUrl` est fourni, affiche l'image (upload multipart JPG/PNG,
 * redimensionnée 200×200 côté backend — §11bis.7bis).
 * Sinon, fallback : initiales sur fond dégradé CSS déterministe
 * (hash simple sur le nom → couleur stable pour le même employé).
 */

interface Props {
  photoUrl?: string | null;
  nom?: string;
  prenom?: string;
  size?: number;                        // px — défaut 40
  borderColor?: string;                 // ex. '#FDFBF3' (crème TV)
  borderWidth?: number;                 // px — défaut 2
  className?: string;
  showRing?: boolean;                   // anneau extérieur discret
}

const PALETTE: Array<[string, string]> = [
  ['#C8663D', '#8A4326'],
  ['#4A6C5B', '#2f4a3d'],
  ['#3B4E68', '#243244'],
  ['#D6A756', '#8A6412'],
  ['#7B4A3D', '#4a2c22'],
  ['#546E7A', '#354a52'],
  ['#8E44AD', '#5a2a70'],
  ['#2C3E50', '#141d24'],
];

const initiales = (prenom?: string, nom?: string) => {
  const p = (prenom || '').trim().charAt(0).toUpperCase();
  const n = (nom || '').trim().charAt(0).toUpperCase();
  return `${p}${n}` || '??';
};

const hashCode = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const EmployeeAvatar: React.FC<Props> = ({
  photoUrl,
  nom,
  prenom,
  size = 40,
  borderColor = '#FDFBF3',
  borderWidth = 2,
  className = '',
  showRing = false,
}) => {
  const key = `${prenom || ''}-${nom || ''}` || 'anon';
  const grad = useMemo(() => {
    const [c1, c2] = PALETTE[hashCode(key) % PALETTE.length];
    return `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`;
  }, [key]);

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderColor,
    borderWidth,
    borderStyle: 'solid',
    background: grad,
    fontSize: Math.max(11, Math.round(size * 0.36)),
    boxShadow: showRing
      ? `0 0 0 ${Math.max(1, Math.round(size * 0.05))}px rgba(255,255,255,0.15)`
      : undefined,
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${prenom || ''} ${nom || ''}`.trim() || 'employé'}
        style={{
          width: size,
          height: size,
          borderColor,
          borderWidth,
          borderStyle: 'solid',
          boxShadow: style.boxShadow,
        }}
        className={`rounded-full object-cover shrink-0 ${className}`}
        onError={(e) => {
          // Fallback : masquer l'image cassée → laissera apparaître le fallback
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 select-none ${className}`}
      aria-label={`${prenom || ''} ${nom || ''}`.trim() || 'employé'}
    >
      {initiales(prenom, nom)}
    </div>
  );
};

export default EmployeeAvatar;
