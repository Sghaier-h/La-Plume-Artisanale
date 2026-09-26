import React from 'react';

/**
 * HoraireIdealBar — barre horaire idéale 100 %.
 *
 * SVG plein-largeur qui affiche, heure par heure :
 *   • la cible (100 % production idéale cumulée) — trait sage à 100 %
 *   • la production réelle cumulée — barres terracotta (ou sage si ≥ 100 %)
 *
 * §11bis.7bis · écrans TV atelier.
 */

interface Point {
  heure: string;
  objectif: number;
  realise: number;
}

interface Props {
  points: Point[];
  height?: number;                      // px — défaut 220
  className?: string;
  title?: string;
}

const COLORS = {
  cible: '#4A6C5B',
  cibleFill: 'rgba(74,108,91,0.10)',
  real: '#C8663D',
  realOk: '#4A6C5B',
  axis: 'rgba(253,251,243,0.35)',
  text: '#FDFBF3',
  grid: 'rgba(253,251,243,0.08)',
};

const HoraireIdealBar: React.FC<Props> = ({
  points,
  height = 220,
  className = '',
  title = 'Barre horaire — objectif idéal 100 %',
}) => {
  const pts = points.length ? points : [];
  const width = 1000;                   // viewBox — s'étire en plein écran
  const padL = 42;
  const padR = 12;
  const padT = 18;
  const padB = 26;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const maxVal = Math.max(
    100,
    ...pts.map((p) => Math.max(p.objectif, p.realise)),
  );

  const barW = pts.length > 0 ? (chartW / pts.length) * 0.68 : 0;
  const gap = pts.length > 0 ? (chartW / pts.length) * 0.32 : 0;

  const yFor = (v: number) => padT + chartH - (v / maxVal) * chartH;
  const xFor = (i: number) => padL + i * (barW + gap) + gap / 2;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2 px-1">
        <span
          className="text-xs uppercase tracking-widest opacity-80"
          style={{ color: COLORS.text }}
        >
          {title}
        </span>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: COLORS.text }}>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: COLORS.real }}
            />
            Réel
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-0.5"
              style={{ backgroundColor: COLORS.cible }}
            />
            Objectif idéal
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height, display: 'block' }}
      >
        {/* Grid horizontale (25/50/75/100 % de maxVal) */}
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <line
            key={r}
            x1={padL}
            x2={width - padR}
            y1={yFor(r * maxVal)}
            y2={yFor(r * maxVal)}
            stroke={COLORS.grid}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Ligne objectif cumulée + zone sous la courbe */}
        {pts.length > 1 && (
          <>
            <polygon
              points={[
                `${xFor(0) + barW / 2},${yFor(0)}`,
                ...pts.map(
                  (p, i) => `${xFor(i) + barW / 2},${yFor(p.objectif)}`,
                ),
                `${xFor(pts.length - 1) + barW / 2},${yFor(0)}`,
              ].join(' ')}
              fill={COLORS.cibleFill}
            />
            <polyline
              points={pts
                .map((p, i) => `${xFor(i) + barW / 2},${yFor(p.objectif)}`)
                .join(' ')}
              fill="none"
              stroke={COLORS.cible}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Barres réelles */}
        {pts.map((p, i) => {
          const y = yFor(p.realise);
          const h = padT + chartH - y;
          const ok = p.realise >= p.objectif * 0.98;
          return (
            <g key={p.heure}>
              <rect
                x={xFor(i)}
                y={y}
                width={barW}
                height={Math.max(0, h)}
                rx={3}
                fill={ok ? COLORS.realOk : COLORS.real}
                opacity={0.92}
              />
              <text
                x={xFor(i) + barW / 2}
                y={height - 6}
                fill={COLORS.text}
                fontSize={11}
                textAnchor="middle"
                opacity={0.75}
                style={{
                  fontFamily:
                    '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                }}
              >
                {p.heure}
              </text>
            </g>
          );
        })}

        {/* Axe Y — labels % */}
        {[0, 0.5, 1].map((r) => (
          <text
            key={r}
            x={padL - 6}
            y={yFor(r * maxVal) + 3}
            fill={COLORS.text}
            fontSize={10}
            textAnchor="end"
            opacity={0.55}
            style={{ fontFamily: 'monospace' }}
          >
            {Math.round(r * maxVal)}
          </text>
        ))}

        {/* Axe X */}
        <line
          x1={padL}
          x2={width - padR}
          y1={padT + chartH}
          y2={padT + chartH}
          stroke={COLORS.axis}
          strokeWidth={1}
        />
      </svg>
    </div>
  );
};

export default HoraireIdealBar;
