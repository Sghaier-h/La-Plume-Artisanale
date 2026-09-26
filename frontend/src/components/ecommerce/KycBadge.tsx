import React from 'react';
import { Clock, CheckCircle2, XCircle, Pause } from 'lucide-react';
import type { KycStatut } from '../../services/ecommerceApi';

interface KycBadgeProps {
  statut: KycStatut;
  size?: 'sm' | 'md';
}

const KYC_STYLES: Record<
  KycStatut,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  en_attente: {
    label: 'En attente',
    classes: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  valide: {
    label: 'Validé',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  refuse: {
    label: 'Refusé',
    classes: 'bg-red-50 text-red-700 border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  suspendu: {
    label: 'Suspendu',
    classes: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: <Pause className="w-3.5 h-3.5" />,
  },
};

const KycBadge: React.FC<KycBadgeProps> = ({ statut, size = 'md' }) => {
  const meta = KYC_STYLES[statut] || KYC_STYLES.en_attente;
  const paddingClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${paddingClasses} ${meta.classes}`}
    >
      {meta.icon}
      KYC · {meta.label}
    </span>
  );
};

export default KycBadge;
