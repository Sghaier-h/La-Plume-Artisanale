import React from 'react';
import { MessageSquare, Mail, AlertTriangle, Scale, CheckCircle2 } from 'lucide-react';
import type { NiveauRelance } from '../../services/ventesComplementsApi';

interface Props {
  niveau: NiveauRelance;
  size?: 'sm' | 'md';
}

const MAP: Record<NiveauRelance, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  0: {
    label: 'À jour',
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    border: 'border-[#7A8C6A]',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  1: {
    label: 'Rappel amiable',
    bg: 'bg-[#EDF0F5]',
    text: 'text-[#3B4E68]',
    border: 'border-[#4A5D75]',
    icon: <Mail className="w-3.5 h-3.5" />,
  },
  2: {
    label: '1ère relance',
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    border: 'border-[#C89B3C]',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
  },
  3: {
    label: 'Mise en demeure',
    bg: 'bg-[#FDF2ED]',
    text: 'text-[#C8663D]',
    border: 'border-[#C8663D]',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  4: {
    label: 'Précontentieux',
    bg: 'bg-[#FBEBE4]',
    text: 'text-[#B84A2F]',
    border: 'border-[#B84A2F]',
    icon: <Scale className="w-3.5 h-3.5" />,
  },
};

const NiveauRelanceBadge: React.FC<Props> = ({ niveau, size = 'md' }) => {
  const cfg = MAP[niveau] || MAP[0];
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

export default NiveauRelanceBadge;
