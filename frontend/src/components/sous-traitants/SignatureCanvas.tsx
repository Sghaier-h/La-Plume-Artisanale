/**
 * SignatureCanvas — composant signature tactile pour bons sortie/retour ST.
 * Capture le trait (mouse + touch) et renvoie un SVG string via onChange.
 * Design strict La Plume : fond crème, encre primary, bouton reset terracotta.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser, Check } from 'lucide-react';

interface SignaturePoint { x: number; y: number }
interface SignatureStroke { points: SignaturePoint[] }

export interface SignatureCanvasProps {
  width?: number;
  height?: number;
  label?: string;
  value?: string;
  onChange?: (svg: string, isEmpty: boolean) => void;
  disabled?: boolean;
}

const DEFAULT_W = 420;
const DEFAULT_H = 160;

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  width = DEFAULT_W,
  height = DEFAULT_H,
  label = 'Signature tactile',
  value,
  onChange,
  disabled,
}) => {
  const [strokes, setStrokes] = useState<SignatureStroke[]>([]);
  const [drawing, setDrawing] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Si on reçoit un `value` initial on l'ignore pour l'édition (zone propre),
  // il reste affichable en mode disabled via render brut.
  const buildSvg = useCallback((all: SignatureStroke[]) => {
    const paths = all.map((s) => {
      if (s.points.length === 0) return '';
      const [first, ...rest] = s.points;
      const d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ` +
        rest.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
      return `<path d="${d}" fill="none" stroke="#2A2A2A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
  }, [width, height]);

  const emit = useCallback((next: SignatureStroke[]) => {
    const svg = buildSvg(next);
    const empty = next.length === 0 || next.every(s => s.points.length < 2);
    onChange?.(svg, empty);
  }, [buildSvg, onChange]);

  const getPos = (e: React.MouseEvent | React.TouchEvent): SignaturePoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const touch = 'touches' in e ? e.touches[0] : null;
    const cx = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const cy = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
  };

  const begin = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const p = getPos(e);
    if (!p) return;
    e.preventDefault();
    setDrawing(true);
    setStrokes((s) => [...s, { points: [p] }]);
  };

  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || disabled) return;
    const p = getPos(e);
    if (!p) return;
    e.preventDefault();
    setStrokes((s) => {
      const copy = [...s];
      copy[copy.length - 1] = { points: [...copy[copy.length - 1].points, p] };
      return copy;
    });
  };

  const end = () => {
    if (!drawing) return;
    setDrawing(false);
  };

  // emit when strokes change (mais pas pendant draw pour perf)
  useEffect(() => {
    if (!drawing) emit(strokes);
  }, [drawing, strokes, emit]);

  const clear = () => {
    setStrokes([]);
    onChange?.(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"></svg>`, true);
  };

  const isEmpty = strokes.length === 0;

  // Mode affichage seul si value fourni & onChange absent
  if (disabled && value) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        {label && <div style={labelStyle}>{label}</div>}
        <div
          style={{
            maxWidth: '100%',
            width,
            height,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={{ maxWidth: '100%' }}>
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          onMouseDown={begin}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={begin}
          onTouchMove={move}
          onTouchEnd={end}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            touchAction: 'none',
            display: 'block',
            width: '100%',
            maxWidth: width,
            cursor: disabled ? 'not-allowed' : 'crosshair',
          }}
        >
          {strokes.map((s, i) => {
            if (s.points.length === 0) return null;
            const [first, ...rest] = s.points;
            const d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ` +
              rest.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--fg-primary)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
          {isEmpty && (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="var(--font-sans)"
              fontSize="14"
              fill="var(--fg-muted)"
            >
              Signez ici — tactile ou souris
            </text>
          )}
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: isEmpty ? 'var(--fg-muted)' : 'var(--accent-sage)',
        }}>
          {isEmpty ? 'EN ATTENTE' : <span><Check size={10} style={{ verticalAlign: 'middle' }} /> SIGNÉ</span>}
        </span>
        <button
          type="button"
          onClick={clear}
          disabled={disabled || isEmpty}
          style={clearBtn}
        >
          <Eraser size={14} /> Effacer
        </button>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  color: 'var(--fg-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const clearBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 12px',
  background: 'transparent',
  border: '1px solid var(--border-subtle)',
  color: 'var(--fg-secondary)',
  borderRadius: 999,
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-xs)',
  fontWeight: 500,
  cursor: 'pointer',
  minHeight: 32,
};

export default SignatureCanvas;
