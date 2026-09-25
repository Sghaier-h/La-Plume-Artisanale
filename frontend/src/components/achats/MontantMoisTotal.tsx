import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';

interface Props {
  total: number;
  devise?: string;
  seuilAlerte?: number;
  seuilBloc?: number;
  libelle?: string;
  compteur?: number;
}

const MontantMoisTotal: React.FC<Props> = ({
  total,
  devise = 'DT',
  seuilAlerte = 100,
  seuilBloc = 500,
  libelle = 'Total dépenses ce mois',
  compteur,
}) => {
  const enAlerte = total >= seuilAlerte;
  const enBloc = total >= seuilBloc;

  const tone = enBloc
    ? 'bg-red-50 border-red-200'
    : enAlerte
    ? 'bg-[#FBF3E0] border-[#C89B3C]/40'
    : 'bg-[#EEF4F0] border-[#7A8C6A]/30';
  const iconTone = enBloc
    ? 'bg-red-600 text-white'
    : enAlerte
    ? 'bg-[#C89B3C] text-white'
    : 'bg-[#7A8C6A] text-white';
  const valueTone = enBloc
    ? 'text-red-700'
    : enAlerte
    ? 'text-[#8A6412]'
    : 'text-[#4A6C5B]';

  return (
    <div className={`rounded-xl border p-5 ${tone}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {libelle}
          </div>
          <div className={`mt-2 text-3xl font-bold ${valueTone} flex items-baseline gap-1`}>
            <span>
              {total.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-lg font-medium">{devise}</span>
          </div>
          {compteur != null && (
            <div className="text-xs text-gray-500 mt-1">
              {compteur} ligne{compteur > 1 ? 's' : ''} enregistrée
              {compteur > 1 ? 's' : ''}
            </div>
          )}
          {enBloc && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              Seuil {seuilBloc} {devise} atteint — bloc obligatoire à comptabiliser
            </div>
          )}
          {!enBloc && enAlerte && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[#8A6412]">
              <AlertTriangle className="w-3.5 h-3.5" />
              Seuil {seuilAlerte} {devise}/facture dépassé — surveiller
            </div>
          )}
        </div>
        <div className={`${iconTone} rounded-lg p-2.5 shrink-0`}>
          <Wallet className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default MontantMoisTotal;
