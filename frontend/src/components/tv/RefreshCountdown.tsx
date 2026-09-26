import React, { useEffect, useState } from 'react';
import { Radio, RefreshCw } from 'lucide-react';

/**
 * RefreshCountdown — indicateur "LIVE · MAJ dans XXs".
 * Décompte 1 s ↓, redémarré par la prop `intervalSec` à chaque refresh.
 *
 * Utilisé en bas des écrans TV muraux atelier (§11bis.7bis).
 */

interface Props {
  intervalSec: number;                  // 30 par défaut côté TV
  lastRefreshAt: number | null;         // Date.now() du dernier refresh
  isFetching?: boolean;
  hasError?: boolean;
  className?: string;
  onClickRefresh?: () => void;
}

const RefreshCountdown: React.FC<Props> = ({
  intervalSec,
  lastRefreshAt,
  isFetching = false,
  hasError = false,
  className = '',
  onClickRefresh,
}) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const secondsSince = lastRefreshAt
    ? Math.floor((Date.now() - lastRefreshAt) / 1000)
    : 0;
  const remaining = Math.max(0, intervalSec - secondsSince);

  const dotColor = hasError ? '#C8663D' : '#4ADE80';
  const label = hasError
    ? 'ERREUR CONNEXION'
    : isFetching
    ? 'MAJ EN COURS...'
    : `LIVE · MAJ dans ${remaining}s`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ${className}`}
      style={{
        background: 'rgba(0,0,0,0.35)',
        color: '#FDFBF3',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
      title="Rafraîchissement automatique du snapshot atelier"
      // Ce tick force la mise à jour de secondsSince — utile pour le linter :
      data-tick={tick}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          backgroundColor: dotColor,
          boxShadow: `0 0 8px ${dotColor}`,
          animation: hasError ? 'none' : 'tv-pulse 1.6s infinite',
        }}
      />
      <Radio className="w-3.5 h-3.5 opacity-80" />
      <span>{label}</span>
      {onClickRefresh && (
        <button
          type="button"
          onClick={onClickRefresh}
          className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Rafraîchir maintenant"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
          />
        </button>
      )}
      <style>{`
        @keyframes tv-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.55; transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
};

export default RefreshCountdown;
