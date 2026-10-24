import React from 'react';
import {
  Users,
  Wallet,
  UserX,
  Calendar,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type {
  Cagnotte,
  StatutCagnotte,
} from '../../services/primesRendementApi';

/**
 * CagnotteCard — carte cagnotte hebdomadaire d'un atelier.
 * Affiche le montant, les bénéficiaires, le statut et les actions.
 */

interface Props {
  cagnotte: Cagnotte;
  onCalculer?: (c: Cagnotte) => void;
  onValider?: (c: Cagnotte) => void;
  onMarquerPayee?: (c: Cagnotte) => void;
  onVoirDetails?: (c: Cagnotte) => void;
}

const STATUT_STYLE: Record<
  StatutCagnotte,
  { bg: string; text: string; label: string; icon: React.ReactNode }
> = {
  brouillon: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    label: 'Brouillon',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  calculee: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Calculée',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  validee: {
    bg: 'bg-[#FBF3E0]',
    text: 'text-[#8A6412]',
    label: 'Validée',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  versee: {
    bg: 'bg-[#EEF4F0]',
    text: 'text-[#4A6C5B]',
    label: 'Versée',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  annulee: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Annulée',
    icon: <UserX className="w-3.5 h-3.5" />,
  },
};

const ATELIER_LABEL: Record<string, { label: string; color: string }> = {
  tissage: { label: 'Tissage', color: '#3B4E68' },
  finition: { label: 'Finition', color: '#C8663D' },
  preparation: { label: 'Préparation', color: '#4A6C5B' },
  coupe: { label: 'Coupe', color: '#D6A756' },
  ourdissage: { label: 'Ourdissage', color: '#7B4A3D' },
  magasin: { label: 'Magasin', color: '#546E7A' },
};

const CagnotteCard: React.FC<Props> = ({
  cagnotte,
  onCalculer,
  onValider,
  onMarquerPayee,
  onVoirDetails,
}) => {
  const st = STATUT_STYLE[cagnotte.statut];
  const at = ATELIER_LABEL[cagnotte.atelier] || {
    label: cagnotte.atelier,
    color: '#3B4E68',
  };
  const pctDistribue =
    cagnotte.montant_total_dt > 0
      ? (cagnotte.montant_distribue_dt / cagnotte.montant_total_dt) * 100
      : 0;

  const fmtDT = (n: number) =>
    n.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md text-white"
              style={{ backgroundColor: at.color }}
            >
              {at.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}
            >
              {st.icon}
              {st.label}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Semaine {cagnotte.numero_semaine} · {cagnotte.annee}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {new Date(cagnotte.date_debut_semaine).toLocaleDateString('fr-FR')}
            {' → '}
            {new Date(cagnotte.date_fin_semaine).toLocaleDateString('fr-FR')}
          </div>
        </div>
        <Wallet className="w-6 h-6 text-[#C8663D] shrink-0" />
      </div>

      <div className="mt-3 mb-4">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
          Cagnotte totale
        </div>
        <div className="text-3xl font-bold text-[#3B4E68]">
          {fmtDT(cagnotte.montant_total_dt)}
          <span className="text-base text-gray-500 font-medium ml-1">DT</span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span>Distribué</span>
          <span className="font-semibold text-gray-700 tabular-nums">
            {fmtDT(cagnotte.montant_distribue_dt)} DT ({pctDistribue.toFixed(0)}%)
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#4A6C5B] rounded-full transition-all"
            style={{ width: `${Math.min(100, pctDistribue)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center bg-[#EEF4F0] rounded-lg p-2">
          <Users className="w-4 h-4 mx-auto text-[#4A6C5B] mb-0.5" />
          <div className="text-xs font-bold text-[#4A6C5B] tabular-nums">
            {cagnotte.nb_beneficiaires}
          </div>
          <div className="text-[9px] text-gray-500">bénéf.</div>
        </div>
        <div className="text-center bg-[#FDF2ED] rounded-lg p-2">
          <UserX className="w-4 h-4 mx-auto text-[#C8663D] mb-0.5" />
          <div className="text-xs font-bold text-[#C8663D] tabular-nums">
            {cagnotte.nb_exclus}
          </div>
          <div className="text-[9px] text-gray-500">exclus</div>
        </div>
        <div className="text-center bg-gray-100 rounded-lg p-2">
          <ArrowRight className="w-4 h-4 mx-auto text-gray-600 mb-0.5" />
          <div className="text-xs font-bold text-gray-700 tabular-nums">
            {fmtDT(cagnotte.reste_report_dt)}
          </div>
          <div className="text-[9px] text-gray-500">report</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
        {(cagnotte.statut === 'brouillon' || cagnotte.statut === 'calculee') && (
          <button
            onClick={() => onCalculer?.(cagnotte)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#3B4E68] text-white hover:bg-[#2d3d54] transition-colors"
          >
            Calculer scores
          </button>
        )}
        {cagnotte.statut === 'calculee' && (
          <button
            onClick={() => onValider?.(cagnotte)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#D6A756] text-white hover:bg-[#b98d3d] transition-colors"
          >
            Valider + bordereaux
          </button>
        )}
        {cagnotte.statut === 'validee' && (
          <button
            onClick={() => onMarquerPayee?.(cagnotte)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#4A6C5B] text-white hover:bg-[#3a5648] transition-colors"
          >
            Marquer payée
          </button>
        )}
        {onVoirDetails && (
          <button
            onClick={() => onVoirDetails(cagnotte)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Détails
          </button>
        )}
      </div>
    </div>
  );
};

export default CagnotteCard;
