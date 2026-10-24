/**
 * PinKeypad — clavier numérique XL pour les tablettes RH (§14quater.14).
 *
 * - Grille 3×4 (chiffres + bouton correction + bouton OK).
 * - Chaque touche min 80×80 px tablette, 60×60 px mobile — via `clamp()`.
 * - 44×44 px minimum (contrat §14ter.17b) toujours garanti.
 * - Affichage du PIN masqué par ⬤.
 * - Résiste au mode portrait + paysage + mobile.
 */
import React from 'react';
import { Delete, Check } from 'lucide-react';

export interface PinKeypadProps {
  value: string;
  onChange: (v: string) => void;
  onValidate: () => void;
  maxLength?: number;
  disabled?: boolean;
  label?: string;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const PinKeypad: React.FC<PinKeypadProps> = ({
  value, onChange, onValidate, maxLength = 6, disabled, label,
}) => {
  const press = (k: string) => {
    if (disabled) return;
    if (value.length >= maxLength) return;
    onChange(value + k);
  };
  const back = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 32px)',
        width: '100%',
        maxWidth: 460,
        margin: '0 auto',
      }}
    >
      {label && (
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            color: 'var(--fg-primary)',
            textAlign: 'center',
          }}
        >
          {label}
        </div>
      )}
      {/* Afficheur */}
      <div
        aria-label="PIN saisi"
        style={{
          display: 'flex',
          gap: 'clamp(10px, 2vw, 16px)',
          padding: 'clamp(12px, 2vw, 20px)',
          background: 'var(--bg-canvas)',
          border: '2px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          minHeight: 60,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {Array.from({ length: maxLength }).map((_, i) => (
          <span
            key={i}
            style={{
              width: 'clamp(14px, 2.5vw, 20px)',
              height: 'clamp(14px, 2.5vw, 20px)',
              borderRadius: '50%',
              background: i < value.length ? 'var(--accent-terracotta)' : 'var(--border-subtle)',
              transition: 'background 180ms ease',
            }}
          />
        ))}
      </div>

      {/* Clavier */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(60px, 1fr))',
          gap: 'clamp(10px, 1.5vw, 16px)',
          width: '100%',
        }}
      >
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            disabled={disabled}
            style={keyStyle}
            aria-label={`Chiffre ${k}`}
          >
            {k}
          </button>
        ))}
        <button type="button" onClick={back} disabled={disabled} style={keyStyle} aria-label="Effacer">
          <Delete size={28} />
        </button>
        <button
          type="button"
          onClick={() => press('0')}
          disabled={disabled}
          style={keyStyle}
          aria-label="Chiffre 0"
        >
          0
        </button>
        <button
          type="button"
          onClick={onValidate}
          disabled={disabled || value.length < 4}
          style={{
            ...keyStyle,
            background: 'var(--accent-terracotta)',
            color: '#FBF8F3',
            borderColor: 'var(--accent-terracotta)',
            opacity: disabled || value.length < 4 ? 0.4 : 1,
          }}
          aria-label="Valider"
        >
          <Check size={28} />
        </button>
      </div>
    </div>
  );
};

const keyStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Mobile ≥ 60px, tablette ≥ 80px, écrans larges jusqu'à 120px.
  minWidth: 60,
  minHeight: 60,
  width: '100%',
  aspectRatio: '1 / 1',
  maxHeight: 'clamp(60px, 10vw, 120px)',
  background: 'var(--bg-elevated)',
  border: '2px solid var(--border-strong)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
  fontWeight: 700,
  color: 'var(--fg-primary)',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'transform 100ms ease, background 180ms ease',
  touchAction: 'manipulation',
};

export default PinKeypad;
