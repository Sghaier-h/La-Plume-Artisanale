# Phase T4 — Mode offline tablettes atelier (§14ter.19)

**Objectif** : qu'un opérateur tablette (TISSEUR, COUPEUR,
MAGASINIER_MP / SOUSTRAITANTS / PREPARATION, CAISSIER, contrôle qualité)
puisse consulter ses OF/tâches/lots, démarrer/pauser/terminer un OF,
pointer, signaler un défaut, créer un bon sortie / retour sous-traitant
ou encaisser **sans connexion internet**, puis tout se synchronise
automatiquement au retour du réseau.

Le comportement online est **100 % préservé** : les intercepteurs
offline ne s'activent que lorsque `navigator.onLine === false` ou qu'un
GET éligible échoue en erreur réseau.

---

## (a) Fichiers créés

| Chemin | Rôle |
|---|---|
| `frontend/public/service-worker.js` | Service Worker Workbox (CDN 6.5.4). App shell `StaleWhileRevalidate`, GET tablette `NetworkFirst` avec fallback cache 24 h, autres `/api/*` en réseau pur. |
| `frontend/src/serviceWorkerRegistration.ts` | Enregistrement CRA-compatible du SW (prod + localhost). |
| `frontend/src/offline/db.ts` | Helpers IndexedDB natifs : `openDb`, `cacheGet/Set/List/Delete`, `metaGet/Set/Delete`, `purgeAll`. 7 stores : `of`, `taches`, `sous_traitants`, `machines`, `articles`, `lots`, `pointages_recents`, `generic`. |
| `frontend/src/offline/outbox.ts` | File d'attente des actions mutantes offline. API `enqueue / listAll / listPending / countPending / updateStatus / remove / clearAll`. Whitelist regex de 12 patterns critiques. |
| `frontend/src/offline/syncWorker.ts` | Worker JS : `startSyncWorker` écoute `online` + polling 30 s + `outbox:changed`. `flushOutbox()` : succès → delete, 4xx → status=failed + raison, 5xx/réseau → laisse pending. N'importe pas axios (évite les boucles). |
| `frontend/src/offline/useOnlineStatus.ts` | Hook React `{ isOnline, pendingCount, lastSyncAt, retry }`. |
| `frontend/src/offline/useCachedData.ts` | Hook GET avec IDB fallback + `fromCache` + `refresh()`. |
| `frontend/src/offline/pinCache.ts` | PIN tablette → SHA-256 salé (crypto.subtle) + TTL 8 h. Jamais stocké en clair. `cachePinAfterAuth`, `verifyPinOffline`, `cacheTabletteSession`, `clearPinCache`. |
| `frontend/src/components/OfflineBanner.tsx` | Bannière sticky 32 px, 3 états (sage/gold/indigo), drawer latéral listant les entrées outbox avec Réessayer / Retirer. |

## (b) Fichiers patchés

| Chemin | Modification |
|---|---|
| `frontend/src/index.tsx` | Appel `serviceWorkerRegistration.register()` + `startSyncWorker()` au boot. |
| `frontend/src/services/api.ts` | Intercepteur **request** : si offline + méthode mutante whitelistée → `enqueue` IDB + rejet marqué `__offlineQueued`. Intercepteur **response** : si rejet queued → renvoie `{ data: { success: true, offline: true, queued: true } }` (status 202). Si GET en erreur réseau et URL cacheable → tente `cacheGet` + renvoie 200 avec header `x-offline-cache`. Succès GET → écrit le cache IDB. |
| `frontend/src/components/TabletteLayout.tsx` | Monte `<OfflineBanner />` en haut, purge IDB + PIN au logout. |
| `frontend/src/components/rh/TabletteKiosqueShell.tsx` | Monte `<OfflineBanner />` en haut (kiosque PIN). |
| `frontend/public/manifest.json` | PWA : `display: standalone`, `start_url: /tablette/pointeuse`, icônes 192/512, `theme_color #C8663D`. |

## (c) Comment tester

1. **Build + serve** : `cd frontend && npm run build && npx serve -s build`
   (le SW ne s'enregistre qu'en prod ou sur `localhost`).
2. Ouvrir `http://localhost:3000/tablette/tisseur`, se connecter via PIN.
3. Dans Chrome DevTools :
   - **Application → Service Workers** : vérifier `service-worker.js` actif.
   - **Application → IndexedDB → laplume-offline** : vérifier les stores.
4. Charger la liste des OF (GET `/v2/fabrication/of`) → le cache IDB se
   remplit.
5. **Network → Offline** (cocher la case).
6. Cliquer **Démarrer OF** sur un OF : la bannière vire **orange**
   « ⚠ Hors ligne — 1 action en attente », toast « ✓ Enregistré hors
   ligne, sera synchronisé » (fourni par la page). L'entrée apparaît
   dans IndexedDB → `outbox`.
7. Décocher **Offline** : la bannière vire **indigo** puis **sage**
   « ✓ En ligne », l'entrée disparaît de l'outbox et le serveur voit
   la requête arriver.

## (d) Limites connues (à traiter en Phase T5)

- **Pagination** : seule la *page courante* du GET est cachée (la clé
  cache est l'URL complète avec query string). Les grandes listes
  paginées côté serveur restent non-cachées pour les pages non visitées.
- **Photos / uploads** : le FormData multipart n'est pas enqueued (JSON
  only pour l'outbox). Les workflows « photo boîte de tri » ou
  « justificatif qualité » conservent une data URL temporaire côté UI
  mais ne synchronisent pas automatiquement — nécessitera un store
  binaire IDB + Blob + fallback upload différé.
- **Conflits** : pas de résolution automatique (par ex. OF démarré
  offline par deux tablettes). Le dernier arrivé gagne côté serveur ;
  le second recevra probablement une erreur 4xx et l'entrée passera en
  `failed` (opérateur devra la retirer manuellement via le drawer).
- **PIN offline** : un seul PIN cacheé à la fois (dernière session
  réussie, TTL 8 h). Si l'opérateur change de poste sans repasser en
  ligne, il devra ressaisir son PIN et sera bloqué.
- **Service Worker CDN** : Workbox est chargé depuis
  `storage.googleapis.com/workbox-cdn`. En environnement air-gap total,
  précharger le script localement et modifier `importScripts`.
- **Pages non patchées** : les pages tablette existantes ne sont pas
  encore adaptées pour afficher explicitement l'état `offline/queued`
  dans leurs feedbacks de boutons — elles reçoivent une réponse 202
  avec `queued: true` que leur code applique en success classique.
  Un pass UX ultérieur devra ajouter un indicateur par action.

---

**Vérifications** :
- `cd frontend && npx tsc --noEmit` → exit 0 ✓
- `cd frontend && npm run build` → bundle produit, `build/service-worker.js` présent ✓
- Aucun commit : laissé à la revue utilisateur.
