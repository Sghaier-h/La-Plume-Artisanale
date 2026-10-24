import React from 'react';

interface CampagnePerfChartProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  label?: string;
  strokeWidth?: number;
  showArea?: boolean;
}

/**
 * Mini sparkline SVG — pas de dépendance externe.
 * Utilisé dans les cartes campagne pour visualiser l'évolution
 * quotidienne des KPI (impressions, dépense, ROAS…).
 */
const CampagnePerfChart: React.FC<CampagnePerfChartProps> = ({
  data,
  color = '#C8663D',
  height = 40,
  width = 120,
  label,
  strokeWidth = 1.6,
  showArea = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded"
        style={{ width, height }}
      >
        —
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const pointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath =
    `M0,${height} L${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} ` +
    points
      .slice(1)
      .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ') +
    ` L${width},${height} Z`;

  return (
    <div className="inline-flex flex-col">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {showArea && (
          <path
            d={areaPath}
            fill={color}
            fillOpacity={0.12}
            stroke="none"
          />
        )}
        <polyline
          points={pointsStr}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color}
        />
      </svg>
      {label && (
        <div className="text-[10px] text-gray-500 mt-0.5 text-right">{label}</div>
      )}
    </div>
  );
};

export default CampagnePerfChart;
