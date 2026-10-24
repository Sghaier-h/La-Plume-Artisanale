import React from 'react';
import { tokens } from './tokens';
import type { ZoneImpression } from '../../services/personnalisationApi';

interface ZoneMiniature {
  code: ZoneImpression;
  libelle_court: string;   // "Coin H-G"
  libelle_long: string;    // "Coin haut gauche"
  /** Position du logo sur la miniature (en % de la surface). */
  pos: { top?: string; left?: string; right?: string; bottom?: string };
}

const DEFAULT_ZONES: ZoneMiniature[] = [
  { code: 'coin_haut_gauche', libelle_court: 'Coin H-G', libelle_long: 'Coin haut gauche', pos: { top: '15%', left: '10%' } },
  { code: 'coin_haut_droit',  libelle_court: 'Coin H-D', libelle_long: 'Coin haut droit',  pos: { top: '15%', right: '10%' } },
  { code: 'centre',           libelle_court: 'Centre',   libelle_long: 'Centre',           pos: { top: '45%', left: '30%' } },
  { code: 'coin_bas_gauche',  libelle_court: 'Coin B-G', libelle_long: 'Coin bas gauche',  pos: { bottom: '15%', left: '10%' } },
  { code: 'coin_bas_droit',   libelle_court: 'Coin B-D', libelle_long: 'Coin bas droit',   pos: { bottom: '15%', right: '10%' } },
];

interface Props {
  zonesAutorisees: ZoneImpression[];
  selected: ZoneImpression;
  onSelect: (zone: ZoneImpression) => void;
  onOuvrirSurfaces?: () => void;
}

/**
 * Grille 5 miniatures format 2:3 avec halo terracotta sur l'emplacement actif.
 * Les miniatures non autorisées sont filtrées par `zonesAutorisees`.
 */
const EmplacementsBroderie: React.FC<Props> = ({
  zonesAutorisees,
  selected,
  onSelect,
  onOuvrirSurfaces,
}) => {
  const zones = DEFAULT_ZONES.filter((z) => zonesAutorisees.includes(z.code));
  const active = zones.find((z) => z.code === selected);

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
        Emplacement broderie ·{' '}
        <strong style={{ color: tokens.ink }}>
          {active?.libelle_long || '—'}
        </strong>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${zones.length || 5}, 1fr)`,
          gap: 6,
        }}
      >
        {zones.map((z) => {
          const isActive = z.code === selected;
          return (
            <button
              key={z.code}
              type="button"
              onClick={() => onSelect(z.code)}
              title={z.libelle_long}
              aria-pressed={isActive}
              style={{
                aspectRatio: '2 / 3',
                background: isActive ? tokens.terracottaWash : tokens.groundSubtle,
                border: isActive
                  ? `2px solid ${tokens.terracotta}`
                  : `1px solid ${tokens.border}`,
                borderRadius: 4,
                position: 'relative',
                cursor: 'pointer',
                padding: 0,
                boxShadow: isActive
                  ? '0 0 8px rgba(200,102,61,0.30)'
                  : 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  ...z.pos,
                  width: isActive ? '40%' : '24%',
                  height: isActive ? '15%' : '12%',
                  background: tokens.terracotta,
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 0,
                  right: 0,
                  fontFamily: tokens.fontMono,
                  fontSize: 8,
                  textAlign: 'center',
                  color: isActive ? tokens.terracotta : tokens.inkMuted,
                  fontWeight: isActive ? 700 : 400,
                }}
              >
                {z.libelle_court}
                {isActive ? ' ✓' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {onOuvrirSurfaces && (
        <button
          type="button"
          onClick={onOuvrirSurfaces}
          style={{
            width: '100%',
            marginTop: 8,
            padding: 8,
            background: 'transparent',
            border: `1px dashed ${tokens.borderStrong}`,
            borderRadius: tokens.radiusSm,
            fontSize: 11,
            color: tokens.inkMuted,
            cursor: 'pointer',
          }}
        >
          + Voir toutes les surfaces
        </button>
      )}
    </div>
  );
};

export default EmplacementsBroderie;
