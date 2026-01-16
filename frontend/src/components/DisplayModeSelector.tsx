import React from 'react';
import { List, Grid, Maximize2, Square, Minimize2 } from 'lucide-react';
import { DisplayMode, CatalogueSize, useDisplayMode } from '../hooks/useDisplayMode';

interface DisplayModeSelectorProps {
  pageId: string;
  defaultMode?: DisplayMode;
  defaultSize?: CatalogueSize;
  showSizeSelector?: boolean;
}

const DisplayModeSelector: React.FC<DisplayModeSelectorProps> = ({
  pageId,
  defaultMode = 'ligne',
  defaultSize = 'moyen',
  showSizeSelector = true
}) => {
  const { mode, size, setMode, setSize } = useDisplayMode(pageId, defaultMode, defaultSize);

  return (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <span className="text-sm font-medium text-gray-700">Affichage:</span>
      
      {/* Boutons Mode */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-3">
        <button
          onClick={() => setMode('ligne')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            mode === 'ligne'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="Mode Ligne"
        >
          <List className="w-4 h-4" />
          <span className="text-sm font-medium">Ligne</span>
        </button>
        <button
          onClick={() => setMode('catalogue')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            mode === 'catalogue'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title="Mode Catalogue"
        >
          <Grid className="w-4 h-4" />
          <span className="text-sm font-medium">Catalogue</span>
        </button>
      </div>

      {/* Sélecteur de taille (uniquement en mode catalogue) */}
      {showSizeSelector && mode === 'catalogue' && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Taille:</span>
          <button
            onClick={() => setSize('grand')}
            className={`p-2 rounded transition-colors ${
              size === 'grand'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Grand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSize('moyen')}
            className={`p-2 rounded transition-colors ${
              size === 'moyen'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Moyen"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSize('petit')}
            className={`p-2 rounded transition-colors ${
              size === 'petit'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Petit"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DisplayModeSelector;
