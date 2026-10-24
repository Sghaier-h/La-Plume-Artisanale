/* eslint-disable no-restricted-globals */
/**
 * Service Worker — ERP La Plume Artisanale (§14ter.19 offline tablettes)
 *
 * Stratégies :
 *   - App shell (JS/CSS/images/fonts)           : StaleWhileRevalidate
 *   - /api/v2/fabrication/of|taches             : NetworkFirst (fallback cache)
 *   - /api/v2/sous-traitance                    : NetworkFirst (fallback cache)
 *   - /api/v2/rh/pointages                      : NetworkFirst (fallback cache)
 *   - /api/v2/fabrication/machines              : NetworkFirst (fallback cache)
 *   - /api/v2/stock/matieres-premieres          : NetworkFirst (fallback cache)
 *   - Autres /api/*                             : NetworkOnly (laisse passer)
 *
 * On importe Workbox depuis le CDN officiel pour éviter de dépendre
 * du build CRA (CRA 5 ne précache plus par défaut via injectManifest).
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (self.workbox) {
  const {
    core: { setCacheNameDetails, skipWaiting, clientsClaim },
    routing: { registerRoute },
    strategies: { StaleWhileRevalidate, NetworkFirst, CacheFirst },
    expiration: { ExpirationPlugin },
    cacheableResponse: { CacheableResponsePlugin },
  } = self.workbox;

  setCacheNameDetails({ prefix: 'laplume', suffix: 'v1' });
  skipWaiting();
  clientsClaim();

  // ─────────────── App shell ───────────────
  registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'worker',
    new StaleWhileRevalidate({
      cacheName: 'laplume-app-shell',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    }),
  );

  // ─────────────── Images / fonts ───────────────
  registerRoute(
    ({ request }) => request.destination === 'image' || request.destination === 'font',
    new CacheFirst({
      cacheName: 'laplume-assets',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
      ],
    }),
  );

  // ─────────────── Navigation (index.html) ───────────────
  registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
      cacheName: 'laplume-navigation',
      networkTimeoutSeconds: 3,
      plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
    }),
  );

  // ─────────────── API tablettes atelier : NetworkFirst ───────────────
  const tabletteApiPatterns = [
    /\/api\/v2\/fabrication\/of(\?.*)?$/,
    /\/api\/v2\/fabrication\/of\/\d+(\?.*)?$/,
    /\/api\/v2\/fabrication\/taches(\/.*)?$/,
    /\/api\/v2\/fabrication\/machines(\/.*)?$/,
    /\/api\/v2\/sous-traitance\/.+$/,
    /\/api\/v2\/rh\/pointages(\/.*)?$/,
    /\/api\/v2\/stock\/matieres-premieres(\/.*)?$/,
    /\/api\/v2\/stock\/tracabilite-lots(\/.*)?$/,
    /\/api\/v2\/produits\/articles-generes(\?.*)?$/,
  ];

  for (const pattern of tabletteApiPatterns) {
    registerRoute(
      ({ url, request }) => request.method === 'GET' && pattern.test(url.pathname + url.search),
      new NetworkFirst({
        cacheName: 'laplume-api-tablette',
        networkTimeoutSeconds: 5,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 24 * 60 * 60 }),
        ],
      }),
    );
  }

  // Les autres /api/* passent en NetworkOnly par défaut (pas de registerRoute
  // nécessaire — fetch natif). Les POST/PUT/DELETE sont gérés côté app
  // par l'intercepteur axios + outbox IndexedDB (voir services/api.ts).

  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
} else {
  // Fallback si Workbox CDN indisponible — passe-plat réseau pur
  self.addEventListener('fetch', () => { /* noop */ });
}
