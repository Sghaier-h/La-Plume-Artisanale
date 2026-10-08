import React from 'react';
import type { TrancheAge } from '../../services/ventesComplementsApi';

interface Props {
  tranche: TrancheAge;
  jours?: number;
  size?: 'sm' | 'md';
}

const MAP: Record<TrancheAge, { label: string; bg: string; text: string; border: string }> = {
  '0-30': {
    label: '0-30 j',
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    border: 'border-[#7A8C6A]',
  },
  '30-60': {
    label: '30-60 j',
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    border: 'border-[#C89B3C]',
  },
  '60-90': {
    label: '60-90 j',
    bg: 'bg-[#FDF2ED]',
    text: 'text-[#C8663D]',
    border: 'border-[#C8663D]',
  },
  '90+': {
    label: '> 90 j',
    bg: 'bg-[#FBEBE4]',
    text: 'text-[#B84A2F]',
    border: 'border-[#B84A2F]',
  },
};

const AgeCreanceBadge: React.FC<Props> = ({ tranche, jours, size = 'md' }) => {
  const cfg = MAP[tranche] || MAP['0-30'];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
      {jours != null && jours > 0 && <span className="opacity-70">({jours}j)</span>}
    </span>
  );
};

export default AgeCreanceBadge;
