/**
 * Design tokens du configurateur — repris du design system Plume Artisanale
 * (voir scratchpad/design-system-plume.html v36 et docs/domain.md §5.8.8).
 * Centralisé ici pour éviter la duplication des couleurs hex dans chaque
 * composant enfant.
 */
export const tokens = {
  terracotta: '#C8663D',
  terracottaSoft: '#E6A88B',
  terracottaWash: 'rgba(200,102,61,0.10)',
  sage: '#4A6C5B',
  sageSoft: '#8FAF9E',
  sageWash: 'rgba(74,108,91,0.10)',
  indigo: '#3B4E68',
  warning: '#D6A756',
  warningWash: 'rgba(214,167,86,0.14)',
  ground: '#FDFBF3',
  groundSubtle: '#F4EEDF',
  groundElevated: '#FFFFFF',
  ink: '#1C1917',
  inkMuted: '#8B7F72',
  inkSecondary: '#4A403A',
  border: '#E5DBC8',
  borderStrong: '#C7B99D',
  fontSerif: `'Fraunces', 'Cormorant Garamond', Georgia, serif`,
  fontSans: `'Inter', system-ui, -apple-system, sans-serif`,
  fontMono: `'JetBrains Mono', 'Menlo', monospace`,
  radiusSm: '6px',
  radiusMd: '10px',
  radiusFull: '999px',
  shadowMd: '0 4px 12px rgba(28,25,23,0.08)',
} as const;

export type Tokens = typeof tokens;
