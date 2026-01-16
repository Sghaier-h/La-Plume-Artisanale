import { useState, useEffect } from 'react';

export type DisplayMode = 'ligne' | 'catalogue';
export type CatalogueSize = 'grand' | 'moyen' | 'petit';

interface DisplayPreferences {
  mode: DisplayMode;
  size: CatalogueSize;
}

const STORAGE_KEY_PREFIX = 'display_pref_';

export const useDisplayMode = (pageId: string, defaultMode: DisplayMode = 'ligne', defaultSize: CatalogueSize = 'moyen') => {
  const storageKey = `${STORAGE_KEY_PREFIX}${pageId}`;

  const [preferences, setPreferences] = useState<DisplayPreferences>(() => {
    // Charger depuis localStorage
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Si erreur, utiliser les valeurs par défaut
      }
    }
    return { mode: defaultMode, size: defaultSize };
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storageKey]);

  const setMode = (mode: DisplayMode) => {
    setPreferences(prev => ({ ...prev, mode }));
  };

  const setSize = (size: CatalogueSize) => {
    setPreferences(prev => ({ ...prev, size }));
  };

  const toggleMode = () => {
    setPreferences(prev => ({
      ...prev,
      mode: prev.mode === 'ligne' ? 'catalogue' : 'ligne'
    }));
  };

  return {
    mode: preferences.mode,
    size: preferences.size,
    setMode,
    setSize,
    toggleMode,
    preferences
  };
};

// Tailles de grille pour le mode catalogue
export const getCatalogueGridClass = (size: CatalogueSize): string => {
  switch (size) {
    case 'grand':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    case 'moyen':
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
    case 'petit':
      return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
    default:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }
};
