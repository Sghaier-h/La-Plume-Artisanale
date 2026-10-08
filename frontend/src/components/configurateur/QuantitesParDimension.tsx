import React from 'react';
import { tokens } from './tokens';
import type { FormatDimension } from '../../services/personnalisationApi';

interface Props {
  formats: FormatDimension[];
  quantites: Record<string, number>;
  onChange: (code: string, quantite: number) => void;
  moqApplicable: number;
  total: number;
}

/**
 * Grille 2×3 (six formats) — chaque case = un input numérique.
 * Le format actif (qté > 0) prend la coloration sage.
 * Ligne de récap dessous : total dynamique + validation MOQ en vert / rouge.
 */
const QuantitesParDimension: React.FC<Props> = ({
  formats,
  quantites,
  onChange,
  moqApplicable,
  total,
}) => {
  const moqOk = total >= moqApplicable;

  return (
    <div>
      <div
        style={{
          fontFamily: tokens.fontMono,
          fontSize: 11,
          color: tokens.inkMuted,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Quantités par dimension ·{' '}
        <span style={{ color: tokens.terracotta }}>(prix dégressif !)</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        {formats.map((f) => {
          const qte = quantites[f.code] ?? 0;
          const actif = qte > 0;
          return (
            <label
              key={f.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: 6,
                background: actif ? tokens.sageWash : tokens.groundSubtle,
                borderRadius: tokens.radiusSm,
                cursor: 'text',
              }}
              title={f.cible_marche}
            >
              <span
                style={{
                  fontFamily: tokens.fontMono,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 8px',
                  background: 'white',
                  borderRadius: 4,
                  minWidth: 52,
                  textAlign: 'center',
                }}
              >
                {f.libelle}
              </span>
              <input
                type="number"
                min={0}
                value={qte}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = raw === '' ? 0 : Math.max(0, parseInt(raw, 10) || 0);
                  onChange(f.code, n);
                }}
                aria-label={`Quantité pour le format ${f.libelle}`}
                style={{
                  flex: 1,
                  padding: 6,
                  borderRadius: tokens.radiusSm,
                  border: `1px solid ${actif ? tokens.sage : tokens.border}`,
                  background: 'white',
                  fontFamily: tokens.fontMono,
                  textAlign: 'center',
                  fontWeight: actif ? 600 : 400,
                  color: actif ? tokens.sage : tokens.ink,
                  minWidth: 0,
                }}
              />
            </label>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 6,
          padding: '6px 10px',
          background: moqOk ? tokens.sageWash : tokens.warningWash,
          borderRadius: tokens.radiusSm,
          fontSize: 11,
          color: moqOk ? tokens.sage : '#8E6A1F',
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        {moqOk ? '✓' : '⚠'} Total : <strong>{total} pièces</strong> ·{' '}
        {moqOk
          ? `MOQ ${moqApplicable} respecté ✓`
          : `MOQ ${moqApplicable} non atteint (manque ${moqApplicable - total})`}
      </div>
    </div>
  );
};

export default QuantitesParDimension;
