# `_legacy/` — Archives du projet

> ⚠️ **NE PAS TOUCHER — Archives historiques préservées pour référence.**
> Ce dossier contient tous les fichiers rendus obsolètes par la refonte
> de septembre 2026 (contrat v2.9 + modules-v2/ + design system artisanal).
>
> Les fichiers sont **conservés dans le Git** avec leur historique complet
> (`git log --follow _legacy/…/fichier`).

## Contenu

| Dossier | Nb | Description |
|---|---:|---|
| `backend-docs-troubleshooting/` | ~104 | Session-notes de dépannage (`CORRIGER_*`, `CORRECTIONS_*`, `RESOUDRE_*`, `SOLUTION_*`, etc.) qui traînaient à la racine de `backend/` |
| `backend-scripts-ps1/` | 31 | Scripts PowerShell backend one-shot (installation, tunnels SSH, tests ponctuels) |
| `backend-scripts-oneshot/` | 128 | Scripts Node.js `.mjs` one-shot (`activer-*.mjs`, `ajouter-*.mjs`, `ameliorer-*.mjs`) qui étaient dans `backend/scripts/` |
| `docs-notes-de-session/` | ~57 | Notes de session obsolètes de `docs/` (résumés, vérifications, redémarrages) |
| `frontend-pages-doublons/` | 1+ | Pages React orphelines (`Dashboard.tsx` non utilisée) |
| `mobile-android-legacy/` | 2 | `app-tisseur` Kotlin (§11quater du contrat : à remplacer par Expo React Native) |
| `mvp-fouta-management/` | 14 | MVP Vite/React initial `fouta-management/` — remplacé par `frontend/` complet |
| `racine-scripts-ps1/` | 5 | Scripts PowerShell racine redondants (`DEMARRAGE_RAPIDE`, `LANCER_LOCAL`, etc. — les 4 utiles sont dans `/`) |
| `racine-scripts-shell/` | ~100 | Scripts `.sh` racine one-shot (corriger-*, deployer-*, transférer-*) qui étaient dans `scripts/` |

## Ce qui reste actif à la racine du projet

```
La-Plume-Artisanale/
├── backend/              # Code productif (modules-v2/ = source de vérité)
├── frontend/             # Code productif React
├── database/             # Schema-v2 + seeds-v2 (les seuls utilisés)
├── docs/                 # Documentation officielle (README, domain, DESIGN_SYSTEM, legacy-gas-*, guides/, operations/, historique/)
├── scripts/              # backup.sh + deploy-safe.sh (les 2 seuls actifs)
├── tests/                # Tests E2E racine
├── .github/workflows/    # CI/CD
├── DEMARRER_COMPLET.ps1  # Lance backend + frontend
├── DEMARRER_BACKEND.ps1  # Backend seul
├── DEMARRER_FRONTEND.ps1 # Frontend seul
├── LIBERER_PORTS.ps1     # Utilitaire ports
├── README.md
├── docker-compose.yml
└── _legacy/              # ← vous êtes ici
```

## Convention

- **Ne pas supprimer** ce dossier — les fichiers gardent leur valeur historique
- **Ne pas modifier** les fichiers dedans — ils sont figés à leur dernier état
- **Ne pas ré-ajouter** dans le code productif — s'il faut un ancien fichier, en créer une version propre dans le bon dossier
- Le VPS OVH doit exclure `_legacy/` du déploiement (déjà exclu de `deploy-safe.sh` : seuls `backend/`, `frontend/build/` et `database/schema-v2/` sont copiés)

## Non archivé mais reporté

- `backend/modules/` (v1, 76 sous-dossiers) — encore **utilisé au runtime** par `backend/src/core/ModuleManager.js`. À archiver après validation route par route que `modules-v2/` couvre tout. Voir `scratchpad/audit-doublons.md` pour le plan.
- `database/*.sql` racine (v1) — encore appliqués par certains scripts legacy. Migration prévue avec le module `backend/src/database/migrate.js` (contrat en place).

## Nettoyage effectué le 2026-09-25

Cf. commit `chore: archive dossiers et fichiers legacy dans _legacy/` (~449 fichiers déplacés avec `git mv` pour préserver l'historique).
