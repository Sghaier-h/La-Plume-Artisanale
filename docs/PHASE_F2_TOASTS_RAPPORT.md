# Phase F2 — Système de toasts unifié · Rapport

## Objectif
Remplacer tous les `alert()` natifs par un système de toasts unifié, et
auto-feedback après chaque mutation API (POST/PUT/DELETE), sans toucher
aux dashboards opérateur ni aux tablettes atelier qui disposent déjà de
leur propre feedback.

## Fichiers créés
- `frontend/src/components/ui/Toast.tsx` — composant d'affichage d'un toast
  individuel (icône + titre + description + bouton X), aligné sur les
  tokens `design-system.css` (`--color-success|danger|warning|info`,
  `--bg-elevated`, `--shadow-lg`, …).
- `frontend/src/components/ui/ToastProvider.tsx` — provider React avec
  queue (max 4 toasts, éjection du plus ancien), auto-dismiss (3,5 s
  success / info / warning, 6 s error), animation slide-in-right + fade,
  position fixed bottom-right (z-index 100). Installe
  `window.showToast(kind, title, description?)` pour usage hors React.
- `frontend/src/components/ui/useToast.ts` — hook principal avec les deux
  patterns d'usage : destructuration (`const { success, error } = useToast()`)
  et namespace (`const { toast } = useToast(); toast.success(...)`).
  Signature : `method(title: string, description?: string)`.

## Fichiers modifiés
- `frontend/src/App.tsx` — montage `<ToastProvider>` dans la chaîne
  `AppProvider → ToastProvider → NotificationProvider → AppContent`.
- `frontend/src/services/api.ts` — response interceptor Phase F2 :
  - 2xx POST/PUT/DELETE hors `/auth/*` → toast success « Enregistré »
    (opt-out via `window.__toastOnSuccess = false` ou header
    `X-No-Toast: 1` par requête).
  - 4xx/5xx (hors 401 et `/auth/*`) → toast error avec
    `error.response.data.error.message` (fallback « Une erreur est
    survenue »).
  - `offlineQueued` → toast info « Enregistré hors ligne / Sera
    synchronisé à la reconnexion ».
  - Erreur réseau (ECONNREFUSED / ERR_NETWORK / « Network Error ») →
    toast warning « Connexion perdue ».
- `frontend/src/components/Toast.tsx` et `frontend/src/hooks/useToast.ts`
  → ré-exports de la nouvelle implémentation (compat des imports
  historiques utilisés par `NotificationCenter`, 4 dashboards opérateur
  et 3 tablettes).
- `frontend/src/components/NotificationCenter.tsx` — permutation
  `toast.info(msg, title)` → `toast.info(title, msg)` pour s'aligner sur
  la nouvelle signature `(title, description)`.

## alert() remplacés
- **224** occurrences remplacées dans **56** fichiers sous `pages/` par
  `window.showToast?.('kind', 'title', description)`, classification
  heuristique sur le contenu littéral (erreur / succès / bientôt / info).
- **25** `alert()` restants, tous dans les fichiers volontairement
  préservés (dashboards opérateur + tablettes atelier) : ChefAtelier,
  DashboardControleCentral, DashboardMagasinierSoustraitants,
  DashboardTisseur, Pointage, PointageTimeMoto, ResponsableDashboard,
  TabletteConsultationBulletins, TabletteMagasinier, TabletteQualite.
- `confirm()` conservés tels quels (hors scope).
- `OfflineBanner` intact (feedback propre préservé).

## Vérification
```
$ cd frontend && npx tsc --noEmit
EXIT: 0
```

Aucun commit effectué (contrainte respectée).
