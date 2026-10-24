# fabrication/of — v2

Ordres de fabrication (CRUD + détail complet + alimentation stock + actions
démarrer/terminer/assigner-machine) — handlers legacy portés verbatim
(Phase E4 + G3).

Phase G3 : le contrôleur legacy `backend/modules/production/` a été absorbé
ici sous `./legacy-production-controller.js` (actions `lancerProduction` /
`terminerProduction` / `updateProduction`). Le module legacy `production/` est
désormais supprimé.

Endpoints sous `/api/v2/fabrication/of`.
