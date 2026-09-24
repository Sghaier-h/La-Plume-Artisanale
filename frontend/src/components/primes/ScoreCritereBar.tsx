import React from 'react';

/**
 * ScoreCritereBar — barre horizontale 0..100 pour visualiser un critère
 * de la formule prime rendement (§11bis.7bis).
 *
 * Couleurs sémantiques :
 *  - ≥ 85 % → sage (vert)
 *  - 70–85  → warning (or)
 *  - < 70   → terracotta (rouge orange)
 */

interface ScoreCritereBarProps {
  label: string;
  score: number;                  // 0..100 (ou 0..10 pour discipline, normaliser à l'appel)
  poids?: number;                 // 0..1 — ex. 0.30
  maxScore?: number;              // défaut 100
  seuilExclusion?: number;        // optionnel — marque un trait rouge
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreCritereBar: React.FC<ScoreCritereBarProps> = ({
  label,
  score,
  poids,
  maxScore = 100,
  seuilExclusion,
  showValue = true,
  size = 'md',
}) => {
  const clamped = Math.max(0, Math.min(maxScore, score));
  const pct = maxScore > 0 ? (clamped / maxScore) * 100 : 0;

  const color =
    pct >= 85 ? '#4A6C5B' : pct >= 70 ? '#D6A756' : '#C8663D';
  const bgColor =
    pct >= 85 ? '#EEF4F0' : pct >= 70 ? '#FBF3E0' : '#FDF2ED';

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-4' : 'h-2.5';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">{label}</span>
          {poids !== undefined && (
            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {(poids * 100).toFixed(0)}%
            </span>
          )}
        </div>
        {showValue && (
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color }}
          >
            {clamped.toFixed(1)}
            <span className="text-gray-400 font-normal">
              /{maxScore}
            </span>
          </span>
        )}
      </div>
      <div
        className={`relative w-full ${heightClass} rounded-full overflow-hidden`}
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
        {seuilExclusion !== undefined && (
          <div
            className="absolute top-0 bottom-0 border-l-2 border-red-500"
            style={{ left: `${(seuilExclusion / maxScore) * 100}%` }}
            title={`Seuil exclusion : ${seuilExclusion}`}
          />
        )}
      </div>
    </div>
  );
};

export default ScoreCritereBar;
