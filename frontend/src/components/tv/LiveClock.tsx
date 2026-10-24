import React, { useEffect, useState } from 'react';

/**
 * LiveClock — horloge géante mise à jour toutes les 1 s.
 * Utilisée dans le coin haut-droit des écrans TV muraux (§11bis.7bis).
 *
 * Police : JetBrains Mono via CSS (fallback monospace).
 */

interface Props {
  size?: 'md' | 'lg' | 'xl' | 'xxl';
  showSeconds?: boolean;
  showDate?: boolean;
  className?: string;
  color?: string;
}

const FONT_SIZES: Record<string, { time: string; date: string }> = {
  md: { time: '48px', date: '14px' },
  lg: { time: '64px', date: '16px' },
  xl: { time: '80px', date: '18px' },
  xxl: { time: '96px', date: '20px' },
};

const LiveClock: React.FC<Props> = ({
  size = 'xl',
  showSeconds = true,
  showDate = true,
  className = '',
  color = '#FDFBF3',
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const date = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const fs = FONT_SIZES[size];

  return (
    <div
      className={`flex flex-col items-end leading-none ${className}`}
      style={{ color }}
    >
      <div
        className="font-bold tabular-nums"
        style={{
          fontSize: fs.time,
          fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
          letterSpacing: '-0.02em',
          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        {hh}:{mm}
        {showSeconds && (
          <span style={{ opacity: 0.55, fontSize: '0.55em', marginLeft: 6 }}>
            :{ss}
          </span>
        )}
      </div>
      {showDate && (
        <div
          className="mt-1 uppercase tracking-widest opacity-80"
          style={{ fontSize: fs.date }}
        >
          {date}
        </div>
      )}
    </div>
  );
};

export default LiveClock;
