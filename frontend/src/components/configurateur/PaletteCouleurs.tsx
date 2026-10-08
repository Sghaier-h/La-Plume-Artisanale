import React, { useState } from 'react';
import { tokens } from './tokens';
import type { CouleurConfig } from '../../services/personnalisationApi';

interface Props {
  couleurs: CouleurConfig[];
  selectedCode: string;
  onSelect: (code: string) => void;
  /** Combien de pastilles montrer avant le bouton `+N` (par défaut 5). */
  visibleCount?: number;
}

/**
 * Palette de pastilles bicolores 48 px (fond + rayure) façon Tostadora.
 * Badge `24h` sur les couleurs à stock permanent (`express_24h`).
 * Bouton `+N` en fin de palette ouvrant l'affichage étendu.
 */
const PaletteCouleurs: React.FC<Props> = ({
  couleurs,
  selectedCode,
  onSelect,
  visibleCount = 5,
}) => {
  const [expanded, setExpanded] = useState(false);

  const displayed = expanded ? couleurs : couleurs.slice(0, visibleCount);
  const hidden = couleurs.length - visibleCount;

  const active = couleurs.find((c) => c.code === selectedCode);

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
        Couleur base ·{' '}
        <strong style={{ color: tokens.ink }}>
          {active?.libelle || '—'}
        </strong>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {displayed.map((c) => {
          const isActive = c.code === selectedCode;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onSelect(c.code)}
              title={c.libelle}
              aria-pressed={isActive}
              aria-label={c.libelle}
              style={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${c.hex_fond} 50%, ${c.hex_rayure} 50%)`,
                border: isActive
                  ? `3px solid ${tokens.terracotta}`
                  : `2px solid ${tokens.border}`,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {c.express_24h && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: tokens.ink,
                    color: 'white',
                    fontSize: 8,
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: 8,
                    fontFamily: tokens.fontMono,
                    letterSpacing: 0.5,
                  }}
                >
                  24h
                </span>
              )}
            </button>
          );
        })}

        {!expanded && hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              position: 'relative',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background:
                'conic-gradient(#C8663D, #4A6C5B, #3B4E68, #D6A756, #A03A2C, #C8663D)',
              border: `2px solid ${tokens.border}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              padding: 0,
            }}
            aria-label={`Afficher les ${hidden} autres couleurs`}
          >
            <span
              style={{
                background: tokens.ink,
                color: 'white',
                padding: '2px 6px',
                borderRadius: 10,
                fontSize: 9,
                fontFamily: tokens.fontMono,
                fontWeight: 700,
              }}
            >
              +{hidden}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PaletteCouleurs;
