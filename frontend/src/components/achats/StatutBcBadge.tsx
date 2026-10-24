import React from 'react';
import { StatutBc } from '../../services/achatsApi';

interface Props {
  statut: StatutBc;
  size?: 'sm' | 'md';
}

const STATUT_MAP: Record<
  StatutBc,
  { label: string; bg: string; text: string; border: string }
> = {
  brouillon: {
    label: 'Brouillon',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  envoye: {
    label: 'Envoyé',
    bg: 'bg-[#EDF0F5]',
    text: 'text-[#4A5D75]',
    border: 'border-[#4A5D75]/30',
  },
  confirme: {
    label: 'Confirmé',
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    border: 'border-[#7A8C6A]/40',
  },
  partiel: {
    label: 'Partiellement reçu',
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    border: 'border-[#C89B3C]/50',
  },
  livre: {
    label: 'Reçu',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
  },
  annule: {
    label: 'Annulé',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
  },
};

const StatutBcBadge: React.FC<Props> = ({ statut, size = 'md' }) => {
  const cfg = STATUT_MAP[statut] || STATUT_MAP.brouillon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${padding} ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
};

export default StatutBcBadge;
