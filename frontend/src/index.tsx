import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/design-system.css';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { startSyncWorker } from './offline/syncWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ─── §14ter.19 Offline tablettes ────────────────────────────────────────
// Enregistre le Service Worker (Workbox CDN) pour cacher l'app shell +
// les GET tablettes atelier. Démarre le worker de synchro outbox (vide
// la file d'attente IndexedDB quand le réseau revient).
serviceWorkerRegistration.register();
startSyncWorker();
