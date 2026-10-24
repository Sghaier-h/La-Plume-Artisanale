/**
 * Service Worker Registration — §14ter.19 ERP La Plume Artisanale.
 *
 * Enregistre `/service-worker.js` (fichier statique dans `public/`).
 * Compatible CRA. L'auto-update écoute `controllerchange` et reload
 * la page pour prendre en compte la nouvelle version.
 */

const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '[::1]' ||
   /^127(?:\.\d{1,3}){3}$/.test(window.location.hostname)),
);

export interface SwRegisterConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export function register(config?: SwRegisterConfig): void {
  if (process.env.NODE_ENV !== 'production' && !isLocalhost) {
    // En dev sur IP distante : on skip pour éviter les surprises de cache.
    return;
  }
  if (!('serviceWorker' in navigator)) return;

  const publicUrl = new URL(process.env.PUBLIC_URL || '/', window.location.href);
  if (publicUrl.origin !== window.location.origin) return;

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
    if (isLocalhost) {
      // Vérifie que le SW existe (évite les 404 silencieux en dev)
      checkValidSw(swUrl, config);
    } else {
      registerValidSw(swUrl, config);
    }
  });
}

function registerValidSw(swUrl: string, config?: SwRegisterConfig): void {
  navigator.serviceWorker.register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Mise à jour disponible
              if (config?.onUpdate) config.onUpdate(registration);
            } else {
              // Première install
              if (config?.onSuccess) config.onSuccess(registration);
            }
          }
        };
      };
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[SW] enregistrement échoué:', err);
    });
}

function checkValidSw(swUrl: string, config?: SwRegisterConfig): void {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((res) => {
      const ct = res.headers.get('content-type');
      if (res.status === 404 || (ct != null && ct.indexOf('javascript') === -1)) {
        navigator.serviceWorker.ready.then((reg) => reg.unregister().then(() => window.location.reload()));
      } else {
        registerValidSw(swUrl, config);
      }
    })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.info('[SW] pas de connexion, mode offline uniquement.');
    });
}

export function unregister(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => reg.unregister())
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[SW] désinscription échouée:', err);
    });
}
