import React from 'react';
import { Trophy, Zap } from 'lucide-react';
import EmployeeAvatar from './EmployeeAvatar';
import type { TvSnapshot } from '../../services/primesRendementApi';

/**
 * TopEmployesTv — podium des 5 meilleurs employés de la semaine.
 *
 * §11bis.7bis · affiché sur les écrans TV atelier avec :
 *   photo, nom, machine/poste, quantité sem, rendement, prime prévue DT.
 */

interface Props {
  topEmployes: TvSnapshot['top_employes'];
  atelier?: 'tissage' | 'finition' | 'preparation';
  maxCount?: number;                    // 5 par défaut
  className?: string;
}

const MEDAL: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'linear-gradient(135deg,#FFD764 0%,#D4A03A 100%)', text: '#3B2A00', label: '1' },
  1: { bg: 'linear-gradient(135deg,#E7E7E7 0%,#B4B4B4 100%)', text: '#2A2A2A', label: '2' },
  2: { bg: 'linear-gradient(135deg,#DDA47A 0%,#A2683F 100%)', text: '#3A200A', label: '3' },
};

const TopEmployesTv: React.FC<Props> = ({
  topEmployes,
  atelier = 'tissage',
  maxCount = 5,
  className = '',
}) => {
  const list = (topEmployes || []).slice(0, maxCount);
  const posteLabel = atelier === 'tissage' ? 'Machine' : 'Poste';

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
        <Trophy className="w-6 h-6" style={{ color: '#D6A756' }} />
        <span
          className="uppercase font-bold tracking-widest"
          style={{ color: '#FDFBF3', fontSize: 20 }}
        >
          Top {maxCount} · Semaine
        </span>
      </div>

      <div className="space-y-3">
        {list.map((emp, idx) => {
          const medal = MEDAL[idx];
          return (
            <div
              key={emp.id_employe}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{
                background:
                  idx === 0
                    ? 'linear-gradient(90deg, rgba(214,167,86,0.20) 0%, rgba(214,167,86,0.05) 100%)'
                    : 'rgba(255,255,255,0.04)',
                border: idx === 0 ? '1px solid rgba(214,167,86,0.35)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                style={
                  medal
                    ? { background: medal.bg, color: medal.text }
                    : {
                        background: 'rgba(253,251,243,0.10)',
                        color: '#FDFBF3',
                        border: '1px solid rgba(253,251,243,0.2)',
                      }
                }
              >
                {medal ? medal.label : idx + 1}
              </div>

              <EmployeeAvatar
                photoUrl={emp.photo_url}
                nom={emp.nom}
                prenom={emp.prenom}
                size={48}
                borderColor="rgba(253,251,243,0.5)"
                showRing
              />

              <div className="flex-1 min-w-0">
                <div
                  className="font-bold text-base leading-tight truncate"
                  style={{ color: '#FDFBF3' }}
                >
                  {emp.prenom} {emp.nom}
                </div>
                <div
                  className="text-xs opacity-70 truncate"
                  style={{ color: '#FDFBF3' }}
                >
                  {posteLabel} : {emp.machine || emp.poste || '—'}
                </div>
              </div>

              <div className="text-right pr-1">
                <div
                  className="text-[11px] uppercase tracking-wider opacity-60"
                  style={{ color: '#FDFBF3' }}
                >
                  Rendement
                </div>
                <div
                  className="font-bold text-lg tabular-nums leading-none"
                  style={{
                    color:
                      emp.rendement_pct >= 100
                        ? '#8FE388'
                        : emp.rendement_pct >= 85
                        ? '#FDFBF3'
                        : '#F5A97F',
                  }}
                >
                  {emp.rendement_pct.toFixed(0)}%
                </div>
              </div>

              <div
                className="text-right shrink-0 pl-3 border-l"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="text-[11px] uppercase tracking-wider opacity-60 flex items-center gap-1 justify-end"
                  style={{ color: '#FDFBF3' }}
                >
                  <Zap className="w-3 h-3" /> Prime
                </div>
                <div
                  className="font-black text-lg tabular-nums leading-none"
                  style={{ color: '#D6A756' }}
                >
                  {emp.prime_prevue_dt.toFixed(1)}
                  <span className="text-xs font-medium opacity-70 ml-0.5">
                    DT
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div
            className="text-center py-10 opacity-50 text-sm uppercase tracking-widest"
            style={{ color: '#FDFBF3' }}
          >
            Aucun classement disponible cette semaine
          </div>
        )}
      </div>
    </div>
  );
};

export default TopEmployesTv;
