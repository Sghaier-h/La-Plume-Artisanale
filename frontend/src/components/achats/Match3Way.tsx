import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Match3wayStatut } from '../../services/achatsApi';

interface Props {
  statut: Match3wayStatut;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const CFG: Record<
  Match3wayStatut,
  { icon: React.ReactNode; text: string; wrap: string; label: string }
> = {
  conforme: {
    icon: <CheckCircle2 className="w-full h-full" strokeWidth={2.4} />,
    text: 'text-emerald-600',
    wrap: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    label: 'Conforme',
  },
  ecart: {
    icon: <AlertTriangle className="w-full h-full" strokeWidth={2.4} />,
    text: 'text-[#8A6412]',
    wrap: 'bg-[#FBF3E0] text-[#8A6412] border-[#C89B3C]/50',
    label: 'Écart',
  },
  manquant: {
    icon: <XCircle className="w-full h-full" strokeWidth={2.4} />,
    text: 'text-red-600',
    wrap: 'bg-red-50 text-red-700 border-red-300',
    label: 'Manquant',
  },
};

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const Match3Way: React.FC<Props> = ({ statut, size = 'md', showLabel = false }) => {
  const cfg = CFG[statut];
  if (showLabel) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 border rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.wrap}`}
        title={cfg.label}
      >
        <span className={`${SIZE_MAP[size]} inline-block`}>{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  }
  return (
    <span
      className={`inline-block ${SIZE_MAP[size]} ${cfg.text}`}
      title={cfg.label}
      aria-label={cfg.label}
    >
      {cfg.icon}
    </span>
  );
};

export default Match3Way;
