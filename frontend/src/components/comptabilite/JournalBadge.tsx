import React from 'react';
import { CodeJournal } from '../../services/comptabiliteApi';

interface JournalBadgeProps {
  code: CodeJournal | string;
  showLabel?: boolean;
}

const JOURNAUX_CONFIG: Record<
  string,
  { bg: string; text: string; libelle: string }
> = {
  VE: { bg: '#7A8C6A', text: '#FFFFFF', libelle: 'Ventes' },
  AC: { bg: '#C8663D', text: '#FFFFFF', libelle: 'Achats' },
  OD: { bg: '#4A5D75', text: '#FFFFFF', libelle: 'Opérations diverses' },
  CA: { bg: '#C89B3C', text: '#FFFFFF', libelle: 'Caisse' },
  BQ1: { bg: '#3B4E68', text: '#FFFFFF', libelle: 'Banque TND' },
  BQ2: { bg: '#5A749E', text: '#FFFFFF', libelle: 'Banque EUR' },
  BA: { bg: '#3B4E68', text: '#FFFFFF', libelle: 'Banque' },
  PA: { bg: '#8A6E4A', text: '#FFFFFF', libelle: 'Paie' },
};

const JournalBadge: React.FC<JournalBadgeProps> = ({ code, showLabel = false }) => {
  const cfg = JOURNAUX_CONFIG[code] || {
    bg: '#9CA3AF',
    text: '#FFFFFF',
    libelle: code,
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
      title={cfg.libelle}
    >
      {code}
      {showLabel && <span className="font-normal opacity-90">· {cfg.libelle}</span>}
    </span>
  );
};

export default JournalBadge;
