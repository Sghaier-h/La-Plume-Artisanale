/**
 * ThemeContext - Gestion des thèmes de l'application
 * Supporte plusieurs thèmes : Clair, Sombre, Automatique, et thèmes colorés
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeColor = 'default' | 'blue' | 'purple' | 'green' | 'orange';

export interface Theme {
  mode: ThemeMode;
  color: ThemeColor;
  name: string;
  description: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  /** Alias pour textSecondary (compatibilité) */
  textMuted: string;
  border: string;
  shadow: string;
  gradient: {
    from: string;
    to: string;
    via?: string;
  };
}

const themes: Record<ThemeColor, ThemeColors> = {
  default: {
    // Palette artisanale La Plume — fouta tunisienne
    primary: '#C8663D',        // terracotta
    secondary: '#7A8C6A',      // sage
    accent: '#C89B3C',         // gold
    background: 'linear-gradient(135deg, #FBF8F3 0%, #F5EFE5 50%, #EBE2CE 100%)',
    surface: 'rgba(255, 255, 255, 0.95)',
    text: '#2F1F12',
    textSecondary: '#6B4E31',
    textMuted: '#9B8874',
    border: 'rgba(75, 45, 20, 0.08)',
    shadow: 'rgba(75, 45, 20, 0.08)',
    gradient: {
      from: '#C8663D',
      to: '#C89B3C',
      via: '#4A5D75'
    }
  },
  blue: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    accent: '#60a5fa',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
    surface: 'rgba(255, 255, 255, 0.95)',
    text: '#1e3a8a',
    textSecondary: '#3b82f6',
    textMuted: '#3b82f6',
    border: 'rgba(59, 130, 246, 0.2)',
    shadow: 'rgba(59, 130, 246, 0.15)',
    gradient: {
      from: '#3b82f6',
      to: '#2563eb',
      via: '#60a5fa'
    }
  },
  purple: {
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a78bfa',
    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)',
    surface: 'rgba(255, 255, 255, 0.95)',
    text: '#6b21a8',
    textSecondary: '#8b5cf6',
    textMuted: '#8b5cf6',
    border: 'rgba(139, 92, 246, 0.2)',
    shadow: 'rgba(139, 92, 246, 0.15)',
    gradient: {
      from: '#8b5cf6',
      to: '#7c3aed',
      via: '#a78bfa'
    }
  },
  green: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
    surface: 'rgba(255, 255, 255, 0.95)',
    text: '#065f46',
    textSecondary: '#10b981',
    textMuted: '#10b981',
    border: 'rgba(16, 185, 129, 0.2)',
    shadow: 'rgba(16, 185, 129, 0.15)',
    gradient: {
      from: '#10b981',
      to: '#059669',
      via: '#34d399'
    }
  },
  orange: {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
    surface: 'rgba(255, 255, 255, 0.95)',
    text: '#92400e',
    textSecondary: '#f59e0b',
    textMuted: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.2)',
    shadow: 'rgba(245, 158, 11, 0.15)',
    gradient: {
      from: '#f59e0b',
      to: '#d97706',
      via: '#fbbf24'
    }
  }
};

const darkThemes: Record<ThemeColor, ThemeColors> = {
  default: {
    // Palette artisanale mode sombre — terracotta/gold/indigo réchauffés
    primary: '#E2896A',
    secondary: '#9EAF8C',
    accent: '#E1B857',
    background: 'linear-gradient(135deg, #1E1610 0%, #2A1F16 50%, #3A2A1E 100%)',
    surface: 'rgba(42, 31, 22, 0.95)',
    text: '#FBF8F3',
    textSecondary: '#DFD3B8',
    textMuted: '#C4B394',
    border: 'rgba(226, 137, 106, 0.18)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    gradient: {
      from: '#C8663D',
      to: '#C89B3C',
      via: '#4A5D75'
    }
  },
  blue: {
    primary: '#60a5fa',
    secondary: '#3b82f6',
    accent: '#93c5fd',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    surface: 'rgba(30, 58, 138, 0.95)',
    text: '#dbeafe',
    textSecondary: '#93c5fd',
    textMuted: '#93c5fd',
    border: 'rgba(96, 165, 250, 0.3)',
    shadow: 'rgba(37, 99, 235, 0.3)',
    gradient: {
      from: '#3b82f6',
      to: '#2563eb',
      via: '#60a5fa'
    }
  },
  purple: {
    primary: '#a78bfa',
    secondary: '#8b5cf6',
    accent: '#c4b5fd',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c3aed 100%)',
    surface: 'rgba(107, 33, 168, 0.95)',
    text: '#f3e8ff',
    textSecondary: '#c4b5fd',
    textMuted: '#c4b5fd',
    border: 'rgba(167, 139, 250, 0.3)',
    shadow: 'rgba(124, 58, 237, 0.3)',
    gradient: {
      from: '#8b5cf6',
      to: '#7c3aed',
      via: '#a78bfa'
    }
  },
  green: {
    primary: '#34d399',
    secondary: '#10b981',
    accent: '#6ee7b7',
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)',
    surface: 'rgba(6, 95, 70, 0.95)',
    text: '#d1fae5',
    textSecondary: '#6ee7b7',
    textMuted: '#6ee7b7',
    border: 'rgba(52, 211, 153, 0.3)',
    shadow: 'rgba(5, 150, 105, 0.3)',
    gradient: {
      from: '#10b981',
      to: '#059669',
      via: '#34d399'
    }
  },
  orange: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    accent: '#fcd34d',
    background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    surface: 'rgba(146, 64, 14, 0.95)',
    text: '#fef3c7',
    textSecondary: '#fcd34d',
    textMuted: '#fcd34d',
    border: 'rgba(251, 191, 36, 0.3)',
    shadow: 'rgba(217, 119, 6, 0.3)',
    gradient: {
      from: '#f59e0b',
      to: '#d97706',
      via: '#fbbf24'
    }
  }
};

interface ThemeContextType {
  theme: Theme;
  themeColors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  setMode: (mode: ThemeMode) => void;
  setColor: (color: ThemeColor) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('erp_theme');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    }
    return { mode: 'light', color: 'default', name: 'Clair', description: 'Thème clair par défaut' };
  });

  const [isDark, setIsDark] = useState(() => {
    if (theme.mode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.mode === 'dark';
  });

  // Détecter les changements de préférence système
  useEffect(() => {
    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDark(theme.mode === 'dark');
    }
  }, [theme.mode]);

  // Obtenir les couleurs du thème
  const themeColors = isDark ? darkThemes[theme.color] : themes[theme.color];

  // Appliquer le thème au document
  //
  // 1. Stamp data-theme sur <html> pour piloter le design system La Plume
  //    (design-system.css redéfinit --bg-app, --fg-primary, etc. sous
  //    :root[data-theme="dark"] ou :root[data-theme="light"]).
  //    mode === 'auto' → on ne stamp rien, prefers-color-scheme prend le relais.
  //
  // 2. Publier les CSS vars --theme-* pour les composants qui les utilisent
  //    (compat rétro — le design system moderne n'en dépend plus).
  useEffect(() => {
    const root = document.documentElement;

    // (1) Stamp data-theme
    if (theme.mode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (theme.mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    // color-scheme aligne les contrôles natifs (scrollbars, form controls)
    root.style.colorScheme = isDark ? 'dark' : 'light';

    // (2) CSS vars compat
    root.style.setProperty('--theme-primary', themeColors.primary);
    root.style.setProperty('--theme-secondary', themeColors.secondary);
    root.style.setProperty('--theme-accent', themeColors.accent);
    root.style.setProperty('--theme-background', themeColors.background);
    root.style.setProperty('--theme-surface', themeColors.surface);
    root.style.setProperty('--theme-text', themeColors.text);
    root.style.setProperty('--theme-text-secondary', themeColors.textSecondary);
    root.style.setProperty('--theme-border', themeColors.border);
    root.style.setProperty('--theme-shadow', themeColors.shadow);
    root.style.setProperty('--theme-gradient-from', themeColors.gradient.from);
    root.style.setProperty('--theme-gradient-to', themeColors.gradient.to);
    if (themeColors.gradient.via) {
      root.style.setProperty('--theme-gradient-via', themeColors.gradient.via);
    }
  }, [theme.mode, isDark, themeColors]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('erp_theme', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  const setMode = (mode: ThemeMode) => {
    const newTheme = { ...theme, mode };
    setTheme(newTheme);
  };

  const setColor = (color: ThemeColor) => {
    const newTheme = { ...theme, color };
    setTheme(newTheme);
  };

  const availableThemes: Theme[] = [
    { mode: 'light', color: 'default', name: 'Clair - Par défaut', description: 'Thème clair avec couleurs par défaut' },
    { mode: 'dark', color: 'default', name: 'Sombre - Par défaut', description: 'Thème sombre avec couleurs par défaut' },
    { mode: 'auto', color: 'default', name: 'Automatique', description: 'Suit les préférences système' },
    { mode: 'light', color: 'blue', name: 'Clair - Bleu', description: 'Thème clair avec palette bleue' },
    { mode: 'dark', color: 'blue', name: 'Sombre - Bleu', description: 'Thème sombre avec palette bleue' },
    { mode: 'light', color: 'purple', name: 'Clair - Violet', description: 'Thème clair avec palette violette' },
    { mode: 'dark', color: 'purple', name: 'Sombre - Violet', description: 'Thème sombre avec palette violette' },
    { mode: 'light', color: 'green', name: 'Clair - Vert', description: 'Thème clair avec palette verte' },
    { mode: 'dark', color: 'green', name: 'Sombre - Vert', description: 'Thème sombre avec palette verte' },
    { mode: 'light', color: 'orange', name: 'Clair - Orange', description: 'Thème clair avec palette orange' },
    { mode: 'dark', color: 'orange', name: 'Sombre - Orange', description: 'Thème sombre avec palette orange' },
  ];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeColors,
        isDark,
        setTheme,
        setMode,
        setColor,
        availableThemes
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
