import React from 'react';
import { FileEdit, CheckCircle2, Lock } from 'lucide-react';
import { StatutEcriture as StatutEcritureType } from '../../services/comptabiliteApi';

interface StatutEcritureProps {
  statut: StatutEcritureType;
  size?: 'sm' | 'md';
}

const CONFIG: Record<
  StatutEcritureType,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  brouillon: {
    label: 'Brouillon',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: <FileEdit className="w-3 h-3" />,
  },
  validee: {
    label: 'Validée',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  cloturee: {
    label: 'Verrouillée',
    classes: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <Lock className="w-3 h-3" />,
  },
};

const StatutEcritureBadge: React.FC<StatutEcritureProps> = ({ statut, size = 'sm' }) => {
  const cfg = CONFIG[statut] || CONFIG.brouillon;
  const px = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${px} ${cfg.classes}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

export default StatutEcritureBadge;
