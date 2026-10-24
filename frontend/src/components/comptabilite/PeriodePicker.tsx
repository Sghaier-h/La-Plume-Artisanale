import React from 'react';
import { Calendar } from 'lucide-react';

export type Granularite = 'mois' | 'trimestre' | 'annee';

interface PeriodePickerProps {
  granularite: Granularite;
  onGranulariteChange: (g: Granularite) => void;
  valeur: string; // "2026-09" ou "2026-Q3" ou "2026"
  onValeurChange: (v: string) => void;
  minAnnee?: number;
  maxAnnee?: number;
  className?: string;
}

const MOIS_LABELS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sept',
  'Oct',
  'Nov',
  'Déc',
];

/**
 * PeriodePicker — Sélecteur de période mois / trimestre / année pour les
 * écrans comptables. Format retourné :
 *   - mois       : "YYYY-MM"     (ex "2026-09")
 *   - trimestre  : "YYYY-Q[1-4]" (ex "2026-Q3")
 *   - annee      : "YYYY"        (ex "2026")
 */
const PeriodePicker: React.FC<PeriodePickerProps> = ({
  granularite,
  onGranulariteChange,
  valeur,
  onValeurChange,
  minAnnee = 2020,
  maxAnnee = new Date().getFullYear() + 1,
  className = '',
}) => {
  const anneeCourante = parseInt(valeur.slice(0, 4), 10) || new Date().getFullYear();
  const annees: number[] = [];
  for (let a = maxAnnee; a >= minAnnee; a--) annees.push(a);

  const changeAnnee = (a: number) => {
    if (granularite === 'annee') onValeurChange(String(a));
    else if (granularite === 'trimestre') onValeurChange(`${a}-Q${valeur.slice(-1) || '1'}`);
    else onValeurChange(`${a}-${(valeur.slice(5, 7) || '01').padStart(2, '0')}`);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm ${className}`}
    >
      <Calendar className="w-4 h-4 text-[#C8663D]" />
      <select
        value={granularite}
        onChange={(e) => onGranulariteChange(e.target.value as Granularite)}
        className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 py-0 pr-2"
      >
        <option value="mois">Mois</option>
        <option value="trimestre">Trimestre</option>
        <option value="annee">Année</option>
      </select>

      <select
        value={anneeCourante}
        onChange={(e) => changeAnnee(parseInt(e.target.value, 10))}
        className="text-sm bg-transparent border-none font-semibold text-[#3B4E68] focus:outline-none focus:ring-0 py-0"
      >
        {annees.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {granularite === 'mois' && (
        <select
          value={valeur.slice(5, 7) || '01'}
          onChange={(e) => onValeurChange(`${anneeCourante}-${e.target.value}`)}
          className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 py-0"
        >
          {MOIS_LABELS.map((m, i) => (
            <option key={m} value={String(i + 1).padStart(2, '0')}>
              {m}
            </option>
          ))}
        </select>
      )}

      {granularite === 'trimestre' && (
        <select
          value={valeur.slice(-1) || '1'}
          onChange={(e) => onValeurChange(`${anneeCourante}-Q${e.target.value}`)}
          className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 py-0"
        >
          <option value="1">T1</option>
          <option value="2">T2</option>
          <option value="3">T3</option>
          <option value="4">T4</option>
        </select>
      )}
    </div>
  );
};

export default PeriodePicker;
