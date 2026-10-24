import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { StatutBordereau } from '../../services/primesRendementApi';

/**
 * BordereauStatutBadge — pastille visuelle du statut d'un bordereau.
 *
 * Couleurs charte §11bis.7bis :
 *  - à_verser → warning (orange)
 *  - versé    → sage (vert)
 *  - annulé   → neutral (gris)
 */

interface Props {
  statut: StatutBordereau;
  size?: 'sm' | 'md';
}

const STATUT_MAP: Record<
  StatutBordereau,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  a_verser: {
    label: 'À verser',
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    border: 'border-[#D6A756]',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  verse: {
    label: 'Versé',
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    border: 'border-[#4A6C5B]',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  annule: {
    label: 'Annulé',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const BordereauStatutBadge: React.FC<Props> = ({ statut, size = 'md' }) => {
  const cfg = STATUT_MAP[statut] || STATUT_MAP.a_verser;
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

export default BordereauStatutBadge;
