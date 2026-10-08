import React from 'react';
import { tokens } from './tokens';
import type { PalierPrix } from '../../services/personnalisationApi';

interface Props {
  paliers: PalierPrix[];
  quantiteCourante: number;
  devise?: 'EUR' | 'TND';
}

/**
 * Grille 4 paliers TTC visibles en permanence.
 * Le palier applicable à `quantiteCourante` est surligné (background terracotta).
 */
const PrixDegressif: React.FC<Props> = ({
  paliers,
  quantiteCourante,
  devise = 'EUR',
}) => {
  const symbole = devise === 'EUR' ? '€' : 'DT';

  // Palier applicable = le plus grand `quantite_min` <= quantiteCourante.
  const paliersTries = [...paliers].sort(
    (a, b) => a.quantite_min - b.quantite_min,
  );
  const applicable = paliersTries.reduce<PalierPrix | null>((acc, p) => {
    return quantiteCourante >= p.quantite_min ? p : acc;
  }, null);

  return (
    <div
      style={{
        padding: 10,
        background: tokens.warningWash,
        border: `1px solid ${tokens.warning}`,
        borderRadius: tokens.radiusSm,
      }}
    >
      <div
        style={{
          fontFamily: tokens.fontMono,
          fontSize: 11,
          color: '#8E6A1F',
          textTransform: 'uppercase',
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        💰 Prix dégressif à l'unité (TTC)
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${paliersTries.length}, 1fr)`,
          gap: 4,
          fontFamily: tokens.fontMono,
          fontSize: 11,
        }}
      >
        {paliersTries.map((p) => {
          const actif =
            applicable?.quantite_min === p.quantite_min && quantiteCourante > 0;
          return (
            <div
              key={p.quantite_min}
              style={{
                textAlign: 'center',
                padding: 4,
                background: actif ? tokens.terracotta : 'white',
                color: actif ? 'white' : tokens.ink,
                borderRadius: 4,
                transition: 'background 120ms',
              }}
            >
              <div
                style={{
                  color: actif ? 'rgba(255,255,255,0.85)' : tokens.inkMuted,
                  fontSize: 9,
                }}
              >
                {p.quantite_min}+{actif ? ' ✓' : ''}
              </div>
              <strong>
                {p.prix_ttc_unite.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {symbole}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrixDegressif;
