import React from 'react';
import { CalendarClock, AlertTriangle } from 'lucide-react';

interface Props {
  titre: string;
  soustitre?: string;
  echeance: string; // ISO date
  seuilAlerteJours?: number; // 30 par défaut
  montant?: number;
  devise?: string;
  variant?: 'default' | 'compact';
}

const daysBetween = (iso: string): number => {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return NaN;
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
};

const EcheanceCard: React.FC<Props> = ({
  titre,
  soustitre,
  echeance,
  seuilAlerteJours = 30,
  montant,
  devise = 'DT',
  variant = 'default',
}) => {
  const jours = daysBetween(echeance);
  const expire = jours < 0;
  const proche = !expire && jours <= seuilAlerteJours;

  const tone = expire
    ? 'bg-red-50 border-red-300'
    : proche
    ? 'bg-[#FBF3E0] border-[#C89B3C]/50'
    : 'bg-[#EEF4F0] border-[#7A8C6A]/30';
  const iconTone = expire
    ? 'bg-red-600 text-white'
    : proche
    ? 'bg-[#C89B3C] text-white'
    : 'bg-[#7A8C6A] text-white';
  const labelTone = expire
    ? 'text-red-700'
    : proche
    ? 'text-[#8A6412]'
    : 'text-[#4A6C5B]';

  const dateFmt = new Date(echeance).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const joursLabel = Number.isNaN(jours)
    ? '—'
    : expire
    ? `Échu depuis ${-jours} j`
    : jours === 0
    ? "Aujourd'hui"
    : jours === 1
    ? 'Demain'
    : `Dans ${jours} j`;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${tone}`}>
        <CalendarClock className={`w-4 h-4 ${labelTone}`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-800 truncate">{titre}</div>
          <div className={`text-[10px] ${labelTone}`}>
            {dateFmt} · {joursLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <div className={`${iconTone} rounded-lg p-2 shrink-0`}>
          <CalendarClock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{titre}</div>
          {soustitre && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{soustitre}</div>
          )}
          <div className={`text-xs font-semibold mt-2 ${labelTone} flex items-center gap-1`}>
            {expire && <AlertTriangle className="w-3.5 h-3.5" />}
            {dateFmt} · {joursLabel}
          </div>
          {montant != null && (
            <div className="text-sm font-bold text-gray-800 mt-1">
              {montant.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {devise}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcheanceCard;
