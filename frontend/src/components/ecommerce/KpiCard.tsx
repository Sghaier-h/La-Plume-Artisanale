import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  evolutionPct?: number | null;
  icon?: React.ReactNode;
  color?: 'terracotta' | 'sage' | 'indigo' | 'warning' | 'neutral';
  subtitle?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; icon: string }> = {
  terracotta: {
    bg: 'bg-[#FDF2ED]',
    text: 'text-[#C8663D]',
    icon: 'bg-[#C8663D] text-white',
  },
  sage: {
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    icon: 'bg-[#4A6C5B] text-white',
  },
  indigo: {
    bg: 'bg-[#EDF0F5]',
    text: 'text-[#3B4E68]',
    icon: 'bg-[#3B4E68] text-white',
  },
  warning: {
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    icon: 'bg-[#D6A756] text-white',
  },
  neutral: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    icon: 'bg-gray-500 text-white',
  },
};

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  suffix,
  evolutionPct,
  icon,
  color = 'indigo',
  subtitle,
}) => {
  const colors = COLOR_MAP[color] || COLOR_MAP.indigo;
  const evolutionIcon =
    evolutionPct == null || evolutionPct === 0 ? (
      <Minus className="w-3.5 h-3.5" />
    ) : evolutionPct > 0 ? (
      <TrendingUp className="w-3.5 h-3.5" />
    ) : (
      <TrendingDown className="w-3.5 h-3.5" />
    );
  const evolutionColor =
    evolutionPct == null || evolutionPct === 0
      ? 'text-gray-500 bg-gray-100'
      : evolutionPct > 0
      ? 'text-emerald-700 bg-emerald-50'
      : 'text-red-700 bg-red-50';

  return (
    <div className={`${colors.bg} rounded-xl p-5 shadow-sm border border-white/60 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate">
            {label}
          </div>
          <div className={`mt-2 text-3xl font-bold ${colors.text} flex items-baseline gap-1`}>
            <span className="truncate">{value}</span>
            {suffix && <span className="text-lg font-medium">{suffix}</span>}
          </div>
          {subtitle && (
            <div className="text-xs text-gray-500 mt-1 truncate">{subtitle}</div>
          )}
        </div>
        {icon && (
          <div className={`${colors.icon} rounded-lg p-2.5 shrink-0`}>{icon}</div>
        )}
      </div>
      {evolutionPct != null && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${evolutionColor}`}
          >
            {evolutionIcon}
            {evolutionPct > 0 ? '+' : ''}
            {evolutionPct.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">vs période préc.</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
