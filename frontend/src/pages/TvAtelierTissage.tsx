import React from 'react';
import TvAtelierScreen from './TvAtelierScreen';

/**
 * TvAtelierTissage — écran mural 55" plein écran, atelier tissage.
 * Route publique : /tv/tissage/:token (pas de login, pas de sidebar).
 * §11bis.7bis — 30 s auto-refresh, top 5 tisseurs, cagnotte tisseurs.
 */

const TvAtelierTissage: React.FC = () => (
  <TvAtelierScreen atelier="tissage" />
);

export default TvAtelierTissage;
