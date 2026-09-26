import React from 'react';

interface Props {
  size?: number;
  titre?: string;                        // texte curviligne haut
  soustitre?: string;                    // texte curviligne bas
  centre?: string;                       // texte central (nom / fonction)
  couleur?: string;
}

/**
 * CachetRond — SVG cachet officiel style tampon administratif.
 * Cercle terracotta 80px par défaut avec texte curviligne.
 * Utilisé sur le BulletinPaiePro et sur les avenants de contrat.
 */
const CachetRond: React.FC<Props> = ({
  size = 96,
  titre = 'LA PLUME ARTISANALE',
  soustitre = 'DIRECTION GÉNÉRALE',
  centre = 'Certifié conforme',
  couleur = '#C8663D',
}) => {
  const r = size / 2 - 4;
  const rInner = r - 6;
  const rText = r - 3;
  const idTop = `topPath-${Math.random().toString(36).slice(2, 8)}`;
  const idBot = `botPath-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'inline-block', transform: 'rotate(-6deg)', opacity: 0.85 }}
      aria-hidden
    >
      <defs>
        <path
          id={idTop}
          d={`M ${size / 2 - rText},${size / 2} a ${rText},${rText} 0 1,1 ${rText * 2},0`}
          fill="none"
        />
        <path
          id={idBot}
          d={`M ${size / 2 - rText},${size / 2} a ${rText},${rText} 0 1,0 ${rText * 2},0`}
          fill="none"
        />
      </defs>
      {/* Double cercle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={couleur}
        strokeWidth={2}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={rInner}
        fill="none"
        stroke={couleur}
        strokeWidth={0.8}
      />
      {/* Étoiles séparatrices */}
      <text x={size / 2} y={size / 2 - rInner + 3} fontSize={size / 12} fill={couleur} textAnchor="middle">
        ★
      </text>
      <text x={size / 2} y={size / 2 + rInner + size / 30} fontSize={size / 12} fill={couleur} textAnchor="middle">
        ★
      </text>
      {/* Texte curviligne haut */}
      <text fontFamily="Fraunces, Georgia, serif" fontSize={size / 12} fill={couleur} fontWeight="700" letterSpacing="1">
        <textPath xlinkHref={`#${idTop}`} startOffset="50%" textAnchor="middle">
          {titre}
        </textPath>
      </text>
      {/* Texte curviligne bas */}
      <text fontFamily="Fraunces, Georgia, serif" fontSize={size / 14} fill={couleur} fontWeight="600" letterSpacing="1">
        <textPath xlinkHref={`#${idBot}`} startOffset="50%" textAnchor="middle">
          {soustitre}
        </textPath>
      </text>
      {/* Texte central */}
      <text
        x={size / 2}
        y={size / 2 + 3}
        fontFamily="Fraunces, Georgia, serif"
        fontSize={size / 11}
        fill={couleur}
        fontStyle="italic"
        textAnchor="middle"
      >
        {centre}
      </text>
    </svg>
  );
};

export default CachetRond;
