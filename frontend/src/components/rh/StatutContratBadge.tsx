import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Calendar } from 'lucide-react';
import type { StatutContrat } from '../../services/rhApi';

interface Props {
  statut: StatutContrat;
  size?: 'sm' | 'md';
}

const MAP: Record<StatutContrat, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  actif: {
    label: 'Actif',
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    border: 'border-[#7A8C6A]',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  en_essai: {
    label: 'En essai',
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    border: 'border-[#C89B3C]',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  a_venir: {
    label: 'À venir',
    bg: 'bg-[#EDF0F5]',
    text: 'text-[#3B4E68]',
    border: 'border-[#4A5D75]',
    icon: <Calendar className="w-3.5 h-3.5" />,
  },
  expire: {
    label: 'Expiré',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  rompu: {
    label: 'Rompu',
    bg: 'bg-[#FBEBE4]',
    text: 'text-[#B84A2F]',
    border: 'border-[#B84A2F]',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  },
};

const StatutContratBadge: React.FC<Props> = ({ statut, size = 'md' }) => {
  const cfg = MAP[statut] || MAP.actif;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${padding} ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

export default StatutContratBadge;
