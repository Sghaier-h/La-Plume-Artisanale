import React from 'react';

/**
 * MontantCell — formatage NUMERIC(14,3) DT avec séparateur, alignement droit,
 * couleur rouge si négatif. Utilisé partout dans les tables comptables.
 */
interface MontantCellProps {
  value?: number | string | null;
  devise?: string;
  decimales?: number;
  bold?: boolean;
  showZero?: boolean;
  colorNegative?: boolean;
  className?: string;
  suffix?: string;
}

const MontantCell: React.FC<MontantCellProps> = ({
  value,
  devise = 'DT',
  decimales = 3,
  bold = false,
  showZero = true,
  colorNegative = true,
  className = '',
  suffix,
}) => {
  const num = value == null || value === '' ? NaN : Number(value);
  if (Number.isNaN(num) || (num === 0 && !showZero)) {
    return <span className={`text-gray-300 ${className}`}>—</span>;
  }
  const isNeg = num < 0;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

  const colorClass = colorNegative
    ? isNeg
      ? 'text-red-600'
      : num > 0
      ? 'text-gray-900'
      : 'text-gray-500'
    : 'text-gray-900';

  return (
    <span
      className={`font-mono tabular-nums text-right whitespace-nowrap ${
        bold ? 'font-semibold' : ''
      } ${colorClass} ${className}`}
      style={{ fontFamily: 'var(--font-mono, JetBrains Mono, monospace)' }}
    >
      {isNeg ? '−' : ''}
      {formatted}
      {devise && (
        <span className="ml-1 text-[10px] font-normal text-gray-500 uppercase">
          {devise}
        </span>
      )}
      {suffix}
    </span>
  );
};

export default MontantCell;
