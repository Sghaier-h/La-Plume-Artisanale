import React from 'react';
import TvAtelierScreen from './TvAtelierScreen';

/**
 * TvAtelierFinition — écran mural 55" plein écran, atelier finition.
 * Route publique : /tv/finition/:token (pas de login, pas de sidebar).
 * §11bis.7bis — 30 s auto-refresh, top 5 opérateurs, cagnotte finition.
 */

const TvAtelierFinition: React.FC = () => (
  <TvAtelierScreen atelier="finition" />
);

export default TvAtelierFinition;
