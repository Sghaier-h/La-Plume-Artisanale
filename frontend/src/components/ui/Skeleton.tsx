/**
 * Skeleton loaders - La Plume Artisanale design system
 * Shimmer gradient animé, palette terracotta/sage/cream
 */
import React from 'react';

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Bloc squelette générique animé.
 * Usage : <Skeleton className="h-4 w-32" />
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{
        background:
          'linear-gradient(90deg, var(--bg-sunken) 0%, var(--bg-canvas) 50%, var(--bg-sunken) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

/**
 * Carte générique (header + lignes).
 */
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`p-5 rounded-lg ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-5/6 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};

/**
 * Rangée de N cartes KPI squelettes (4 par défaut).
 */
export const SkeletonKpiRow: React.FC<{ count?: number }> = ({ count = 4 }) => {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((i) => (
        <div
          key={i}
          className="p-5 rounded-lg"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-2 w-16" />
        </div>
      ))}
    </div>
  );
};

/**
 * Table squelette (N lignes × N colonnes). Rendu dans un conteneur stylé proche de la vraie table.
 */
export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 8,
  cols = 6,
  className = '',
}) => {
  const rowList = Array.from({ length: rows }, (_, i) => i);
  const colList = Array.from({ length: cols }, (_, i) => i);
  return (
    <div
      className={`rounded-lg overflow-hidden ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        className="grid gap-4 px-6 py-3"
        style={{
          background: 'var(--bg-canvas)',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {colList.map((c) => (
          <Skeleton key={c} className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      <div>
        {rowList.map((r) => (
          <div
            key={r}
            className="grid gap-4 px-6 py-4"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              borderTop: r === 0 ? 'none' : '1px solid var(--border-subtle)',
            }}
          >
            {colList.map((c) => (
              <Skeleton
                key={c}
                className="h-4"
                style={{ width: `${60 + ((r * 13 + c * 7) % 40)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Page squelette standard (KPI row + table) pour remplacer les spinners d'écran complet.
 */
export const PageSkeleton: React.FC<{ kpiCount?: number; rows?: number; cols?: number }> = ({
  kpiCount = 4,
  rows = 8,
  cols = 6,
}) => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div style={{ marginBottom: 'var(--s-6)' }}>
            <Skeleton className="h-3 w-32 mb-3" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          {kpiCount > 0 && <SkeletonKpiRow count={kpiCount} />}
          <SkeletonTable rows={rows} cols={cols} />
        </div>
      </div>
    </div>
  );
};

/**
 * Keyframes CSS injectés une fois (idempotent).
 */
if (typeof document !== 'undefined' && !document.getElementById('skeleton-shimmer-keyframes')) {
  const style = document.createElement('style');
  style.id = 'skeleton-shimmer-keyframes';
  style.textContent = `
    @keyframes skeleton-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;
