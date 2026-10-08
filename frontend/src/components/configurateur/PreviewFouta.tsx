import React from 'react';
import { tokens } from './tokens';
import type { CouleurConfig, ZoneImpression } from '../../services/personnalisationApi';

interface Props {
  couleur?: CouleurConfig;
  zone: ZoneImpression;
  /** URL du logo client uploadé (SVG/PNG). Sinon fallback texte. */
  logoUrl?: string;
  texteBroderie?: string;
  couleursFils?: string[];
  onPartager?: () => void;
  onPleinEcran?: () => void;
}

/** Position (%) du logo sur la fouta selon la zone. */
const zonePositions: Record<ZoneImpression, { cx: number; cy: number }> = {
  coin_haut_gauche: { cx: 40, cy: 60 },
  coin_haut_droit:  { cx: 160, cy: 60 },
  centre:           { cx: 100, cy: 160 },
  coin_bas_gauche:  { cx: 40, cy: 260 },
  coin_bas_droit:   { cx: 160, cy: 260 },
  face_avant:       { cx: 100, cy: 160 },
  face_avant_centre:{ cx: 100, cy: 160 },
};

/**
 * SVG fouta haute fidélité avec rayures, frange, logo appliqué + zone
 * d'impression pointillée. Colonne de miniatures de vues alternatives à côté
 * (gérée par le parent).
 */
const PreviewFouta: React.FC<Props> = ({
  couleur,
  zone,
  logoUrl,
  texteBroderie,
  couleursFils,
  onPartager,
  onPleinEcran,
}) => {
  const fond = couleur?.hex_fond || '#FBF7EE';
  const rayure = couleur?.hex_rayure || '#3B4E68';
  const filPrincipal = couleursFils?.[0] || tokens.sage;
  const filAccent = couleursFils?.[1] || tokens.terracotta;
  const pos = zonePositions[zone];

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #FDFBF3 0%, #F0E8D0 100%)',
        border: `1px solid ${tokens.border}`,
        borderRadius: tokens.radiusMd,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 420,
      }}
    >
      {onPleinEcran && (
        <button
          type="button"
          onClick={onPleinEcran}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            padding: '6px 12px',
            background: 'rgba(28,25,23,0.85)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          ⛶ Plein écran
        </button>
      )}

      <svg
        viewBox="0 0 200 320"
        style={{
          width: '60%',
          maxWidth: 280,
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))',
        }}
        aria-label="Aperçu fouta personnalisée"
      >
        {/* Corps */}
        <rect
          x="8"
          y="8"
          width="184"
          height="304"
          fill={fond}
          stroke="#8B7F72"
          strokeWidth="0.8"
        />
        {/* Rayures haut */}
        <rect x="8" y="20" width="184" height="2" fill={rayure} opacity="0.7" />
        <rect x="8" y="26" width="184" height="1.5" fill={tokens.terracotta} opacity="0.6" />
        <rect x="8" y="30" width="184" height="1" fill={rayure} opacity="0.5" />
        {/* Rayures bas */}
        <rect x="8" y="284" width="184" height="2" fill={rayure} opacity="0.7" />
        <rect x="8" y="290" width="184" height="1.5" fill={tokens.terracotta} opacity="0.6" />
        <rect x="8" y="294" width="184" height="1" fill={rayure} opacity="0.5" />

        {/* Franges — 30 brins haut/bas */}
        <g stroke="#8B7F72" strokeWidth="0.4" opacity="0.7">
          {Array.from({ length: 30 }).map((_, i) => {
            const x = 12 + i * 6;
            const yTop = i % 2 === 0 ? 1 : 0.5;
            const yBot = i % 2 === 0 ? 319 : 319.5;
            return (
              <React.Fragment key={i}>
                <line x1={x} y1={8} x2={x} y2={yTop} />
                <line x1={x} y1={312} x2={x} y2={yBot} />
              </React.Fragment>
            );
          })}
        </g>

        {/* Zone d'impression pointillée autour du logo */}
        <rect
          x={pos.cx - 45}
          y={pos.cy - 40}
          width="90"
          height="80"
          fill="none"
          stroke="#8B7F72"
          strokeWidth="0.4"
          strokeDasharray="2 2"
          opacity="0.5"
        />

        {/* Logo (image ou fallback texte / motif générique) */}
        <g
          transform={`translate(${pos.cx}, ${pos.cy})`}
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          {logoUrl ? (
            <image
              x={-30}
              y={-20}
              width="60"
              height="40"
              href={logoUrl}
              preserveAspectRatio="xMidYMid meet"
            />
          ) : (
            <>
              <ellipse cx={0} cy={0} rx={30} ry={20} fill={filPrincipal} opacity="0.85" />
              <text
                x={-2}
                y={5}
                fontFamily="Fraunces, serif"
                fontSize="16"
                fill="#FBF7EE"
                textAnchor="middle"
                fontStyle="italic"
                fontWeight={500}
              >
                {texteBroderie || 'logo'}
              </text>
              <circle cx={24} cy={-8} r={7} fill={filAccent} />
            </>
          )}
        </g>
      </svg>

      {/* Barre outils bas */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          style={outilStyle}
          aria-label="Zoom avant"
        >
          🔍 +
        </button>
        <button type="button" style={outilStyle} aria-label="Zoom arrière">
          🔍 −
        </button>
        <button type="button" style={outilStyle} aria-label="Réinitialiser la vue">
          ↺ Reset
        </button>
        {onPartager && (
          <button
            type="button"
            onClick={onPartager}
            style={{
              ...outilStyle,
              background: tokens.terracotta,
              color: 'white',
              border: 'none',
            }}
          >
            📤 Partager mon design
          </button>
        )}
      </div>
    </div>
  );
};

const outilStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: 'white',
  border: `1px solid ${tokens.border}`,
  borderRadius: 20,
  fontSize: 11,
  cursor: 'pointer',
  color: tokens.ink,
};

export default PreviewFouta;
